# React Context Selector

A lightweight library for efficient React Context updates using selectors. Only re-render components when the data they actually use changes.

## Installation

```bash
npm install @tigerabrodioss/react-context-selector
# or
pnpm add @tigerabrodioss/react-context-selector
# or
yarn add @tigerabrodioss/react-context-selector
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
- 🪶 Lightweight: Built on React's `useSyncExternalStore` (no additional dependencies!)
- 🔍 Debug Mode: Optional debugging to track state updates

## Debug Mode

This enables logging to the console when the state changes.

```tsx
const [TodoContext, TodoProvider] = createSelectContext(initialState, {
  enabled: true,
  name: 'Todos',
})
```

## Custom compare function

You can pass a custom compare function to control when re-renders happen. This is useful for complex comparisons or performance optimization.

```tsx
// Only re-render if the number of completed todos changes
const completedCount = useContextSelector(
  TodoContext,
  (state) => state.todos.filter((t) => t.completed).length,
  (prev, next) => prev === next // Custom compare
)

// Or for array comparison
const todos = useContextSelector(
  TodoContext,
  (state) => state.todos,
  (prev, next) => prev.length === next.length // Only re-render on length changes
)
```

Returning true from the compare function will not cause a re-render. It's like saying "this is the same data, so don't re-render".

## Requirements

- React 18 or later

## License

MIT © [Tiger Abrodi](https://github.com/tigerabrodi)
