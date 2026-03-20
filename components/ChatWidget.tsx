// components/ChatWidget.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, ChevronDown } from "lucide-react";
import { sendMessage, type ChatMessage } from "@/lib/chatApi";

// ── Types ─────────────────────────────────────────────────────────────────

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface MessageBubbleProps {
  msg: DisplayMessage;
  key?: string; 
}

// ── Suggested prompts shown before first message ──────────────────────────

const SUGGESTED_PROMPTS = [
  "What's your current role?",
  "What projects have you shipped?",
  "What's your tech stack?",
  "Are you open to opportunities?",
];

// ── Helpers ───────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Dot loader ────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
        />
      ))}
    </span>
  );
}

// ── Single message bubble ─────────────────────────────────────────────────

function MessageBubble({ msg }: MessageBubbleProps) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center shadow-sm
          ${isUser
            ? "bg-primary-500 text-white"
            : "bg-slate-200 dark:bg-slate-700 text-primary-500"
          }`}
      >
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
            ${isUser
              ? "bg-primary-500 text-white rounded-br-sm"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-sm"
            }`}
        >
          {msg.isStreaming ? <TypingDots /> : msg.content}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1">
          {formatTime(msg.timestamp)}
        </span>
      </div>
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasUnread, setHasUnread] = useState<boolean>(false);
  const [showScrollBtn, setShowScrollBtn] = useState<boolean>(false);

  const historyRef = useRef<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Warm up backend on mount ────────────────────────────────────────────

  useEffect(() => {
    const base = (import.meta.env.VITE_CHAT_API_URL as string | undefined) ?? "http://localhost:8000";
    fetch(`${base}/health`).catch(() => {});
  }, []);

  // ── Scroll helpers ──────────────────────────────────────────────────────

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false);
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
    else if (messages.length > 0) setHasUnread(true);
  }, [messages, isOpen, scrollToBottom]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 80);
  };

  // ── Welcome message on first open ─────────────────────────────────────

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: generateId(),
        role: "assistant",
        content: "Hey! I'm Izu's AI assistant. Ask me anything about his work, skills, or background — or just say hi 👋",
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, messages.length]);

  // ── Send logic ─────────────────────────────────────────────────────────

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: DisplayMessage = {
      id: generateId(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    const loadingId = generateId();
    const loadingMsg: DisplayMessage = {
      id: loadingId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await sendMessage(trimmed, historyRef.current);

      historyRef.current = [
        ...historyRef.current,
        { role: "user", content: trimmed },
        { role: "assistant", content: reply },
      ];

      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId ? { ...m, content: reply, isStreaming: false } : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? { ...m, content: "Sorry, something went wrong. Please try again.", isStreaming: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const showSuggestions = messages.length <= 1;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Floating bubble ─────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Open chat"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
          bg-primary-500 hover:bg-primary-600 active:scale-95
          text-white shadow-lg shadow-primary-500/30
          flex items-center justify-center
          transition-all duration-300
          ${isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"}
        `}
      >
        <MessageCircle size={24} />
        {hasUnread && (
          <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      {/* ── Chat panel ──────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-6 right-6 z-50
          w-[360px] max-w-[calc(100vw-2rem)]
          flex flex-col rounded-2xl overflow-hidden
          shadow-2xl shadow-black/20 dark:shadow-black/50
          border border-slate-200 dark:border-slate-700
          bg-slate-50 dark:bg-dark-bg
          transition-all duration-300 origin-bottom-right
          ${isOpen
            ? "scale-100 opacity-100 h-[520px] max-h-[80vh]"
            : "scale-75 opacity-0 h-0 pointer-events-none"
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-primary-500 text-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">Izu's Assistant</p>
              <p className="text-[11px] text-primary-100 leading-tight flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
                Online
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close chat"
          >
            <X size={14} />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {/* Suggested prompts */}
          {showSuggestions && !isLoading && (
            <div className="flex flex-wrap gap-2 pt-1">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => send(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full
                    bg-white dark:bg-slate-800
                    border border-slate-200 dark:border-slate-700
                    text-primary-500 dark:text-primary-400
                    hover:bg-primary-50 dark:hover:bg-slate-700
                    hover:border-primary-300
                    transition-colors shadow-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Scroll-to-bottom button */}
        {showScrollBtn && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-20 right-4 w-7 h-7 rounded-full
              bg-white dark:bg-slate-700 shadow-md
              border border-slate-200 dark:border-slate-600
              flex items-center justify-center
              text-slate-500 hover:text-primary-500
              transition-all"
          >
            <ChevronDown size={14} />
          </button>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex-shrink-0 p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything…"
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none rounded-xl px-3.5 py-2.5 text-sm
              bg-slate-100 dark:bg-slate-800
              border border-slate-200 dark:border-slate-700
              text-slate-800 dark:text-slate-200
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
              disabled:opacity-50 leading-relaxed
              transition-all max-h-[120px] overflow-y-auto"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-10 h-10 rounded-xl
              bg-primary-500 hover:bg-primary-600
              disabled:opacity-40 disabled:cursor-not-allowed
              text-white flex items-center justify-center
              transition-all active:scale-95 shadow-sm"
            aria-label="Send"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>
      </div>
    </>
  );
}