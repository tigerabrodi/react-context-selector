import { useContext, useRef, useSyncExternalStore } from 'react'
import { SetStateFn, Store } from './types'
import { debugLogger, isDevelopment } from './utils'

type Options<Selected> = {
  compare: (prev: Selected, next: Selected) => boolean
  debug?: {
    name: string
    enabled: boolean
  }
}

/**
 * A hook that subscribes to context updates with selector optimization.
 * Re-renders will only occur if the selected state changes based on the compare function.
 *
 * @param Context - The React Context created by createSelectContext
 * @param selector - A function that selects a portion of the state
 * @param options - Configuration options
 * @param options.compare - Function to determine if selected state has changed (defaults to Object.is)
 * @param options.debug - Debug options for development only
 * @param options.debug.name - Name to identify this selector in debug logs
 * @param options.debug.enabled - Whether to enable debug logging
 * @returns The selected portion of state
 *
 * @example
 * ```tsx
 * const count = useContextSelector(CountContext,
 *   state => state.count,
 *   {
 *     compare: (prev, next) => prev === next,
 *     debug: { name: 'CountSelector', enabled: true }
 *   }
 * )
 * ```
 */
export function useContextSelector<State, Selected>(
  Context: React.Context<Store<State> | null>,
  selector: (state: State) => Selected,
  options: Options<Selected> = {
    compare: Object.is,
  }
): Selected {
  const store = useContext(Context)

  if (!store) {
    throw new Error('Context Provider is missing')
  }

  const previousSelectedStateRef = useRef<Selected | null>(null)

  const selectedState = useSyncExternalStore(
    store.subscribe,
    () => {
      const nextSelectedState = selector(store.getSnapshot())

      if (previousSelectedStateRef.current !== null) {
        const shouldUpdateState = !options.compare(
          previousSelectedStateRef.current,
          nextSelectedState
        )

        if (shouldUpdateState) {
          previousSelectedStateRef.current = nextSelectedState

          if (options.debug?.enabled && isDevelopment()) {
            debugLogger({
              name: options.debug.name,
              prevState: previousSelectedStateRef.current,
              nextState: nextSelectedState,
              listeners: store.listeners.size,
              status: 'New Selected State',
            })
          }

          return nextSelectedState
        }

        if (options.debug?.enabled && isDevelopment()) {
          debugLogger({
            name: options.debug.name,
            prevState: previousSelectedStateRef.current,
            nextState: nextSelectedState,
            listeners: store.listeners.size,
            status: 'No New Selected State',
          })
        }

        return previousSelectedStateRef.current
      }

      if (options.debug?.enabled && isDevelopment()) {
        debugLogger({
          name: options.debug.name,
          prevState: null,
          nextState: nextSelectedState,
          listeners: store.listeners.size,
          status: 'Initial Render',
        })
      }

      // First time render
      previousSelectedStateRef.current = nextSelectedState
      return nextSelectedState
    },
    // Server snapshot
    // No need to compare here
    () => selector(store.getSnapshot())
  )

  return selectedState
}

/**
 * A hook that returns the setState function from the context.
 * Use this to update the context state.
 *
 * @param Context - The React Context created by createSelectContext
 * @returns A function to update the context state
 * @throws {Error} If used outside of a Provider
 *
 * @example
 * ```tsx
 * const setState = useContextSetState(CountContext)
 * // Update state
 * setState(state => ({ ...state, count: state.count + 1 }))
 * ```
 */
export function useContextSetState<State>(
  Context: React.Context<Store<State> | null>
): SetStateFn<State> {
  const store = useContext(Context)

  if (!store) {
    throw new Error('Context Provider is missing')
  }

  return store.setState
}
