import { http, HttpResponse, ws } from 'msw'

interface Todo {
  id: number
  title: string
  completed: boolean
}

let todos: Todo[] = [
  { id: 1, title: 'Learn MSW', completed: true },
  { id: 2, title: 'Build a demo app', completed: false },
]
let nextId = 3

const chat = ws.link('wss://api.example.com/chat')

export const handlers = [
  // ---- HTTP: Todos ----
  http.get('https://api.example.com/todos', () => {
    return HttpResponse.json(todos)
  }),

  http.post('https://api.example.com/todos', async ({ request }) => {
    const body = (await request.json()) as { title?: string }
    if (!body?.title?.trim()) {
      return HttpResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    const todo: Todo = { id: nextId++, title: body.title, completed: false }
    todos.push(todo)
    return HttpResponse.json(todo, { status: 201 })
  }),

  http.put('https://api.example.com/todos/:id', async ({ params, request }) => {
    const body = (await request.json()) as { title?: string; completed?: boolean }
    const id = Number(params.id)
    const index = todos.findIndex((t) => t.id === id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Todo not found' }, { status: 404 })
    }
    todos[index] = { ...todos[index], ...body }
    return HttpResponse.json(todos[index])
  }),

  http.patch('https://api.example.com/todos/:id', async ({ params }) => {
    const id = Number(params.id)
    const index = todos.findIndex((t) => t.id === id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Todo not found' }, { status: 404 })
    }
    todos[index].completed = !todos[index].completed
    return HttpResponse.json(todos[index])
  }),

  http.delete('https://api.example.com/todos/:id', async ({ params }) => {
    const id = Number(params.id)
    const index = todos.findIndex((t) => t.id === id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Todo not found' }, { status: 404 })
    }
    todos.splice(index, 1)
    return HttpResponse.json({ message: 'Deleted' })
  }),

  // ---- WebSocket: Chat ----
  chat.addEventListener('connection', ({ client }) => {
    chat.broadcast(JSON.stringify({ type: 'notice', text: 'A user joined the chat' }))

    client.addEventListener('message', (event) => {
      const text = event.data as string
      const payload = JSON.stringify({ type: 'message', text, id: crypto.randomUUID() })
      chat.broadcast(payload)
    })

    client.addEventListener('close', () => {
      chat.broadcast(JSON.stringify({ type: 'notice', text: 'A user left the chat' }))
    })
  }),
]
