# dsh-cmdj-toggle

给 [dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) 补一个 Codex 式的专注快捷键：
**Cmd/Ctrl + J** 一键收起右侧面板和底部面板；全部已收起时再按，恢复原状。

纯客户端插件，host 侧为空壳。不 import 任何 `@deepseek-ai/*`，开发机可 `link:` 安装。

## 行为

- 默认 `target: 'both'`（专注模式）：任一面板开着 → 全部收起；全关着 → 全部展开。
- 可改成只切换单个面板：在 DevTools console 执行

  ```js
  __dshCmdjToggle.setPrefs({ target: 'panel' })  // 或 'bottom' / 'both'
  ```

  偏好存在 `localStorage['dsh-cmdj-toggle:prefs']`，立即生效，无需重启。
- 输入框 / textarea / contenteditable 聚焦时不触发；IME 组合输入中不触发；
  按键重复（长按）不触发。
- Mac 用 Cmd+J，Windows/Linux 用 Ctrl+J。实测 Chrome 下页面可 `preventDefault`
  拦截 Cmd+J（不会弹下载页）。

## 与 better-sidebar 的耦合点（升级失效时的修复位置）

只依赖三个语义钩子（均为 better-sidebar 自身逻辑也在用的稳定契约，非哈希类名）：

| 用途 | 钩子 | 0.16.1 验证 |
| --- | --- | --- |
| 动作 | 合成点击 `[data-dsh-toggle-cluster]` 内按钮（顺序：[底部?, 右侧]，右侧恒为最后一个） | 走官方 `togglePanel` / `toggleBottomPanel` reducer 与 localStorage 持久化 |
| 右侧状态 | `body[data-dsh-sidebar-collapsed]` 不存在 = 展开 | ✅ |
| 底部状态 | CSS 变量 `--dsh-sidebar-height` > 0 = 展开 | ✅ |

上游若改名这些钩子，**只有快捷键失效**，侧栏本身不受影响；改 `client.js`
里对应选择器即可。长期方案：给上游提 issue，请求内置快捷键或在
`ctx.betterSidebar` service 上暴露 toggle 方法。

## 安装

```bash
# profile 的 package.json dependencies 加：
#   "dsh-cmdj-toggle": "link:$HOME/Documents/dshspace/plugins/dsh-cmdj-toggle"
# dsh.profile.bundles 加 "dsh-cmdj-toggle"，然后 profile 目录 pnpm install。
# 或用 dsh plugin --profile web add link:...（如有 CLI）。
```

安装/更新后需**重启 `dsh web`** 才生效（bundle patch 变更）。

## 调试

- `__dshCmdjToggle.readState()` 查看当前两个面板的开合判断。
- `__dshCmdjToggle.toggle()` 手动触发一次切换。
