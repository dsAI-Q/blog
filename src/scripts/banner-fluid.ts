/**
 * 首页横幅的「鼠标跟随烟雾」：WebGL2 上的稳定流体（Stable Fluids）精简实现。
 * 思路和 Pavel Dobryakov 的 MIT 开源 WebGL Fluid Simulation 一致：
 * 速度场 + 染料场双缓冲，每帧 advect → curl/vorticity → divergence → pressure → gradient，
 * 指针移动时用高斯 splat 注入速度和染料；只有显示着色（gradient shading）没有 bloom。
 *
 * 这是试验功能：不支持 WebGL2 / 浮点渲染目标时直接抛错，由调用方静默降级。
 */

type GL = WebGL2RenderingContext;

interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
}

interface DoubleFBO {
  read: FBO;
  write: FBO;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  swap(): void;
}

export interface BannerFluidHandle {
  pause(): void;
  resume(): void;
  destroy(): void;
}

const SIM_RESOLUTION = 160;
const DYE_RESOLUTION = 720;
const DYE_MAX_DIMENSION = 1024;
const PRESSURE_ITERATIONS = 18;
const CURL = 20;
const VELOCITY_DISSIPATION = 0.9;
const DENSITY_DISSIPATION = 0.035;
const SPLAT_RADIUS = 0.02;
const SPLAT_FORCE = 1800;
function hsv(h, s, v) { const i = Math.floor(h / 60) % 6; const f = h / 60 - Math.floor(h / 60); const p = v * (1 - s); const q = v * (1 - f * s); const t = v * (1 - (1 - f) * s); return [ [v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q] ][i]; }

const VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPosition;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const ADVECTION = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
void main () {
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
  vec4 result = texture(uSource, coord);
  fragColor = result / (1.0 + dissipation * dt);
}`;

const DIVERGENCE = `#version 300 es
precision mediump float;
precision mediump sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
uniform sampler2D uVelocity;
void main () {
  float L = texture(uVelocity, vL).x;
  float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y;
  float B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  fragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

const CURL_SHADER = `#version 300 es
precision mediump float;
precision mediump sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
uniform sampler2D uVelocity;
void main () {
  float L = texture(uVelocity, vL).y;
  float R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x;
  float B = texture(uVelocity, vB).x;
  fragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`;

const VORTICITY = `#version 300 es
precision mediump float;
precision mediump sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
void main () {
  float L = texture(uCurl, vL).x;
  float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x;
  float B = texture(uCurl, vB).x;
  float C = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;
  vec2 velocity = texture(uVelocity, vUv).xy;
  velocity += force * dt;
  velocity = min(max(velocity, -1000.0), 1000.0);
  fragColor = vec4(velocity, 0.0, 1.0);
}`;

const PRESSURE = `#version 300 es
precision mediump float;
precision mediump sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main () {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  float divergence = texture(uDivergence, vUv).x;
  fragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
}`;

const GRADIENT = `#version 300 es
precision mediump float;
precision mediump sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main () {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  vec2 velocity = texture(uVelocity, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  fragColor = vec4(velocity, 0.0, 1.0);
}`;

const CLEAR = `#version 300 es
precision mediump float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTexture;
uniform float value;
void main () {
  fragColor = value * texture(uTexture, vUv);
}`;

const SPLAT = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main () {
  vec2 p = vUv - point.xy;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture(uTarget, vUv).xyz;
  fragColor = vec4(base + splat, 1.0);
}`;

const DISPLAY = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTexture;
uniform vec2 texelSize;
void main () {
  // 4 点均值代替硬件双线性（这台机器上 RGBA16F 线性过滤不生效）
  vec2 ts = texelSize * 0.5;
  vec3 c =
    texture(uTexture, vUv + vec2(-ts.x, -ts.y)).rgb +
    texture(uTexture, vUv + vec2(ts.x, -ts.y)).rgb +
    texture(uTexture, vUv + vec2(-ts.x, ts.y)).rgb +
    texture(uTexture, vUv + vec2(ts.x, ts.y)).rgb;
  c *= 0.25;
  float alpha = clamp(max(c.r, max(c.g, c.b)) * 1.1, 0.0, 0.8);
  fragColor = vec4(c * alpha, alpha);
}`;

function compileShader(gl: GL, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('createShader failed');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`shader: ${log}`);
  }
  return shader;
}

function createProgram(gl: GL, vs: string, fs: string) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vs);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fs);
  const program = gl.createProgram();
  if (!program) throw new Error('createProgram failed');
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`link: ${gl.getProgramInfoLog(program)}`);
  }
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i);
    if (!info) continue;
    uniforms[info.name] = gl.getUniformLocation(program, info.name);
  }
  return { program, uniforms };
}

function makeResolution(base: number, aspect: number, maxSize: number) {
  const isLandscape = aspect >= 1;
  let width = Math.round(isLandscape ? base * aspect : base);
  let height = Math.round(isLandscape ? base : base / aspect);
  const longest = Math.max(width, height);
  if (longest > maxSize) {
    const scale = maxSize / longest;
    width = Math.max(16, Math.round(width * scale));
    height = Math.max(16, Math.round(height * scale));
  }
  return { width: Math.max(16, width), height: Math.max(16, height) };
}

export function createBannerFluid(canvas: HTMLCanvasElement, target: HTMLElement): BannerFluidHandle {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: 'low-power',
  });
  if (!gl) throw new Error('WebGL2 unavailable');
  if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('float render targets unavailable');

  const programs = {
    advection: createProgram(gl, VERT, ADVECTION),
    divergence: createProgram(gl, VERT, DIVERGENCE),
    curl: createProgram(gl, VERT, CURL_SHADER),
    vorticity: createProgram(gl, VERT, VORTICITY),
    pressure: createProgram(gl, VERT, PRESSURE),
    gradient: createProgram(gl, VERT, GRADIENT),
    clear: createProgram(gl, VERT, CLEAR),
    splat: createProgram(gl, VERT, SPLAT),
    display: createProgram(gl, VERT, DISPLAY),
  };

  // 全屏四边形
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const attach = (texture: WebGLTexture, unit: number) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    return unit;
  };

  function createFBO(width: number, height: number): FBO {
    const texture = gl!.createTexture();
    if (!texture) throw new Error('createTexture failed');
    gl!.bindTexture(gl!.TEXTURE_2D, texture);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.NEAREST);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.NEAREST);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA16F, width, height, 0, gl!.RGBA, gl!.HALF_FLOAT, null);

    const fbo = gl!.createFramebuffer();
    if (!fbo) throw new Error('createFramebuffer failed');
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
    gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, texture, 0);
    gl!.viewport(0, 0, width, height);
    gl!.clear(gl!.COLOR_BUFFER_BIT);

    return { texture, fbo, width, height, texelSizeX: 1 / width, texelSizeY: 1 / height };
  }

  function createDoubleFBO(width: number, height: number): DoubleFBO {
    let a = createFBO(width, height);
    let b = createFBO(width, height);
    return {
      get read() {
        return a;
      },
      get write() {
        return b;
      },
      width,
      height,
      texelSizeX: 1 / width,
      texelSizeY: 1 / height,
      swap() {
        const tmp = a;
        a = b;
        b = tmp;
      },
    };
  }

  function blit(fbo: FBO | null) {
    if (fbo) {
      gl!.viewport(0, 0, fbo.width, fbo.height);
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo.fbo);
    } else {
      gl!.viewport(0, 0, canvas.width, canvas.height);
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    }
    gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
  }

  let sim: DoubleFBO;
  let dye: DoubleFBO;
  let pressure: DoubleFBO;
  let divergence: FBO;
  let curl: FBO;
  let seeded = false;

  function allocate() {
    const rect = { width: window.innerWidth, height: window.innerHeight };
    const aspect = rect.width > 0 && rect.height > 0 ? rect.width / rect.height : 16 / 9;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    canvas.width = Math.max(2, Math.round(rect.width * dpr));
    canvas.height = Math.max(2, Math.round(rect.height * dpr));

    const simSize = makeResolution(SIM_RESOLUTION, aspect, 512);
    const dyeSize = makeResolution(DYE_RESOLUTION, aspect, DYE_MAX_DIMENSION);
    sim = createDoubleFBO(simSize.width, simSize.height);
    dye = createDoubleFBO(dyeSize.width, dyeSize.height);
    pressure = createDoubleFBO(simSize.width, simSize.height);
    divergence = createFBO(simSize.width, simSize.height);
    curl = createFBO(simSize.width, simSize.height);
    // 重建缓冲后要重新种一次烟，否则画面上什么都没有
    seeded = false;
  }

  allocate();
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  let pending: Array<{ x: number; y: number; dx: number; dy: number; color: [number, number, number] }> = [];

  function splat(x: number, y: number, dx: number, dy: number, color: [number, number, number]) {
    gl!.useProgram(programs.splat.program);
    gl!.uniform1i(programs.splat.uniforms.uTarget, attach(sim.read.texture, 0));
    gl!.uniform1f(programs.splat.uniforms.aspectRatio, canvas.width / canvas.height);
    gl!.uniform2f(programs.splat.uniforms.point, x, y);
    gl!.uniform3f(programs.splat.uniforms.color, dx, dy, 0);
    gl!.uniform1f(programs.splat.uniforms.radius, SPLAT_RADIUS);
    blit(sim.write);
    sim.swap();

    gl!.uniform1i(programs.splat.uniforms.uTarget, attach(dye.read.texture, 0));
    gl!.uniform3f(programs.splat.uniforms.color, color[0], color[1], color[2]);
    blit(dye.write);
    dye.swap();
  }

  let hue = Math.random() * 360;
  function randomDye(intensity = 0.32): [number, number, number] {
    hue = (hue + 7 + Math.random() * 10) % 360;
    const [r, g, b] = hsv(hue, 0.55, 1);
    const k = intensity * (0.8 + Math.random() * 0.4);
    return [r * k, g * k, b * k];
  }

  function step(dt: number) {
    gl!.disable(gl!.BLEND);

    gl!.useProgram(programs.curl.program);
    gl!.uniform2f(programs.curl.uniforms.texelSize, sim.texelSizeX, sim.texelSizeY);
    gl!.uniform1i(programs.curl.uniforms.uVelocity, attach(sim.read.texture, 0));
    blit(curl);

    gl!.useProgram(programs.vorticity.program);
    gl!.uniform2f(programs.vorticity.uniforms.texelSize, sim.texelSizeX, sim.texelSizeY);
    gl!.uniform1i(programs.vorticity.uniforms.uVelocity, attach(sim.read.texture, 0));
    gl!.uniform1i(programs.vorticity.uniforms.uCurl, attach(curl.texture, 1));
    gl!.uniform1f(programs.vorticity.uniforms.curl, CURL);
    gl!.uniform1f(programs.vorticity.uniforms.dt, dt);
    blit(sim.write);
    sim.swap();

    gl!.useProgram(programs.divergence.program);
    gl!.uniform2f(programs.divergence.uniforms.texelSize, sim.texelSizeX, sim.texelSizeY);
    gl!.uniform1i(programs.divergence.uniforms.uVelocity, attach(sim.read.texture, 0));
    blit(divergence);

    gl!.useProgram(programs.clear.program);
    gl!.uniform1i(programs.clear.uniforms.uTexture, attach(pressure.read.texture, 0));
    gl!.uniform1f(programs.clear.uniforms.value, 0.8);
    blit(pressure.write);
    pressure.swap();

    gl!.useProgram(programs.pressure.program);
    gl!.uniform1i(programs.pressure.uniforms.uDivergence, attach(divergence.texture, 0));
    for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
      gl!.uniform1i(programs.pressure.uniforms.uPressure, attach(pressure.read.texture, 1));
      blit(pressure.write);
      pressure.swap();
    }

    gl!.useProgram(programs.gradient.program);
    gl!.uniform2f(programs.gradient.uniforms.texelSize, sim.texelSizeX, sim.texelSizeY);
    gl!.uniform1i(programs.gradient.uniforms.uPressure, attach(pressure.read.texture, 0));
    gl!.uniform1i(programs.gradient.uniforms.uVelocity, attach(sim.read.texture, 1));
    blit(sim.write);
    sim.swap();

    gl!.useProgram(programs.advection.program);
    gl!.uniform2f(programs.advection.uniforms.texelSize, sim.texelSizeX, sim.texelSizeY);
    gl!.uniform1i(programs.advection.uniforms.uVelocity, attach(sim.read.texture, 0));
    gl!.uniform1i(programs.advection.uniforms.uSource, attach(sim.read.texture, 0));
    gl!.uniform1f(programs.advection.uniforms.dt, dt);
    gl!.uniform1f(programs.advection.uniforms.dissipation, VELOCITY_DISSIPATION);
    blit(sim.write);
    sim.swap();

    gl!.useProgram(programs.advection.program);
    gl!.uniform2f(programs.advection.uniforms.texelSize, sim.texelSizeX, sim.texelSizeY);
    gl!.uniform1i(programs.advection.uniforms.uVelocity, attach(sim.read.texture, 0));
    gl!.uniform1i(programs.advection.uniforms.uSource, attach(dye.read.texture, 1));
    gl!.uniform1f(programs.advection.uniforms.dt, dt);
    gl!.uniform1f(programs.advection.uniforms.dissipation, DENSITY_DISSIPATION);
    blit(dye.write);
    dye.swap();
  }

  function render() {
    gl!.enable(gl!.BLEND);
    gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
    gl!.useProgram(programs.display.program);
    gl!.uniform2f(programs.display.uniforms.texelSize, dye.texelSizeX, dye.texelSizeY);
    gl!.uniform1i(programs.display.uniforms.uTexture, attach(dye.read.texture, 0));
    blit(null);
  }

  let running = false;
  let raf = 0;
  let lastTime = 0;

  function seed() {
    if (seeded) return;
    seeded = true;
    // 初始几团烟雾，避免刚进来是一片空白
    for (let i = 0; i < 4; i++) {
      const x = 0.2 + Math.random() * 0.6;
      const y = 0.3 + Math.random() * 0.5;
      splat(x, y, (Math.random() - 0.5) * 70, (Math.random() - 0.5) * 70, randomDye(1.6));
    }
  }

  function frame(now: number) {
    if (!running) return;
    try {
      seed();
      const dt = Math.min(Math.max((now - lastTime) / 1000, 0.0001), 1 / 45);
      lastTime = now;

      if (pending.length) {
        const splats = pending.slice(0, 3);
        pending = pending.slice(splats.length);
        for (const s of splats) splat(s.x, s.y, s.dx, s.dy, s.color);
      }

      step(dt);
      render();
      raf = requestAnimationFrame(frame);
    } catch {
      // 出错就安静停下，不影响横幅本身
      running = false;
    }
  }

  /* ---------------- 指针 ---------------- */
  let lastX = 0;
  let lastY = 0;
  let hasLast = false;

  const onPointerMove = (event: PointerEvent) => {
    const rect = { width: window.innerWidth, height: window.innerHeight };
    if (!rect.width || !rect.height) return;
    const x = event.clientX / rect.width;
    const y = 1 - event.clientY / rect.height;

    if (!hasLast) {
      lastX = x;
      lastY = y;
      hasLast = true;
      return;
    }

    const dx = (x - lastX) * SPLAT_FORCE;
    const dy = (y - lastY) * SPLAT_FORCE;
    lastX = x;
    lastY = y;

    if (Math.abs(dx) + Math.abs(dy) > 0.4) {
      pending.push({ x, y, dx, dy, color: randomDye(2.2) });
    }
  };

  const onPointerLeave = () => {
    hasLast = false;
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });

  const onResize = () => {
    if (!window.innerWidth || !window.innerHeight) return;
    allocate();
    gl!.clearColor(0, 0, 0, 0);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
  };
  window.addEventListener('resize', onResize);

  const handle: BannerFluidHandle = {
    pause() {
      running = false;
      cancelAnimationFrame(raf);
    },
    resume() {
      if (running) return;
      running = true;
      lastTime = performance.now();
      raf = requestAnimationFrame(frame);
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', onResize);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };

  return handle;
}


