// The snowy scene, drawn as one SVG string. Everything is placed by a seeded
// random number generator, so the same level always draws the same picture.

/** The snow rises in 20 steps (one per 5% of the context window). */
export const MAX_LEVEL = 20

/** Snow level for a context window that is `percent` full (0 to 100). */
export function levelFor(percent: number | undefined): number {
  const fill = Math.min(100, Math.max(0, percent ?? 0)) / 100

  return Math.round(fill * MAX_LEVEL)
}

// mulberry32: a tiny repeatable random number generator.
function seeded(seed: number): () => number {
  let state = seed

  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const fixed = (value: number, digits = 1): string => value.toFixed(digits)

// The ground the cabin stands on, and how high the snow can climb above it.
const GROUND = 905
// At a full context window the snow just covers the cabin's chimney.
const MAX_RISE = 235

function stars(): string {
  const random = seeded(31)
  let out = ''

  for (let i = 0; i < 40; i++) {
    const x = fixed(random() * 1600)
    const y = fixed(random() * 520)
    const r = fixed(0.5 + random() * 1)
    const opacity = fixed(0.2 + random() * 0.45, 2)
    out += `<circle cx="${x}" cy="${y}" r="${r}" fill="#e6eeff" opacity="${opacity}"/>`
  }

  return out
}

/** A pine tree with snow on its branches, `h` tall, standing at (x, base). */
function pine(x: number, base: number, h: number, color: string): string {
  const w = h * 0.42
  let out = `<rect x="${fixed(x - h * 0.03)}" y="${fixed(base - h * 0.12)}" width="${fixed(h * 0.06)}" height="${fixed(h * 0.12)}" fill="${color}"/>`

  // three stacked tiers, each with a cap of snow on top
  for (let tier = 0; tier < 3; tier++) {
    const bottom = base - h * 0.1 - tier * h * 0.26
    const top = bottom - h * 0.42
    const half = w * (1 - tier * 0.25)
    out += `<path d="M${fixed(x - half)} ${fixed(bottom)}L${fixed(x)} ${fixed(top)}L${fixed(x + half)} ${fixed(bottom)}Z" fill="${color}"/>`
    out += `<path d="M${fixed(x - half * 0.42)} ${fixed(top + h * 0.17)}L${fixed(x)} ${fixed(top)}L${fixed(x + half * 0.42)} ${fixed(top + h * 0.17)}Q${fixed(x)} ${fixed(top + h * 0.11)} ${fixed(x - half * 0.42)} ${fixed(top + h * 0.17)}Z" fill="#dfe8f3" opacity="0.85"/>`
  }

  return out
}

const CABIN =
  // window glow on the snow around it
  `<ellipse cx="1180" cy="860" rx="170" ry="90" fill="url(#warm)"/>` +
  // walls and roof
  `<rect x="1080" y="790" width="200" height="115" fill="#3a2a2a"/>` +
  `<path d="M1060 795L1180 715L1300 795Z" fill="#2a1f22"/>` +
  `<path d="M1054 798L1180 708L1306 798L1294 804L1180 724L1066 804Z" fill="#e9eff7"/>` +
  `<rect x="1240" y="722" width="22" height="48" fill="#2a1f22"/>` +
  `<rect x="1236" y="716" width="30" height="9" rx="3" fill="#e9eff7"/>` +
  // lit windows and the door
  `<rect x="1104" y="818" width="40" height="34" rx="2" fill="#f2b45a"/>` +
  `<path d="M1124 818V852M1104 835H1144" stroke="#3a2a2a" stroke-width="3"/>` +
  `<rect x="1216" y="818" width="40" height="34" rx="2" fill="#f2b45a"/>` +
  `<path d="M1236 818V852M1216 835H1256" stroke="#3a2a2a" stroke-width="3"/>` +
  `<rect x="1164" y="836" width="32" height="69" rx="2" fill="#24191b"/>`

/** The snow pile: a soft, wavy drift whose top sits `rise` above the ground. */
function pile(rise: number): string {
  const top = GROUND - rise
  let d = `M-20 1000L-20 ${fixed(top - 26)}`

  for (let x = -20; x <= 1620; x += 40) {
    // gentle waves, with drifts banked higher against both edges
    const wave = 14 * Math.sin(x / 170) + 8 * Math.sin(x / 61 + 1.3)
    const bank = 34 * Math.exp(-x / 260) + 26 * Math.exp((x - 1600) / 300)
    d += `L${x} ${fixed(top - wave * 0.6 - bank)}`
  }
  d += 'L1620 1000Z'

  return (
    `<path d="${d}" fill="url(#snow)"/>` +
    // a faint blue shadow along the drift's crest, for depth
    `<path d="${d}" fill="none" stroke="#a9bad3" stroke-width="5" opacity="0.35" transform="translate(0 7)"/>`
  )
}

function snowfall(count: number): string {
  const random = seeded(77)
  let out = ''

  for (let i = 0; i < count; i++) {
    const x = fixed(-40 + random() * 1680)
    const near = random()
    const r = fixed(1 + near * 2.8)
    const opacity = fixed(0.45 + near * 0.5, 2)
    const fall = fixed(26 - near * 12)
    const delay = fixed(random() * 30)
    const sway = 1 + Math.floor(random() * 3)
    const swayTime = fixed(5 + random() * 5)

    out +=
      `<g class="fall" style="animation-duration:${fall}s;animation-delay:-${delay}s">` +
      `<circle class="w${sway}" style="animation-duration:${swayTime}s" cx="${x}" cy="-12" r="${r}" fill="#f4f8ff" opacity="${opacity}"/>` +
      `</g>`
  }

  return out
}

const STYLE = `
.fall{animation:fall 20s linear infinite}
.w1,.w2,.w3{animation:w1 7s ease-in-out infinite alternate}
.w2{animation-name:w2}
.w3{animation-name:w3}
@keyframes fall{from{transform:translate(0px,0px)}to{transform:translate(-60px,1040px)}}
@keyframes w1{from{transform:translateX(-14px)}to{transform:translateX(14px)}}
@keyframes w2{from{transform:translateX(10px)}to{transform:translateX(-18px)}}
@keyframes w3{from{transform:translateX(-6px)}to{transform:translateX(22px)}}
`

// Built once: only the snowfall and the pile change between levels.
const SKY_AND_LAND =
  `<defs>` +
  `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">` +
  `<stop offset="0" stop-color="#0b1222"/>` +
  `<stop offset="0.5" stop-color="#16223b"/>` +
  `<stop offset="0.8" stop-color="#2c3d5d"/>` +
  `</linearGradient>` +
  `<linearGradient id="snow" x1="0" y1="0" x2="0" y2="1">` +
  `<stop offset="0" stop-color="#dfe7f2"/>` +
  `<stop offset="1" stop-color="#97a9c3"/>` +
  `</linearGradient>` +
  `<radialGradient id="warm">` +
  `<stop offset="0" stop-color="#f2b45a" stop-opacity="0.3"/>` +
  `<stop offset="1" stop-color="#f2b45a" stop-opacity="0"/>` +
  `</radialGradient>` +
  `<radialGradient id="moonglow">` +
  `<stop offset="0" stop-color="#dfe8ff" stop-opacity="0.22"/>` +
  `<stop offset="1" stop-color="#dfe8ff" stop-opacity="0"/>` +
  `</radialGradient>` +
  `</defs>` +
  `<rect width="1600" height="1000" fill="url(#sky)"/>` +
  stars() +
  // full moon, top left, with a soft halo
  `<circle cx="250" cy="150" r="150" fill="url(#moonglow)"/>` +
  `<circle cx="250" cy="150" r="46" fill="#eef1f8"/>` +
  // far snowy hills
  `<path d="M0 760C200 700 420 720 650 752S1100 690 1340 720S1540 700 1600 716V1000H0Z" fill="#45567a"/>` +
  `<path d="M0 760C200 700 420 720 650 752S1100 690 1340 720S1540 700 1600 716V738C1520 726 1350 742 1100 716S700 778 420 744S120 772 0 782Z" fill="#8193b3" opacity="0.6"/>` +
  // pines
  `<g>` +
  pine(110, 880, 210, '#16213a') +
  pine(230, 870, 160, '#1a2741') +
  pine(380, 880, 120, '#1d2b46') +
  pine(930, 880, 140, '#1d2b46') +
  pine(1430, 885, 230, '#16213a') +
  pine(1540, 875, 170, '#1a2741') +
  `</g>` +
  CABIN

/** The whole scene with the snow at `level` (0 to 20). */
export function snowScene(level: number): string {
  const shown = Math.min(MAX_LEVEL, Math.max(0, Math.round(level)))
  // Eased so the snow creeps up at first and climbs faster near the end:
  // half full reaches the windows, full covers the chimney.
  const rise = Math.pow(shown / MAX_LEVEL, 1.6) * MAX_RISE

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">` +
    `<style>${STYLE}</style>` +
    SKY_AND_LAND +
    // it snows a little harder as the pile grows
    snowfall(50 + shown * 2) +
    pile(rise) +
    `</svg>`
  )
}
