import { companionUserId, getCompanion, roll } from '../../buddy/companion.js'
import { renderSprite } from '../../buddy/sprites.js'
import { RARITY_STARS } from '../../buddy/types.js'
import type {
  LocalJSXCommandContext,
  LocalJSXCommandOnDone,
} from '../../types/command.js'
import type { ToolUseContext } from '../../Tool.js'
import { getGlobalConfig, saveGlobalConfig } from '../../utils/config.js'

export async function call(
  onDone: LocalJSXCommandOnDone,
  _context: ToolUseContext & LocalJSXCommandContext,
  args: string,
): Promise<null> {
  const sub = args.trim().toLowerCase()

  // /buddy mute / unmute
  if (sub === 'mute') {
    saveGlobalConfig(c => ({ ...c, companionMuted: true }))
    onDone('伙伴已静音。使用 /buddy unmute 恢复显示。', { display: 'system' })
    return null
  }
  if (sub === 'unmute') {
    saveGlobalConfig(c => ({ ...c, companionMuted: false }))
    onDone('伙伴已恢复显示！', { display: 'system' })
    return null
  }

  // /buddy pet
  if (sub === 'pet') {
    const companion = getCompanion()
    if (!companion) {
      onDone('你还没有伙伴！先运行 /buddy 来领养一个吧。', { display: 'system' })
      return null
    }
    onDone(`你摸了摸 ${companion.name}！❤️`, { display: 'system' })
    return null
  }

  // /buddy — 查看当前伙伴或领养新伙伴
  const existing = getCompanion()
  if (existing) {
    const sprite = renderSprite(existing).join('\n')
    const stars = RARITY_STARS[existing.rarity]
    const lines = [
      `${sprite}`,
      '',
      `${existing.name}  ${stars} (${existing.rarity})`,
      `种族: ${existing.species}`,
      `性格: ${existing.personality}`,
      '',
      `属性:`,
      ...Object.entries(existing.stats).map(
        ([k, v]) => `  ${k}: ${'█'.repeat(Math.round((v as number) / 10))}${'░'.repeat(10 - Math.round((v as number) / 10))} ${v}`,
      ),
      '',
      existing.shiny ? '✨ 闪光个体！' : '',
    ].filter(Boolean)
    onDone(lines.join('\n'), { display: 'system' })
    return null
  }

  // 首次领养
  const userId = companionUserId()
  const { bones, inspirationSeed } = roll(userId)
  const sprite = renderSprite(bones).join('\n')
  const stars = RARITY_STARS[bones.rarity]

  // 生成名字和性格（简单的确定性方式，不依赖 API）
  const names = [
    'Pixel', 'Byte', 'Chip', 'Nova', 'Dot', 'Mochi', 'Bloop',
    'Fizz', 'Ziggy', 'Pebble', 'Sprout', 'Nimbus', 'Glitch', 'Echo',
    'Tofu', 'Maple', 'Pepper', 'Cocoa', 'Mango', 'Biscuit',
  ]
  const personalities = [
    '好奇心旺盛，喜欢探索代码的每个角落',
    '安静沉稳，擅长在 debug 时保持冷静',
    '活泼好动，总是在终端里蹦蹦跳跳',
    '略带混乱，但总能在关键时刻帮上忙',
    '温柔耐心，默默守护着每次部署',
    '充满智慧，偶尔会发出神秘的提示',
  ]
  const name = names[inspirationSeed % names.length]!
  const personality = personalities[inspirationSeed % personalities.length]!

  // 保存到配置
  saveGlobalConfig(c => ({
    ...c,
    companion: {
      name,
      personality,
      hatchedAt: Date.now(),
    },
  }))

  const lines = [
    '🎉 你领养了一个新伙伴！',
    '',
    sprite,
    '',
    `${name}  ${stars} (${bones.rarity})`,
    `种族: ${bones.species}`,
    `性格: ${personality}`,
    '',
    bones.shiny ? '✨ 恭喜！这是一个闪光个体！' : '',
    '',
    '使用 /buddy 随时查看你的伙伴',
  ].filter(Boolean)

  onDone(lines.join('\n'), { display: 'system' })
  return null
}
