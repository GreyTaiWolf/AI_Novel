# 笔维斯手机端原型

笔维斯是一个本地可点击的手机端高保真原型，用来承接 Figma 写入额度恢复前的产品落地工作。目标是验证 V1 核心闭环：本地资料库、AI 写章、引用资料展示、AI 提出资料变更、用户审批后写入。

## 项目文档

更完整的项目总结和介绍文档已放在 `docs/`：

- [项目文档索引](./docs/README.md)
- [项目总览](./docs/project-overview.md)
- [产品功能说明](./docs/product-features.md)
- [技术架构说明](./docs/technical-architecture.md)
- [数据模型与 AI 流程](./docs/data-model-and-ai-flow.md)
- [开发运行指南](./docs/development-guide.md)

## 已落地范围

- `AI`：ChatGPT 式创作区，展示真实 `AIContextBundle`，只在 DeepSeek 已配置时生成章节草稿并进入待审批变更。
- `资料库`：人物、家族/势力、地点、事件、物品、世界规则、卷章等资料分类；点击资料弹窗查看，新建用弹窗，完整修改进入独立编辑页。
- `大纲`：按卷/章节维护章节目标、关键事件、冲突、伏笔和禁用内容。
- `关系/时间线`：展示人物、势力、地点、物品之间的关系和关键时间点。
- `设置`：API Key 入口、本地 JSON 导出、样例数据重置、三套可保存主题切换。
- `DeepSeek 连接`：通过本地 Node 代理调用 OpenAI-compatible Chat Completions，前端不直接访问 DeepSeek。

## 数据契约

- `Project`：作品名、类型、简介、写作目标、全局风格。
- `LoreItem`：类型、标题、摘要、详情、标签、重要度、状态、关联对象、时间线引用。
- `ChapterPlan`：所属卷、章节目标、出场人物、关键事件、冲突、伏笔、禁用内容。
- `AIContextBundle`：AI 本次引用的资料卡、关系、时间段、章节目标。
- `AIProposedChange`：新增/修改/关联/删除、原因、影响范围、审批状态。
- `LibraryDataAPI`：统一提供资料索引、详情、搜索、新建、修改和批准写入；`npm run dev` 下优先走本地 JSON/API，直接打开 `index.html` 时回落到 `localStorage`。
- `ThemeConfig`：`id/name/mode/colors/border/radius/isDefault/lastUsedAt`。

## 主题

三套主题都保留为可切换配置，同一套 UI 布局只替换颜色和状态样式。

- 清爽知识库：默认浅色，适合资料维护。
- 夜间创作台：深色沉浸，适合长时间写作。
- 专业资料中枢：高密度资料、关系和审批。

## DeepSeek 连接

DeepSeek 官方 OpenAI-compatible 配置：

- Base URL：`https://api.deepseek.com`
- 默认模型：`deepseek-v4-flash`
- 可选模型：`deepseek-v4-pro`

推荐方式是在项目根目录创建 `.env.local`：

```bash
DEEPSEEK_API_KEY=你的真实Key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
```

然后启动本地服务：

```bash
npm run dev
```

浏览器打开：

```text
http://localhost:4173
```

也可以在设置页填写 Key 并点击“测试连接”。真实 Key 不要提交到仓库，`.env.local` 已加入 `.gitignore`。

AI 权限边界：

- AI 可以读取资料库、选择本章需要的上下文、生成章节草稿、提出新增/修改/关联/删除建议。
- AI 不可以直接写入资料库。
- AI 请求只发送资料目录索引和本次命中的少量资料详情，不发送整库详情或代码。
- 所有资料变化必须进入 `AIProposedChange`，用户批准后才会写入 `LoreItem`。

## 本地使用

只看原型可直接打开 `index.html`，资料会保存在浏览器 `localStorage` 中。要使用真实 DeepSeek AI 和本地 JSON 资料接口，请用 `npm run dev` 启动本地服务后访问 `http://localhost:4173`。

## 验证

```bash
npm test
```

验证内容包括：资料详情弹窗、新建资料弹窗、独立编辑页、未连接 DeepSeek 时禁止生成演示草稿、AI payload 只包含资料索引和少量详情、批准资料变更后写入资料库。

真实 DeepSeek 连接检查：

```bash
npm run ai:check
```

如果没有配置 `DEEPSEEK_API_KEY`，该命令会明确失败并提示缺 Key。

## Figma 状态

Figma 文件已经创建，地址为：

https://www.figma.com/design/xHVWDzyW6r9mGoSfxg65Ia

当前 Figma MCP Starter 写入额度触发限制。额度恢复后，优先把本地已验证的完整流程同步回 Figma，并修正主题卡色板裁切细节。
