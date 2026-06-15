# 打包说明

本项目当前是手机端 Web 原型和本地 Node 代理服务，不是原生 Android APK 工程。

## 源码 ZIP 打包

在克隆后的仓库根目录运行：

```bash
npm run package:zip
```

该命令会调用 `git archive`，在 `dist/` 目录生成一个 ZIP 包，例如：

```text
AI_Novel-fix-ai-connection-failure-xxxxxxx.zip
```

打包内容只包含 Git 已跟踪的项目文件。不会包含本地未跟踪文件，例如：

- `.env.local`
- `node_modules/`
- `dist/`

## 运行完整 AI 代理验证

打包前建议先运行：

```bash
npm run ai:proxy-check
```

该检查会验证本地代理模式下的真实 AI 状态、连接测试、聊天返回和草稿返回。
