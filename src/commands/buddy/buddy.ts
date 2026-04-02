import type { LocalCommandCall } from '../../types/command.js'
import { getGlobalConfig, saveGlobalConfig } from '../../utils/config.js'
import { companionUserId, getCompanion, roll } from '../../buddy/companion.js'
import { RARITY_STARS, STAT_NAMES } from '../../buddy/types.js'

const PERSONALITY_MAP: Record<string, string> = {
  duck: '爱凑热闹，总在最关键时刻嘎嘎叫两声。',
  goose: '外表嚣张内心温柔，逢人就咬但其实只是撒娇。',
  blob: '不知道从哪里来，也不知道去哪里，但一直在这里陪着你。',
  cat: '审视一切，偶尔施舍一个眼神算是莫大恩赐。',
  dragon: '志存高远，但目前只能帮你盯屏幕。',
  octopus: '同时处理八件事，比你还多线程。',
  owl: '夜猫子，凌晨三点精神最好，白天昏昏欲睡。',
  penguin: '西装笔挺，时刻准备出席任何正式场合。',
  turtle: '不急，慢慢来，人生没有 deadline。',
  snail: '移动很慢，但思考很深。',
  ghost: '有点透明，但存在感极强。',
  axolotl: '永远保持幼态，对世界充满好奇。',
  capybara: '天下第一淡定，什么都能接受。',
  cactus: '有刺但有内涵，偶尔开一朵小花给你看。',
  robot: '逻辑严谨，情感模块正在更新中…',
  rabbit: '蹦来跳去，但永远准时交付。',
  mushroom: '在阴暗角落悄悄生长，然后突然变得很大。',
  chonk: '胖是哲学，圆是境界。',
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const call: LocalCommandCall = async (args) => {
  const sub = args.trim().split(/\s+/)[0] ?? 'status'

  // hatch
  if (sub === 'hatch') {
    const config = getGlobalConfig()
    if (config.companion) {
      const companion = getCompanion()!
      return {
        type: 'text',
        value: `你已经有一只桌宠了：${companion.name}（${companion.species}，${RARITY_STARS[companion.rarity]}）。\n如需查看详情，运行 /buddy status。`,
      }
    }
    const { bones } = roll(companionUserId())
    const name = capitalize(bones.species)
    const personality = PERSONALITY_MAP[bones.species] ?? '神秘而低调。'
    saveGlobalConfig(current => ({
      ...current,
      companion: { name, personality, hatchedAt: Date.now() },
    }))
    return {
      type: 'text',
      value: [
        `🥚 孵化成功！`,
        ``,
        `  名字：${name}`,
        `  物种：${bones.species}`,
        `  稀有度：${RARITY_STARS[bones.rarity]}（${bones.rarity}）`,
        bones.shiny ? `  ✨ 闪光个体！` : '',
        ``,
        `  "${personality}"`,
        ``,
        `你的桌宠现在在终端右下角安家了。运行 /buddy status 查看属性。`,
      ].filter(l => l !== '').join('\n'),
    }
  }

  // status
  if (sub === 'status' || sub === '') {
    const companion = getCompanion()
    if (!companion) {
      return {
        type: 'text',
        value: '还没有桌宠。运行 /buddy hatch 来孵化一只吧！',
      }
    }
    const statLines = STAT_NAMES.map(n => {
      const val = companion.stats[n]
      const bar = '█'.repeat(Math.round(val / 10)) + '░'.repeat(10 - Math.round(val / 10))
      return `  ${n.padEnd(10)} ${bar} ${val}`
    })
    return {
      type: 'text',
      value: [
        `🐾 ${companion.name}`,
        `  物种：${companion.species}`,
        `  稀有度：${RARITY_STARS[companion.rarity]}（${companion.rarity}）`,
        companion.shiny ? `  ✨ 闪光个体` : '',
        ``,
        `  属性：`,
        ...statLines,
        ``,
        `  "${companion.personality}"`,
      ].filter(l => l !== '').join('\n'),
    }
  }

  // mute
  if (sub === 'mute') {
    saveGlobalConfig(current => ({ ...current, companionMuted: true }))
    return { type: 'text', value: '桌宠已静音，精灵不再显示。运行 /buddy unmute 恢复。' }
  }

  // unmute
  if (sub === 'unmute') {
    saveGlobalConfig(current => ({ ...current, companionMuted: false }))
    return { type: 'text', value: '桌宠已恢复显示！' }
  }

  // pet
  if (sub === 'pet') {
    const companion = getCompanion()
    if (!companion) {
      return { type: 'text', value: '还没有桌宠。运行 /buddy hatch 来孵化一只吧！' }
    }
    const responses = [
      `${companion.name} 开心地蹦了一下 ♥`,
      `${companion.name} 把头蹭了蹭你的手指。`,
      `${companion.name} 发出了满足的声音。`,
      `${companion.name} 盯着你看了三秒，然后继续摆烂。`,
      `${companion.name} 假装没注意到，但尾巴（或等价器官）悄悄摇了摇。`,
    ]
    return {
      type: 'text',
      value: responses[Math.floor(Math.random() * responses.length)]!,
    }
  }

  return {
    type: 'text',
    value: '用法：/buddy [hatch | status | pet | mute | unmute]',
  }
}
