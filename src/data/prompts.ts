// 由 scripts/import-prompts.mjs 自动生成，勿手改。正文见 public/prompts-data.json
export type PromptCategory = '图像' | '视频' | '通用';
export type PromptModel = 'MiniMax H3' | 'LTX 2' | 'Wan 2.2' | 'bernini' | 'Viggle' | '通用';
export type PromptKind = '系统提示词' | '提示词';
export type PromptSource = 'file' | 'workflow';

export type Prompt = {
  id: string;
  title: string;
  category: PromptCategory;
  model: PromptModel;
  kind: PromptKind;
  /** 正文字数（正文本身在 public/prompts-data.json 里懒加载） */
  len: number;
  source: PromptSource;
};

export const PROMPTS: Prompt[] = [
  {
    id: "w-932efa87",
    title: "### 🚀 MOSS-Image 提示词增强系统提示词 (System Prompt)",
    category: "图像",
    model: "通用",
    kind: "系统提示词",
    len: 4680,
    source: "workflow"
  },
  {
    id: "w-edce7f0d",
    title: "flux2 klein短剧角色卡生成.app · 文本",
    category: "图像",
    model: "通用",
    kind: "系统提示词",
    len: 7382,
    source: "workflow"
  },
  {
    id: "w-3e17d199",
    title: "qwen image 21全能生图工作流 · 文本",
    category: "图像",
    model: "通用",
    kind: "系统提示词",
    len: 3192,
    source: "workflow"
  },
  {
    id: "w-8fa0eda5",
    title: "大圣AI🐷minimax H3 image全能生图工作流 · Text (task_prompt)",
    category: "图像",
    model: "MiniMax H3",
    kind: "提示词",
    len: 38448,
    source: "workflow"
  },
  {
    id: "w-c90d7f2a",
    title: "梵高",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 544,
    source: "workflow"
  },
  {
    id: "w-db672cc8",
    title: "韩版",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 550,
    source: "workflow"
  },
  {
    id: "w-55f08c75",
    title: "末日废土",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 576,
    source: "workflow"
  },
  {
    id: "w-4540780a",
    title: "水墨风",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 564,
    source: "workflow"
  },
  {
    id: "w-f44f55ea",
    title: "提示词 - Prompt",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 82,
    source: "workflow"
  },
  {
    id: "p-eb52c856",
    title: "文生图 人物脸型提示词",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 1814,
    source: "file"
  },
  {
    id: "p-223493b6",
    title: "仙侠角色设定图提示词生成器 图像编辑",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 1995,
    source: "file"
  },
  {
    id: "p-bba7c22d",
    title: "中英文封面全案策划师",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 1138,
    source: "file"
  },
  {
    id: "w-5fed833c",
    title: "CR Prompt Text",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 102,
    source: "workflow"
  },
  {
    id: "w-d75dc368",
    title: "easy showAnything",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 2961,
    source: "workflow"
  },
  {
    id: "p-29c34274",
    title: "H3图像编辑海报提示词生成器",
    category: "图像",
    model: "MiniMax H3",
    kind: "提示词",
    len: 14720,
    source: "file"
  },
  {
    id: "w-19c54759",
    title: "JjkText",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 147,
    source: "workflow"
  },
  {
    id: "w-98a56c00",
    title: "JjkText",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 150,
    source: "workflow"
  },
  {
    id: "w-3bd9d02a",
    title: "JjkText",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 1598,
    source: "workflow"
  },
  {
    id: "w-d549f08d",
    title: "JjkText",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 366,
    source: "workflow"
  },
  {
    id: "w-f524c14b",
    title: "JjkText",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 384,
    source: "workflow"
  },
  {
    id: "w-b2bc77b6",
    title: "JjkText",
    category: "图像",
    model: "MiniMax H3",
    kind: "提示词",
    len: 228,
    source: "workflow"
  },
  {
    id: "w-5cbcec9a",
    title: "MOSSImageLayoutPrompt",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 3755,
    source: "workflow"
  },
  {
    id: "w-e4d9994b",
    title: "Note: Usage",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 906,
    source: "workflow"
  },
  {
    id: "w-dddd30ad",
    title: "ShowText|pysssss",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 511,
    source: "workflow"
  },
  {
    id: "w-49393040",
    title: "Text _O",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 547,
    source: "workflow"
  },
  {
    id: "w-68dac80b",
    title: "Text (Multiline)",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 222,
    source: "workflow"
  },
  {
    id: "w-869a57c7",
    title: "Text (Multiline)",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 901,
    source: "workflow"
  },
  {
    id: "w-e81c83bb",
    title: "Text (user_prompt)",
    category: "图像",
    model: "MiniMax H3",
    kind: "提示词",
    len: 143,
    source: "workflow"
  },
  {
    id: "w-9631e6b1",
    title: "Text (user_prompt)",
    category: "图像",
    model: "MiniMax H3",
    kind: "提示词",
    len: 400,
    source: "workflow"
  },
  {
    id: "w-af87f4a5",
    title: "Text (user_prompt)",
    category: "图像",
    model: "MiniMax H3",
    kind: "提示词",
    len: 118,
    source: "workflow"
  },
  {
    id: "w-c16fba53",
    title: "TextEncodeQwenImage21",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 377,
    source: "workflow"
  },
  {
    id: "w-04350e14",
    title: "TextEncodeQwenImageEditPlusCustom_lrzjason",
    category: "图像",
    model: "通用",
    kind: "提示词",
    len: 304,
    source: "workflow"
  },
  {
    id: "w-7ea82911",
    title: "九宫格系统提示词",
    category: "视频",
    model: "通用",
    kind: "系统提示词",
    len: 2101,
    source: "workflow"
  },
  {
    id: "w-d8752e2e",
    title: "双人对话系统提示词2秒参考",
    category: "视频",
    model: "LTX 2",
    kind: "系统提示词",
    len: 4744,
    source: "workflow"
  },
  {
    id: "w-52237e39",
    title: "双人对话系统提示词3秒参考",
    category: "视频",
    model: "LTX 2",
    kind: "系统提示词",
    len: 4744,
    source: "workflow"
  },
  {
    id: "w-08a960d2",
    title: "四宫格连续分镜系统提示词",
    category: "视频",
    model: "通用",
    kind: "系统提示词",
    len: 15071,
    source: "workflow"
  },
  {
    id: "w-a062226c",
    title: "四宫格运镜系统提示词",
    category: "视频",
    model: "通用",
    kind: "系统提示词",
    len: 2223,
    source: "workflow"
  },
  {
    id: "p-0536e425",
    title: "武戏扩写系统提示词",
    category: "视频",
    model: "MiniMax H3",
    kind: "系统提示词",
    len: 14412,
    source: "file"
  },
  {
    id: "w-5eaecf14",
    title: "flux2 klein短剧多角色分镜生成.app · 文本",
    category: "视频",
    model: "通用",
    kind: "系统提示词",
    len: 3190,
    source: "workflow"
  },
  {
    id: "p-7d4b3278",
    title: "H3视频编辑遮罩内人物替换系统提示词",
    category: "视频",
    model: "MiniMax H3",
    kind: "系统提示词",
    len: 25486,
    source: "file"
  },
  {
    id: "w-e1795699",
    title: "非动作片",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 2161,
    source: "workflow"
  },
  {
    id: "w-091c26f8",
    title: "非动作片",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 5004,
    source: "workflow"
  },
  {
    id: "w-ff4d7359",
    title: "负面提示词",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 1455,
    source: "workflow"
  },
  {
    id: "p-3980ddbf",
    title: "古代监控视频提示词SKILL",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 8911,
    source: "file"
  },
  {
    id: "p-ff0b003e",
    title: "华强买瓜时隔 20 年重逢 5 段分镜提示词",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 3804,
    source: "file"
  },
  {
    id: "w-a3831e33",
    title: "绿色遮罩版物体替换提示词生成器",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 13014,
    source: "workflow"
  },
  {
    id: "w-c578e01c",
    title: "去水印",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 208,
    source: "workflow"
  },
  {
    id: "w-c1a3143b",
    title: "深度-动作迁移提示词生成器",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 18808,
    source: "workflow"
  },
  {
    id: "w-c3e7b1e0",
    title: "视频编辑",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 2967,
    source: "workflow"
  },
  {
    id: "w-8412efe5",
    title: "视频全能参考 for循环 ltx2.3全能参考视频延长 · 提示词",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 288,
    source: "workflow"
  },
  {
    id: "w-a3faae86",
    title: "通配符处理器",
    category: "视频",
    model: "Wan 2.2",
    kind: "提示词",
    len: 366,
    source: "workflow"
  },
  {
    id: "w-9126749d",
    title: "通配符处理器",
    category: "视频",
    model: "Wan 2.2",
    kind: "提示词",
    len: 663,
    source: "workflow"
  },
  {
    id: "w-74178246",
    title: "无遮罩·放慢版·饰品替换提示词生成器",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 16388,
    source: "workflow"
  },
  {
    id: "w-4b6e94ce",
    title: "无遮罩版物体替换提示词生成器",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 15008,
    source: "workflow"
  },
  {
    id: "p-d7fe8707",
    title: "仙侠对决视频提示词生成器（V7.0 最终完整版）",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 10736,
    source: "file"
  },
  {
    id: "p-43514665",
    title: "掩耳盗铃 五段视频提示词 最终版",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 35629,
    source: "file"
  },
  {
    id: "w-fe1655c9",
    title: "About  Models",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 488,
    source: "workflow"
  },
  {
    id: "p-ddaefc3f",
    title: "AI视频一句话分镜提示词通用生成器",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 2433,
    source: "file"
  },
  {
    id: "w-52d91e9f",
    title: "CLIP Text Encode (Negative Prompt)",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 137,
    source: "workflow"
  },
  {
    id: "w-d669d188",
    title: "CLIPTextEncode",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 689,
    source: "workflow"
  },
  {
    id: "w-cd5f5adf",
    title: "CLIPTextEncode",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 558,
    source: "workflow"
  },
  {
    id: "w-cd5535bc",
    title: "CLIPTextEncode",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 683,
    source: "workflow"
  },
  {
    id: "w-438051b4",
    title: "CLIPTextEncode",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 1354,
    source: "workflow"
  },
  {
    id: "w-a1ba9089",
    title: "CLIPTextEncode",
    category: "视频",
    model: "Wan 2.2",
    kind: "提示词",
    len: 251,
    source: "workflow"
  },
  {
    id: "w-67153466",
    title: "CLIPTextEncode",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 1390,
    source: "workflow"
  },
  {
    id: "w-b870a219",
    title: "CLIPTextEncode",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 141,
    source: "workflow"
  },
  {
    id: "w-4272a826",
    title: "CR Prompt Text",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 1083,
    source: "workflow"
  },
  {
    id: "w-b56a373d",
    title: "easy promptLine",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 3630,
    source: "workflow"
  },
  {
    id: "w-5f7b9921",
    title: "easy promptLine",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 598,
    source: "workflow"
  },
  {
    id: "w-fe57c717",
    title: "easy showAnything",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 101,
    source: "workflow"
  },
  {
    id: "w-6c4c7b91",
    title: "easy showAnything",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 3204,
    source: "workflow"
  },
  {
    id: "w-97020d22",
    title: "easy showAnything",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 92,
    source: "workflow"
  },
  {
    id: "w-89271cd8",
    title: "easy showAnything",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 167,
    source: "workflow"
  },
  {
    id: "w-6815e7d1",
    title: "Frame Rate Note",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 1717,
    source: "workflow"
  },
  {
    id: "w-1c29b99d",
    title: "Frame Rate Note",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 2123,
    source: "workflow"
  },
  {
    id: "p-59b1e88d",
    title: "H3白模视频提示词样例",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 5455,
    source: "file"
  },
  {
    id: "p-c0eb9f12",
    title: "H3动作指导提示词生成器",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 1556,
    source: "file"
  },
  {
    id: "p-5d7074d7",
    title: "H3三图+2音频参考生视频提示词生成器",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 7424,
    source: "file"
  },
  {
    id: "p-176a5770",
    title: "H3文戏对白提示词生成器",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 7978,
    source: "file"
  },
  {
    id: "p-72af2e83",
    title: "H3仙侠对决视频提示词生成器（V6.0 最终完整版）",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 10053,
    source: "file"
  },
  {
    id: "p-678eeb35",
    title: "H3写实武打电影对决视频提示词生成器",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 16127,
    source: "file"
  },
  {
    id: "p-4269a4a1",
    title: "H3一打多导演模板",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 3208,
    source: "file"
  },
  {
    id: "w-b3ea5abf",
    title: "Input Text (Prompt)",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 202,
    source: "workflow"
  },
  {
    id: "w-c2f3cf57",
    title: "Input Text (Prompt)",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 145,
    source: "workflow"
  },
  {
    id: "w-f4fecdd8",
    title: "Input Text (Prompt)",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 3676,
    source: "workflow"
  },
  {
    id: "w-5d804dcc",
    title: "Input Text (Prompt)",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 6104,
    source: "workflow"
  },
  {
    id: "w-6c8850b8",
    title: "Input Text (Prompt)",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 6055,
    source: "workflow"
  },
  {
    id: "w-b088e9df",
    title: "JjkText",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 606,
    source: "workflow"
  },
  {
    id: "w-eb5788ce",
    title: "JjkText",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 3218,
    source: "workflow"
  },
  {
    id: "w-c9eaf643",
    title: "JjkText",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 165,
    source: "workflow"
  },
  {
    id: "w-7977b808",
    title: "JjkText",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 84,
    source: "workflow"
  },
  {
    id: "w-a86f7692",
    title: "JjkText",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 83,
    source: "workflow"
  },
  {
    id: "w-10e3982b",
    title: "LoraLoaderModelOnly",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 92,
    source: "workflow"
  },
  {
    id: "p-14e72fd2",
    title: "LTX 2 首尾帧提示词工程",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 2803,
    source: "file"
  },
  {
    id: "p-71024373",
    title: "LTX 2 提示词工程",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 2394,
    source: "file"
  },
  {
    id: "p-424eb550",
    title: "LTX 2 图生视频 (I2V) 提示词生成规则",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 2808,
    source: "file"
  },
  {
    id: "p-35841a16",
    title: "LTX 2 文生视频 (T2V) 提示词生成规则",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 2743,
    source: "file"
  },
  {
    id: "w-b86b3741",
    title: "LTXDirector",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 471,
    source: "workflow"
  },
  {
    id: "w-b5934d81",
    title: "MarkdownNote",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 145,
    source: "workflow"
  },
  {
    id: "w-be211034",
    title: "MarkdownNote",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 332,
    source: "workflow"
  },
  {
    id: "w-dc19d755",
    title: "MarkdownNote",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 80,
    source: "workflow"
  },
  {
    id: "w-1c4f354f",
    title: "MarkdownNote",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 3665,
    source: "workflow"
  },
  {
    id: "w-ad85cb8a",
    title: "MiniMax H3 视频编辑提示词生成器（中文精简版）",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 22715,
    source: "workflow"
  },
  {
    id: "p-2b29bf40",
    title: "MiniMax H3 Video Editing Prompts",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 11934,
    source: "file"
  },
  {
    id: "w-732a6267",
    title: "Note",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 1651,
    source: "workflow"
  },
  {
    id: "w-19bef9a1",
    title: "Note",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 419,
    source: "workflow"
  },
  {
    id: "w-b2318ad1",
    title: "Note",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 272,
    source: "workflow"
  },
  {
    id: "w-65d4215f",
    title: "Note",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 83,
    source: "workflow"
  },
  {
    id: "w-0986fa57",
    title: "Note",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 115,
    source: "workflow"
  },
  {
    id: "w-76ddad4a",
    title: "NSFW",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 2421,
    source: "workflow"
  },
  {
    id: "w-d1c5b852",
    title: "NSFW",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 126,
    source: "workflow"
  },
  {
    id: "w-f20f1b60",
    title: "PrimitiveStringMultiline",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 10038,
    source: "workflow"
  },
  {
    id: "w-17015b74",
    title: "Prompt Relay Encode",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 2654,
    source: "workflow"
  },
  {
    id: "w-e2d4ab0f",
    title: "Prompt_Text",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 3439,
    source: "workflow"
  },
  {
    id: "w-57d0fb3d",
    title: "PromptRelayEncode",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 1007,
    source: "workflow"
  },
  {
    id: "w-987f7b4a",
    title: "PromptRelayEncode",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 1624,
    source: "workflow"
  },
  {
    id: "w-545a0f96",
    title: "PromptRelayEncodeTimeline",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 552,
    source: "workflow"
  },
  {
    id: "w-49f4e8b7",
    title: "PromptRelayEncodeTimeline",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 187,
    source: "workflow"
  },
  {
    id: "p-367de3be",
    title: "refmod提示词模版",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 1289,
    source: "file"
  },
  {
    id: "w-98eca3cc",
    title: "SCAIL2ScheduledLongVideoWithSAM",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 211,
    source: "workflow"
  },
  {
    id: "w-3fe74bb0",
    title: "ShowText|pysssss",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 554,
    source: "workflow"
  },
  {
    id: "w-6d182f02",
    title: "ShowText|pysssss",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 483,
    source: "workflow"
  },
  {
    id: "w-79611d2f",
    title: "ShowText|pysssss",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 482,
    source: "workflow"
  },
  {
    id: "w-bb89d3c0",
    title: "ShowText|pysssss",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 456,
    source: "workflow"
  },
  {
    id: "w-2df13f1c",
    title: "ShowText|pysssss",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 462,
    source: "workflow"
  },
  {
    id: "w-2f3e42b2",
    title: "ShowText|pysssss",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 417,
    source: "workflow"
  },
  {
    id: "w-2acbd97f",
    title: "ShowText|pysssss",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 446,
    source: "workflow"
  },
  {
    id: "w-2053c450",
    title: "ShowText|pysssss",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 392,
    source: "workflow"
  },
  {
    id: "w-f7cc1068",
    title: "ShowText|pysssss",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 388,
    source: "workflow"
  },
  {
    id: "w-4eef0dea",
    title: "ShowText|pysssss",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 375,
    source: "workflow"
  },
  {
    id: "w-7da108cc",
    title: "ShowText|pysssss",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 427,
    source: "workflow"
  },
  {
    id: "w-29e767fa",
    title: "ShowText|pysssss",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 399,
    source: "workflow"
  },
  {
    id: "w-2cee2f2d",
    title: "ShowText|pysssss",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 495,
    source: "workflow"
  },
  {
    id: "w-613e1ead",
    title: "ShowText|pysssss",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 447,
    source: "workflow"
  },
  {
    id: "w-fb9b2553",
    title: "ShowText|pysssss",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 497,
    source: "workflow"
  },
  {
    id: "w-f8e08b85",
    title: "ShowText|pysssss",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 458,
    source: "workflow"
  },
  {
    id: "w-51427308",
    title: "ShowText|pysssss",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 393,
    source: "workflow"
  },
  {
    id: "w-ce7aa652",
    title: "ShowText|pysssss",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 409,
    source: "workflow"
  },
  {
    id: "w-e722782d",
    title: "ShowText|pysssss",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 85,
    source: "workflow"
  },
  {
    id: "w-87c5695f",
    title: "ShowText|pysssss",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 297,
    source: "workflow"
  },
  {
    id: "w-41fc7571",
    title: "ShowText|pysssss",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 2005,
    source: "workflow"
  },
  {
    id: "p-e16fb34d",
    title: "SSS 专研 分镜 【阵列】 提示词 0918 P1",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 1261,
    source: "file"
  },
  {
    id: "w-0636f416",
    title: "StringConcatenate",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 1997,
    source: "workflow"
  },
  {
    id: "w-e71df3ae",
    title: "TE Bernini 视频编辑 增强进阶流 · 文本",
    category: "视频",
    model: "bernini",
    kind: "提示词",
    len: 128,
    source: "workflow"
  },
  {
    id: "w-ffcf2d8d",
    title: "Text _O",
    category: "视频",
    model: "MiniMax H3",
    kind: "提示词",
    len: 208,
    source: "workflow"
  },
  {
    id: "w-ce1d6169",
    title: "Text Multiline",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 1112,
    source: "workflow"
  },
  {
    id: "w-b57bda15",
    title: "TextGenerate",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 981,
    source: "workflow"
  },
  {
    id: "w-5913e571",
    title: "TT_img_enc",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 324,
    source: "workflow"
  },
  {
    id: "w-71770b10",
    title: "TT_img_enc",
    category: "视频",
    model: "Wan 2.2",
    kind: "提示词",
    len: 153,
    source: "workflow"
  },
  {
    id: "w-f2b03781",
    title: "V15 Viggle后处理 人脸高清重绘 · 提示词",
    category: "视频",
    model: "Viggle",
    kind: "提示词",
    len: 3465,
    source: "workflow"
  },
  {
    id: "w-f000668f",
    title: "Very Very Important",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 829,
    source: "workflow"
  },
  {
    id: "w-fb3c9ce2",
    title: "Very Very Important",
    category: "视频",
    model: "LTX 2",
    kind: "提示词",
    len: 2744,
    source: "workflow"
  },
  {
    id: "p-10e6a8b7",
    title: "viggle bg swap prompt",
    category: "视频",
    model: "Viggle",
    kind: "提示词",
    len: 6181,
    source: "file"
  },
  {
    id: "p-b830775b",
    title: "viggle prompt 填空模板",
    category: "视频",
    model: "Viggle",
    kind: "提示词",
    len: 6591,
    source: "file"
  },
  {
    id: "p-1d147308",
    title: "wan22提示词生成方法",
    category: "视频",
    model: "Wan 2.2",
    kind: "提示词",
    len: 385,
    source: "file"
  },
  {
    id: "w-08375c42",
    title: "WanVideo TextEncode Cached",
    category: "视频",
    model: "通用",
    kind: "提示词",
    len: 220,
    source: "workflow"
  },
  {
    id: "p-b7da6492",
    title: "【5S提示法】",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 488,
    source: "file"
  },
  {
    id: "w-7c7197db",
    title: "2人替换-分特写图参考",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 6448,
    source: "workflow"
  },
  {
    id: "w-b682ee32",
    title: "360镜头",
    category: "通用",
    model: "MiniMax H3",
    kind: "提示词",
    len: 534,
    source: "workflow"
  },
  {
    id: "w-f42b1966",
    title: "5人替换",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 6669,
    source: "workflow"
  },
  {
    id: "w-27d16dd8",
    title: "艾橘溪的Ai工具箱!",
    category: "通用",
    model: "bernini",
    kind: "提示词",
    len: 340,
    source: "workflow"
  },
  {
    id: "w-257dda6f",
    title: "单人替换-二视图",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 6718,
    source: "workflow"
  },
  {
    id: "w-eff0ac57",
    title: "说明 · 怎么用",
    category: "通用",
    model: "Viggle",
    kind: "提示词",
    len: 527,
    source: "workflow"
  },
  {
    id: "w-53c4dd44",
    title: "小猪AI🐇comfyui一对一陪练教学、加入RH小猪AI团队空间玩高质量工作流",
    category: "通用",
    model: "MiniMax H3",
    kind: "提示词",
    len: 279,
    source: "workflow"
  },
  {
    id: "w-eab33caf",
    title: "BreezeTTS2MultiSpeaker",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 99,
    source: "workflow"
  },
  {
    id: "w-5ddd7de2",
    title: "BreezeTTS2VoiceClone",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 262,
    source: "workflow"
  },
  {
    id: "w-0be9b291",
    title: "DuckDecodeNode",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 82,
    source: "workflow"
  },
  {
    id: "w-85226c39",
    title: "DuckHideNode",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 90,
    source: "workflow"
  },
  {
    id: "w-bd44b0bc",
    title: "easy positive",
    category: "通用",
    model: "bernini",
    kind: "提示词",
    len: 425,
    source: "workflow"
  },
  {
    id: "w-45e4ce50",
    title: "easy showAnything",
    category: "通用",
    model: "bernini",
    kind: "提示词",
    len: 557,
    source: "workflow"
  },
  {
    id: "w-b2cbc863",
    title: "easy showAnything",
    category: "通用",
    model: "bernini",
    kind: "提示词",
    len: 7003,
    source: "workflow"
  },
  {
    id: "w-3a0f0d5c",
    title: "easy showAnything",
    category: "通用",
    model: "bernini",
    kind: "提示词",
    len: 116,
    source: "workflow"
  },
  {
    id: "w-9a8c8997",
    title: "easy showAnything",
    category: "通用",
    model: "bernini",
    kind: "提示词",
    len: 1037,
    source: "workflow"
  },
  {
    id: "w-a563b4ef",
    title: "easy showAnything",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 3136,
    source: "workflow"
  },
  {
    id: "p-8c929eb6",
    title: "H3通用提示词",
    category: "通用",
    model: "MiniMax H3",
    kind: "提示词",
    len: 29632,
    source: "file"
  },
  {
    id: "w-d5265019",
    title: "Input Text (Prompt)",
    category: "通用",
    model: "MiniMax H3",
    kind: "提示词",
    len: 6904,
    source: "workflow"
  },
  {
    id: "w-a0f990c6",
    title: "Input Text (Prompt)",
    category: "通用",
    model: "MiniMax H3",
    kind: "提示词",
    len: 2547,
    source: "workflow"
  },
  {
    id: "w-0624096a",
    title: "Input Text (Prompt)",
    category: "通用",
    model: "MiniMax H3",
    kind: "提示词",
    len: 7133,
    source: "workflow"
  },
  {
    id: "w-e596dd2e",
    title: "Input Text (Prompt)",
    category: "通用",
    model: "MiniMax H3",
    kind: "提示词",
    len: 3895,
    source: "workflow"
  },
  {
    id: "w-55634554",
    title: "JjkText",
    category: "通用",
    model: "MiniMax H3",
    kind: "提示词",
    len: 11515,
    source: "workflow"
  },
  {
    id: "w-7a2e8480",
    title: "JjkText",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 1082,
    source: "workflow"
  },
  {
    id: "w-d4bfe406",
    title: "JjkText",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 219,
    source: "workflow"
  },
  {
    id: "w-9ed1214e",
    title: "JjkText",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 4670,
    source: "workflow"
  },
  {
    id: "w-cbea62a1",
    title: "JjkText",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 147,
    source: "workflow"
  },
  {
    id: "w-1e59e7ba",
    title: "MajoorOmniCamMonitor",
    category: "通用",
    model: "MiniMax H3",
    kind: "提示词",
    len: 291,
    source: "workflow"
  },
  {
    id: "w-17e8f75b",
    title: "MarkdownNote",
    category: "通用",
    model: "MiniMax H3",
    kind: "提示词",
    len: 404,
    source: "workflow"
  },
  {
    id: "w-28faf1d4",
    title: "MarkdownNote",
    category: "通用",
    model: "MiniMax H3",
    kind: "提示词",
    len: 454,
    source: "workflow"
  },
  {
    id: "w-9b890288",
    title: "MarkdownNote",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 1635,
    source: "workflow"
  },
  {
    id: "w-dec3e9dc",
    title: "MarkdownNote",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 792,
    source: "workflow"
  },
  {
    id: "w-f0269799",
    title: "N人替换V2",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 6301,
    source: "workflow"
  },
  {
    id: "w-151b9799",
    title: "N人替换V2",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 6986,
    source: "workflow"
  },
  {
    id: "w-72c8a270",
    title: "Note",
    category: "通用",
    model: "bernini",
    kind: "提示词",
    len: 1144,
    source: "workflow"
  },
  {
    id: "w-ae996be4",
    title: "Note",
    category: "通用",
    model: "bernini",
    kind: "提示词",
    len: 153,
    source: "workflow"
  },
  {
    id: "w-ee46b593",
    title: "Note",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 1552,
    source: "workflow"
  },
  {
    id: "w-97f92be7",
    title: "PrimitiveStringMultiline",
    category: "通用",
    model: "bernini",
    kind: "提示词",
    len: 487,
    source: "workflow"
  },
  {
    id: "w-f6b9f6cc",
    title: "PrimitiveStringMultiline",
    category: "通用",
    model: "MiniMax H3",
    kind: "提示词",
    len: 4424,
    source: "workflow"
  },
  {
    id: "w-532ed6b9",
    title: "Prompt, size, length, references",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 3257,
    source: "workflow"
  },
  {
    id: "w-205eac04",
    title: "Query Local LLM",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 200,
    source: "workflow"
  },
  {
    id: "w-eed66d1d",
    title: "SCAIL2SegmentPlanBuilder",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 114,
    source: "workflow"
  },
  {
    id: "w-3dd3a3c5",
    title: "SCAIL2SegmentPlanBuilder",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 97,
    source: "workflow"
  },
  {
    id: "w-c07b1d39",
    title: "ShowText|pysssss",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 778,
    source: "workflow"
  },
  {
    id: "w-1c02d376",
    title: "ShowText|pysssss",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 849,
    source: "workflow"
  },
  {
    id: "w-43459c0b",
    title: "ShowText|pysssss",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 820,
    source: "workflow"
  },
  {
    id: "w-ba3bcda8",
    title: "ShowText|pysssss",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 99,
    source: "workflow"
  },
  {
    id: "w-65995c11",
    title: "Text (user_prompt)",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 354,
    source: "workflow"
  },
  {
    id: "w-c50966e6",
    title: "Text (user_prompt)",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 282,
    source: "workflow"
  },
  {
    id: "w-2d9d819b",
    title: "Text (user_prompt)",
    category: "通用",
    model: "通用",
    kind: "提示词",
    len: 265,
    source: "workflow"
  }
];
