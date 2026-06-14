const THEMES = {
  clean: {
    id: "clean",
    name: "清爽知识库",
    desc: "白底轻卡片，默认推荐",
    mode: "light",
    colors: {
      bg: "#f7f7f2",
      surface: "#ffffff",
      surface2: "#f1f5f2",
      ink: "#161a16",
      muted: "#6b746b",
      subtle: "#929a92",
      border: "#dfe5dd",
      accent: "#187a5d",
      accentText: "#0e5f48",
      accentSoft: "#e8f6f0",
      warn: "#b7791f",
      warnSoft: "#fff4d6",
      danger: "#b42318",
      dangerSoft: "#fff0ed",
      nav: "#ffffff",
      accentOn: "#ffffff"
    },
    isDefault: true,
    lastUsedAt: "2026-06-14T00:00:00.000Z"
  },
  studio: {
    id: "studio",
    name: "夜间创作台",
    desc: "深色沉浸，适合长时间写作",
    mode: "dark",
    colors: {
      bg: "#111313",
      surface: "#1b1f1d",
      surface2: "#242a27",
      ink: "#f3f5ef",
      muted: "#b7bdb4",
      subtle: "#838b82",
      border: "#343b36",
      accent: "#b7e46c",
      accentText: "#d7ff8a",
      accentSoft: "#26351e",
      warn: "#f2b84b",
      warnSoft: "#3a2d16",
      danger: "#ff8d7a",
      dangerSoft: "#3b201c",
      nav: "#181c1a",
      accentOn: "#111313"
    },
    isDefault: false,
    lastUsedAt: null
  },
  pro: {
    id: "pro",
    name: "专业资料中枢",
    desc: "高密度资料、关系、审批",
    mode: "light",
    colors: {
      bg: "#f5f7fa",
      surface: "#ffffff",
      surface2: "#eef2f7",
      ink: "#172033",
      muted: "#647087",
      subtle: "#8a94a6",
      border: "#dde4ee",
      accent: "#5b5bd6",
      accentText: "#4242b4",
      accentSoft: "#eeeeff",
      warn: "#0f8b8d",
      warnSoft: "#e7f7f6",
      danger: "#b42318",
      dangerSoft: "#fff0ed",
      nav: "#ffffff",
      accentOn: "#ffffff"
    },
    isDefault: false,
    lastUsedAt: null
  }
};

const CSS_VAR_NAMES = {
  surface2: "surface-2"
};

const API_PROXY_BASE = window.location.protocol === "file:" ? "http://localhost:4173" : "";
const DEFAULT_API_CONFIG = {
  provider: "DeepSeek",
  baseUrl: "https://api.deepseek.com",
  model: "deepseek-v4-flash",
  apiKey: "",
  connected: false,
  hasServerKey: false,
  lastTestAt: null,
  lastError: ""
};

const LORE_SCHEMA_VERSION = 2;
const LORE_TYPE_ALIASES = {
  地点: "地点/地理",
  物品: "物品/线索",
  世界规则: "世界观/规则",
  世界观: "世界观/规则",
  规则: "世界观/规则"
};
const LORE_CATEGORIES = [
  "人物",
  "家族/势力",
  "地点/地理",
  "事件",
  "物品/线索",
  "世界观/规则",
  "历史/年表",
  "种族/生物",
  "能力/魔法",
  "宗教/文化",
  "国家/制度",
  "卷章"
];
const LORE_CATEGORY_GROUPS = [
  { label: "角色", categories: ["全部", "人物", "家族/势力"] },
  { label: "世界", categories: ["世界观/规则", "地点/地理", "历史/年表", "种族/生物", "能力/魔法", "宗教/文化", "国家/制度"] },
  { label: "剧情", categories: ["事件", "物品/线索", "卷章"] }
];
const IMPORTANCE_OPTIONS = ["核心", "高", "中", "低"];
const STATUS_OPTIONS = ["有效", "待验证", "草稿", "已归档"];
const RELATION_TYPE_LABELS = {
  member: "成员",
  ally: "盟友",
  enemy: "敌对",
  related: "关联",
  owner: "持有",
  affects: "影响",
  belongsTo: "归属"
};
const DEMO_CHAT_TEXTS = new Set([
  "根据第 2 卷目标，写第 12 章：宴会暗杀失败后，女主发现家族密约。",
  "我会先读取人物、家族、旧王印、星陨宴和第 2 卷目标。草稿完成后，任何新增设定都会进入待审批变更。"
]);
const DEMO_CHANGE_IDS = new Set(["change-1", "change-2", "change-3"]);
const LORE_FORM_PROFILES = {
  人物: {
    titleLabel: "人物姓名",
    titlePlaceholder: "输入人物姓名或称号",
    summaryLabel: "身份/定位",
    summaryPlaceholder: "写清角色身份、立场、当前目标。",
    detailLabel: "人物设定",
    detailPlaceholder: "写人物背景、能力边界、秘密、成长线和不能违背的设定。",
    relationsLabel: "人物关系",
    relationsPlaceholder: "关联人物、家族、地点、事件",
    referencesLabel: "出场章节",
    referencesPlaceholder: "第 1 章、第 2 章",
    timelineLabel: "登场时间",
    timelinePlaceholder: "首次登场或关键时间段"
  },
  "家族/势力": {
    titleLabel: "势力名称",
    titlePlaceholder: "输入家族、组织或阵营名称",
    summaryLabel: "势力摘要",
    summaryPlaceholder: "写清势力立场、资源、权力边界。",
    detailLabel: "组织设定",
    detailPlaceholder: "写成员结构、利益诉求、盟友敌人、禁忌和历史。",
    relationsLabel: "其他关联线索",
    relationsPlaceholder: "不属于成员、盟友、敌对的地点、物品、历史或事件",
    referencesLabel: "涉及章节",
    referencesPlaceholder: "第 3 章、第 8 章",
    timelineLabel: "活跃时期",
    timelinePlaceholder: "兴起、衰落或当前行动阶段"
  },
  "地点/地理": {
    titleLabel: "地点名称",
    titlePlaceholder: "输入城市、区域、建筑或秘境名称",
    summaryLabel: "地点摘要",
    summaryPlaceholder: "写清地点功能、氛围、归属和冲突价值。",
    detailLabel: "地点设定",
    detailPlaceholder: "写地理位置、视觉特征、规则限制、入口出口和隐藏线索。",
    relationsLabel: "关联人物/事件",
    relationsPlaceholder: "常驻人物、发生事件、所属势力",
    referencesLabel: "出现章节",
    referencesPlaceholder: "第 5 章、第 12 章",
    timelineLabel: "时间/时代",
    timelinePlaceholder: "出现时间、历史时期或变化阶段"
  },
  事件: {
    titleLabel: "事件名称",
    titlePlaceholder: "输入事件或关键节点名称",
    summaryLabel: "事件摘要",
    summaryPlaceholder: "写清事件起因、关键转折和结果。",
    detailLabel: "事件经过",
    detailPlaceholder: "写起因、经过、结果、参与者、隐藏真相和后续影响。",
    relationsLabel: "参与者/影响对象",
    relationsPlaceholder: "人物、势力、地点、物品",
    referencesLabel: "涉及章节",
    referencesPlaceholder: "第 12 章、第 13 章",
    timelineLabel: "时间点",
    timelinePlaceholder: "事件发生的章节、日期或阶段"
  },
  "物品/线索": {
    titleLabel: "物品名称",
    titlePlaceholder: "输入道具、信物、法器或线索名称",
    summaryLabel: "物品摘要",
    summaryPlaceholder: "写清物品用途、持有人和剧情价值。",
    detailLabel: "物品设定",
    detailPlaceholder: "写外观、来源、能力、限制、代价和可触发的剧情。",
    relationsLabel: "持有人/相关事件",
    relationsPlaceholder: "持有人、制造者、相关事件",
    referencesLabel: "出现章节",
    referencesPlaceholder: "第 9 章、第 12 章",
    timelineLabel: "出现时间",
    timelinePlaceholder: "首次出现或转手时间"
  },
  "世界观/规则": {
    titleLabel: "世界观条目",
    titlePlaceholder: "输入世界规则、时代背景、制度或核心设定",
    summaryLabel: "世界观摘要",
    summaryPlaceholder: "写清规则作用、适用范围和限制。",
    detailLabel: "设定机制",
    detailPlaceholder: "写历史背景、地理文化、运行机制、边界、例外、代价和不能破坏的设定。",
    relationsLabel: "影响对象/关联设定",
    relationsPlaceholder: "人物、势力、地点、物品或事件",
    referencesLabel: "适用章节",
    referencesPlaceholder: "第 2 卷、第 12 章",
    timelineLabel: "生效范围",
    timelinePlaceholder: "时代、地域或章节范围"
  },
  "历史/年表": {
    titleLabel: "历史节点",
    titlePlaceholder: "输入纪年、朝代、战争或历史转折",
    summaryLabel: "历史摘要",
    summaryPlaceholder: "写清发生时间、参与方和对当下剧情的影响。",
    detailLabel: "历史详情",
    detailPlaceholder: "写起因、经过、结果、遗留问题、被篡改的版本和真实版本。",
    relationsLabel: "关联人物/势力/地点",
    relationsPlaceholder: "参与者、受益者、受害者、发生地点",
    referencesLabel: "引用章节",
    referencesPlaceholder: "第 1 卷、第 12 章",
    timelineLabel: "纪年/阶段",
    timelinePlaceholder: "旧王陨落前、第三纪末等"
  },
  "种族/生物": {
    titleLabel: "种族/生物名称",
    titlePlaceholder: "输入族群、异兽、灵体或生态物种",
    summaryLabel: "生态摘要",
    summaryPlaceholder: "写清分布、习性、社会关系和剧情价值。",
    detailLabel: "生态设定",
    detailPlaceholder: "写外形、能力、繁衍、弱点、禁忌、与文明的关系。",
    relationsLabel: "关联地区/势力/人物",
    relationsPlaceholder: "栖息地、敌对族群、契约者",
    referencesLabel: "出现章节",
    referencesPlaceholder: "第 4 章、第 12 章",
    timelineLabel: "活跃范围",
    timelinePlaceholder: "时代、季节、地域或剧情阶段"
  },
  "能力/魔法": {
    titleLabel: "能力/体系名称",
    titlePlaceholder: "输入魔法、异能、科技或修炼体系",
    summaryLabel: "体系摘要",
    summaryPlaceholder: "写清能力来源、使用门槛和叙事限制。",
    detailLabel: "机制设定",
    detailPlaceholder: "写规则、代价、升级路径、例外、克制关系和不能违背的边界。",
    relationsLabel: "使用者/受影响对象",
    relationsPlaceholder: "人物、家族、物品、世界规则",
    referencesLabel: "适用章节",
    referencesPlaceholder: "第 2 卷、第 12 章",
    timelineLabel: "生效阶段",
    timelinePlaceholder: "觉醒时间、封禁年代或剧情阶段"
  },
  "宗教/文化": {
    titleLabel: "宗教/文化名称",
    titlePlaceholder: "输入信仰、节日、习俗、语言或价值观",
    summaryLabel: "文化摘要",
    summaryPlaceholder: "写清信奉群体、禁忌、仪式和冲突价值。",
    detailLabel: "文化设定",
    detailPlaceholder: "写起源、仪式、阶层、禁忌、日常影响和剧情可用细节。",
    relationsLabel: "关联群体/地点/事件",
    relationsPlaceholder: "信徒、地区、节日、历史事件",
    referencesLabel: "出现章节",
    referencesPlaceholder: "第 7 章、第 12 章",
    timelineLabel: "流行时期",
    timelinePlaceholder: "时代、地域或章节范围"
  },
  "国家/制度": {
    titleLabel: "国家/制度名称",
    titlePlaceholder: "输入王国、政体、法律、官署或经济制度",
    summaryLabel: "制度摘要",
    summaryPlaceholder: "写清权力来源、治理对象和冲突点。",
    detailLabel: "制度设定",
    detailPlaceholder: "写组织结构、运行规则、漏洞、利益方和对角色行动的限制。",
    relationsLabel: "关联势力/地点/人物",
    relationsPlaceholder: "统治者、执行者、反对者、辖区",
    referencesLabel: "涉及章节",
    referencesPlaceholder: "第 2 卷、第 12 章",
    timelineLabel: "有效时期",
    timelinePlaceholder: "建立、改革、崩塌或当前阶段"
  },
  卷章: {
    titleLabel: "卷章名称",
    titlePlaceholder: "输入卷名、章节名或剧情段落",
    summaryLabel: "卷章摘要",
    summaryPlaceholder: "写清本卷/本章目标和读者需要获得的信息。",
    detailLabel: "剧情规划",
    detailPlaceholder: "写目标、冲突、伏笔、禁用内容、节奏和资料引用要求。",
    relationsLabel: "关联资料",
    relationsPlaceholder: "人物、事件、地点、规则",
    referencesLabel: "对应章节",
    referencesPlaceholder: "第 12 章",
    timelineLabel: "时间范围",
    timelinePlaceholder: "剧情发生的时间段"
  }
};

const seedState = {
  schemaVersion: LORE_SCHEMA_VERSION,
  view: "ai",
  themeId: "clean",
  activeCategory: "人物",
  selectedLoreId: "shen",
  editLoreId: null,
  modal: null,
  librarySource: "local",
  selectedChapterId: "ch12",
  chat: [],
  generatedDraft: false,
  draftText: "",
  lastContextBundle: null,
  lore: [
    {
      id: "shen",
      type: "人物",
      title: "沈青岚",
      summary: "女主，灵契师，正在调查云氏家族密约。",
      detail: "她擅长读取灵契残响，但无法伪造灵契。第 2 卷开始，她怀疑父亲旧案与云氏有关。",
      tags: ["主角", "灵契师", "王都"],
      importance: "核心",
      status: "有效",
      relations: ["云氏家族", "旧王印", "星陨宴"],
      fields: {
        role: "女主",
        ability: "读取灵契残响",
        goal: "调查父亲旧案与云氏密约"
      },
      timeline: "星陨宴前后 3 日",
      references: ["第 8 章", "第 12 章"]
    },
    {
      id: "yun",
      type: "家族/势力",
      title: "云氏家族",
      summary: "王都旧贵族，掌握内阁线人与禁术残卷。",
      detail: "云氏表面支持新王，暗中保留旧王时代的灵契档案。",
      tags: ["贵族", "内阁", "敌友未明"],
      importance: "高",
      status: "有效",
      relations: ["沈青岚", "王都内阁", "旧王印"],
      fields: {
        members: ["shen"],
        allies: [],
        enemies: []
      },
      links: [
        { targetId: "shen", targetTitle: "沈青岚", relationType: "member", note: "被卷入云氏旧案调查" },
        { targetId: "seal", targetTitle: "旧王印", relationType: "related", note: "保存旧王时代灵契档案" }
      ],
      timeline: "旧王陨落后",
      references: ["第 6 章", "第 12 章"]
    },
    {
      id: "star-banquet",
      type: "事件",
      title: "星陨宴",
      summary: "王都宴会暗杀失败，暴露多个家族的秘密联系。",
      detail: "刺客原本目标不是新王，而是携带旧王印线索的使者。",
      tags: ["暗杀", "宴会", "第 12 章"],
      importance: "高",
      status: "待验证",
      relations: ["沈青岚", "云氏家族", "密约碎片"],
      fields: {
        cause: "宴会刺杀失败",
        result: "多方密约线索浮出水面"
      },
      timeline: "第 2 卷中段",
      references: ["第 12 章"]
    },
    {
      id: "seal",
      type: "物品/线索",
      title: "旧王印",
      summary: "旧王时代的权力凭证，能激活古老灵契。",
      detail: "旧王印并非玉玺，而是一段被封存的契约坐标。",
      tags: ["伏笔", "灵契", "旧王"],
      importance: "核心",
      status: "有效",
      relations: ["沈青岚", "云氏家族"],
      fields: {
        holder: "未知",
        rule: "只能被真实灵契残响激活"
      },
      timeline: "旧王陨落前",
      references: ["第 9 章", "第 12 章"]
    },
    {
      id: "spirit-contract-rule",
      type: "世界观/规则",
      title: "灵契法则",
      summary: "灵契记录真实誓约的残响，能被读取但不能被伪造。",
      detail: "灵契以誓约双方的真实意志为锚点。读取者只能捕捉残响，无法修改已成立的契约；强行伪造会留下反噬痕迹。旧王印能定位古老灵契，但不能替代誓约本身。",
      tags: ["世界观", "能力边界", "灵契"],
      importance: "核心",
      status: "有效",
      relations: ["沈青岚", "旧王印"],
      fields: {
        scope: "王都及旧王朝遗留灵契",
        limit: "不能伪造，只能读取或激活残响"
      },
      links: [
        { targetId: "shen", targetTitle: "沈青岚", relationType: "affects", note: "限制她的能力边界" },
        { targetId: "seal", targetTitle: "旧王印", relationType: "related", note: "旧王印可定位古老灵契" }
      ],
      timeline: "旧王朝至今",
      references: ["第 2 卷", "第 12 章"]
    },
    {
      id: "old-king-fall",
      type: "历史/年表",
      title: "旧王陨落",
      summary: "旧王朝崩塌，新王登基，贵族势力重新洗牌。",
      detail: "旧王陨落后，王都贵族公开归顺新王，暗地里争夺旧王时代的灵契档案。云氏家族保存了部分档案，成为第 2 卷权力冲突的源头。",
      tags: ["历史", "王都", "旧王"],
      importance: "高",
      status: "有效",
      relations: ["云氏家族", "旧王印"],
      fields: {
        era: "旧王陨落后",
        consequence: "贵族势力重新结盟"
      },
      links: [
        { targetId: "yun", targetTitle: "云氏家族", relationType: "affects", note: "云氏保留旧王档案" },
        { targetId: "seal", targetTitle: "旧王印", relationType: "related", note: "旧王时代凭证" }
      ],
      timeline: "旧王陨落后",
      references: ["第 6 章", "第 9 章", "第 12 章"]
    }
  ],
  chapters: [
    {
      id: "ch11",
      volume: "第 2 卷",
      title: "第 11 章 旧宴请柬",
      goal: "让沈青岚进入星陨宴，并埋下旧王印的视觉线索。",
      conflict: "云氏试探她是否能读取残响。",
      taboo: "不能直接说出云氏叛变。",
      status: "已完成"
    },
    {
      id: "ch12",
      volume: "第 2 卷",
      title: "第 12 章 星陨宴",
      goal: "暗杀失败、暴露密约、推进沈青岚与云氏裂痕。",
      conflict: "她必须在众目睽睽下保护真正目标。",
      taboo: "禁止提前揭露旧王真实身份。",
      status: "写作中"
    },
    {
      id: "ch13",
      volume: "第 2 卷",
      title: "第 13 章 雨夜账册",
      goal: "让线索从宴会转入云氏旧账，进入调查段落。",
      conflict: "证据会牵连沈青岚父亲。",
      taboo: "不能让新王直接出面。",
      status: "规划中"
    }
  ],
  proposedChanges: [],
  apiConfig: { ...DEFAULT_API_CONFIG },
  apiKeySaved: false,
  followSystem: false
};

let state = loadState();
let aiBusy = false;

function loadState() {
  const raw = localStorage.getItem("ai-novel-prototype-state");
  if (!raw) return normalizeAppState(structuredClone(seedState));
  try {
    const parsed = JSON.parse(raw);
    return normalizeAppState({
      ...structuredClone(seedState),
      ...parsed,
      apiConfig: { ...DEFAULT_API_CONFIG, ...(parsed.apiConfig || {}) },
      modal: null,
      editLoreId: null
    });
  } catch {
    return normalizeAppState(structuredClone(seedState));
  }
}

function saveState() {
  const { modal, editLoreId, ...persistentState } = state;
  persistentState.schemaVersion = LORE_SCHEMA_VERSION;
  localStorage.setItem("ai-novel-prototype-state", JSON.stringify(persistentState));
}

function normalizeAppState(nextState) {
  const activeCategory = normalizeLoreType(nextState.activeCategory || "人物");
  const generatedDraft = Boolean(nextState.generatedDraft && nextState.draftText);
  const lastContextBundle = normalizeContextBundleState(nextState.lastContextBundle);
  return {
    ...nextState,
    schemaVersion: LORE_SCHEMA_VERSION,
    activeCategory,
    lore: normalizeLoreCollection(nextState.lore || []),
    chat: normalizeChatHistory(nextState.chat),
    generatedDraft,
    draftText: generatedDraft ? String(nextState.draftText || "") : "",
    lastContextBundle,
    proposedChanges: normalizeStoredChanges(nextState.proposedChanges)
  };
}

function normalizeChatHistory(chat) {
  return (Array.isArray(chat) ? chat : [])
    .filter(item => item && typeof item === "object")
    .filter(item => !DEMO_CHAT_TEXTS.has(String(item.text || "")))
    .map(item => ({
      role: item.role === "user" ? "user" : "assistant",
      text: String(item.text || ""),
      meta: item.meta ? String(item.meta) : ""
    }))
    .filter(item => item.text);
}

function normalizeStoredChanges(changes) {
  return (Array.isArray(changes) ? changes : []).filter(change => change && !DEMO_CHANGE_IDS.has(change.id));
}

function normalizeContextBundleState(bundle) {
  if (!bundle || typeof bundle !== "object") return null;
  const loreItemIds = toList(bundle.loreItemIds);
  const relationHints = toList(bundle.relationHints);
  const timelineRefs = toList(bundle.timelineRefs);
  if (!loreItemIds.length && !relationHints.length && !timelineRefs.length && !bundle.chapterId) return null;
  return {
    loreItemIds,
    relationHints,
    timelineRefs,
    chapterId: String(bundle.chapterId || "")
  };
}

function normalizeLoreType(type = "") {
  const value = String(type || "").trim();
  if (!value) return "人物";
  return LORE_TYPE_ALIASES[value] || value;
}

function normalizeLoreCollection(items = []) {
  const normalized = (Array.isArray(items) ? items : []).map(normalizeLoreItem);
  const byId = new Map(normalized.map(item => [item.id, item]));
  const byTitle = new Map(normalized.map(item => [item.title, item]).filter(([, item]) => item.title));
  return normalized.map(item => enrichLoreItemLinks(item, byId, byTitle));
}

function normalizeLoreItem(item = {}) {
  const type = normalizeLoreType(item.type || "人物");
  const links = normalizeLinks(item.links);
  const relations = unique([...toList(item.relations), ...links.map(link => link.targetTitle)]);
  return {
    id: String(item.id || `lore-${Date.now()}`),
    type,
    title: String(item.title || "").trim(),
    summary: String(item.summary || "").trim(),
    detail: String(item.detail || "").trim(),
    tags: toList(item.tags),
    importance: String(item.importance || "中"),
    status: String(item.status || "有效"),
    relations,
    timeline: String(item.timeline || ""),
    references: toList(item.references),
    fields: normalizeFields(item.fields),
    links
  };
}

function toLoreIndexItem(item = {}) {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    summary: item.summary,
    tags: toList(item.tags),
    importance: item.importance,
    status: item.status,
    relations: toList(item.relations),
    references: toList(item.references),
    fields: normalizeFields(item.fields),
    links: normalizeLinks(item.links)
  };
}

function normalizeFields(fields = {}) {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) return {};
  return Object.entries(fields).reduce((out, [key, value]) => {
    if (Array.isArray(value)) out[key] = unique(value.map(item => String(item).trim()));
    else if (value !== undefined && value !== null) out[key] = String(value).trim();
    return out;
  }, {});
}

function normalizeLinks(links = []) {
  if (!Array.isArray(links)) return [];
  return links
    .map(link => {
      if (!link || typeof link !== "object") {
        return {
          targetId: "",
          targetTitle: String(link || "").trim(),
          relationType: "related",
          note: ""
        };
      }
      return {
        targetId: String(link.targetId || "").trim(),
        targetTitle: String(link.targetTitle || link.title || "").trim(),
        relationType: normalizeRelationType(link.relationType || link.type || "related"),
        note: String(link.note || "").trim()
      };
    })
    .filter(link => link.targetId || link.targetTitle);
}

function normalizeRelationType(type = "related") {
  const value = String(type || "related").trim();
  return RELATION_TYPE_LABELS[value] ? value : "related";
}

function enrichLoreItemLinks(item, byId, byTitle) {
  const links = [];
  const addLink = link => {
    const target = link.targetId ? byId.get(link.targetId) : byTitle.get(link.targetTitle);
    const targetId = link.targetId || target?.id || "";
    const targetTitle = link.targetTitle || target?.title || "";
    if (!targetId && !targetTitle) return;
    if (links.some(entry => (targetId && entry.targetId === targetId && entry.relationType === link.relationType) || (!targetId && entry.targetTitle === targetTitle && entry.relationType === link.relationType))) return;
    links.push({
      targetId,
      targetTitle,
      relationType: normalizeRelationType(link.relationType),
      note: link.note || ""
    });
  };

  normalizeLinks(item.links).forEach(addLink);
  toList(item.relations).forEach(title => {
    const target = byTitle.get(title);
    const relationType = item.type === "家族/势力" && target?.type === "人物" ? "member" : "related";
    addLink({ targetId: target?.id || "", targetTitle: target?.title || title, relationType, note: "" });
  });

  const fields = normalizeFields(item.fields);
  if (item.type === "家族/势力") {
    addStructuredFamilyLinks("members", "member");
    addStructuredFamilyLinks("allies", "ally");
    addStructuredFamilyLinks("enemies", "enemy");
    fields.members = unique([...toList(fields.members), ...links.filter(link => link.relationType === "member").map(link => link.targetId).filter(Boolean)]);
    fields.allies = unique([...toList(fields.allies), ...links.filter(link => link.relationType === "ally").map(link => link.targetId).filter(Boolean)]);
    fields.enemies = unique([...toList(fields.enemies), ...links.filter(link => link.relationType === "enemy").map(link => link.targetId).filter(Boolean)]);
  }

  const relations = unique([...toList(item.relations), ...links.map(link => link.targetTitle).filter(Boolean)]);
  return { ...item, fields, links, relations };

  function addStructuredFamilyLinks(fieldName, relationType) {
    toList(fields[fieldName]).forEach(id => {
      const target = byId.get(id);
      if (target) addLink({ targetId: target.id, targetTitle: target.title, relationType, note: "" });
    });
  }
}

const LibraryDataAPI = {
  async request(endpoint, options = {}) {
    if (window.location.protocol === "file:") return null;
    try {
      const response = await fetch(`${API_PROXY_BASE}${endpoint}`, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) throw new Error(data.error || `请求失败：${response.status}`);
      state.librarySource = "server";
      return data;
    } catch {
      state.librarySource = "local";
      return null;
    }
  },

  async readState() {
    const data = await this.request("/api/library/state");
    if (!data || !Array.isArray(data.lore)) return null;
    state.lore = normalizeLoreCollection(data.lore);
    state.schemaVersion = data.schemaVersion || LORE_SCHEMA_VERSION;
    saveState();
    return state.lore;
  },

  async listLoreIndex() {
    const data = await this.request("/api/library/index");
    if (data?.loreIndex) return data.loreIndex.map(toLoreIndexItem);
    return state.lore.map(toLoreIndexItem);
  },

  async getLoreItem(id) {
    const data = await this.request(`/api/library/items/${encodeURIComponent(id)}`);
    if (data?.item) {
      state.lore = normalizeLoreCollection([...state.lore.filter(item => item.id !== id), data.item]);
      saveState();
      return state.lore.find(item => item.id === id) || null;
    }
    return state.lore.find(item => item.id === id) || null;
  },

  async searchLore(query = {}) {
    const data = await this.request("/api/library/search", {
      method: "POST",
      body: JSON.stringify(query)
    });
    if (data?.details) return normalizeLoreCollection(data.details);
    return searchLocalLore(query);
  },

  async createLoreItem(item) {
    const normalized = normalizeLoreItem(item);
    const data = await this.request("/api/library/items", {
      method: "POST",
      body: JSON.stringify({ item: normalized })
    });
    if (data?.lore) state.lore = normalizeLoreCollection(data.lore);
    else upsertLocalLoreItem(normalized);
    saveState();
    return data?.item ? normalizeLoreItem(data.item) : normalized;
  },

  async updateLoreItem(id, patch) {
    const data = await this.request(`/api/library/items/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify({ item: patch })
    });
    if (data?.lore) state.lore = normalizeLoreCollection(data.lore);
    else upsertLocalLoreItem(normalizeLoreItem({ ...(state.lore.find(item => item.id === id) || {}), ...patch, id }));
    saveState();
    return state.lore.find(item => item.id === id) || null;
  },

  async applyApprovedChange(change) {
    const data = await this.request("/api/library/apply-approved-change", {
      method: "POST",
      body: JSON.stringify({ change })
    });
    if (data?.lore) state.lore = normalizeLoreCollection(data.lore);
    else applyApprovedChangeLocally(change);
    saveState();
  },

  async proposeChange(change) {
    mergeProposedChanges([change]);
    saveState();
  }
};

function upsertLocalLoreItem(item) {
  const index = state.lore.findIndex(entry => entry.id === item.id);
  if (index === -1) state.lore.push(item);
  else state.lore[index] = item;
}

function searchLocalLore(query = {}) {
  const terms = tokenizeLoreQuery([query.query, query.message, query.chapterId].filter(Boolean).join(" "));
  const types = toList(query.types);
  const limit = Math.min(Math.max(Number(query.limit || 6), 1), 12);
  return state.lore
    .filter(item => !types.length || types.includes(item.type))
    .map(item => ({ item, score: scoreLoreMatch(item, terms) }))
    .filter(entry => !terms.length || entry.score > 0)
    .sort((left, right) => right.score - left.score || importanceRank(right.item.importance) - importanceRank(left.item.importance))
    .slice(0, limit)
    .map(entry => entry.item);
}

function tokenizeLoreQuery(value = "") {
  return String(value)
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(term => term.length >= 2);
}

function scoreLoreMatch(item, terms) {
  const fieldValues = Object.values(normalizeFields(item.fields)).flatMap(value => toList(value));
  const linkValues = normalizeLinks(item.links).flatMap(link => [link.targetTitle, RELATION_TYPE_LABELS[link.relationType], link.note]);
  const haystack = [item.title, item.type, item.summary, item.detail, item.timeline, ...toList(item.tags), ...toList(item.relations), ...toList(item.references), ...fieldValues, ...linkValues]
    .join(" ")
    .toLowerCase();
  if (!terms.length) return importanceRank(item.importance);
  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

function importanceRank(value = "") {
  if (value === "核心") return 4;
  if (value === "高") return 3;
  if (value === "中") return 2;
  return 1;
}

function applyTheme() {
  const theme = THEMES[state.themeId] || THEMES.clean;
  const root = document.documentElement;
  root.style.colorScheme = theme.mode;
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssKey = CSS_VAR_NAMES[key] || key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
    root.style.setProperty(`--${cssKey}`, value);
  });
  document.querySelector('meta[name="theme-color"]').setAttribute("content", theme.colors.accent);
}

function setView(view) {
  state.view = view;
  state.modal = null;
  saveState();
  render();
}

function html(strings, ...values) {
  return strings.reduce((out, string, index) => out + string + (values[index] ?? ""), "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  const template = document.getElementById("toastTemplate");
  const toast = template.content.firstElementChild.cloneNode(true);
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2400);
}

function render() {
  applyTheme();
  renderTopbar();
  renderNav();
  const screen = document.getElementById("screen");
  screen.className = `screen view-${state.view}`;
  const renderers = {
    ai: renderAI,
    library: renderLibrary,
    outline: renderOutline,
    graph: renderGraph,
    settings: renderSettings
  };
  screen.innerHTML = renderers[state.view]();
  const modalRoot = document.getElementById("modalRoot");
  if (modalRoot) modalRoot.innerHTML = renderModal();
  bindActions();
}

function renderTopbar() {
  const titles = {
    ai: ["云上王朝", "AI 写作 · 引用资料 · 待审批"],
    library: ["资料库", "人物 · 家族 · 世界观 · 年表 · 规则"],
    outline: ["大纲", "卷 · 章 · 目标 · 禁用内容"],
    graph: ["关系/时间线", "关系网 · 时间顺序 · 影响范围"],
    settings: ["设置", "外观主题 · API Key · 本地数据"]
  };
  const [title, eyebrow] = titles[state.view] || titles.ai;
  document.getElementById("sectionTitle").textContent = title;
  document.getElementById("sectionEyebrow").textContent = eyebrow;
}

function renderNav() {
  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.view === state.view);
  });
}

function renderAI() {
  const selectedChapter = state.chapters.find(chapter => chapter.id === state.selectedChapterId);
  const contextItems = resolveContextItems();
  const pending = state.proposedChanges.filter(change => change.status === "待审批");
  const apiReady = isAiConfigured();
  const hasRealActivity = state.chat.length || state.lastContextBundle || state.generatedDraft || pending.length;
  return html`
    <div class="ai-workspace">
      <section class="ai-timeline" aria-label="AI 创作对话">
        ${state.chat
          .map(renderTimelineMessage)
          .join("")}
        ${state.lastContextBundle ? renderContextOutput(contextItems, selectedChapter) : ""}
        ${state.generatedDraft && state.draftText ? renderDraftOutput(state.draftText, selectedChapter) : ""}
        ${pending.length ? renderApprovalsOutput(pending) : ""}
        ${hasRealActivity ? "" : renderAIEmptyState(apiReady)}
      </section>
      ${renderAIComposer(apiReady)}
    </div>
  `;
}

function renderAIEmptyState(apiReady) {
  return `
    <article class="ai-empty-state">
      <h2>${apiReady ? "等待真实生成" : "AI 未连接"}</h2>
      <p>${apiReady ? "发送请求或生成章节后，才会显示真实引用资料、章节草稿和待审批变更。" : "连接 DeepSeek 前，不会自动生成引用资料、章节草稿或待审批变更。"}</p>
    </article>
  `;
}

function renderTimelineMessage(item) {
  const role = item.role === "user" ? "user" : "assistant";
  return `
    <article class="timeline-row ${role}">
      ${role === "assistant" ? `<span class="avatar">AI</span>` : ""}
      <div class="message-bubble">
        <p>${escapeHtml(item.text)}</p>
        ${item.meta ? `<span class="small">${escapeHtml(item.meta)}</span>` : ""}
      </div>
    </article>
  `;
}

function renderContextOutput(items, chapter) {
  if (!state.lastContextBundle) return "";
  const sourceText = `已读取 ${items.length} 条资料`;
  const rows = items
    .map(
      item => `
        <button class="context-row" type="button" data-select-lore="${escapeHtml(item.id)}">
          <span class="context-mark">${escapeHtml(contextMark(item.type))}</span>
          <span class="context-copy">
            <strong>${escapeHtml(item.title)}</strong>
            <small>${escapeHtml(item.summary || item.type || "资料")}</small>
          </span>
          <span class="context-meta">${escapeHtml(contextMeta(item))}</span>
        </button>
      `
    )
    .join("");

  return `
    <article class="timeline-row assistant output-row">
      <span class="avatar">AI</span>
      <section class="ai-output-card context-output">
        <div class="output-head">
          <div>
            <h2>本次引用资料</h2>
            <p>${sourceText} · ${escapeHtml(chapter?.title || "当前章节")}</p>
          </div>
          <button class="text-action" type="button" data-action="show-context">查看</button>
        </div>
        <div class="context-stack">${rows}</div>
      </section>
    </article>
  `;
}

function renderDraftOutput(draftText, chapter) {
  return `
    <article class="timeline-row assistant output-row">
      <span class="avatar">AI</span>
      <section class="ai-output-card draft-output">
        <div class="output-head">
          <div>
            <h2>章节草稿</h2>
            <p>${escapeHtml(chapter?.title || "当前章节")} · 新增片段</p>
          </div>
        </div>
        <p class="draft-text">${escapeHtml(draftText)}</p>
        <div class="inline-actions">
          <button class="btn" type="button" data-action="continue-draft">继续改写</button>
          <button class="btn" type="button" data-view-jump="approvals">处理变更</button>
        </div>
      </section>
    </article>
  `;
}

function renderApprovalsOutput(pending) {
  return `
    <article class="timeline-row assistant output-row" id="approvals">
      <span class="avatar">AI</span>
      <section class="ai-output-card approvals-output">
        <div class="output-head">
          <div>
            <h2>待审批变更</h2>
            <p>AI 只能提交建议，批准后才写入资料库。</p>
          </div>
          <span class="badge">${pending.length}</span>
        </div>
        <div class="approval-stack">
          ${pending.length ? pending.map(renderChange).join("") : `<p class="empty-note">没有待审批变更。</p>`}
        </div>
      </section>
    </article>
  `;
}

function renderAIComposer(apiReady) {
  return `
    <section class="ai-composer" aria-label="AI 输入">
      <textarea id="aiMessageInput" rows="2" placeholder="要求后续变更…"></textarea>
      <div class="composer-toolbar">
        <button class="icon-button" type="button" data-action="show-context" aria-label="查看引用资料">+</button>
        <button class="mode-button" type="button" data-action="open-ai-approvals">替我审批</button>
        <button class="mode-button subtle" type="button" data-action="open-current-plan">计划</button>
        <span class="composer-spacer"></span>
        <span class="connection-dot ${apiReady ? "active" : ""}">${apiReady ? "5.5" : "未连接"}</span>
        <button class="icon-button muted" type="button" aria-label="语音输入" disabled>◦</button>
        <button class="send-button" type="button" data-action="send-ai-message" aria-label="${aiBusy ? "处理中" : "发送给 AI"}">
          <span>${aiBusy ? "■" : "↑"}</span>
        </button>
      </div>
    </section>
  `;
}

function resolveContextItems() {
  const ids = state.lastContextBundle?.loreItemIds || [];
  const items = ids
    .map(id => state.lore.find(item => item.id === id) || { id, type: "资料", title: id, summary: "AIContextBundle" })
    .filter(Boolean);
  return uniqueById(items).slice(0, 4);
}

function resolveContextItemTitles() {
  return resolveContextItems().map(item => item.title);
}

function contextMark(type) {
  return {
    人物: "人",
    "家族/势力": "势",
    事件: "事",
    "物品/线索": "物",
    "地点/地理": "地",
    "世界观/规则": "观",
    "历史/年表": "史",
    "种族/生物": "族",
    "能力/魔法": "法",
    "宗教/文化": "文",
    "国家/制度": "制",
    卷章: "卷"
  }[type] || "资";
}

function contextMeta(item) {
  const reference = toList(item.references)[0] || item.timeline || "";
  return [item.type, reference].filter(Boolean).join(" · ");
}

function renderChange(change) {
  return `
    <article class="approval-item">
      <div>
        <div class="approval-title">
          <strong>${escapeHtml(change.type)} · ${escapeHtml(change.title)}</strong>
          <span>AIProposedChange</span>
        </div>
        <p>原因：${escapeHtml(change.reason)}</p>
        <p>影响：${escapeHtml(change.impact)}</p>
        <p>冲突：${escapeHtml(change.conflict)}</p>
      </div>
      <div class="approval-actions">
        <button class="btn primary" data-action="approve-change" data-id="${change.id}">批准</button>
        <button class="btn danger" data-action="reject-change" data-id="${change.id}">拒绝</button>
      </div>
    </article>
  `;
}

function renderLibrary() {
  const items = state.lore.filter(item => state.activeCategory === "全部" || item.type === state.activeCategory);
  return html`
    <div class="stack">
      ${renderLibraryCategories()}
      <section class="list">
        ${items.length ? items.map(item => renderLoreRow(item)).join("") : `<p class="empty-note">这个分类还没有资料。可以点右上角或下方“新建”补一条设定。</p>`}
      </section>
      <section class="panel pad stack">
        <div class="row between">
          <div>
            <h2 class="section-title">资料索引</h2>
            <p class="caption">${state.librarySource === "server" ? "本地 JSON/API" : "浏览器本地"} · ${items.length} 条当前分类资料</p>
          </div>
          <button class="btn" data-action="open-new-lore">新建</button>
        </div>
      </section>
    </div>
  `;
}

function renderLibraryCategories() {
  return `
    <section class="category-groups" aria-label="资料分类">
      ${LORE_CATEGORY_GROUPS.map(
        group => `
          <div class="category-row">
            <span class="category-label">${group.label}</span>
            <div class="category-scroll">
              ${group.categories.map(category => renderCategoryButton(category)).join("")}
            </div>
          </div>
        `
      ).join("")}
    </section>
  `;
}

function renderCategoryButton(category) {
  const count = category === "全部" ? state.lore.length : state.lore.filter(item => item.type === category).length;
  return `<button class="category-chip ${state.activeCategory === category ? "active" : ""}" data-category="${escapeHtml(category)}">${escapeHtml(category)} <span>${count}</span></button>`;
}

function renderLoreRow(item) {
  return `
    <button class="list-row lore-row ${state.selectedLoreId === item.id ? "selected" : ""}" type="button" data-select-lore="${item.id}">
      <div class="lore-row-copy">
        <span class="lore-type-pill">${escapeHtml(item.type)}</span>
        <strong>${item.title}</strong>
        <span class="lore-summary">${item.summary || "暂无摘要"}</span>
      </div>
      <span class="badge">${item.importance}</span>
    </button>
  `;
}

function renderLoreEditor() {
  const item = state.lore.find(entry => entry.id === state.editLoreId) || state.lore.find(entry => entry.id === state.selectedLoreId) || state.lore[0];
  const profile = loreFormProfile(item?.type);
  if (!item) {
    return `
      <div class="stack">
        <section class="panel pad stack">
          <h2 class="section-title">没有可编辑资料</h2>
          <button class="btn primary" data-action="back-to-library">返回资料库</button>
        </section>
      </div>
    `;
  }
  return `
    <div class="stack">
      <section class="detail editor-panel">
        <div class="row between">
          <div>
            <h2 class="section-title">${escapeHtml(item.title)}</h2>
            <p class="caption" data-profile-caption="editLore">${escapeHtml(item.type)} · ${escapeHtml(item.status)}</p>
          </div>
          <button class="chip" data-action="back-to-library">返回</button>
        </div>
        <div class="field">
          <label for="editLoreTitle" data-profile-label="editLore.titleLabel">${profile.titleLabel}</label>
          <input id="editLoreTitle" value="${escapeHtml(item.title)}" />
        </div>
        <div class="field">
          <label>分类</label>
          ${renderOptionButtons("editLore", "Type", LORE_CATEGORIES, item.type)}
        </div>
        <div class="field">
          <label>重要度</label>
          ${renderOptionButtons("editLore", "Importance", IMPORTANCE_OPTIONS, item.importance)}
        </div>
        <div class="field">
          <label>状态</label>
          ${renderOptionButtons("editLore", "Status", STATUS_OPTIONS, item.status)}
        </div>
        <div class="field">
          <label for="editLoreSummary" data-profile-label="editLore.summaryLabel">${profile.summaryLabel}</label>
          <textarea id="editLoreSummary" class="small-textarea" placeholder="${escapeHtml(profile.summaryPlaceholder)}">${escapeHtml(item.summary)}</textarea>
        </div>
        <div class="field">
          <label for="editLoreDetail" data-profile-label="editLore.detailLabel">${profile.detailLabel}</label>
          <textarea id="editLoreDetail" placeholder="${escapeHtml(profile.detailPlaceholder)}">${escapeHtml(item.detail)}</textarea>
        </div>
        <div data-structured-fields="editLore">${renderStructuredFields("editLore", item)}</div>
        <div class="grid-2">
          <div class="field">
            <label for="editLoreRelations" data-profile-label="editLore.relationsLabel">${profile.relationsLabel}</label>
            <textarea id="editLoreRelations" class="small-textarea" placeholder="${escapeHtml(profile.relationsPlaceholder)}">${escapeHtml(relationTextForForm(item))}</textarea>
          </div>
          <div class="field">
            <label for="editLoreReferences" data-profile-label="editLore.referencesLabel">${profile.referencesLabel}</label>
            <textarea id="editLoreReferences" class="small-textarea" placeholder="${escapeHtml(profile.referencesPlaceholder)}">${escapeHtml(item.references.join("、"))}</textarea>
          </div>
        </div>
        <div class="field">
          <label for="editLoreTags">标签</label>
          <input id="editLoreTags" value="${escapeHtml(item.tags.join("、"))}" />
        </div>
        <div class="field">
          <label for="editLoreTimeline" data-profile-label="editLore.timelineLabel">${profile.timelineLabel}</label>
          <input id="editLoreTimeline" value="${escapeHtml(item.timeline)}" placeholder="${escapeHtml(profile.timelinePlaceholder)}" />
        </div>
        <div class="button-row">
          <button class="btn primary" data-action="save-lore-editor" data-id="${item.id}">保存修改</button>
          <button class="btn" data-action="cancel-lore-editor" data-id="${item.id}">取消</button>
        </div>
      </section>
    </div>
  `;
}

function renderOptions(options, selected) {
  return options.map(option => `<option value="${escapeHtml(option)}" ${option === selected ? "selected" : ""}>${escapeHtml(option)}</option>`).join("");
}

function loreFormProfile(type) {
  return LORE_FORM_PROFILES[type] || LORE_FORM_PROFILES.人物;
}

function renderOptionButtons(prefix, field, options, selected) {
  const inputId = `${prefix}${field}`;
  const layoutClass = field === "Importance" ? "segmented-options" : "";
  return `
    <input id="${inputId}" type="hidden" value="${escapeHtml(selected)}" />
    <div class="option-grid ${layoutClass}" data-option-group="${inputId}">
      ${options
        .map(
          option => `
            <button class="option-chip ${option === selected ? "active" : ""}" type="button" data-form-option="${escapeHtml(option)}" data-form-prefix="${prefix}" data-form-field="${field}">
              ${escapeHtml(option)}
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function renderStructuredFields(prefix, item = {}) {
  const type = normalizeLoreType(item.type || inputValue(`${prefix}Type`) || "人物");
  if (type !== "家族/势力") return "";
  const people = state.lore.filter(entry => entry.type === "人物");
  const factions = state.lore.filter(entry => entry.type === "家族/势力" && entry.id !== item.id);
  const members = selectedLinkIds(item, "members", "member");
  const allies = selectedLinkIds(item, "allies", "ally");
  const enemies = selectedLinkIds(item, "enemies", "enemy");
  return `
    <section class="structured-fields" data-structured-type="family">
      ${renderEntityPicker({
        prefix,
        field: "Members",
        label: "成员",
        choices: people,
        selectedIds: members,
        emptyText: "还没有可选人物。先新建人物资料，再把 TA 加入家族/势力。"
      })}
      <div class="grid-2">
        ${renderEntityPicker({
          prefix,
          field: "Allies",
          label: "盟友",
          choices: factions,
          selectedIds: allies,
          emptyText: "还没有其他家族/势力可选。"
        })}
        ${renderEntityPicker({
          prefix,
          field: "Enemies",
          label: "敌对",
          choices: factions,
          selectedIds: enemies,
          emptyText: "还没有其他家族/势力可选。"
        })}
      </div>
    </section>
  `;
}

function renderEntityPicker({ prefix, field, label, choices, selectedIds, emptyText }) {
  const selected = choices.filter(choice => selectedIds.includes(choice.id));
  const summary = selected.length ? selected.map(choice => choice.title).join("、") : "点击展开选择";
  return `
    <details class="link-picker" ${selected.length ? "open" : ""}>
      <summary>
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(summary)}</strong>
      </summary>
      ${
        choices.length
          ? `<div class="picker-options">
              ${choices
                .map(
                  choice => `
                    <label class="picker-option">
                      <input type="checkbox" value="${escapeHtml(choice.id)}" data-structured-field="${prefix}${field}" ${selectedIds.includes(choice.id) ? "checked" : ""} />
                      <span>
                        <strong>${escapeHtml(choice.title)}</strong>
                        <small>${escapeHtml(choice.summary || choice.type)}</small>
                      </span>
                    </label>
                  `
                )
                .join("")}
            </div>`
          : `<p class="picker-empty">${escapeHtml(emptyText)}</p>`
      }
    </details>
  `;
}

function selectedLinkIds(item = {}, fieldName, relationType) {
  const fromFields = toList(normalizeFields(item.fields)[fieldName]);
  const fromLinks = normalizeLinks(item.links)
    .filter(link => link.relationType === relationType)
    .map(link => link.targetId || findLoreIdByTitle(link.targetTitle))
    .filter(Boolean);
  return unique([...fromFields, ...fromLinks]);
}

function findLoreIdByTitle(title = "") {
  return state.lore.find(item => item.title === title)?.id || "";
}

function renderModal() {
  if (!state.modal) return "";
  if (state.modal.type === "lore-detail") return renderLoreDetailModal(state.modal.id);
  if (state.modal.type === "lore-new") return renderLoreCreateModal();
  if (state.modal.type === "lore-form" && state.modal.mode === "create") return renderLoreCreateModal();
  if (state.modal.type === "lore-form" && state.modal.mode === "edit") return renderLoreEditModal(state.modal.id);
  if (state.modal.type === "lore-relations") return renderLoreRelationsModal(state.modal.id);
  if (state.modal.type === "chapter-detail") return renderChapterDetailModal(state.modal.id);
  if (state.modal.type === "chapter-form") return renderChapterFormModal(state.modal.mode, state.modal.id);
  if (state.modal.type === "relation-detail") return renderRelationDetailModal(state.modal.id);
  if (state.modal.type === "relation-form") return renderRelationFormModal(state.modal.id);
  if (state.modal.type === "settings-panel") return renderSettingsPanelModal(state.modal.id);
  if (state.modal.type === "ai-context") return renderAIContextModal();
  if (state.modal.type === "ai-approvals") return renderAIApprovalsModal();
  return "";
}

function renderLoreDetailModal(id) {
  const item = state.lore.find(entry => entry.id === id);
  if (!item) return "";
  const profile = loreFormProfile(item.type);
  return `
    <div class="modal-layer" role="presentation">
      <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="loreModalTitle">
        <div class="modal-head">
          <div>
            <h2 id="loreModalTitle">${escapeHtml(item.title)}</h2>
            <p class="caption">${escapeHtml(item.type)} · ${escapeHtml(item.status)} · ${escapeHtml(item.importance)}</p>
          </div>
          <button class="round-action small" type="button" data-action="close-modal" aria-label="关闭">×</button>
        </div>
        <div class="field">
          <label>${profile.summaryLabel}</label>
          <p class="readonly-box">${escapeHtml(item.summary)}</p>
        </div>
        <div class="field">
          <label>${profile.detailLabel}</label>
          <p class="readonly-box tall">${escapeHtml(item.detail)}</p>
        </div>
        <div class="grid-2">
          <div class="mini-card">
            <strong>${profile.relationsLabel}</strong>
            <span>${escapeHtml(relationTextForForm(item) || "暂无关联")}</span>
          </div>
          <div class="mini-card">
            <strong>${profile.referencesLabel}</strong>
            <span>${escapeHtml(item.references.join("、") || "暂无引用")}</span>
          </div>
        </div>
        ${renderLoreStructuredSummary(item)}
        <div class="chip-row">${item.tags.map(tag => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}</div>
        <div class="button-row">
          <button class="btn primary" data-action="open-lore-editor" data-id="${item.id}">编辑详情</button>
          <button class="btn" data-action="ask-ai-about-lore" data-id="${item.id}">让 AI 读取</button>
          <button class="btn" data-action="open-relations-modal" data-id="${item.id}">关联资料</button>
        </div>
      </section>
    </div>
  `;
}

function renderLoreStructuredSummary(item) {
  if (item.type === "家族/势力") {
    const cards = [
      ["成员", linkTitles(item, "member", "members")],
      ["盟友", linkTitles(item, "ally", "allies")],
      ["敌对", linkTitles(item, "enemy", "enemies")]
    ];
    return `
      <div class="grid-2 structured-summary">
        ${cards
          .map(
            ([label, values]) => `
              <div class="mini-card">
                <strong>${label}</strong>
                <span>${escapeHtml(values.join("、") || "未选择")}</span>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  if (item.type === "人物") {
    const families = state.lore
      .filter(entry => entry.type === "家族/势力")
      .filter(entry => normalizeLinks(entry.links).some(link => link.relationType === "member" && (link.targetId === item.id || link.targetTitle === item.title)))
      .map(entry => entry.title);
    if (!families.length) return "";
    return `
      <div class="mini-card">
        <strong>所属家族/势力</strong>
        <span>${escapeHtml(families.join("、"))}</span>
      </div>
    `;
  }

  return "";
}

function linkTitles(item, relationType, fieldName) {
  const fieldIds = toList(normalizeFields(item.fields)[fieldName]);
  const fromFields = fieldIds.map(id => state.lore.find(entry => entry.id === id)?.title || "").filter(Boolean);
  const fromLinks = normalizeLinks(item.links)
    .filter(link => link.relationType === relationType)
    .map(link => link.targetTitle || state.lore.find(entry => entry.id === link.targetId)?.title || "")
    .filter(Boolean);
  return unique([...fromFields, ...fromLinks]);
}

function relationTextForForm(item) {
  if (item.type !== "家族/势力") return toList(item.relations).join("、");
  const managedTitles = new Set([
    ...linkTitles(item, "member", "members"),
    ...linkTitles(item, "ally", "allies"),
    ...linkTitles(item, "enemy", "enemies")
  ]);
  return toList(item.relations)
    .filter(title => !managedTitles.has(title))
    .join("、");
}

function renderLoreCreateModal() {
  const profile = loreFormProfile("人物");
  return `
    <div class="modal-layer" role="presentation">
      <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="newLoreTitle">
        <div class="modal-head">
          <div>
            <h2 id="newLoreTitle">新资料</h2>
            <p class="caption" data-profile-caption="newLore">人物 · 草稿</p>
          </div>
          <button class="round-action small" type="button" data-action="close-modal" aria-label="关闭">×</button>
        </div>
        <div class="field">
          <label>分类</label>
          ${renderOptionButtons("newLore", "Type", LORE_CATEGORIES, "人物")}
        </div>
        <div class="field">
          <label>重要度</label>
          ${renderOptionButtons("newLore", "Importance", IMPORTANCE_OPTIONS, "中")}
        </div>
        <div class="field">
          <label for="newLoreTitleInput" data-profile-label="newLore.titleLabel">${profile.titleLabel}</label>
          <input id="newLoreTitleInput" value="" placeholder="${escapeHtml(profile.titlePlaceholder)}" />
        </div>
        <div class="field">
          <label for="newLoreSummary" data-profile-label="newLore.summaryLabel">${profile.summaryLabel}</label>
          <textarea id="newLoreSummary" class="small-textarea" placeholder="${escapeHtml(profile.summaryPlaceholder)}"></textarea>
        </div>
        <div class="field">
          <label for="newLoreDetail" data-profile-label="newLore.detailLabel">${profile.detailLabel}</label>
          <textarea id="newLoreDetail" placeholder="${escapeHtml(profile.detailPlaceholder)}"></textarea>
        </div>
        <div data-structured-fields="newLore">${renderStructuredFields("newLore", { type: "人物" })}</div>
        <div class="grid-2">
          <div class="field">
            <label for="newLoreRelations" data-profile-label="newLore.relationsLabel">${profile.relationsLabel}</label>
            <textarea id="newLoreRelations" class="small-textarea" placeholder="${escapeHtml(profile.relationsPlaceholder)}"></textarea>
          </div>
          <div class="field">
            <label for="newLoreReferences" data-profile-label="newLore.referencesLabel">${profile.referencesLabel}</label>
            <textarea id="newLoreReferences" class="small-textarea" placeholder="${escapeHtml(profile.referencesPlaceholder)}"></textarea>
          </div>
        </div>
        <div class="field">
          <label for="newLoreTimeline" data-profile-label="newLore.timelineLabel">${profile.timelineLabel}</label>
          <input id="newLoreTimeline" placeholder="${escapeHtml(profile.timelinePlaceholder)}" />
        </div>
        <input id="newLoreStatus" type="hidden" value="草稿" />
        <div class="button-row">
          <button class="btn primary" data-action="save-new-lore">保存资料</button>
          <button class="btn" data-action="save-new-lore-and-read">让 AI 读取</button>
        </div>
      </section>
    </div>
  `;
}

function renderLoreEditModal(id) {
  const item = state.lore.find(entry => entry.id === id);
  if (!item) return "";
  const profile = loreFormProfile(item.type);
  return `
    <div class="modal-layer" role="presentation">
      <section class="modal-card modal-card-large" role="dialog" aria-modal="true" aria-labelledby="editLoreTitleHeading">
        <div class="modal-head">
          <div>
            <h2 id="editLoreTitleHeading">${escapeHtml(item.title)}</h2>
            <p class="caption" data-profile-caption="editLore">${escapeHtml(item.type)} · ${escapeHtml(item.status)}</p>
          </div>
          <button class="round-action small" type="button" data-action="close-modal" aria-label="关闭">×</button>
        </div>
        <div class="field">
          <label for="editLoreTitle" data-profile-label="editLore.titleLabel">${profile.titleLabel}</label>
          <input id="editLoreTitle" value="${escapeHtml(item.title)}" placeholder="${escapeHtml(profile.titlePlaceholder)}" />
        </div>
        <div class="field">
          <label>分类</label>
          ${renderOptionButtons("editLore", "Type", LORE_CATEGORIES, item.type)}
        </div>
        <div class="field">
          <label>重要度</label>
          ${renderOptionButtons("editLore", "Importance", IMPORTANCE_OPTIONS, item.importance)}
        </div>
        <div class="field">
          <label>状态</label>
          ${renderOptionButtons("editLore", "Status", STATUS_OPTIONS, item.status)}
        </div>
        <div class="field">
          <label for="editLoreSummary" data-profile-label="editLore.summaryLabel">${profile.summaryLabel}</label>
          <textarea id="editLoreSummary" class="small-textarea" placeholder="${escapeHtml(profile.summaryPlaceholder)}">${escapeHtml(item.summary)}</textarea>
        </div>
        <div class="field">
          <label for="editLoreDetail" data-profile-label="editLore.detailLabel">${profile.detailLabel}</label>
          <textarea id="editLoreDetail" placeholder="${escapeHtml(profile.detailPlaceholder)}">${escapeHtml(item.detail)}</textarea>
        </div>
        <div data-structured-fields="editLore">${renderStructuredFields("editLore", item)}</div>
        <div class="grid-2">
          <div class="field">
            <label for="editLoreRelations" data-profile-label="editLore.relationsLabel">${profile.relationsLabel}</label>
            <textarea id="editLoreRelations" class="small-textarea" placeholder="${escapeHtml(profile.relationsPlaceholder)}">${escapeHtml(relationTextForForm(item))}</textarea>
          </div>
          <div class="field">
            <label for="editLoreReferences" data-profile-label="editLore.referencesLabel">${profile.referencesLabel}</label>
            <textarea id="editLoreReferences" class="small-textarea" placeholder="${escapeHtml(profile.referencesPlaceholder)}">${escapeHtml(item.references.join("、"))}</textarea>
          </div>
        </div>
        <div class="field">
          <label for="editLoreTags">标签</label>
          <input id="editLoreTags" value="${escapeHtml(item.tags.join("、"))}" />
        </div>
        <div class="field">
          <label for="editLoreTimeline" data-profile-label="editLore.timelineLabel">${profile.timelineLabel}</label>
          <input id="editLoreTimeline" value="${escapeHtml(item.timeline)}" placeholder="${escapeHtml(profile.timelinePlaceholder)}" />
        </div>
        <div class="button-row">
          <button class="btn primary" data-action="save-lore-editor" data-id="${item.id}">保存修改</button>
          <button class="btn" data-action="open-lore-modal" data-id="${item.id}">返回详情</button>
        </div>
      </section>
    </div>
  `;
}

function renderLoreRelationsModal(id) {
  const item = state.lore.find(entry => entry.id === id);
  if (!item) return "";
  const profile = loreFormProfile(item.type);
  return `
    <div class="modal-layer" role="presentation">
      <section class="modal-card compact" role="dialog" aria-modal="true" aria-labelledby="relationsTitle">
        <div class="modal-head">
          <div>
            <h2 id="relationsTitle">关联资料</h2>
            <p class="caption">${escapeHtml(item.title)}</p>
          </div>
          <button class="round-action small" type="button" data-action="close-modal" aria-label="关闭">×</button>
        </div>
        <div class="field">
          <label for="relationInput">${profile.relationsLabel}</label>
          <textarea id="relationInput">${escapeHtml(relationTextForForm(item))}</textarea>
        </div>
        <div class="field">
          <label for="referenceInput">${profile.referencesLabel}</label>
          <textarea id="referenceInput">${escapeHtml(item.references.join("、"))}</textarea>
        </div>
        <div class="button-row">
          <button class="btn primary" data-action="save-lore-relations" data-id="${item.id}">保存关联</button>
          <button class="btn" data-action="open-lore-modal" data-id="${item.id}">返回详情</button>
        </div>
      </section>
    </div>
  `;
}

function renderOutline() {
  return html`
    <div class="stack">
      <section class="panel pad stack">
        <div class="row between">
          <h2 class="section-title">第 2 卷 · 王都暗线</h2>
          <span class="chip active">写作中</span>
        </div>
        <p class="caption">卷目标：让沈青岚从被动卷入王都政局，转为主动调查旧王灵契。</p>
      </section>
      <section class="list">
        ${state.chapters
          .map(
            chapter => `
              <button class="list-row" type="button" data-select-chapter="${chapter.id}">
                <div>
                  <strong>${chapter.title}</strong>
                  <span>${chapter.goal}</span>
                </div>
                <span class="badge">${chapter.status}</span>
              </button>
            `
          )
          .join("")}
      </section>
      <section class="panel pad stack">
        <div class="row between">
          <div>
            <h2 class="section-title">章节索引</h2>
            <p class="caption">点击章节查看、编辑、发送给 AI；主页面只保留一级列表。</p>
          </div>
          <button class="btn" data-action="open-new-chapter">新建</button>
        </div>
      </section>
    </div>
  `;
}

function renderChapterDetailModal(id) {
  const chapter = state.chapters.find(item => item.id === id);
  if (!chapter) return "";
  return `
    <div class="modal-layer" role="presentation">
      <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="chapterModalTitle">
        <div class="modal-head">
          <div>
            <h2 id="chapterModalTitle">${escapeHtml(chapter.title)}</h2>
            <p class="caption">${escapeHtml(chapter.volume)} · ${escapeHtml(chapter.status)}</p>
          </div>
          <button class="round-action small" type="button" data-action="close-modal" aria-label="关闭">×</button>
        </div>
        <div class="field">
          <label>章节目标</label>
          <p class="readonly-box tall">${escapeHtml(chapter.goal)}</p>
        </div>
        <div class="grid-2">
          <div class="mini-card">
            <strong>冲突</strong>
            <span>${escapeHtml(chapter.conflict)}</span>
          </div>
          <div class="mini-card">
            <strong>禁用内容</strong>
            <span>${escapeHtml(chapter.taboo)}</span>
          </div>
        </div>
        <div class="button-row">
          <button class="btn primary" data-action="send-chapter-to-ai" data-id="${chapter.id}">发送给 AI</button>
          <button class="btn" data-action="open-chapter-form" data-id="${chapter.id}">编辑章节</button>
        </div>
      </section>
    </div>
  `;
}

function renderChapterFormModal(mode = "edit", id = "") {
  const chapter =
    mode === "create"
      ? { id: `ch-${Date.now()}`, volume: "第 2 卷", title: "新章节", goal: "", conflict: "", taboo: "", status: "规划中" }
      : state.chapters.find(item => item.id === id);
  if (!chapter) return "";
  return `
    <div class="modal-layer" role="presentation">
      <section class="modal-card modal-card-large" role="dialog" aria-modal="true" aria-labelledby="chapterFormTitle">
        <div class="modal-head">
          <div>
            <h2 id="chapterFormTitle">${mode === "create" ? "新章节" : escapeHtml(chapter.title)}</h2>
            <p class="caption">${escapeHtml(chapter.volume)} · ${escapeHtml(chapter.status)}</p>
          </div>
          <button class="round-action small" type="button" data-action="close-modal" aria-label="关闭">×</button>
        </div>
        <input id="chapterFormId" type="hidden" value="${escapeHtml(chapter.id)}" />
        <div class="grid-2">
          <div class="field">
            <label for="chapterFormTitleInput">章节标题</label>
            <input id="chapterFormTitleInput" value="${escapeHtml(chapter.title)}" placeholder="第 12 章 星陨宴" />
          </div>
          <div class="field">
            <label for="chapterFormVolume">所属卷</label>
            <input id="chapterFormVolume" value="${escapeHtml(chapter.volume)}" placeholder="第 2 卷" />
          </div>
        </div>
        <div class="field">
          <label>状态</label>
          ${renderOptionButtons("chapterForm", "Status", ["已完成", "写作中", "规划中"], chapter.status)}
        </div>
        <div class="field">
          <label for="chapterFormGoal">章节目标</label>
          <textarea id="chapterFormGoal" placeholder="写清这一章需要推进的剧情、情绪和信息。">${escapeHtml(chapter.goal)}</textarea>
        </div>
        <div class="grid-2">
          <div class="field">
            <label for="chapterFormConflict">冲突</label>
            <textarea id="chapterFormConflict" class="small-textarea" placeholder="本章的外部/内部冲突。">${escapeHtml(chapter.conflict)}</textarea>
          </div>
          <div class="field">
            <label for="chapterFormTaboo">禁用内容</label>
            <textarea id="chapterFormTaboo" class="small-textarea" placeholder="本章不能提前揭露或不能违背的设定。">${escapeHtml(chapter.taboo)}</textarea>
          </div>
        </div>
        <div class="button-row">
          <button class="btn primary" data-action="save-chapter-form" data-id="${mode}">保存章节</button>
          <button class="btn" data-action="send-chapter-draft-to-ai">发送给 AI</button>
        </div>
      </section>
    </div>
  `;
}

function renderGraph() {
  return html`
    <div class="stack">
      <section class="panel pad stack">
        <div class="row between">
          <h2 class="section-title">关系网</h2>
          <span class="chip active">第 12 章上下文</span>
        </div>
        <div class="graph-stage">
          <span class="graph-line" style="left:84px;top:84px;width:160px;transform:rotate(-8deg)"></span>
          <span class="graph-line" style="left:98px;top:120px;width:125px;transform:rotate(22deg)"></span>
          <span class="graph-line" style="left:210px;top:96px;width:88px;transform:rotate(46deg)"></span>
          <button class="graph-node" style="left:44px;top:66px" data-action="open-relation-detail" data-id="shen">沈青岚</button>
          <button class="graph-node alt" style="left:220px;top:52px" data-action="open-relation-detail" data-id="yun">云氏</button>
          <button class="graph-node soft" style="left:238px;top:150px" data-action="open-relation-detail" data-id="seal">旧王印</button>
          <button class="graph-node soft" style="left:92px;top:144px" data-action="open-relation-detail" data-id="star-banquet">星陨宴</button>
        </div>
      </section>
      <section class="panel pad stack">
        <div class="row between">
          <h2 class="section-title">时间线</h2>
          <span class="chip">星陨宴前后 3 日</span>
        </div>
        <div class="timeline">
          ${[
            ["宴前", "云氏送出旧宴请柬，沈青岚被迫入局。"],
            ["宴中", "暗杀失败，旧王印第一次出现残响。"],
            ["宴后", "AI 建议新增“密约碎片”作为追踪线索。"]
          ]
            .map(
              ([time, text]) => `
                <article class="timeline-item">
                  <span class="timeline-dot"></span>
                  <div>
                    <strong>${time}</strong>
                    <p class="caption">${text}</p>
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
      <section class="panel pad stack">
        <div class="row between">
          <div>
            <h2 class="section-title">关系索引</h2>
            <p class="caption">点击图中节点查看关系，新增关系也在弹窗内完成。</p>
          </div>
          <button class="btn" data-action="open-new-relation">新建</button>
        </div>
      </section>
    </div>
  `;
}

function renderRelationDetailModal(id) {
  const item = state.lore.find(entry => entry.id === id);
  if (!item) return "";
  return `
    <div class="modal-layer" role="presentation">
      <section class="modal-card compact" role="dialog" aria-modal="true" aria-labelledby="relationDetailTitle">
        <div class="modal-head">
          <div>
            <h2 id="relationDetailTitle">${escapeHtml(item.title)}</h2>
            <p class="caption">${escapeHtml(item.type)} · 关系节点</p>
          </div>
          <button class="round-action small" type="button" data-action="close-modal" aria-label="关闭">×</button>
        </div>
        <div class="grid-2">
          <div class="mini-card">
            <strong>关联对象</strong>
            <span>${escapeHtml(item.relations.join("、") || "暂无关联")}</span>
          </div>
          <div class="mini-card">
            <strong>时间线</strong>
            <span>${escapeHtml(item.timeline || "未记录")}</span>
          </div>
        </div>
        <div class="field">
          <label>引用章节</label>
          <p class="readonly-box">${escapeHtml(item.references.join("、") || "暂无引用")}</p>
        </div>
        <div class="button-row">
          <button class="btn primary" data-action="open-relation-form" data-id="${item.id}">编辑关系</button>
          <button class="btn" data-action="open-lore-modal" data-id="${item.id}">查看资料</button>
        </div>
      </section>
    </div>
  `;
}

function renderRelationFormModal(id = "") {
  const item = state.lore.find(entry => entry.id === id) || state.lore.find(entry => entry.id === state.selectedLoreId) || state.lore[0];
  if (!item) return "";
  return `
    <div class="modal-layer" role="presentation">
      <section class="modal-card compact" role="dialog" aria-modal="true" aria-labelledby="relationFormTitle">
        <div class="modal-head">
          <div>
            <h2 id="relationFormTitle">关系资料</h2>
            <p class="caption">${escapeHtml(item.title)}</p>
          </div>
          <button class="round-action small" type="button" data-action="close-modal" aria-label="关闭">×</button>
        </div>
        <input id="relationSourceId" type="hidden" value="${escapeHtml(item.id)}" />
        <div class="field">
          <label for="relationTargets">关联对象</label>
          <textarea id="relationTargets" placeholder="用顿号分隔人物、势力、地点、事件">${escapeHtml(item.relations.join("、"))}</textarea>
        </div>
        <div class="field">
          <label for="relationTimeline">关系时间线</label>
          <textarea id="relationTimeline" class="small-textarea" placeholder="记录关系发生、变化或生效时间">${escapeHtml(item.timeline || "")}</textarea>
        </div>
        <div class="button-row">
          <button class="btn primary" data-action="save-relation-form">保存关系</button>
          <button class="btn" data-action="open-relation-detail" data-id="${item.id}">返回关系</button>
        </div>
      </section>
    </div>
  `;
}

function renderSettings() {
  const activeTheme = THEMES[state.themeId];
  return html`
    <div class="stack">
      <section class="panel pad stack">
        <div class="row between">
          <div>
            <h2 class="section-title">云上王朝</h2>
            <p class="caption">当前主题：${activeTheme.name}</p>
          </div>
          <button class="chip ${state.followSystem ? "active" : ""}" data-action="toggle-system-theme">
            ${state.followSystem ? "跟随系统" : "手动切换"}
          </button>
        </div>
      </section>
      <section class="list">
        <button class="list-row" type="button" data-action="open-settings-panel" data-id="themes">
          <div>
            <strong>外观主题</strong>
            <span>当前：${activeTheme.name} · 三套主题可切换</span>
          </div>
          <span class="badge">主题</span>
        </button>
        <button class="list-row" type="button" data-action="open-settings-panel" data-id="api">
          <div>
            <strong>DeepSeek API</strong>
            <span>${apiStatusText()} · Key、本地代理和模型配置</span>
          </div>
          <span class="badge">AI</span>
        </button>
        <button class="list-row" type="button" data-action="open-settings-panel" data-id="data">
          <div>
            <strong>本地数据</strong>
            <span>导出 JSON、重置样例、查看本地保存边界</span>
          </div>
          <span class="badge">JSON</span>
        </button>
      </section>
    </div>
  `;
}

function renderSettingsPanelModal(panel = "api") {
  const titles = {
    themes: ["外观主题", "ThemeConfig · 三套主题"],
    api: ["DeepSeek API", `${apiStatusText()} · OpenAI-compatible`],
    data: ["本地数据", "localStorage · JSON 导出"]
  };
  const [title, caption] = titles[panel] || titles.api;
  return `
    <div class="modal-layer" role="presentation">
      <section class="modal-card modal-card-large" role="dialog" aria-modal="true" aria-labelledby="settingsPanelTitle">
        <div class="modal-head">
          <div>
            <h2 id="settingsPanelTitle">${title}</h2>
            <p class="caption">${caption}</p>
          </div>
          <button class="round-action small" type="button" data-action="close-modal" aria-label="关闭">×</button>
        </div>
        ${panel === "themes" ? renderThemeSettingsPanel() : ""}
        ${panel === "api" ? renderApiSettingsPanel() : ""}
        ${panel === "data" ? renderDataSettingsPanel() : ""}
      </section>
    </div>
  `;
}

function renderThemeSettingsPanel() {
  return `
    <div class="stack">
      ${Object.values(THEMES).map(renderThemeCard).join("")}
      <button class="chip ${state.followSystem ? "active" : ""}" data-action="toggle-system-theme">
        ${state.followSystem ? "跟随系统" : "手动切换"}
      </button>
    </div>
  `;
}

function renderApiSettingsPanel() {
  return `
    <div class="stack">
      <p class="caption">支持 DeepSeek/OpenAI-compatible API。推荐用本地服务启动，Key 只保存在你的电脑或浏览器本地。</p>
      <div class="field">
        <label for="apiBaseUrl">Base URL</label>
        <input id="apiBaseUrl" type="url" value="${escapeHtml(state.apiConfig.baseUrl)}" placeholder="https://api.deepseek.com" />
      </div>
      <div class="field">
        <label for="apiModel">模型</label>
        <input id="apiModel" type="text" value="${escapeHtml(state.apiConfig.model)}" placeholder="deepseek-v4-flash" />
      </div>
      <div class="field">
        <label for="apiKey">API Key</label>
        <input id="apiKey" type="password" value="${escapeHtml(state.apiConfig.apiKey)}" placeholder="${state.apiConfig.hasServerKey ? "已检测到 .env.local / 环境变量 Key" : "sk-... 或 ds-..."}" />
      </div>
      <div class="button-row">
        <button class="btn primary" data-action="test-ai-connection">${aiBusy ? "测试中..." : "测试连接"}</button>
        <button class="btn" data-action="save-api-config">保存设置</button>
      </div>
      ${state.apiConfig.lastError ? `<p class="caption danger-text">${escapeHtml(state.apiConfig.lastError)}</p>` : ""}
    </div>
  `;
}

function renderDataSettingsPanel() {
  return `
    <div class="stack">
      <p class="caption">资料库、章节目标、审批记录和主题配置都保存在本地，可导出 JSON。</p>
      <div class="button-row">
        <button class="btn primary" data-action="export-json">导出 JSON</button>
        <button class="btn" data-action="reset-demo">重置样例</button>
      </div>
    </div>
  `;
}

function renderAIContextModal() {
  const ids = state.lastContextBundle?.loreItemIds || [];
  const items = ids
    .map(id => state.lore.find(item => item.id === id))
    .filter(Boolean);
  return `
    <div class="modal-layer" role="presentation">
      <section class="modal-card compact" role="dialog" aria-modal="true" aria-labelledby="aiContextTitle">
        <div class="modal-head">
          <div>
            <h2 id="aiContextTitle">AI 引用资料</h2>
            <p class="caption">${state.lastContextBundle ? "最近一次真实读取" : "等待 AI 读取"}</p>
          </div>
          <button class="round-action small" type="button" data-action="close-modal" aria-label="关闭">×</button>
        </div>
        ${
          items.length
            ? `<section class="list">${items
                .map(
                  item => `
                    <button class="list-row" type="button" data-select-lore="${item.id}">
                      <div>
                        <strong>${escapeHtml(item.title)}</strong>
                        <span>${escapeHtml(item.summary)}</span>
                      </div>
                      <span class="badge">${escapeHtml(item.importance)}</span>
                    </button>
                  `
                )
                .join("")}</section>`
            : `<p class="caption">还没有真实 AI 读取记录。生成草稿或让 AI 读取资料后，这里会列出本次引用。</p>`
        }
        <div class="grid-2">
          <div class="mini-card">
            <strong>关系线索</strong>
            <span>${escapeHtml((state.lastContextBundle?.relationHints || []).join("、") || "暂无")}</span>
          </div>
          <div class="mini-card">
            <strong>时间线</strong>
            <span>${escapeHtml((state.lastContextBundle?.timelineRefs || []).join("、") || "暂无")}</span>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderAIApprovalsModal() {
  const pending = state.proposedChanges.filter(change => change.status === "待审批");
  return `
    <div class="modal-layer" role="presentation">
      <section class="modal-card compact" role="dialog" aria-modal="true" aria-labelledby="aiApprovalsTitle">
        <div class="modal-head">
          <div>
            <h2 id="aiApprovalsTitle">待审批变更</h2>
            <p class="caption">${pending.length ? `共 ${pending.length} 条真实 AI 建议` : "没有真实 AI 待审批建议"}</p>
          </div>
          <button class="round-action small" type="button" data-action="close-modal" aria-label="关闭">×</button>
        </div>
        <div class="approval-stack">
          ${
            pending.length
              ? pending.map(renderChange).join("")
              : `<p class="empty-note">AI 生成或提交资料变更后，才会在这里出现可审批内容。未连接或未生成时不会放入演示数据。</p>`
          }
        </div>
      </section>
    </div>
  `;
}

function renderThemeCard(theme) {
  const active = theme.id === state.themeId;
  const swatches = ["bg", "surface", "accent", "warn"].map(key => {
    return `<span class="swatch" style="background:${theme.colors[key]}"></span>`;
  });
  return `
    <button class="theme-card ${active ? "active" : ""}" type="button" data-theme="${theme.id}">
      <div class="row between">
        <div>
          <strong>${theme.name}</strong>
          <p class="caption">${theme.desc}</p>
        </div>
        <span class="chip ${active ? "active" : ""}">${active ? "当前启用" : "可切换"}</span>
      </div>
      <div class="swatches">${swatches.join("")}<span class="small">${active ? "正在用于当前作品" : "点击预览并应用"}</span></div>
    </button>
  `;
}

function bindActions() {
  document.querySelectorAll("[data-view]").forEach(button => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });
  document.querySelectorAll("[data-view-jump]").forEach(button => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.viewJump);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  document.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", () => {
      state.activeCategory = button.dataset.category;
      saveState();
      render();
    });
  });
  document.querySelectorAll("[data-select-lore]").forEach(button => {
    button.addEventListener("click", () => {
      openLoreModal(button.dataset.selectLore);
    });
  });
  document.querySelectorAll("[data-select-chapter]").forEach(button => {
    button.addEventListener("click", () => {
      openChapterModal(button.dataset.selectChapter);
    });
  });
  document.querySelectorAll("[data-theme]").forEach(button => {
    button.addEventListener("click", () => {
      state.themeId = button.dataset.theme;
      THEMES[state.themeId].lastUsedAt = new Date().toISOString();
      saveState();
      render();
      showToast(`已切换为「${THEMES[state.themeId].name}」`);
    });
  });
  document.querySelectorAll("[data-form-option]").forEach(button => {
    button.addEventListener("click", () => {
      setFormOption(button.dataset.formPrefix, button.dataset.formField, button.dataset.formOption);
    });
  });
  document.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => runAction(button.dataset.action, button.dataset.id));
  });
  document.getElementById("quickAddButton").onclick = () => {
    openQuickAdd();
  };
}

async function runAction(action, id) {
  const actions = {
    "generate-draft": generateDraft,
    "continue-draft": continueDraft,
    "show-context": showContext,
    "open-ai-approvals": openAIApprovals,
    "open-current-plan": openCurrentPlan,
    "send-ai-message": sendAIMessage,
    "approve-change": () => approveChange(id),
    "reject-change": () => rejectChange(id),
    "open-new-lore": openNewLoreModal,
    "save-new-lore": saveNewLore,
    "save-new-lore-and-read": saveNewLoreAndRead,
    "open-lore-modal": () => openLoreModal(id),
    "close-modal": closeModal,
    "open-lore-editor": () => openLoreEditor(id),
    "save-lore-editor": () => saveLoreEditor(id),
    "cancel-lore-editor": () => cancelLoreEditor(id),
    "back-to-library": backToLibrary,
    "open-relations-modal": () => openRelationsModal(id),
    "save-lore-relations": () => saveLoreRelations(id),
    "save-lore-detail": () => saveLoreDetail(id),
    "ask-ai-about-lore": () => askAIAboutLore(id),
    "open-new-chapter": openNewChapterModal,
    "open-chapter-form": () => openChapterFormModal("edit", id),
    "save-chapter-form": () => saveChapterForm(id),
    "send-chapter-draft-to-ai": sendChapterFormToAI,
    "open-relation-detail": () => openRelationDetailModal(id),
    "open-relation-form": () => openRelationFormModal(id),
    "open-new-relation": () => openRelationFormModal(state.selectedLoreId),
    "save-relation-form": saveRelationForm,
    "open-settings-panel": () => openSettingsPanel(id || "api"),
    "send-chapter-to-ai": () => sendChapterToAI(id),
    "save-chapter-goal": saveChapterGoal,
    "toggle-system-theme": toggleSystemTheme,
    "save-api-config": saveApiConfig,
    "test-ai-connection": testAIConnection,
    "fake-save-key": saveApiConfig,
    "export-json": exportJson,
    "reset-demo": resetDemo
  };
  await actions[action]?.();
}

function setFormOption(prefix, field, value) {
  const input = document.getElementById(`${prefix}${field}`);
  if (!input) return;
  input.value = value;
  const group = document.querySelector(`[data-option-group="${prefix}${field}"]`);
  group?.querySelectorAll("[data-form-option]").forEach(button => {
    button.classList.toggle("active", button.dataset.formOption === value);
  });
  if (field === "Type") applyFormProfile(prefix, value);
  if (field === "Status") updateFormCaption(prefix);
}

function applyFormProfile(prefix, type) {
  const profile = loreFormProfile(type);
  Object.entries(profile).forEach(([key, value]) => {
    document.querySelectorAll(`[data-profile-label="${prefix}.${key}"]`).forEach(label => {
      label.textContent = value;
    });
  });
  setPlaceholder(`${prefix}TitleInput`, profile.titlePlaceholder);
  setPlaceholder(`${prefix}Title`, profile.titlePlaceholder);
  setPlaceholder(`${prefix}Summary`, profile.summaryPlaceholder);
  setPlaceholder(`${prefix}Detail`, profile.detailPlaceholder);
  setPlaceholder(`${prefix}Relations`, profile.relationsPlaceholder);
  setPlaceholder(`${prefix}References`, profile.referencesPlaceholder);
  setPlaceholder(`${prefix}Timeline`, profile.timelinePlaceholder);
  document.querySelectorAll(`[data-structured-fields="${prefix}"]`).forEach(container => {
    container.innerHTML = renderStructuredFields(prefix, { type });
  });
  const status = inputValue(`${prefix}Status`) || (prefix === "newLore" ? "草稿" : "");
  document.querySelectorAll(`[data-profile-caption="${prefix}"]`).forEach(caption => {
    caption.textContent = status ? `${type} · ${status}` : type;
  });
}

function updateFormCaption(prefix) {
  const type = inputValue(`${prefix}Type`);
  const status = inputValue(`${prefix}Status`);
  document.querySelectorAll(`[data-profile-caption="${prefix}"]`).forEach(caption => {
    caption.textContent = [type, status].filter(Boolean).join(" · ");
  });
}

function setPlaceholder(id, value) {
  const element = document.getElementById(id);
  if (element && "placeholder" in element) element.placeholder = value;
}

function isAiConfigured() {
  return Boolean(state.apiConfig?.apiKey || state.apiConfig?.hasServerKey);
}

function apiStatusText() {
  if (state.apiConfig?.connected) return "已连接";
  if (state.apiConfig?.hasServerKey) return "检测到本机 Key";
  if (state.apiConfig?.apiKey) return "已填写 Key";
  return "未连接";
}

function collectApiConfigFromInputs() {
  const baseUrl = document.getElementById("apiBaseUrl")?.value.trim() || DEFAULT_API_CONFIG.baseUrl;
  const model = document.getElementById("apiModel")?.value.trim() || DEFAULT_API_CONFIG.model;
  const apiKey = document.getElementById("apiKey")?.value.trim() || state.apiConfig.apiKey || "";
  state.apiConfig = {
    ...DEFAULT_API_CONFIG,
    ...state.apiConfig,
    baseUrl,
    model,
    apiKey,
    lastError: ""
  };
}

function saveApiConfig() {
  collectApiConfigFromInputs();
  state.apiKeySaved = Boolean(state.apiConfig.apiKey || state.apiConfig.hasServerKey);
  saveState();
  render();
  showToast("AI 连接设置已保存到本机");
}

async function testAIConnection() {
  if (aiBusy) return;
  collectApiConfigFromInputs();
  aiBusy = true;
  render();
  try {
    const result = await callAI("/api/ai/test", state.apiConfig);
    state.apiConfig.connected = true;
    state.apiConfig.lastTestAt = new Date().toISOString();
    state.apiConfig.lastError = "";
    showToast(result.message || "DeepSeek 连接成功");
  } catch (error) {
    state.apiConfig.connected = false;
    state.apiConfig.lastError = error.message;
    showToast(`连接失败：${error.message}`);
  } finally {
    aiBusy = false;
    saveState();
    render();
  }
}

async function generateDraft() {
  if (aiBusy) return;
  if (!requireAIConnection("生成章节草稿")) return;

  aiBusy = true;
  render();
  try {
    const chapter = state.chapters.find(item => item.id === state.selectedChapterId);
    const contextPayload = await buildAIContextPayload({ chapter, message: chapter?.goal || "" });
    const result = await callAI("/api/ai/draft", {
      api: state.apiConfig,
      chapter,
      ...contextPayload,
      proposedChanges: state.proposedChanges.filter(change => change.status === "待审批")
    });
    applyDraftResult(result);
    state.apiConfig.connected = true;
    state.apiConfig.lastError = "";
    showToast("DeepSeek 已生成草稿，资料变更已进入审批区");
  } catch (error) {
    state.apiConfig.connected = false;
    state.apiConfig.lastError = error.message;
    state.chat.push({ role: "assistant", text: `DeepSeek 调用失败：${error.message}` });
    showToast(`DeepSeek 调用失败：${error.message}`);
  } finally {
    aiBusy = false;
    saveState();
    render();
  }
}

async function continueDraft() {
  if (!requireAIConnection("继续改写")) return;
  const message = "继续改写，让沈青岚更主动，并降低解释感。";
  state.chat.push({ role: "user", text: message });

  await askAI(message);
}

async function askAI(message, extra = {}) {
  if (aiBusy) return;
  if (!requireAIConnection("让 AI 读取资料")) return;
  aiBusy = true;
  render();
  try {
    const chapter = state.chapters.find(item => item.id === state.selectedChapterId);
    const contextPayload = await buildAIContextPayload({ chapter, message, selectedLore: extra.selectedLore || null });
    const result = await callAI("/api/ai/chat", {
      api: state.apiConfig,
      message,
      view: state.view,
      chapter,
      ...contextPayload,
      selectedLore: extra.selectedLore || null,
      proposedChanges: state.proposedChanges.filter(change => change.status === "待审批")
    });
    state.chat.push({ role: "assistant", text: result.reply || "已完成。" });
    if (result.contextBundle) state.lastContextBundle = result.contextBundle;
    mergeProposedChanges(result.proposedChanges || []);
    const actionReports = await executeAIActions(result.actions || []);
    actionReports.forEach(text => state.chat.push({ role: "assistant", text, meta: "AI 执行结果" }));
    state.apiConfig.connected = true;
    state.apiConfig.lastError = "";
  } catch (error) {
    state.apiConfig.connected = false;
    state.apiConfig.lastError = error.message;
    state.chat.push({ role: "assistant", text: `DeepSeek 调用失败：${error.message}` });
  } finally {
    aiBusy = false;
    saveState();
    render();
  }
}

async function sendAIMessage() {
  const input = document.getElementById("aiMessageInput");
  const message = input?.value.trim() || "";
  if (!message) {
    showToast("先输入你想让 AI 做什么");
    return;
  }
  state.chat.push({ role: "user", text: message });
  saveState();
  await askAI(message);
}

async function executeAIActions(actions) {
  const reports = [];
  for (const action of normalizeAIActions(actions)) {
    if (action.requiresApproval && (action.kind === "proposeLoreChange" || action.kind === "proposeChapterChange")) {
      mergeProposedChanges([action.payload || {}]);
      reports.push("已提交 1 条待审批变更，批准后才会写入。");
      continue;
    }
    if (action.kind === "navigate" && ["ai", "library", "outline", "graph", "settings"].includes(action.targetType || action.targetView)) {
      state.view = action.targetType || action.targetView;
      reports.push(`已切换到「${viewTitle(state.view)}」。`);
      continue;
    }
    if (action.kind === "openModal") {
      const report = await openModalFromAIAction(action);
      if (report) reports.push(report);
      continue;
    }
    if (action.kind === "readLore") {
      const item = await LibraryDataAPI.getLoreItem(action.targetId);
      if (item) {
        state.selectedLoreId = item.id;
        state.modal = { type: "lore-detail", id: item.id, sourceView: "ai" };
        reports.push(`已读取并打开资料「${item.title}」。`);
      }
      continue;
    }
    if (action.kind === "searchLore") {
      const results = await LibraryDataAPI.searchLore({ query: action.payload?.query || action.query || "", limit: 5, detailLimit: 5 });
      reports.push(`已找到 ${results.length} 条相关资料：${results.map(item => item.title).join("、") || "无匹配"}`);
      continue;
    }
    if (action.kind === "generateDraft") {
      reports.push("已收到生成草稿指令；请使用「生成章节草稿」执行真实生成，写入仍需审批。");
      continue;
    }
  }
  return reports;
}

function normalizeAIActions(actions) {
  return (Array.isArray(actions) ? actions : []).map(action => ({
    kind: action.kind || action.type || "",
    targetId: action.targetId || action.id || "",
    targetType: action.targetType || action.target || "",
    targetView: action.targetView || "",
    payload: typeof action.payload === "object" && action.payload ? action.payload : {},
    requiresApproval: Boolean(action.requiresApproval)
  }));
}

async function openModalFromAIAction(action) {
  if (action.targetType === "lore") {
    const item = await LibraryDataAPI.getLoreItem(action.targetId);
    if (!item) return "";
    state.selectedLoreId = item.id;
    state.modal = { type: "lore-detail", id: item.id, sourceView: "ai" };
    return `已打开资料「${item.title}」。`;
  }
  if (action.targetType === "chapter") {
    const chapter = state.chapters.find(item => item.id === action.targetId);
    if (!chapter) return "";
    state.selectedChapterId = chapter.id;
    state.modal = { type: "chapter-detail", id: chapter.id, sourceView: "ai" };
    return `已打开章节「${chapter.title}」。`;
  }
  if (action.targetType === "relation") {
    const item = state.lore.find(entry => entry.id === action.targetId);
    if (!item) return "";
    state.modal = { type: "relation-detail", id: item.id, sourceView: "ai" };
    return `已打开关系节点「${item.title}」。`;
  }
  if (action.targetType === "settings") {
    state.modal = { type: "settings-panel", id: action.targetId || "api", sourceView: "ai" };
    return "已打开设置弹窗。";
  }
  if (action.targetType === "context") {
    state.modal = { type: "ai-context", sourceView: "ai" };
    return "已打开本次 AI 引用资料。";
  }
  return "";
}

function viewTitle(view) {
  return { ai: "AI", library: "资料库", outline: "大纲", graph: "关系", settings: "设置" }[view] || view;
}

function requireAIConnection(actionLabel) {
  if (isAiConfigured()) return true;
  const message = `${actionLabel}需要先连接 DeepSeek。请到设置页填写 API Key 或配置 .env.local。`;
  state.apiConfig.lastError = message;
  state.chat.push({ role: "assistant", text: message });
  saveState();
  render();
  showToast("请先连接 DeepSeek，未生成内容");
  return false;
}

async function buildAIContextPayload({ chapter, message = "", selectedLore = null } = {}) {
  const loreIndex = await LibraryDataAPI.listLoreIndex();
  const query = [
    message,
    chapter?.title,
    chapter?.goal,
    chapter?.conflict,
    chapter?.taboo,
    selectedLore?.title,
    selectedLore?.summary
  ]
    .filter(Boolean)
    .join(" ");
  const forcedDetails = selectedLore ? [normalizeLoreItem(selectedLore)] : [];
  let matchedDetails = await LibraryDataAPI.searchLore({
    query,
    chapterId: chapter?.id || "",
    limit: forcedDetails.length ? 4 : 6,
    detailLimit: forcedDetails.length ? 4 : 6
  });
  if (!matchedDetails.length) {
    matchedDetails = await LibraryDataAPI.searchLore({ query: "", chapterId: chapter?.id || "", limit: 4, detailLimit: 4 });
  }
  const loreDetails = uniqueById([...forcedDetails, ...matchedDetails]).slice(0, 6);
  return {
    loreIndex,
    loreDetails,
    contextRequest: {
      query,
      selectedLoreId: selectedLore?.id || "",
      chapterId: chapter?.id || "",
      detailCount: loreDetails.length
    }
  };
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter(item => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

async function callAI(endpoint, payload) {
  const response = await fetch(`${API_PROXY_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `请求失败：${response.status}`);
  }
  return data;
}

async function hydrateServerConfig() {
  if (window.location.protocol === "file:") return;
  try {
    const response = await fetch(`${API_PROXY_BASE}/api/config`);
    if (!response.ok) return;
    const data = await response.json();
    if (!data.ok) return;
    state.apiConfig = {
      ...DEFAULT_API_CONFIG,
      ...state.apiConfig,
      baseUrl: state.apiConfig.baseUrl || data.baseUrl || DEFAULT_API_CONFIG.baseUrl,
      model: state.apiConfig.model || data.model || DEFAULT_API_CONFIG.model,
      hasServerKey: Boolean(data.hasServerKey)
    };
    saveState();
    render();
  } catch {
    // Opening index.html directly is still supported with localStorage fallback.
  }
}

async function hydrateLibraryFromServer() {
  const lore = await LibraryDataAPI.readState();
  if (!lore) return;
  state.librarySource = "server";
  saveState();
  render();
}

function applyDraftResult(result) {
  state.generatedDraft = true;
  state.draftText = result.draft || result.reply || state.draftText;
  state.lastContextBundle = result.contextBundle || null;
  state.chat.push({
    role: "assistant",
    text: result.reply || "已生成章节草稿，并把资料变更放入待审批列表。"
  });
  mergeProposedChanges(result.proposedChanges || []);
}

function mergeProposedChanges(changes) {
  normalizeClientChanges(changes).forEach(change => {
    if (!state.proposedChanges.some(item => item.id === change.id)) {
      state.proposedChanges.push(change);
    }
  });
}

function normalizeClientChanges(changes) {
  return (Array.isArray(changes) ? changes : []).map((change, index) => ({
    id: change.id || `ai-change-${Date.now()}-${index}`,
    type: ["新增", "修改", "关联", "删除"].includes(change.type) ? change.type : "新增",
    title: change.title || "AI 提议资料变更",
    reason: change.reason || "AI 根据当前章节提出。",
    impact: change.impact || "需要用户确认影响范围。",
    conflict: change.conflict || "未发现明显冲突，但需要人工复核。",
    status: "待审批",
    patch: change.patch || {}
  }));
}

function showContext() {
  if (!state.lastContextBundle) {
    showToast("还没有真实 AI 引用资料");
    return;
  }
  state.modal = { type: "ai-context", sourceView: state.view };
  saveState();
  render();
}

function openAIApprovals() {
  state.modal = { type: "ai-approvals", sourceView: state.view };
  saveState();
  render();
}

function openCurrentPlan() {
  const chapter = state.chapters.find(item => item.id === state.selectedChapterId) || state.chapters[0];
  if (!chapter) {
    showToast("还没有章节计划");
    return;
  }
  state.selectedChapterId = chapter.id;
  state.modal = { type: "chapter-detail", id: chapter.id, sourceView: state.view };
  saveState();
  render();
}

async function approveChange(id) {
  const change = state.proposedChanges.find(item => item.id === id);
  if (!change) return;
  change.status = "已批准";
  await LibraryDataAPI.applyApprovedChange(change);
  saveState();
  render();
  showToast("已批准，资料库和关系/时间线会同步更新");
}

function applyApprovedChangeLocally(change) {
  const patch = change.patch || {};
  const loreItem = patch.loreItem || patch.item || patch;
  const target = findLoreTarget(change, patch);

  if (change.type === "新增") {
    addLoreFromChange(change, loreItem);
    return;
  }

  if (change.type === "修改" && target) {
    Object.assign(target, pickLoreFields(loreItem));
    target.status = target.status || "有效";
    target.tags = unique([...(target.tags || []), "AI已审批"]);
    state.lore = normalizeLoreCollection(state.lore);
    return;
  }

  if (change.type === "关联" && target) {
    const relations = toList(loreItem.relations || patch.relations || [cleanChangeTitle(change.title)]);
    target.relations = unique([...(target.relations || []), ...relations]);
    target.fields = { ...normalizeFields(target.fields), ...normalizeFields(loreItem.fields || patch.fields) };
    target.links = uniqueLinks([...(target.links || []), ...normalizeLinks(loreItem.links || patch.links)]);
    target.tags = unique([...(target.tags || []), "AI已审批"]);
    state.lore = normalizeLoreCollection(state.lore);
    return;
  }

  if (change.type === "删除" && target) {
    target.status = "已归档";
    target.tags = unique([...(target.tags || []), "AI建议删除-已归档"]);
    return;
  }

  addLoreFromChange(change, loreItem);
}

function addLoreFromChange(change, loreItem = {}) {
  const title = loreItem.title || cleanChangeTitle(change.title);
  if (state.lore.some(item => item.title === title)) return;
  state.lore.push(normalizeLoreItem({
    id: loreItem.id || `lore-${Date.now()}-${state.lore.length}`,
    type: loreItem.type || inferLoreType(change.title),
    title,
    summary: loreItem.summary || change.reason || "AI 审批后新增资料。",
    detail: loreItem.detail || `${change.reason}\n\n影响范围：${change.impact}`,
    tags: unique(["AI已审批", ...toList(loreItem.tags)]),
    importance: loreItem.importance || "中",
    status: loreItem.status || "有效",
    relations: toList(loreItem.relations),
    timeline: loreItem.timeline || "",
    references: toList(loreItem.references),
    fields: normalizeFields(loreItem.fields),
    links: normalizeLinks(loreItem.links)
  }));
  state.lore = normalizeLoreCollection(state.lore);
}

function findLoreTarget(change, patch = {}) {
  const targetId = patch.targetId || patch.id;
  if (targetId) {
    const byId = state.lore.find(item => item.id === targetId);
    if (byId) return byId;
  }
  const targetTitle = patch.targetTitle || patch.title || cleanChangeTitle(change.title);
  return state.lore.find(item => item.title === targetTitle || change.title.includes(item.title));
}

function pickLoreFields(source = {}) {
  const allowed = ["type", "title", "summary", "detail", "tags", "importance", "status", "relations", "timeline", "references", "fields", "links"];
  return allowed.reduce((out, key) => {
    if (source[key] !== undefined) out[key] = Array.isArray(source[key]) ? [...source[key]] : source[key];
    return out;
  }, {});
}

function cleanChangeTitle(title = "") {
  return String(title).replace(/^(新增|修改|关联|删除)(人物|事件|地点\/地理|地点|物品\/线索|物品|世界观\/规则|世界规则|历史\/年表|种族\/生物|能力\/魔法|宗教\/文化|国家\/制度|卷章|家族\/势力)?[:：\s]*/, "").trim() || "AI 新资料";
}

function inferLoreType(title = "") {
  if (title.includes("人物")) return "人物";
  if (title.includes("地点") || title.includes("地理")) return "地点/地理";
  if (title.includes("物品") || title.includes("线索")) return "物品/线索";
  if (title.includes("规则") || title.includes("世界观")) return "世界观/规则";
  if (title.includes("历史") || title.includes("年表")) return "历史/年表";
  if (title.includes("种族") || title.includes("生物")) return "种族/生物";
  if (title.includes("能力") || title.includes("魔法")) return "能力/魔法";
  if (title.includes("宗教") || title.includes("文化")) return "宗教/文化";
  if (title.includes("国家") || title.includes("制度")) return "国家/制度";
  if (title.includes("家族") || title.includes("势力")) return "家族/势力";
  return "事件";
}

function toList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (!value) return [];
  return String(value)
    .split(/[、,，\n]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function uniqueLinks(links = []) {
  const seen = new Set();
  return normalizeLinks(links).filter(link => {
    const key = `${link.relationType}:${link.targetId || link.targetTitle}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function rejectChange(id) {
  const change = state.proposedChanges.find(item => item.id === id);
  if (!change) return;
  change.status = "已拒绝";
  saveState();
  render();
  showToast("已拒绝，AI 不会写入这条资料变更");
}

async function openLoreModal(id) {
  const item = await LibraryDataAPI.getLoreItem(id);
  if (!item) return;
  state.selectedLoreId = id;
  state.modal = { type: "lore-detail", id };
  saveState();
  render();
}

function openNewLoreModal() {
  state.view = "library";
  state.modal = { type: "lore-form", mode: "create", sourceView: state.view };
  saveState();
  render();
}

function closeModal() {
  state.modal = null;
  render();
}

function openLoreEditor(id) {
  state.editLoreId = id;
  state.selectedLoreId = id;
  state.modal = { type: "lore-form", mode: "edit", id, sourceView: state.view };
  saveState();
  render();
}

function cancelLoreEditor(id) {
  state.view = "library";
  state.editLoreId = null;
  state.modal = id ? { type: "lore-detail", id } : null;
  saveState();
  render();
  showToast("已取消，未保存修改");
}

function backToLibrary() {
  state.view = "library";
  state.editLoreId = null;
  state.modal = null;
  saveState();
  render();
}

function openRelationsModal(id) {
  state.modal = { type: "lore-relations", id };
  render();
}

function openQuickAdd() {
  const actions = {
    ai: () => {
      state.modal = { type: "ai-context", sourceView: "ai" };
      render();
    },
    library: openNewLoreModal,
    outline: openNewChapterModal,
    graph: () => openRelationFormModal(state.selectedLoreId),
    settings: () => openSettingsPanel("api")
  };
  (actions[state.view] || openNewLoreModal)();
}

function openChapterModal(id) {
  const chapter = state.chapters.find(item => item.id === id);
  if (!chapter) return;
  state.selectedChapterId = id;
  state.modal = { type: "chapter-detail", id, sourceView: state.view };
  saveState();
  render();
}

function openNewChapterModal() {
  state.view = "outline";
  state.modal = { type: "chapter-form", mode: "create", sourceView: "outline" };
  saveState();
  render();
}

function openChapterFormModal(mode = "edit", id = "") {
  const targetId = id || state.selectedChapterId;
  state.modal = { type: "chapter-form", mode, id: targetId, sourceView: state.view };
  saveState();
  render();
}

function readChapterForm() {
  return {
    id: inputValue("chapterFormId") || `ch-${Date.now()}`,
    title: inputValue("chapterFormTitleInput") || "新章节",
    volume: inputValue("chapterFormVolume") || "第 2 卷",
    goal: inputValue("chapterFormGoal"),
    conflict: inputValue("chapterFormConflict"),
    taboo: inputValue("chapterFormTaboo"),
    status: inputValue("chapterFormStatus") || "规划中"
  };
}

function saveChapterForm(mode = "edit") {
  const chapter = readChapterForm();
  if (!chapter.title.trim()) {
    showToast("章节标题不能为空");
    return;
  }
  const index = state.chapters.findIndex(item => item.id === chapter.id);
  if (index === -1) state.chapters.push(chapter);
  else state.chapters[index] = chapter;
  state.selectedChapterId = chapter.id;
  state.modal = { type: "chapter-detail", id: chapter.id, sourceView: "outline" };
  saveState();
  render();
  showToast(mode === "create" ? "新章节已保存" : "章节已保存");
}

async function sendChapterFormToAI() {
  const chapter = readChapterForm();
  const index = state.chapters.findIndex(item => item.id === chapter.id);
  if (index === -1) state.chapters.push(chapter);
  else state.chapters[index] = chapter;
  state.selectedChapterId = chapter.id;
  state.modal = null;
  saveState();
  await sendChapterToAI(chapter.id);
}

function openRelationDetailModal(id) {
  const item = state.lore.find(entry => entry.id === id);
  if (!item) return;
  state.selectedLoreId = id;
  state.modal = { type: "relation-detail", id, sourceView: state.view };
  saveState();
  render();
}

function openRelationFormModal(id = "") {
  state.view = "graph";
  state.modal = { type: "relation-form", id: id || state.selectedLoreId, sourceView: "graph" };
  saveState();
  render();
}

async function saveRelationForm() {
  const id = inputValue("relationSourceId") || state.selectedLoreId;
  const item = state.lore.find(entry => entry.id === id);
  if (!item) return;
  const relations = toList(inputValue("relationTargets"));
  const timeline = inputValue("relationTimeline");
  await LibraryDataAPI.updateLoreItem(id, { ...item, relations, timeline });
  state.selectedLoreId = id;
  state.modal = { type: "relation-detail", id, sourceView: "graph" };
  saveState();
  render();
  showToast("关系资料已保存");
}

function openSettingsPanel(id = "api") {
  state.view = "settings";
  state.modal = { type: "settings-panel", id, sourceView: "settings" };
  saveState();
  render();
}

function readLoreForm(prefix, id) {
  const current = id ? state.lore.find(item => item.id === id) : {};
  const type = normalizeLoreType(inputValue(`${prefix}Type`) || current?.type || "人物");
  const structured = readStructuredFields(prefix, type, current);
  return normalizeLoreItem({
    ...current,
    id: id || `lore-${Date.now()}`,
    title: inputValue(`${prefix}Title`) || inputValue(`${prefix}TitleInput`) || current?.title || "",
    type,
    summary: inputValue(`${prefix}Summary`) || current?.summary || "",
    detail: inputValue(`${prefix}Detail`) || current?.detail || "",
    importance: inputValue(`${prefix}Importance`) || current?.importance || "中",
    status: inputValue(`${prefix}Status`) || current?.status || "草稿",
    tags: inputValue(`${prefix}Tags`) || current?.tags || ["新建"],
    relations: inputValue(`${prefix}Relations`) || current?.relations || [],
    timeline: inputValue(`${prefix}Timeline`) || current?.timeline || "",
    references: inputValue(`${prefix}References`) || current?.references || [],
    fields: structured.fields,
    links: structured.links
  });
}

function readStructuredFields(prefix, type, current = {}) {
  const currentFields = normalizeFields(current?.fields);
  const currentLinks = normalizeLinks(current?.links);
  if (type !== "家族/势力") {
    return { fields: currentFields, links: currentLinks };
  }

  const members = checkedStructuredValues(prefix, "Members");
  const allies = checkedStructuredValues(prefix, "Allies");
  const enemies = checkedStructuredValues(prefix, "Enemies");
  const managedTypes = new Set(["member", "ally", "enemy"]);
  const links = currentLinks.filter(link => !managedTypes.has(link.relationType));
  addLinksFromIds(links, members, "member");
  addLinksFromIds(links, allies, "ally");
  addLinksFromIds(links, enemies, "enemy");
  return {
    fields: { ...currentFields, members, allies, enemies },
    links
  };
}

function checkedStructuredValues(prefix, field) {
  return Array.from(document.querySelectorAll(`[data-structured-field="${prefix}${field}"]:checked`)).map(input => input.value).filter(Boolean);
}

function addLinksFromIds(links, ids, relationType) {
  ids.forEach(id => {
    const target = state.lore.find(item => item.id === id);
    if (!target) return;
    links.push({ targetId: target.id, targetTitle: target.title, relationType, note: "" });
  });
}

function inputValue(id) {
  const element = document.getElementById(id);
  return element && "value" in element ? String(element.value).trim() : "";
}

async function saveNewLore() {
  const saved = await createLoreFromNewForm();
  if (!saved) return;
  state.selectedLoreId = saved.id;
  state.activeCategory = saved.type;
  state.modal = { type: "lore-detail", id: saved.id };
  saveState();
  render();
  showToast("新资料已保存");
}

async function saveNewLoreAndRead() {
  const saved = await createLoreFromNewForm();
  if (!saved) return;
  state.modal = null;
  saveState();
  await askAIAboutLore(saved.id);
}

async function createLoreFromNewForm() {
  const item = readLoreForm("newLore");
  if (!item.title) {
    showToast("请先填写资料标题");
    return null;
  }
  return LibraryDataAPI.createLoreItem(item);
}

async function saveLoreEditor(id) {
  const item = readLoreForm("editLore", id);
  if (!item.title) {
    showToast("资料标题不能为空");
    return;
  }
  await LibraryDataAPI.updateLoreItem(id, item);
  state.selectedLoreId = id;
  state.activeCategory = item.type;
  state.editLoreId = null;
  state.modal = { type: "lore-detail", id };
  saveState();
  render();
  showToast("资料修改已保存");
}

async function saveLoreRelations(id) {
  const item = state.lore.find(entry => entry.id === id);
  if (!item) return;
  const relations = toList(document.getElementById("relationInput")?.value || "");
  const references = toList(document.getElementById("referenceInput")?.value || "");
  await LibraryDataAPI.updateLoreItem(id, { ...item, relations, references });
  state.modal = { type: "lore-detail", id };
  saveState();
  render();
  showToast("关联资料已保存");
}

async function saveLoreDetail(id) {
  const item = state.lore.find(entry => entry.id === id);
  const textarea = document.getElementById("loreDetail");
  if (!item || !textarea) return;
  item.detail = textarea.value.trim();
  await LibraryDataAPI.updateLoreItem(id, item);
  render();
  showToast("资料详情已保存到本地");
}

async function askAIAboutLore(id) {
  const item = state.lore.find(entry => entry.id === id);
  if (!item) return;
  state.view = "ai";
  state.modal = null;
  const message = `读取资料「${item.title}」，帮我判断它是否适合进入下一章。`;
  if (!isAiConfigured()) {
    requireAIConnection("让 AI 读取资料");
    return;
  }
  state.chat.push({
    role: "user",
    text: message
  });
  await askAI(message, { selectedLore: item });
}

async function sendChapterToAI(id = "") {
  const chapter = state.chapters.find(item => item.id === (id || state.selectedChapterId));
  if (!chapter) return;
  if (!requireAIConnection("发送章节给 AI")) return;
  state.view = "ai";
  state.modal = null;
  state.selectedChapterId = chapter.id;
  state.chat.push({
    role: "user",
    text: `按「${chapter.title}」目标生成草稿：${chapter.goal}`
  });
  saveState();
  render();
  await generateDraft();
}

function saveChapterGoal() {
  const chapter = state.chapters.find(item => item.id === state.selectedChapterId);
  const textarea = document.getElementById("chapterGoal");
  if (!chapter || !textarea) return;
  chapter.goal = textarea.value.trim();
  saveState();
  render();
  showToast("章节目标已保存");
}

function addLoreItem() {
  openNewLoreModal();
}

function toggleSystemTheme() {
  state.followSystem = !state.followSystem;
  saveState();
  render();
}

function fakeSaveKey() {
  state.apiKeySaved = true;
  saveState();
  showToast("原型不会保存真实 Key，这里只确认入口位置");
}

function exportJson() {
  const payload = {
    exportedAt: new Date().toISOString(),
    project: {
      name: "云上王朝",
      type: "长篇奇幻",
      themeId: state.themeId
    },
    themeConfigs: THEMES,
    lore: state.lore,
    chapters: state.chapters,
    proposedChanges: state.proposedChanges
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ai-novel-local-export.json";
  a.click();
  URL.revokeObjectURL(url);
  showToast("已导出 JSON");
}

function resetDemo() {
  state = structuredClone(seedState);
  saveState();
  render();
  showToast("样例数据已重置");
}

render();
hydrateServerConfig();
hydrateLibraryFromServer();
