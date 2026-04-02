## 1. 启用 BUDDY feature flag

- [x] 1.1 修改 `src/entrypoints/cli.tsx` 中的 `feature()` polyfill，使其对 `'BUDDY'` 返回 `true`，其余 flag 仍返回 `false`

## 2. 实现 /buddy 命令

- [x] 2.1 实现 `src/commands/buddy/index.ts`：替换空存根，导出符合 `Command` 类型的命令对象（`type: 'local'`，`load()` 指向实现文件）
- [x] 2.2 创建 `src/commands/buddy/buddy.ts`：实现 `LocalCommandCall`，支持子命令 `hatch`、`status`（默认）、`mute`、`unmute`、`pet`
- [x] 2.3 实现 `hatch` 子命令：调用 `roll(companionUserId())` 获取骨骼，构造 `StoredCompanion`（占位 soul：name 为物种名首字母大写，personality 为一句话描述），通过 `saveGlobalConfig` 写入 `config.companion`
- [x] 2.4 实现 `status` 子命令：调用 `getCompanion()` 读取并格式化展示桌宠信息（名字、物种、稀有度、属性）；无桌宠时提示执行 `/buddy hatch`
- [x] 2.5 实现 `mute` / `unmute` 子命令：通过 `saveGlobalConfig` 切换 `config.companionMuted`
- [x] 2.6 实现 `pet` 子命令：返回一段互动文本（暂不触发 AppState，仅文本响应）

## 3. 验证功能可用性

- [x] 3.1 运行 `bun run dev`，确认 `/buddy hatch` 能写入 config 并返回欢迎文本
- [x] 3.2 确认 `/buddy status` 能读取并展示桌宠信息
- [x] 3.3 确认 REPL 右下角 `CompanionSprite` 在终端宽度 ≥ 100 时可见
- [x] 3.4 确认 `/buddy mute` 和 `/buddy unmute` 能切换桌宠精灵的显示/隐藏
