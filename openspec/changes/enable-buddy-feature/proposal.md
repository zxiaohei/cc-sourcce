## Why

`src/buddy/` 目录下已有完整实现的桌宠（Companion）功能，但由于 `feature('BUDDY')` 始终返回 `false`（feature 多填写为 false），且 `/buddy` 命令是一个空存根，该功能目前完全不可用。需要解除这两道封锁，让用户可以孵化、查看和互动自己的桌宠。

## What Changes

- 修改 `src/entrypoints/cli.tsx` 中的 `feature()` polyfill，使其对 `'BUDDY'` 返回 `true`
- 实现 `src/commands/buddy/index.ts`（当前是空存根），添加 `/buddy` 命令（hatch、status、pet、mute/unmute 等子命令）
- 绕过 `isBuddyLive()` / `isBuddyTeaserWindow()` 中的外部环境判断（`BUILD_TARGET` 为 `external` 时硬编码条件），确保本地 dev 模式可用
- 在 `getGlobalConfig()` 的 config 类型中确认 `companion` 字段已存在（只读）

## Capabilities

### New Capabilities

- `buddy-command`: 实现 `/buddy` 命令，支持孵化桌宠 (`hatch`)、查看状态 (`status`)、互动 (`pet`) 及静音切换 (`mute`/`unmute`)

### Modified Capabilities

（无需更改现有 spec）

## Impact

- `src/entrypoints/cli.tsx`：修改 feature polyfill，对 `BUDDY` 返回 `true`
- `src/commands/buddy/index.ts`：实现命令逻辑
- 运行时依赖：`getGlobalConfig()` 中 `companion` 字段的读写（已有相关类型定义）
- `CompanionSprite`、`useBuddyNotification`、`companionReservedColumns` 等 UI 组件将自动激活，无需额外修改
