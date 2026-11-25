import { atom, read, update } from 'claude-code'
import type { Register, ThemeSetArgs } from 'claude-code'

import type { SnowLevel } from '../types'
import { makeColors } from './make-colors.js'
import { MAX_LEVEL, levelFor, snowScene } from './scene'

const PLUGIN = 'snowed-in'
const SCENE = 'snow'

// Winter night: deep blue surfaces, frost-white text, icy-blue accent.
const NIGHT = '#131b2b'
const { theme, problems } = makeColors({
  label: 'Snowed in',
  only: 'dark',
  roles: { accent: '#8cc4ee', danger: '#e07272', success: '#7fc29b', warning: '#e0b05a', pro: '#b29ae0' },
  dark: {
    gray: {
      anchors: {
        'surface-0': NIGHT,
        'surface-1': '#192235',
        'surface-2': '#1f2a40',
        'surface-3': '#222d44',
        'text-primary': '#eaf0f7',
        'text-secondary': '#c5cfdd',
        'text-muted': '#9eaabd',
      },
    },
  },
})

const LOOK: ThemeSetArgs = {
  colors: theme,
  overrideColorScheme: 'dark',
  // The app's panels sit over the scene as frosted glass, tinted night blue,
  // so the snow shows through softly and the text stays readable.
  backdrop: { scene: SCENE, glass: { blur: 10, tint: NIGHT, opacity: 0.62 } },
}

// How deep the snow is. The backdrop reads it while drawing, so a write
// redraws the backdrop and nothing else.
const START: SnowLevel = 0
const level = atom({ plugin: 'snowed-in', key: 'level' } as const, START)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    await $.theme.set(LOOK)

    // Start from wherever the context window already is (a reload mid-session).
    const { context } = await $.session.usage()
    const depth = levelFor(context.percent)

    if ((await read($, level)) !== depth) {
      await update($, level, () => depth)
    }

    return next(e)
  })

  // The engine pushes this after each turn when the context fill has moved.
  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('context')) {
      const depth = levelFor(e.context.percent)

      // Only write when the level changes, so the scene is not redrawn for nothing.
      if ((await read($, level)) !== depth) {
        await update($, level, () => depth)
      }
    }

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if (e.props.plugin !== PLUGIN || e.props.scene !== SCENE) {
      return next(e)
    }

    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)
    const depth = await read($, level)
    const percent = Math.round((depth / MAX_LEVEL) * 100)

    return (
      <Svg
        source={snowScene(depth)}
        alt={`A snowy night with a lit cabin among pine trees; the snow has piled ${percent}% of the way up`}
        isInteractive
      />
    )
  })
}
