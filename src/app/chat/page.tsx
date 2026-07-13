// src/app/chat/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

type ToolCall = {
  name: string;
  args: Record<string, string>;
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTools]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setActiveTools([]);

    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.reply,
        toolCalls: data.tool_calls || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: unknown) {
      const errorMsg: Message = {
        role: 'assistant',
        content: `Error: ${e instanceof Error ? e.message : 'Failed to get response'}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setActiveTools([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
  };

  const toolLabel = (name: string) => {
    const labels: Record<string, string> = {
      check_inventory: 'Checking inventory',
      get_sales_history: 'Fetching sales data',
      calculate_reorder: 'Calculating reorder qty',
      generate_po: 'Generating purchase order',
    };
    return labels[name] || name;
  };

  const suggestions = [
    'Check if RICE_01 needs restocking',
    'What is the sales history for OIL_01?',
    'Generate a PO for RICE_01, qty 30',
  ];

  return (
    <div className="flex h-screen bg-[#FFF8F2]">
      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top navbar */}
        <header className="flex items-center justify-between border-b-2 border-amber-500 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <line x1="12" y1="7" x2="12" y2="11" />
                <line x1="8" y1="16" x2="8" y2="16.01" />
                <line x1="16" y1="16" x2="16" y2="16.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">StockKeyHub Procurement Agent</h1>
              <p className="text-xs text-gray-400">FastAPI + OpenAI Function Calling</p>
            </div>
          </div>
          <button
            onClick={handleNewChat}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            + New Chat
          </button>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center">
              <p className="mb-1 text-lg font-semibold text-gray-800">
                Hi! Ask me anything about procurement
              </p>
              <p className="mb-8 text-sm text-gray-400">
                I can check inventory, analyze sales trends, and generate purchase orders.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="rounded-full bg-amber-500 px-4 py-2 text-xs text-white transition hover:bg-amber-600"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl px-4 py-6">
              <div className="space-y-5">
                {messages.map((msg, idx) => (
                  <div key={idx}>
                    {/* Tool calls display */}
                    {msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="mb-2 ml-9 flex flex-wrap gap-1.5">
                        {msg.toolCalls.map((tc, tcIdx) => (
                          <span
                            key={tcIdx}
                            className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] text-amber-700"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                            </svg>
                            {toolLabel(tc.name)}({Object.values(tc.args).join(', ')})
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Message bubble */}
                    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'assistant' && (
                        <div className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="10" rx="2" />
                            <circle cx="12" cy="5" r="2" />
                            <line x1="12" y1="7" x2="12" y2="11" />
                            <line x1="8" y1="16" x2="8" y2="16.01" />
                            <line x1="16" y1="16" x2="16" y2="16.01" />
                          </svg>
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'bg-amber-500 text-white font-semibold'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="10" rx="2" />
                        <circle cx="12" cy="5" r="2" />
                        <line x1="12" y1="7" x2="12" y2="11" />
                        <line x1="8" y1="16" x2="8" y2="16.01" />
                        <line x1="16" y1="16" x2="16" y2="16.01" />
                      </svg>
                    </div>
                    <div className="rounded-2xl bg-gray-100 px-4 py-2.5 text-sm text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <span className="animate-bounce">●</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 bg-white px-4 py-3">
          <div className="mx-auto flex max-w-3xl gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about inventory, sales, or procurement..."
              disabled={loading}
              className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-60"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
          <p className="mt-1.5 text-center text-[11px] text-gray-300">
            Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}
