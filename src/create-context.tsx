import { createContext } from 'react'
import { Store } from './types'

/**
 * Creates a context with selector functionality for efficient updates.
 * Only re-renders components when their selected state changes.
 *
 * @template State - The type of state stored in the context
 * @param initialState - The initial state value for the context
 * @returns A tuple containing [Context, Provider]
 *  - Context: React Context object to be used with useContextSelector
 *  - Provider: React component to wrap your app/component tree
 *
 * @example
 * ```tsx
 * type State = {
 *   count: number
 *   text: string
 * }
 *
 * const [CountContext, Provider] = createSelectContext<State>({
 *   count: 0,
 *   text: ''
 * })
 *
 * function App() {
 *   return (
 *     <Provider>
 *       <Counter />
 *       <TextInput />
 *     </Provider>
 *   )
 * }
 * ```
 */
export function createSelectContext<State>(initialState: State) {
  const store: Store<State> = {
    state: initialState,
    listeners: new Set(),
    setState(fn) {
      const nextState = fn(store.state)
      store.state = nextState

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
