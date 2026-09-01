# dsh-cmdj-toggle 仓库与 Agent 维护规范（AGENTS.md）

> 本文件是本插件的**代码架构与维护硬性规范**。
> 所有 AI Agent 与人类贡献者在修改、重构或新增功能时，**必须严格遵守以下规则**。

---

## 1. 保持极简与零膨胀原则（Strict Simplicity Limits）

1. **单文件行数上限**：
   - 任何单个源码文件严禁超过 **150 行**。
   - 纯客户端小插件，严禁在 `client.js` 中无限堆砌无关功能。
2. **模块职责划分**：
   - **前端交互 (`client.js`)**：负责键盘监听（Cmd/Ctrl+J）、better-sidebar 右侧/底部面板状态识别与平滑收起/展开。
   - **后端入口 (`index.js`)**：轻量声明式空入口（< 15 行）。

---

## 2. 交互与跨平台铁律

1. **全平台热键支持**：
   - macOS 匹配 `metaKey` (Cmd)，Windows / Linux 匹配 `ctrlKey` (Ctrl)。
2. **避免输入冲突**：
   - 当焦点处于 `textarea` / `input` 或编辑器光标中时，避免误吞正常文本操作或造成意外面板跳动。
3. **零侵入原则**：
   - 纯客户端零耦合扩展，只通过标准 DOM 查询与按键事件协同，不依赖 better-sidebar 内部私有实现。

---

## 3. 原生 ESM 与修改后自检

1. **零构建原生 ESM**：所有模块引用必须显式带 `.js` 扩展名。
2. **修改后门禁自检**：
   修改任何代码后，必须在插件根目录下运行以下命令：
   ```bash
   find . -name "*.js" -not -path "*/.*" -not -path "*/node_modules/*" -exec node --check {} +
   ```
