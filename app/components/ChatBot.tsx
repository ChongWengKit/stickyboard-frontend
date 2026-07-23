"use client";

import { useState, useEffect, useRef } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
}

const STORAGE_KEY = "stickyboard-chat-messages";

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as ChatMessage[];
    }
  } catch {
  }
  return [];
}

function saveMessages(messages: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function ChatBot({ isOpen, onToggle }: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isBotTyping) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsBotTyping(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: trimmed, history }),
        }
      );
      const json = await res.json();

      const botContent =
        json.success && json.data?.answer
          ? json.data.answer
          : json.message || "Sorry, I couldn't generate a response.";
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: botContent,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "Error: Failed to reach chat server. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearAll = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const panelWidth = 380;

  return (
    <>
      <button
        onClick={onToggle}
        className="fixed bottom-6 z-50 flex items-center justify-center w-12 h-12 rounded-full shadow-xl border border-neutral-600 bg-neutral-700 text-neutral-300 transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          backgroundColor: "#404040",
          borderColor: "#525252",
          color: "#d4d4d4",
          right: isOpen ? panelWidth + 16 : 16,
        }}
        title={isOpen ? "Close chat" : "Open chat"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          )}
        </svg>
      </button>

      {/* Chat panel — dark theme, right side */}
      <div
        className="fixed top-0 right-0 z-40 h-full border-l shadow-2xl flex flex-col transition-transform duration-300"
        style={{
          width: panelWidth,
          maxWidth: "100vw",
          backgroundColor: "#404040",
          color: "#d4d4d4",
          borderColor: "#525252",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#525252" }}>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-neutral-200">Stickyboard Bot</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAll}
              className="px-2 py-1 text-xs rounded border transition hover:bg-neutral-600"
              style={{ color: "#f87171", borderColor: "#f87171" }}
              title="Clear all messages"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center" style={{ color: "#a3a3a3" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p className="text-sm">Start a conversation!</p>
              <p className="text-xs mt-1">Type a message below.</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className="flex"
              style={{ justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
            >
              <div
                className="relative group max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm"
                style={{
                  backgroundColor: msg.role === "user" ? "#262626" : "#525252",
                  border: msg.role === "assistant" ? "1px solid #737373" : "none",
                  borderBottomRightRadius: msg.role === "user" ? 4 : 16,
                  borderBottomLeftRadius: msg.role === "assistant" ? 4 : 16,
                }}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <div className="flex items-center justify-between mt-1" style={{ gap: 4 }}>
                  <span className="text-xs" style={{ color: "#a3a3a3" }}>
                    {formatTime(msg.timestamp)}
                  </span>
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "#f87171" }}
                    title="Delete message"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {isBotTyping && (
            <div className="flex justify-start">
              <div
                className="rounded-2xl px-4 py-3 text-sm border shadow-sm"
                style={{
                  backgroundColor: "#525252",
                  borderColor: "#737373",
                  borderBottomLeftRadius: 4,
                }}
              >
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "#a3a3a3", animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "#a3a3a3", animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "#a3a3a3", animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 py-3 border-t" style={{ borderColor: "#525252" }}>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 rounded-full px-4 py-2 text-sm outline-none border"
              style={{
                backgroundColor: "#262626",
                color: "#d4d4d4",
                borderColor: "#525252",
              }}
              disabled={isBotTyping}
            />
            <button
              onClick={handleSend}
              disabled={input.trim() === "" || isBotTyping}
              className="flex items-center justify-center w-9 h-9 rounded-full transition disabled:opacity-40"
              style={{
                backgroundColor: "#2b7cff",
                color: "#ffffff",
                border: "none",
                cursor: input.trim() === "" || isBotTyping ? "not-allowed" : "pointer",
              }}
              aria-label="Send"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}