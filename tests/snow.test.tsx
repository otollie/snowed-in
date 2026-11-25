import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'snowed-in',
  component: 'Backdrop',
  requestId: 'backdrop',
  props: {
    scene: 'snow',
    plugin: 'snowed-in',
    glass: { blur: 10, opacity: 0.62 },
    overrideColorScheme: 'dark',
  },
} as const

const measured = (percent?: number) => ({
  context: percent === undefined ? { window: 200000 } : { window: 200000, tokens: percent * 2000, percent },
  rateLimits: [],
  changed: ['context' as const],
})

test('the snow piles higher as the context window fills', async ($, on) => {
  on('session.measure', (_, e) => ({ changed: e.changed }))

  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BACKDROP, surface })
    const alt = async () => String((await ui.find({ type: 'Svg' }))?.props.alt)

    expect(await alt()).toContain('piled 0% of the way up')

    await $.session.measure(measured(50))
    expect(await alt()).toContain('piled 50% of the way up')

    await $.session.measure(measured(100))
    expect(await alt()).toContain('piled 100% of the way up')

    // After a compaction the fill is unknown until the next reply: back to a dusting.
    await $.session.measure(measured())
    expect(await alt()).toContain('piled 0% of the way up')
    await ui.unmount()
  }
})

test("another mod's backdrop is left alone", async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)

    return <Text>engine</Text>
  })

  const ui = await $.ui.mount({
    ...BACKDROP,
    props: { ...BACKDROP.props, plugin: 'someone-else' },
    surface: 'desktop',
  })

  expect(await ui.find({ type: 'Svg' })).toBeUndefined()
  await ui.unmount()
})
