import { useContext, useRef, useSyncExternalStore } from 'react'
import { Store } from './types'
import { debugLogger } from './utils'

export function useContextSelector<State, Selected>(
  Context: React.Context<Store<State> | null>,
  selector: (state: State) => Selected,
  compare: (prev: Selected, next: Selected) => boolean = Object.is
) {
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
        const shouldUpdateState = !compare(
          previousSelectedStateRef.current,
          nextSelectedState
        )

        if (shouldUpdateState) {
          previousSelectedStateRef.current = nextSelectedState

          if (store.debug?.enabled) {
            debugLogger({
              name: store.debug.name,
              prevState: previousSelectedStateRef.current,
              nextState: nextSelectedState,
              listeners: store.listeners.size,
              status: 'New Selected State',
            })
          }

          return nextSelectedState
        }

        if (store.debug?.enabled) {
          debugLogger({
            name: store.debug.name,
            prevState: previousSelectedStateRef.current,
            nextState: nextSelectedState,
            listeners: store.listeners.size,
            status: 'No New Selected State',
          })
        }

        return previousSelectedStateRef.current
      }

      if (store.debug?.enabled) {
        debugLogger({
          name: store.debug.name,
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

export function useContextSetState<State>(
  Context: React.Context<Store<State> | null>
) {
  const store = useContext(Context)

  if (!store) {
    throw new Error('Context Provider is missing')
  }

  return store.setState
}
