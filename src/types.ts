export type Store<State> = {
  state: State
  setState: (fn: (state: State) => State) => void
  listeners: Set<() => void>
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => State
  debug?: DebugOptions
}

export type DebugOptions = {
  name: string
  enabled: boolean
}
