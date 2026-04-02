## Context

`src/buddy/` 目录包含完整的桌宠（Companion）功能实现：
- `companion.ts`：基于 userId 哈希确定性生成桌宠骨骼（species、rarity、stats 等）
- `CompanionSprite.tsx`：Ink UI 组件，在终端右下角渲染桌宠精灵和气泡
- `useBuddyNotification.tsx`：首次使用的彩虹文字 `/buddy` 提示
- `prompt.ts`：向 Claude API 注入桌宠介绍 attachment
- `sprites.ts`：ASCII art 精灵帧渲染
- `types.ts`：所有类型定义

两道封锁：
1. **`feature('BUDDY')`** 全局返回 `false`（cli.tsx 的 polyfill）
2. **`src/commands/buddy/index.ts`** 是空存根，`/buddy` 命令不存在

全局 config（`~/.claude/config.json`）已有 `companion?: StoredCompanion` 和 `companionMuted?: boolean` 字段。

## Goals / Non-Goals

**Goals:**
- 使 `feature('BUDDY')` 对 `BUDDY` 返回 `true`，激活所有已有的 UI 和逻辑
- 实现 `/buddy` 命令（Commander.js 风格，参考现有命令结构），支持孵化、查看、互动、静音
- 确保 `isBuddyLive()` 在本地 dev 模式中返回 `true`（当前日期 2026-04-02 已在窗口内）

**Non-Goals:**
- 不修改精灵渲染、概率系统、动画逻辑（已完整实现）
- 不接入任何 Claude API 用于 soul 生成（暂时使用占位 soul）
- 不修改 AppState 中 companionReaction 相关逻辑

## Decisions

### 决策 1：修改 feature polyfill 而非 BUILD_TARGET

**方案 A（选择）**：将 `feature()` 改为接受白名单，对 `'BUDDY'` 返回 `true`。
**方案 B**：将 `BUILD_TARGET` 改为 `'ant'`，触发内部模式。

选 A：改动最小、最精准，只打开 BUDDY，不触发其他内部功能（DUMP_SYSTEM_PROMPT、DAEMON 等）。

### 决策 2：/buddy 命令直接操作 globalConfig

`/buddy hatch` 写入 `config.companion`（StoredCompanion），`/buddy mute` 切换 `config.companionMuted`。与现有 `/config`、`/help` 等命令一致，无需引入新的持久化机制。

### 决策 3：soul 暂时使用静态占位

真实场景中 soul（name + personality）由 Claude API 生成。本实现先用固定占位 soul（name: species 名, personality 简短描述），确保功能可用，后续可接入 API。

## Risks / Trade-offs

- **[风险] feature polyfill 改动可能影响其他 feature flag 行为** → 缓解：用显式白名单 `new Set(['BUDDY'])`，其他 flag 仍返回 false
- **[风险] `isBuddyLive()` 的日期条件在 2027 年后可能改变** → 缓解：当前日期 2026-04-02 完全满足条件，无需 hack
- **[Trade-off] 静态 soul 缺少个性** → 可接受，功能验证优先，后续可接入 Claude API 生成
