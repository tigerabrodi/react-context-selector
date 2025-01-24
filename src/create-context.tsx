import { createContext } from 'react'
import { DebugOptions, Store } from './types'
import { debugLogger } from './utils'

/**
 * @param initialState - The initial state of the context
 * @param debug - Debug options (optional) - If enabled, must pass a name. Will log the previous and next state, and the number of listeners.
 * @returns
 */
export function createSelectContext<State>(
  initialState: State,
  debug?: DebugOptions
) {
  const store: Store<State> = {
    state: initialState,
    listeners: new Set(),
    debug,
    setState(fn) {
      const prevState = store.state
      const nextState = fn(store.state)
      store.state = nextState

      if (debug?.enabled) {
        debugLogger({
          name: debug.name,
          prevState,
          nextState,
          listeners: store.listeners.size,
          status: 'State Update',
        })
      }

      store.listeners.forEach((listener) => listener())
    },

    subscribe(listener) {
      store.listeners.add(listener)
      // Return cleanup function
      return () => store.listeners.delete(listener)
    },

    getSnapshot() {
      return store.state
    },
  }

  const Context = createContext<Store<State> | null>(null)

  function Provider({ children }: { children: React.ReactNode }) {
    return <Context.Provider value={store}>{children}</Context.Provider>
  }

  return [Context, Provider] as const
}
