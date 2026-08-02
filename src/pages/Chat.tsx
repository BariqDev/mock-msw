import { useEffect, useRef, useState, type FormEvent } from 'react'

interface ChatMessage {
  id?: string
  type: 'message' | 'notice'
  text: string
}

function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [rawLog, setRawLog] = useState<string[]>([])
  const [showRaw, setShowRaw] = useState(false)
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const rawRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    connect()
    return () => wsRef.current?.close()
  }, [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    rawRef.current?.scrollTo({ top: rawRef.current.scrollHeight, behavior: 'smooth' })
  }, [rawLog])

  const sendMessage = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !wsRef.current) return
    wsRef.current.send(input)
    setRawLog((prev) => [...prev, `📤 ${input}`])
    setInput('')
  }

  const disconnect = () => {
    wsRef.current?.close()
  }

  const connect = () => {
    const ws = new WebSocket('wss://api.example.com/chat')
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      setRawLog((prev) => [...prev, '🟢 CONNECTED'])
    }

    ws.onclose = () => {
      setConnected(false)
      setRawLog((prev) => [...prev, '🔴 DISCONNECTED'])
    }

    ws.onmessage = (event) => {
      setRawLog((prev) => [...prev, `📩 ${event.data}`])
      const msg: ChatMessage = JSON.parse(event.data)
      setMessages((prev) => [...prev, msg])
    }
  }

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-2">MSW WebSocket Chat</h1>
      <div className="flex items-center gap-2 mb-6">
        <span className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm text-gray-400">{connected ? 'Connected' : 'Disconnected'}</span>
        <button
          type="button"
          onClick={() => setShowRaw(!showRaw)}
          className="ml-4 text-xs text-gray-500 hover:text-gray-300 underline cursor-pointer"
        >
          {showRaw ? 'Hide' : 'View'} raw frames
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {connected ? (
          <button
            type="button"
            onClick={disconnect}
            className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
          >
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            onClick={connect}
            className="bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
          >
            Reconnect
          </button>
        )}
      </div>

      {showRaw && (
        <div
          ref={rawRef}
          className="w-full max-w-md h-32 overflow-y-auto bg-black border border-gray-700 rounded-lg p-3 mb-4 font-mono text-xs space-y-1"
        >
          {rawLog.map((line, i) => (
            <div key={`${i+Date.now()}`} className="text-green-400">{line}</div>
          ))}
        </div>
      )}

      <div
        ref={listRef}
        className="w-full max-w-md h-80 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4 space-y-2"
      >
        {messages.length === 0 && (
          <p className="text-gray-500 text-center mt-16">No messages yet</p>
        )}
        {messages.map((msg, i) => (
          <div key={msg.id ?? i} className={`${msg.type === 'notice' ? 'text-center' : ''}`}>
            {msg.type === 'notice' ? (
              <span className="text-xs text-gray-500 italic">{msg.text}</span>
            ) : (
              <div className="bg-gray-700 rounded-lg px-3 py-2 text-sm break-words">
                {msg.text}
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 w-full max-w-md">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={!connected}
          className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!connected}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-5 py-2 rounded-lg font-semibold cursor-pointer transition-colors"
        >
          SEND
        </button>
      </form>
    </div>
  )
}

export default Chat
