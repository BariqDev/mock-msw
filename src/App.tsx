import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import Todos from './pages/Todos'
import Chat from './pages/Chat'

function Nav() {
  const { pathname } = useLocation()

  const links = [
    { to: '/', label: 'Todos' },
    { to: '/chat', label: 'WebSocket Chat' },
  ]

  return (
    <nav className="flex gap-4 border-b border-gray-700 px-8 py-4">
      {links.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          className={`font-semibold transition-colors ${
            pathname === to ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Nav />
        <Routes>
          <Route path="/" element={<Todos />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
