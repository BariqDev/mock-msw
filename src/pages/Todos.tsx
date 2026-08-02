import { useEffect, useState, type FormEvent } from 'react'

const API = 'https://api.example.com/todos'

interface Todo {
  id: number
  title: string
  completed: boolean
}

function Todos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const fetchTodos = async () => {
    const res = await fetch(API)
    setTodos(await res.json())
  }

  useEffect(() => { fetchTodos() }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: input }),
    })
    setInput('')
    fetchTodos()
  }

  const toggleTodo = async (id: number) => {
    await fetch(`${API}/${id}`, { method: 'PATCH' })
    fetchTodos()
  }

  const deleteTodo = async (id: number) => {
    await fetch(`${API}/${id}`, { method: 'DELETE' })
    fetchTodos()
  }

  const startEdit = (todo: Todo) => {
    setEditId(todo.id)
    setEditTitle(todo.title)
  }

  const saveEdit = async () => {
    if (!editTitle.trim() || editId === null) return
    await fetch(`${API}/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle }),
    })
    setEditId(null)
    fetchTodos()
  }

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6">MSW Todo App</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-8 w-full max-w-md">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a todo..."
          className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-semibold cursor-pointer transition-colors"
        >
          POST
        </button>
      </form>

      <div className="w-full max-w-md space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="w-5 h-5 accent-blue-500 cursor-pointer"
            />

            {editId === todo.id ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="flex-1 px-2 py-1 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            ) : (
              <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                {todo.title}
              </span>
            )}

            <span className="text-xs text-gray-500 font-mono">#{todo.id}</span>

            {editId === todo.id ? (
              <button
                onClick={saveEdit}
                className="text-green-400 hover:text-green-300 text-sm font-semibold cursor-pointer"
              >
                SAVE
              </button>
            ) : (
              <>
                <button
                  onClick={() => startEdit(todo)}
                  className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold cursor-pointer"
                >
                  PUT
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-400 hover:text-red-300 text-sm font-semibold cursor-pointer"
                >
                  DELETE
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Todos
