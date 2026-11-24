// 由 scripts/import-prompts.mjs 自动生成，勿手改。正文见 public/prompts-data.json
export type PromptCategory = '图像' | '视频' | '通用';
export type PromptModel = 'MiniMax H3' | 'LTX 2' | 'Wan 2.2' | 'bernini' | 'Viggle' | '通用';
export type PromptKind = '系统提示词' | '提示词';
export type PromptSource = 'file' | 'workflow';

export type Prompt = {
  id: string;
  /** 正文首句（工作流条目）或文件名（本地文档） */
  title: string;
  /** 来源工作流名；本地文档为空串 */
  origin: string;
  category: PromptCategory;
  model: PromptModel;
  kind: PromptKind;
  /** 正文字数（正文本身在 public/prompts-data.json 里懒加载） */
  len: number;
  source: PromptSource;
};

export const PROMPTS: Prompt[] = [
  {
    id: "w-3e17d199",
    title: "分镜图像编辑系统提示词 V2（多角色版·Qwen3.5优化…",
    origin: "qwen image 21全能生图工作流",
    category: "图像",
    model: "通用",
    kind: "系统提示词",
    len: 3192,
    source: "workflow"
  },
  {
    id: "w-edce7f0d",
    title: "角色卡文生图系统提示词 V3",
    origin: "flux2 klein短剧角色卡生成.app",
    category: "图像",
    model: "通用",
    kind: "系统提示词",
    len: 7382,
    source: "workflow"
  },
  {
    id: "w-49393040",
    title: "你是一个图像描述转生图提示词引擎",
    origin: "MJ平替 双模文生图 洗图 moss+krea2",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 547,
    source: "workflow"
  },
  {
    id: "w-c16fba53",
    title: "竖版短视频封面 · 最强开源模型qwen image2.1新鲜…",
    origin: "qwen image 21透明背景图编辑",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 377,
    source: "workflow"
  },
  {
    id: "w-f524c14b",
    title: "竖版短视频封面 · 最强图像模型qwen image2.1拆解…",
    origin: "qwen image 21透明背景图编辑",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 384,
    source: "workflow"
  },
  {
    id: "p-eb52c856",
    title: "文生图 人物脸型提示词",
    origin: "",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 1814,
    source: "file"
  },
  {
    id: "p-223493b6",
    title: "仙侠角色设定图提示词生成器 图像编辑",
    origin: "",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 1995,
    source: "file"
  },
  {
    id: "w-869a57c7",
    title: "一幅16:9横向构图的日系半写实梦幻城市人像",
    origin: "MJ平替 双模文生图 洗图 moss+krea2",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 901,
    source: "workflow"
  },
  {
    id: "p-bba7c22d",
    title: "中英文封面全案策划师",
    origin: "",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 1138,
    source: "file"
  },
  {
    id: "w-19c54759",
    title: "B站视频封面",
    origin: "boogu turbo文生图工作流",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 147,
    source: "workflow"
  },
  {
    id: "w-04350e14",
    title: "Describe the key features of the input image…",
    origin: "去豆包水印（保持原图不变）",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 304,
    source: "workflow"
  },
  {
    id: "p-29c34274",
    title: "H3图像编辑海报提示词生成器",
    origin: "",
    category: "图像",
    model: "MiniMax H3",
    kind: "提示词",
    len: 14720,
    source: "file"
  },
  {
    id: "w-e4d9994b",
    title: "Qwen Image 2.1 has native 2K (2048*2048)…",
    origin: "qwen image 2 1文生图",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 906,
    source: "workflow"
  },
  {
    id: "w-98a56c00",
    title: "Replace only the three red handwritten…",
    origin: "moss image edit 图像编辑",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 150,
    source: "workflow"
  },
  {
    id: "w-8fa0eda5",
    title: "You are an expert at enhancing a short…",
    origin: "大圣AI🐷minimax H3 image全能生图工作流",
    category: "图像",
    model: "MiniMax H3",
    kind: "提示词",
    len: 38448,
    source: "workflow"
  },
  {
    id: "w-d8752e2e",
    title: "你是LTX2.3图生音视频脚本生成助手 · 自动判断场景类型，输出整体描…（视频全能参考 for循环 ltx2.3全能参考视频延长 2）",
    origin: "视频全能参考 for循环 ltx2.3全能参考视频延长",
    category: "视频",
    model: "LTX 2",
    kind: "系统提示词",
    len: 4744,
    source: "workflow"
  },
  {
    id: "w-52237e39",
    title: "你是LTX2.3图生音视频脚本生成助手 · 自动判断场景类型，输出整体描…（视频全能参考 for循环 ltx2.3全能参考视频延长 3）",
    origin: "视频全能参考 for循环 ltx2.3全能参考视频延长",
    category: "视频",
    model: "LTX 2",
    kind: "系统提示词",
    len: 4744,
    source: "workflow"
  },
  {
    id: "p-0536e425",
    title: "武戏扩写系统提示词",
    origin: "",
    category: "视频",
    model: "MiniMax H3",
    kind: "系统提示词",
    len: 14412,
    source: "file"
  },
  {
    id: "p-7d4b3278",
    title: "H3视频编辑遮罩内人物替换系统提示词",
    origin: "",
    category: "视频",
    model: "MiniMax H3",
    kind: "系统提示词",
    len: 25486,
    source: "file"
  },
  {
    id: "w-c2f3cf57",
    title: "【主体1】是<Picture 1>中的女孩",
    origin: "H3全能工作流 人物深度 动作迁移",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 145,
    source: "workflow"
  },
  {
    id: "w-f2b03781",
    title: "<Subject 1> is the character defined by the…",
    origin: "V15 Viggle后处理 人脸高清重绘",
    category: "视频",
    model: "Viggle",
    kind: "提示词",
    len: 3465,
    source: "workflow"
  },
  {
    id: "w-6c8850b8",
    title: "<Subject 1> is the man in <Picture 1>: a 3D…",
    origin: "pika h3视频延长 直出古代监控",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 6055,
    source: "workflow"
  },
  {
    id: "w-f4fecdd8",
    title: "<Subject 1> is the young woman in <Picture 1>",
    origin: "H3运镜导演团",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 3676,
    source: "workflow"
  },
  {
    id: "w-3fe74bb0",
    title: "参考首帧的人物",
    origin: "LTX2.3全栈式短剧生成V8",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 554,
    source: "workflow"
  },
  {
    id: "w-0986fa57",
    title: "触发词：zhuanchang",
    origin: "首尾帧音视频LTX2.3",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 115,
    source: "workflow"
  },
  {
    id: "p-3980ddbf",
    title: "古代监控视频提示词SKILL",
    origin: "",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 8911,
    source: "file"
  },
  {
    id: "p-ff0b003e",
    title: "华强买瓜时隔 20 年重逢 5 段分镜提示词",
    origin: "",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 3804,
    source: "file"
  },
  {
    id: "w-091c26f8",
    title: "你是LTX2.3图生音视频脚本生成助手 · 你需要首先自动判断视频所属的…",
    origin: "ltx2.3全能参考短剧续拍",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 5004,
    source: "workflow"
  },
  {
    id: "w-e1795699",
    title: "你是LTX2.3图生音视频脚本生成助手 · 自动判断场景类型，输出整体描…",
    origin: "ltx2.3全能参考短剧续拍",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 2161,
    source: "workflow"
  },
  {
    id: "w-49f4e8b7",
    title: "女孩手拿激光枪对着外星怪兽",
    origin: "创新LTX2.3 9宫格AI漫剧生成",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 187,
    source: "workflow"
  },
  {
    id: "p-d7fe8707",
    title: "仙侠对决视频提示词生成器（V7.0 最终完整版）",
    origin: "",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 10736,
    source: "file"
  },
  {
    id: "p-43514665",
    title: "掩耳盗铃 五段视频提示词 最终版",
    origin: "",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 35629,
    source: "file"
  },
  {
    id: "w-b870a219",
    title: "一位紫色头发的精灵少女手持黑玫瑰站在月光哥特庭…",
    origin: "首尾帧音视频LTX2.3",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 141,
    source: "workflow"
  },
  {
    id: "w-ad85cb8a",
    title: "最高优先级 · 绝对禁绿：五字段正文绝对禁止…",
    origin: "大圣AI🐷H3 sam3精准视频编辑物品替换饰品",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 22715,
    source: "workflow"
  },
  {
    id: "w-74178246",
    title: "最高优先级 · 无遮罩原则：本任务不使用任何…",
    origin: "大圣AI🐷H3 sam3精准视频编辑物品替换饰品",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 16388,
    source: "workflow"
  },
  {
    id: "w-b86b3741",
    title: "A 14-second high-stakes cinematic sequence…",
    origin: "LTX Director参考三视图图工作流",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 471,
    source: "workflow"
  },
  {
    id: "p-ddaefc3f",
    title: "AI视频一句话分镜提示词通用生成器",
    origin: "",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 2433,
    source: "file"
  },
  {
    id: "w-5d804dcc",
    title: "For the target video",
    origin: "pika h3视频延长 直出古代监控",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 6104,
    source: "workflow"
  },
  {
    id: "p-59b1e88d",
    title: "H3白模视频提示词样例",
    origin: "",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 5455,
    source: "file"
  },
  {
    id: "p-c0eb9f12",
    title: "H3动作指导提示词生成器",
    origin: "",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 1556,
    source: "file"
  },
  {
    id: "p-5d7074d7",
    title: "H3三图+2音频参考生视频提示词生成器",
    origin: "",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 7424,
    source: "file"
  },
  {
    id: "p-176a5770",
    title: "H3文戏对白提示词生成器",
    origin: "",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 7978,
    source: "file"
  },
  {
    id: "p-72af2e83",
    title: "H3仙侠对决视频提示词生成器（V6.0 最终完整版）",
    origin: "",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 10053,
    source: "file"
  },
  {
    id: "p-678eeb35",
    title: "H3写实武打电影对决视频提示词生成器",
    origin: "",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 16127,
    source: "file"
  },
  {
    id: "p-4269a4a1",
    title: "H3一打多导演模板",
    origin: "",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 3208,
    source: "file"
  },
  {
    id: "w-545a0f96",
    title: "High-quality cinematic anime storyboard",
    origin: "创新LTX2.3 9宫格AI漫剧生成",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 552,
    source: "workflow"
  },
  {
    id: "w-17015b74",
    title: "In Figure 4",
    origin: "LTX 2.3 I2V 多角色参考 V1",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 2654,
    source: "workflow"
  },
  {
    id: "p-14e72fd2",
    title: "LTX 2 首尾帧提示词工程",
    origin: "",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 2803,
    source: "file"
  },
  {
    id: "p-71024373",
    title: "LTX 2 提示词工程",
    origin: "",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 2394,
    source: "file"
  },
  {
    id: "p-424eb550",
    title: "LTX 2 图生视频 (I2V) 提示词生成规则",
    origin: "",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 2808,
    source: "file"
  },
  {
    id: "p-35841a16",
    title: "LTX 2 文生视频 (T2V) 提示词生成规则",
    origin: "",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 2743,
    source: "file"
  },
  {
    id: "p-2b29bf40",
    title: "MiniMax H3 Video Editing Prompts",
    origin: "",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 11934,
    source: "file"
  },
  {
    id: "w-b56a373d",
    title: "Next Scene：主体（金发挽起",
    origin: "flux2 klein短剧多角色分镜生成.app",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 3630,
    source: "workflow"
  },
  {
    id: "w-732a6267",
    title: "OmniCam -> MiniMax H3 native (profile:…",
    origin: "H3运镜导演团",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 1651,
    source: "workflow"
  },
  {
    id: "w-fe1655c9",
    title: "Pencil Sketch —— 铅笔素描风",
    origin: "LTX 视频编辑 长视频0519",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 488,
    source: "workflow"
  },
  {
    id: "p-367de3be",
    title: "refmod提示词模版",
    origin: "",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 1289,
    source: "file"
  },
  {
    id: "w-987f7b4a",
    title: "Shot 1 wide establishing shot with slow…",
    origin: "LTX 2.3 20宫格(2.5升级版)无限时长可调整",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 1624,
    source: "workflow"
  },
  {
    id: "p-e16fb34d",
    title: "SSS 专研 分镜 【阵列】 提示词 0918 P1",
    origin: "",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 1261,
    source: "file"
  },
  {
    id: "w-b5934d81",
    title: "The original prompt is in Chinese",
    origin: "video wan dancer",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 145,
    source: "workflow"
  },
  {
    id: "p-10e6a8b7",
    title: "viggle bg swap prompt",
    origin: "",
    category: "视频",
    model: "Viggle",
    kind: "提示词",
    len: 6181,
    source: "file"
  },
  {
    id: "p-b830775b",
    title: "viggle prompt 填空模板",
    origin: "",
    category: "视频",
    model: "Viggle",
    kind: "提示词",
    len: 6591,
    source: "file"
  },
  {
    id: "w-98eca3cc",
    title: "Wan21 SCAIL2 01 full body pause.example · SCAIL2ScheduledLongVideoWithSAM",
    origin: "Wan21 SCAIL2 01 full body pause.example",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 211,
    source: "workflow"
  },
  {
    id: "p-1d147308",
    title: "wan22提示词生成方法",
    origin: "",
    category: "视频",
    model: "Wan 2.2",
    kind: "提示词",
    len: 385,
    source: "file"
  },
  {
    id: "w-1c4f354f",
    title: "Woosh — Sound Effect Generation",
    origin: "索尼AI Woosh短视频自动配音效",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 3665,
    source: "workflow"
  },
  {
    id: "w-e71df3ae",
    title: "You are a helpful assistant specialized in… · video editing with reference",
    origin: "TE Bernini 视频编辑 增强进阶流",
    category: "视频",
    model: "bernini",
    kind: "提示词",
    len: 128,
    source: "workflow"
  },
  {
    id: "w-c1a3143b",
    title: "You are the H3 Ref2VA prompt compiler for a… · attached reference images.…",
    origin: "H3全能工作流 人物深度 动作迁移",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 18808,
    source: "workflow"
  },
  {
    id: "p-b7da6492",
    title: "【5S提示法】",
    origin: "",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 488,
    source: "file"
  },
  {
    id: "w-532ed6b9",
    title: "<Subject 1> is the 3D-anime monkey warrior…",
    origin: "hyperflow ref2v int8测试",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 3257,
    source: "workflow"
  },
  {
    id: "w-0624096a",
    title: "<Subject 1> is the man in <Picture 3>",
    origin: "H3全能工作流 OmniCam测试",
    category: "通用",
    model: "MiniMax H3",
    kind: "提示词",
    len: 7133,
    source: "workflow"
  },
  {
    id: "w-f6b9f6cc",
    title: "<Subject 1> is the middle-aged rural woman Ma…",
    origin: "H3全能可变工作流",
    category: "通用",
    model: "MiniMax H3",
    kind: "提示词",
    len: 4424,
    source: "workflow"
  },
  {
    id: "w-151b9799",
    title: "<Video 1> is the source video and supplies the… · and jaw movement, lip…",
    origin: "V14 PINS锚定 N人通用",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 6986,
    source: "workflow"
  },
  {
    id: "w-f42b1966",
    title: "<Video 1> is the source video and supplies the… · movement, lip and jaw…",
    origin: "V14 PINS锚定 N人通用",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 6669,
    source: "workflow"
  },
  {
    id: "w-b2cbc863",
    title: "你是三图参考视频动态设计专家",
    origin: "Bernini R S2V 语音+背景音+多轨编辑器for循环版",
    category: "通用",
    model: "bernini",
    kind: "提示词",
    len: 7003,
    source: "workflow"
  },
  {
    id: "w-eed66d1d",
    title: "一个年轻女性 · 看球赛的人们，屏幕上再播放足…",
    origin: "Wan21 SCAIL2 01 full body pause.example",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 114,
    source: "workflow"
  },
  {
    id: "w-3dd3a3c5",
    title: "一个年轻女性 · 足球场，有人在踢球",
    origin: "Wan21 SCAIL2 02 face detail resume.example",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 97,
    source: "workflow"
  },
  {
    id: "w-9ed1214e",
    title: "A complete Chinese home-style restaurant menu",
    origin: "moss sft全能工作流",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 4670,
    source: "workflow"
  },
  {
    id: "w-9b890288",
    title: "Breeze TTS 2",
    origin: "breeze tts2 音频克隆 多人",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 1635,
    source: "workflow"
  },
  {
    id: "w-28faf1d4",
    title: "H3 双采工作流（Tr1dae 放大） / H3 Two-Pass…",
    origin: "H3全能可变工作流",
    category: "通用",
    model: "MiniMax H3",
    kind: "提示词",
    len: 454,
    source: "workflow"
  },
  {
    id: "p-8c929eb6",
    title: "H3通用提示词",
    origin: "",
    category: "通用",
    model: "MiniMax H3",
    kind: "提示词",
    len: 29632,
    source: "file"
  },
  {
    id: "w-97f92be7",
    title: "In image0, the man in white clothing and the…",
    origin: "Bernini R S2V Workflow V2",
    category: "通用",
    model: "bernini",
    kind: "提示词",
    len: 487,
    source: "workflow"
  },
  {
    id: "w-72c8a270",
    title: "In image1, the girl in black clothing and the…",
    origin: "Bernini R S2V Workflow V2",
    category: "通用",
    model: "bernini",
    kind: "提示词",
    len: 1144,
    source: "workflow"
  },
  {
    id: "w-dec3e9dc",
    title: "Multi-Speaker Dialogue",
    origin: "breeze tts2 音频克隆 多人",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 792,
    source: "workflow"
  },
  {
    id: "w-9a8c8997",
    title: "You are a helpful assistant specialized in… · image-to-video…",
    origin: "Bernini R S2V 语音+背景音+多轨编辑器for循环版",
    category: "通用",
    model: "bernini",
    kind: "提示词",
    len: 1037,
    source: "workflow"
  },
  {
    id: "w-205eac04",
    title: "You are an assistant designed to create more…",
    origin: "练习",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 200,
    source: "workflow"
  },
  {
    id: "w-55634554",
    title: "You are the H3 Ref2VA prompt compiler for a… · user's reference images. You…",
    origin: "H3全能工作流 OmniCam测试",
    category: "通用",
    model: "MiniMax H3",
    kind: "提示词",
    len: 11515,
    source: "workflow"
  }
];
