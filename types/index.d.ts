/** How deep the snow is: 0 (a dusting) to 20 (the cabin is buried). */
export type SnowLevel = number

declare module 'claude-code' {
  interface PluginState {
    'snowed-in': { level: SnowLevel }
  }
}
