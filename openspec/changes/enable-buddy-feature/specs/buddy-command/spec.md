## ADDED Requirements

### Requirement: 功能标志启用
系统 SHALL 通过修改 `feature()` polyfill 使 `feature('BUDDY')` 返回 `true`，激活所有桌宠相关代码路径。

#### Scenario: BUDDY feature flag 激活
- **WHEN** `feature('BUDDY')` 被调用
- **THEN** 返回 `true`，桌宠 UI 组件和命令均正常加载

### Requirement: /buddy 命令注册
系统 SHALL 注册 `/buddy` 命令，使其在 REPL 命令列表中可见并可调用。

#### Scenario: 命令列表中出现 /buddy
- **WHEN** 用户输入 `/` 查看命令列表
- **THEN** 列表中包含 `buddy` 命令及其描述

### Requirement: /buddy hatch 孵化桌宠
系统 SHALL 在执行 `/buddy hatch` 时，将一个 `StoredCompanion`（含 name 和 personality）写入 `globalConfig.companion`。

#### Scenario: 首次孵化
- **WHEN** 用户执行 `/buddy hatch`（config 中无 companion）
- **THEN** 系统写入 `config.companion`，并返回包含桌宠名字和物种的欢迎文本

#### Scenario: 重复孵化
- **WHEN** 用户执行 `/buddy hatch`（config 中已有 companion）
- **THEN** 返回已有桌宠信息，提示已孵化，不覆盖现有数据

### Requirement: /buddy status 查看桌宠
系统 SHALL 在执行 `/buddy status`（或无参数执行 `/buddy`）时，返回当前桌宠的信息。

#### Scenario: 有桌宠时查看状态
- **WHEN** 用户执行 `/buddy status`
- **THEN** 返回桌宠的名字、物种、稀有度和属性数值

#### Scenario: 无桌宠时查看状态
- **WHEN** 用户执行 `/buddy status` 但未孵化
- **THEN** 提示用户运行 `/buddy hatch`

### Requirement: /buddy mute 和 unmute
系统 SHALL 支持 `/buddy mute` 和 `/buddy unmute` 命令切换 `config.companionMuted`。

#### Scenario: 静音桌宠
- **WHEN** 用户执行 `/buddy mute`
- **THEN** 设置 `config.companionMuted = true`，桌宠精灵不再渲染

#### Scenario: 取消静音
- **WHEN** 用户执行 `/buddy unmute`
- **THEN** 设置 `config.companionMuted = false`，桌宠精灵重新渲染
