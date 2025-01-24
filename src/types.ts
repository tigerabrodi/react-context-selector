export type SetStateFn<State> = (fn: (state: State) => State) => void

export type Store<State> = {
  state: State
  setState: SetStateFn<State>
  listeners: Set<() => void>
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => State
}

export type DebugOptions = {
  name: string
  enabled: boolean
}
