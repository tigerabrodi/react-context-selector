import { act, render, screen } from '@testing-library/react'
import { createSelectContext } from '../create-context'
import { useContextSelector, useContextSetState } from '../hooks'

it('should only rerender when selected value changes', () => {
  let renderCount = 0
  const [Context, Provider] = createSelectContext({ count: 0, name: 'test' })

  function Counter() {
    const count = useContextSelector(Context, (state) => state.count)
    const setState = useContextSetState(Context)

    renderCount++

    return (
      <div>
        {count}
        <button
          onClick={() =>
            setState((state) => ({ ...state, count: state.count + 1 }))
          }
        >
          Increment
        </button>
        <button
          onClick={() => setState((state) => ({ ...state, name: 'new' }))}
        >
          Change Name
        </button>
      </div>
    )
  }

  render(
    <Provider>
      <Counter />
    </Provider>
  )

  // Initial render!
  expect(renderCount).toBe(1)

  // Update unrelated state
  act(() => {
    screen.getByRole('button', { name: 'Change Name' }).click()
  })

  // Shouldn't rerender
  // renderCount should be 1 still
  expect(renderCount).toBe(1)

  // Update counted state
  act(() => {
    screen.getByRole('button', { name: 'Increment' }).click()
  })

  // Should rerender because count changed
  expect(renderCount).toBe(2)
})

it('should respect custom compare function', () => {
  let renderCount = 0
  const [Context, Provider] = createSelectContext({
    items: [1, 2, 3],
  })

  function Items() {
    const items = useContextSelector(Context, (state) => state.items, {
      compare: (prev, next) => prev.length === next.length,
    })
    const setState = useContextSetState(Context)

    renderCount++

    return (
      <div>
        {items.join(',')}
        <button
          onClick={() =>
            setState((state) => ({
              items: state.items.map((item) => item + 1),
            }))
          }
        >
          Increment All
        </button>
        <button
          onClick={() =>
            setState((state) => ({
              items: [...state.items, state.items.length + 1],
            }))
          }
        >
          Add Item
        </button>
      </div>
    )
  }

  render(
    <Provider>
      <Items />
    </Provider>
  )

  // Initial render
  expect(renderCount).toBe(1)

  // Update array values but keep same length
  act(() => {
    screen.getByRole('button', { name: 'Increment All' }).click()
  })

  // Shouldn't rerender because length is same
  expect(renderCount).toBe(1)

  // Add new item which changes length
  act(() => {
    screen.getByRole('button', { name: 'Add Item' }).click()
  })

  // Should rerender because length changed
  expect(renderCount).toBe(2)
})

it('should only log debug messages in development when state changes', () => {
  const consoleSpy = vi.spyOn(console, 'group')
  const originalNodeEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'development'

  const [Context, Provider] = createSelectContext({ count: 0, name: 'test' })

  function Component() {
    const count = useContextSelector(Context, (state) => state.count, {
      debug: {
        enabled: true,
        name: 'CountSelector',
      },
    })
    const setState = useContextSetState(Context)

    return (
      <div>
        <span>{count}</span>
        <button
          onClick={() =>
            setState((state) => ({ ...state, count: state.count + 1 }))
          }
        >
          Increment
        </button>
        <button
          onClick={() => setState((state) => ({ ...state, name: 'new' }))}
        >
          Change Name
        </button>
      </div>
    )
  }

  render(
    <Provider>
      <Component />
    </Provider>
  )

  // Clear initial render log
  consoleSpy.mockClear()

  // Update unrelated state
  // not being consumed by the selector
  act(() => {
    screen.getByRole('button', { name: 'Change Name' }).click()
  })

  // Should not log because selected state (count) didn't change
  expect(consoleSpy).not.toHaveBeenCalled()

  // Update counted state
  act(() => {
    screen.getByRole('button', { name: 'Increment' }).click()
  })

  // Should log once because count changed
  expect(consoleSpy).toHaveBeenCalledTimes(1)

  // Cleanup
  process.env.NODE_ENV = originalNodeEnv
  consoleSpy.mockRestore()
})
