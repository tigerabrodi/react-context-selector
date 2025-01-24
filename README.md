# React Context Selector

A lightweight (less than 1kb gzipped) library for efficient React Context updates using selectors. Only re-render components when the data they actually use changes.

## Installation

```bash
npm install @tigerabrodioss/react-context-selector
# or
pnpm add @tigerabrodioss/react-context-selector
# or
yarn add @tigerabrodioss/react-context-selector
```

## Quick start

```js
// 1. Create a context
const [CounterContext, Provider] = createSelectContext({
  count: 0,
  name: 'Tiger',
})

// 2. Set up the provider
function App() {
  return (
    <Provider>
      <Counter />
    </Provider>
  )
}

// 3. Use the context with a selector inside a component
const count = useContextSelector(CounterContext, (state) => state.count)

// 4. Update the state inside a component
const setState = useContextSetState(CounterContext)
setState((state) => ({ ...state, count: state.count + 1 }))
```

## Usage

```tsx
type Todo = {
  id: string
  text: string
  completed: boolean
}

type Filters = {
  status: 'all' | 'active' | 'completed'
}

type State = {
  todos: Array<Todo>
  filters: Filters
}

// 1. Create a context with your state type
const [TodoContext, TodoProvider] = createSelectContext<State>({
  todos: [],
  filters: { status: 'all' },
})

// 2. Set up the provider
function App() {
  return (
    <TodoProvider>
      <TodoList />
      <FilterPanel />
    </TodoProvider>
  )
}

// 3. Use selectors in your components
function TodoList() {
  // Only re-renders when todos change!
  const todos = useContextSelector(TodoContext, (state) => state.todos)
  const setState = useContextSetState(TodoContext)

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() =>
              setState((state) => ({
                ...state,
                todos: state.todos.map((t) =>
                  t.id === todo.id ? { ...t, completed: !t.completed } : t
                ),
              }))
            }
          />
          {todo.text}
        </li>
      ))}
    </ul>
  )
}

function FilterPanel() {
  // Only re-renders when filters change!
  const filters = useContextSelector(TodoContext, (state) => state.filters)
  const setState = useContextSetState(TodoContext)

  return (
    <select
      value={filters.status}
      onChange={(event) =>
        setState((state) => ({
          ...state,
          filters: {
            status: event.target.value as 'all' | 'active' | 'completed',
          },
        }))
      }
    >
      <option value="all">All</option>
      <option value="active">Active</option>
      <option value="completed">Completed</option>
    </select>
  )
}
```

## Key Features

- 🎯 Selective Re-rendering: Components only re-render when their selected data changes
- 💡 Type-safe: Full TypeScript support
- 🪶 Lightweight: < 1kb gzipped (no dependencies!)
- 🔍 Debug Mode: Optional debugging to track state updates

## Debug Mode

This enables logging to the console when the state changes. You enable debug option per selector. Debugging is only enabled in development mode.

```tsx
const filters = useContextSelector(TodoContext, (state) => state.filters, {
  debug: {
    enabled: true,
    name: 'Filters',
  },
})
```

If enabled, `name` is required. This is used to identify the selector in the console.

## Custom compare function

You can pass a custom compare function to control when re-renders happen. This is useful for complex comparisons or performance optimization. The default compare function is [Object.is](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).

```tsx
// Only re-render if the number of completed todos changes
const completedCount = useContextSelector(
  TodoContext,
  (state) => state.todos.filter((t) => t.completed).length,
  {
    compare: (prev, next) => prev === next,
  }
)

// Or for array comparison
const todos = useContextSelector(TodoContext, (state) => state.todos, {
  compare: (prev, next) => prev.length === next.length, // Only re-render on length changes
})
```

Returning true from the compare function will not cause a re-render. It's like saying "this is the same data, so don't re-render".

Usually, you don't need this. But it's useful when working with complex shapes of data.

## Requirements

- React 18 or later

## License

MIT © [Tiger Abrodi](https://github.com/tigerabrodi)
