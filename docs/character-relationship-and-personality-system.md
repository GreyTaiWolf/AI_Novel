# 角色关系与性格驱动剧情系统设计

最后更新：2026-06-15

本文档用于设计小说资料库中的“角色关系系统”。目标是让项目不仅能记录角色资料，还能记录家族、势力、血缘、婚姻、师徒、敌对、忠诚、背叛、性格倾向等信息，并让这些信息参与 AI 写作上下文，影响剧情走向。

## 1. 设计目标

本系统解决三个问题：

1. **记录关系**：清楚记录每个角色与家族、势力、亲属、敌人、盟友、导师、学生、主人、奴隶等关系。
2. **记录性格**：每个角色不仅有身份，还要有性格、欲望、恐惧、底线、弱点和行为模式。
3. **影响剧情**：AI 写章节时不能只看角色简介，还要根据角色性格和关系网络判断角色会怎么反应。

一句话定位：

> 角色关系系统不是单纯画关系图，而是给 AI 提供“人物为什么这样做”的逻辑依据。

---

## 2. 核心资料对象

建议把角色关系拆成四类资料对象：

| 对象 | 作用 |
|---|---|
| `Character` | 单个角色资料，记录姓名、身份、性格、目标、弱点等 |
| `Family` | 家族资料，记录家族成员、血脉、爵位、领地、家族矛盾 |
| `Faction` | 势力资料，记录国家、教会、商会、军团、巫族组织等 |
| `Relationship` | 关系边，记录两个对象之间的关系类型、强度、状态和变化 |

其中最重要的是 `Relationship`，因为它能把角色、家族、势力连接起来。

---

## 3. Character 角色模型

角色资料建议包含以下字段。

```ts
interface Character {
  id: string;
  name: string;
  aliases: string[];
  type: '主角' | '女主' | '配角' | '反派' | '路人' | '怪物/异族';
  race: string;
  gender?: string;
  age?: number;
  appearance?: string;

  familyId?: string;
  factionIds: string[];
  status: '未登场' | '已登场' | '失踪' | '死亡' | '隐藏';
  socialClass: string;
  legalStatus: string;

  summary: string;
  background: string;
  currentGoal: string;
  longTermGoal: string;
  fear: string;
  weakness: string;
  bottomLine: string;

  personality: PersonalityProfile;
  relationshipIds: string[];

  firstChapter?: number;
  lastKnownLocationId?: string;
  tags: string[];
}
```

### 字段说明

| 字段 | 说明 |
|---|---|
| `race` | 种族，例如人类、巫族、精灵、矮人、巨龙等 |
| `socialClass` | 社会阶级，例如贵族、自由民、农奴、巫族奴隶等 |
| `legalStatus` | 法律身份，例如公民、奴隶、逃奴、无籍巫族、通缉犯等 |
| `currentGoal` | 当前剧情阶段的目标 |
| `longTermGoal` | 长线欲望，决定角色长期行动 |
| `fear` | 角色最害怕什么 |
| `weakness` | 性格弱点或现实弱点 |
| `bottomLine` | 不会轻易突破的底线 |

---

## 4. PersonalityProfile 性格模型

性格不能只写“冷静、善良、勇敢”这种标签，要能影响剧情。

建议采用“标签 + 数值倾向 + 行为规则”的结构。

```ts
interface PersonalityProfile {
  tags: string[];

  traits: {
    rationality: number;
    empathy: number;
    ambition: number;
    loyalty: number;
    courage: number;
    patience: number;
    suspicion: number;
    aggression: number;
    pride: number;
    adaptability: number;
  };

  decisionStyle: '理性分析' | '情绪驱动' | '利益优先' | '忠诚优先' | '恐惧回避' | '复仇优先' | '信仰优先';
  conflictStyle: '回避' | '谈判' | '隐忍' | '反击' | '支配' | '牺牲' | '背叛';
  trustRule: string;
  betrayalTrigger: string;
  growthDirection: string;
}
```

### 性格数值建议

数值范围建议使用 `0-100`。

| 字段 | 含义 | 剧情影响 |
|---|---|---|
| `rationality` | 理性程度 | 高则会先分析利弊，低则容易冲动 |
| `empathy` | 共情能力 | 高则容易救人，低则更冷酷 |
| `ambition` | 野心 | 高则追求权力、地位、扩张 |
| `loyalty` | 忠诚 | 高则不易背叛，低则容易倒向利益 |
| `courage` | 勇气 | 高则敢冒险，低则容易退缩 |
| `patience` | 忍耐 | 高则能长期潜伏，低则急于行动 |
| `suspicion` | 多疑 | 高则不易信任主角，低则容易被说服 |
| `aggression` | 攻击性 | 高则倾向武力解决 |
| `pride` | 自尊/傲慢 | 高则难以低头，容易冲突 |
| `adaptability` | 适应力 | 高则能接受新制度、新科技 |

---

## 5. Relationship 关系模型

关系应该是独立数据，而不是写死在角色简介里。

```ts
interface Relationship {
  id: string;
  sourceId: string;
  sourceType: 'character' | 'family' | 'faction';
  targetId: string;
  targetType: 'character' | 'family' | 'faction';

  relationType: RelationshipType;
  direction: '单向' | '双向';
  status: '稳定' | '紧张' | '破裂' | '隐藏' | '已结束';

  strength: number;
  trust: number;
  conflict: number;
  loyalty: number;
  fear: number;
  debt: number;

  publicKnowledge: boolean;
  secret: boolean;
  description: string;
  history: RelationshipEvent[];
  plotImpact: string;
}
```

### RelationshipType 关系类型

```ts
type RelationshipType =
  | '父子'
  | '母子'
  | '兄弟'
  | '姐妹'
  | '夫妻'
  | '婚约'
  | '恋人'
  | '暗恋'
  | '朋友'
  | '恩人'
  | '仇人'
  | '主仆'
  | '主人与奴隶'
  | '领主与臣属'
  | '君主与封臣'
  | '导师与学生'
  | '师徒'
  | '同僚'
  | '竞争者'
  | '盟友'
  | '敌对'
  | '利用'
  | '背叛'
  | '保护'
  | '监视'
  | '血脉继承'
  | '政治联姻'
  | '家族宿敌';
```

---

## 6. Family 家族模型

家族不是普通势力。家族要记录血缘、继承、婚姻、爵位、家族矛盾。

```ts
interface Family {
  id: string;
  name: string;
  race: string;
  socialRank: string;
  title?: string;
  territoryId?: string;
  factionId?: string;

  currentHeadId?: string;
  heirIds: string[];
  memberIds: string[];

  familyMotto?: string;
  reputation: string;
  wealthLevel: string;
  militaryPower: string;
  magicPower: string;

  allies: string[];
  enemies: string[];
  marriageLinks: string[];
  secrets: string[];
  internalConflicts: string[];

  plotRole: string;
}
```

### 家族内部必须记录的关系

| 关系 | 剧情作用 |
|---|---|
| 家主 | 决定家族表面立场 |
| 继承人 | 引发权力斗争、暗杀、婚约 |
| 庶子/私生子 | 可用于身份反转、背叛、夺权 |
| 婚约对象 | 可引发政治联姻和家族联盟 |
| 被驱逐成员 | 可成为主角盟友或反派 |
| 家族奴隶 | 体现阶级压迫，尤其适合巫族剧情 |
| 家族秘密 | 伏笔、丑闻、血脉真相 |

---

## 7. 性格如何影响剧情

AI 写剧情时，不能只问“角色能不能做”，还要问“这个角色会不会这样做”。

### 示例规则

| 性格组合 | 剧情表现 |
|---|---|
| 高理性 + 高忍耐 | 会暂时服从、暗中准备反击 |
| 高攻击性 + 高仇恨 | 容易冲动复仇，可能破坏主角计划 |
| 高忠诚 + 高恐惧 | 想保护同伴，但关键时刻可能犹豫 |
| 高野心 + 低忠诚 | 容易背叛或利用主角势力上位 |
| 高共情 + 低理性 | 容易为了救人打乱整体计划 |
| 高傲慢 + 低适应 | 很难接受主角的新制度和工业体系 |
| 高适应 + 高理性 | 容易成为主角工业体系骨干 |
| 高多疑 + 低安全感 | 即使被救也不容易相信主角 |

### 写作时的判断流程

AI 生成角色行动前，应检查：

1. 角色当前目标是什么？
2. 角色最怕失去什么？
3. 角色和当前事件中的其他人有什么关系？
4. 角色的性格是否支持这个行动？
5. 这个行动会不会触碰角色底线？
6. 这个行动会改变哪些关系数值？

---

## 8. 关系数值如何变化

每次重大剧情后，关系应该可以变化。

```ts
interface RelationshipEvent {
  chapterId?: string;
  eventName: string;
  effect: string;
  trustChange?: number;
  conflictChange?: number;
  loyaltyChange?: number;
  fearChange?: number;
  debtChange?: number;
}
```

### 示例

```json
{
  "eventName": "主角救下被追捕的巫族少女",
  "effect": "少女对主角产生初步信任，但仍担心主角只是另一个利用者",
  "trustChange": 20,
  "fearChange": -10,
  "debtChange": 30
}
```

---

## 9. 面向小说项目的关系图展示

前端可以做三种视图。

### 1. 家族树视图

用于展示血缘和继承关系。

展示重点：

- 父母
- 子女
- 兄弟姐妹
- 夫妻
- 婚约
- 私生子
- 继承顺位
- 被驱逐成员

### 2. 阵营关系图

用于展示势力之间的关系。

展示重点：

- 主角方
- 贵族方
- 教会方
- 奴隶商会
- 魔法学院
- 巫族逃亡者
- 精灵/矮人/巨龙等异族

### 3. 角色情感关系图

用于展示角色之间的情感和冲突。

展示重点：

- 信任
- 仇恨
- 爱慕
- 恐惧
- 愧疚
- 欠债
- 背叛
- 保护
- 利用

---

## 10. 与 AI 写作流程的结合

AIContextBundle 应该包含本章相关角色的关系和性格摘要。

```ts
interface CharacterContextForAI {
  characterId: string;
  name: string;
  summary: string;
  currentGoal: string;
  personalitySummary: string;
  keyTraits: Record<string, number>;
  importantRelationships: RelationshipContextForAI[];
  forbiddenActions: string[];
  likelyActions: string[];
}

interface RelationshipContextForAI {
  targetName: string;
  relationType: string;
  trust: number;
  conflict: number;
  loyalty: number;
  fear: number;
  plotImpact: string;
}
```

### AI 写作提示原则

AI 写章节时，应优先使用：

1. 本章出场角色。
2. 这些角色之间的直接关系。
3. 关系强度高的隐藏关系。
4. 会影响当前冲突的性格标签。
5. 角色底线和禁忌行为。
6. 上一章后发生变化的关系数值。

---

## 11. 适合本小说的角色关系重点

当前小说世界观是巫族被压迫、主角用 AI 和科技开启工业革命。因此关系系统要重点支持以下剧情：

### 1. 巫族逃亡者内部关系

记录谁信任主角、谁害怕主角、谁想复仇、谁想投降、谁适合成为工匠、谁适合成为士兵。

### 2. 贵族家族关系

记录家主、继承人、婚约、家族奴隶、私生子、政治联姻、领地继承。

### 3. 教会与贵族关系

记录谁受教会支持，谁依赖教会加冕，谁私下与奴隶商会勾结。

### 4. 巫族与主人关系

记录奴隶与主人之间的恐惧、仇恨、债务、保护、驯化和背叛。

### 5. 主角工业体系成员关系

记录哪些角色是学校、工坊、军队、医疗、农业、冶金、建筑、水利体系的骨干。

---

## 12. 样例数据

```json
{
  "characters": [
    {
      "id": "char_protagonist",
      "name": "主角（待命名）",
      "race": "巫族外貌 / 地球人",
      "socialClass": "无籍巫族",
      "legalStatus": "被捕奴队视为可捕捉对象",
      "currentGoal": "逃离奴隶队并活下去",
      "longTermGoal": "带领巫族建立工业文明",
      "personality": {
        "tags": ["理性", "谨慎", "反奴隶制", "工程思维"],
        "traits": {
          "rationality": 90,
          "empathy": 70,
          "ambition": 65,
          "loyalty": 75,
          "courage": 70,
          "patience": 80,
          "suspicion": 60,
          "aggression": 40,
          "pride": 45,
          "adaptability": 95
        },
        "decisionStyle": "理性分析",
        "conflictStyle": "隐忍",
        "trustRule": "先观察行动，再决定是否信任",
        "betrayalTrigger": "有人主动出卖逃亡巫族或奴隶儿童",
        "growthDirection": "从求生者成长为工业文明缔造者"
      }
    }
  ],
  "relationships": [
    {
      "id": "rel_protagonist_fugitive_witches",
      "sourceId": "char_protagonist",
      "sourceType": "character",
      "targetId": "faction_witch_fugitives",
      "targetType": "faction",
      "relationType": "保护",
      "direction": "双向",
      "status": "紧张",
      "strength": 45,
      "trust": 30,
      "conflict": 20,
      "loyalty": 25,
      "fear": 40,
      "debt": 10,
      "publicKnowledge": false,
      "secret": false,
      "description": "主角试图保护逃亡巫族，但他们尚未完全信任这个来历不明的人。",
      "plotImpact": "前期会出现不服从、恐惧、试探和逐步建立信任的剧情。"
    }
  ]
}
```

---

## 13. 实现优先级

### V1：必须实现

- 角色性格字段。
- 角色之间的关系记录。
- 家族成员关系。
- 关系强度、信任、冲突、忠诚、恐惧、债务数值。
- AIContextBundle 引用角色性格和关系摘要。

### V2：增强实现

- 家族树视图。
- 阵营关系图。
- 关系变化历史。
- 章节结束后 AI 提出关系变化建议。
- 用户审批后写入关系变化。

### V3：高级实现

- 性格驱动剧情预测。
- 背叛风险提示。
- 家族继承冲突自动检测。
- 隐藏关系和伏笔关系管理。
- 角色行为一致性检查。

---

## 14. AI 审批写入规则

AI 不应直接修改角色关系。

AI 可以提出建议：

- “某角色对主角信任 +15”。
- “某角色因被救下，债务值 +30”。
- “某贵族家族与奴隶商会建立隐藏关系”。
- “某角色因性格高野心低忠诚，存在背叛风险”。

用户批准后，才写入 `Relationship` 或 `Character.personality`。

---

## 15. 总结

角色关系系统的核心不是画图，而是让角色行为变得有因果。

家族关系决定角色的身份压力；势力关系决定角色的政治处境；情感关系决定角色的选择；性格模型决定角色在冲突中会怎么行动。

对于本小说来说，这套系统尤其重要，因为主角不是单人升级，而是在建立一个新文明。新文明的形成，必须依赖一群性格不同、出身不同、关系复杂的人共同推动，也会因为背叛、恐惧、忠诚、野心和仇恨不断产生剧情。