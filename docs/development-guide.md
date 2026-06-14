# 开发运行指南

最后更新：2026-06-14

## 环境要求

需要安装 Node.js。项目当前只使用 Playwright 作为测试依赖，应用本身不需要前端构建步骤。

安装依赖：

```bash
npm install
```

## 本地启动

启动本地服务：

```bash
npm run dev
```

默认访问地址：

```text
http://localhost:4173
```

也可以直接打开 `index.html` 查看纯前端原型。直接打开时，资料会保存在浏览器 `localStorage`，不会读写 `data/library.json`。

## DeepSeek 配置

推荐在项目根目录创建 `.env.local`：

```bash
DEEPSEEK_API_KEY=你的真实Key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
```

默认值：

- Base URL：`https://api.deepseek.com`
- 模型：`deepseek-v4-flash`
- 可选模型：`deepseek-v4-pro`

也可以在设置页填写 API Key 并测试连接。真实 Key 不要提交到仓库。

## 检查 DeepSeek 连接

```bash
npm run ai:check
```

如果未配置 Key，脚本会以明确错误退出。脚本会隐藏常见 Key 和 Bearer Token 片段，避免错误日志泄露敏感信息。

## 运行测试

```bash
npm test
```

测试覆盖重点：

- 资料详情、编辑、新建弹窗。
- 大纲、关系、设置等二级界面。
- AI 聊天只发送资料索引和有限详情。
- AI action 可以打开章节弹窗。
- AI 资料变更必须进入审批。
- 批准变更后资料库可见。
- v1 本地资料迁移到 v2 分类和结构化关系。

## 常见开发任务

### 新增资料类型

需要同步检查：

- `app.js` 中的 `LORE_CATEGORIES`。
- `LORE_FORM_PROFILES` 是否需要新增类型化表单字段。
- `normalizeLoreType` 是否需要兼容旧别名。
- Playwright 测试是否需要覆盖新分类。

### 修改资料结构

需要同步检查：

- 前端 `normalizeLoreItem`。
- 服务端 `normalizeLoreItem`。
- `data/library.json` 样例数据。
- AI prompt 和 `normalizeProposedChanges`。
- 旧 localStorage 数据迁移逻辑。

### 修改 AI 写作流程

需要同步检查：

- `buildAIContextPayload` 发送给 AI 的资料边界。
- `server.js` 中 `buildDraftMessages` 和 `buildChatMessages`。
- `normalizeDraftPayload`、`normalizeContextBundle`、`normalizeAIActions`。
- 测试中对 payload 的断言，尤其是不能发送整库详情或代码。

### 修改 API

需要同步检查：

- `server.js` 的 `handleApi`。
- 前端 `LibraryDataAPI`。
- `tests/prototype-smoke.spec.js` 中的 route mock。
- 本文档中的 API 表。

## 数据文件

本地资料库文件是：

```text
data/library.json
```

它保存 `schemaVersion`、`updatedAt` 和 `lore`。服务端写入时会自动更新 `updatedAt` 并标准化资料集合。

## 排查建议

如果 AI 功能不可用：

- 确认使用的是 `npm run dev`，而不是直接打开 `index.html`。
- 确认 `.env.local` 中存在 `DEEPSEEK_API_KEY`。
- 运行 `npm run ai:check`。
- 打开设置页检查 Base URL 和模型。

如果资料没有写入 JSON：

- 确认地址是 `http://localhost:4173`。
- 检查页面设置中资料来源是否回落到了本地。
- 确认 `data/library.json` 可写。

如果测试失败：

- 先确认没有打开旧的本地状态干扰测试。
- 重新运行 `npm test`。
- 查看 `test-results/` 中的 Playwright 输出。

