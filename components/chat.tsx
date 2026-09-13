"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  ArrowUp,
  Check,
  Copy,
  LoaderCircle,
  Plus,
  RotateCcw,
  Square,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import { MAX_INPUT } from "@/lib/chat-schema";

const transport = new DefaultChatTransport({ api: "/api/chat" });
const suggestions = [
  "Help me think through an idea",
  "Explain a difficult concept",
  "Make my writing clearer",
];
export function Chat({ mode }: { mode: "Demo" | "Live" | "Not configured" }) {
  const {
    messages,
    sendMessage,
    status,
    stop,
    error,
    clearError,
    regenerate,
    setMessages,
  } = useChat({ transport });
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const busy = status === "submitted" || status === "streaming";
  useEffect(() => {
    if (follow.current) bottom.current?.scrollIntoView({ behavior: "instant" });
  }, [messages, status]);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(null), 1800);
    return () => clearTimeout(timer);
  }, [copied]);
  function send(text: string) {
    if (!text.trim() || busy || mode === "Not configured") return;
    clearError();
    follow.current = true;
    setInput("");
    void sendMessage({ text: text.trim() });
  }
  return (
    <main className="chat-app">
      <header className="app-header">
        <div className="brand">
          <Sparkles size={22} aria-hidden="true" />
          <span>AI Starter</span>
          <span className="mode">{mode}</span>
        </div>
        <button
          className="new-chat"
          onClick={() => {
            stop();
            setMessages([]);
            clearError();
            setInput("");
          }}
          title="New chat"
        >
          <Plus size={18} /> <span>New chat</span>
        </button>
      </header>
      <section
        className="conversation"
        aria-label="Conversation"
        onScroll={(e) => {
          const el = e.currentTarget;
          follow.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 100;
        }}
      >
        <div className="conversation-inner">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="assistant-mark">
                <Sparkles size={28} aria-hidden="true" />
              </div>
              <h1>What are you working on?</h1>
              <div className="suggestions">
                {suggestions.map((text) => (
                  <button
                    key={text}
                    disabled={mode === "Not configured"}
                    onClick={() => send(text)}
                  >
                    {text}
                    <ArrowUp size={16} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const text = message.parts
                .filter((p) => p.type === "text")
                .map((p) => p.text)
                .join("");
              return (
                <article className={`message ${message.role}`} key={message.id}>
                  <div className="message-label">
                    {message.role === "user" ? "You" : "Assistant"}
                  </div>
                  <div className="message-content">
                    <Markdown
                      skipHtml
                      components={{
                        img: () => null,
                        a: (props) => (
                          <a
                            href={props.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {props.children}
                          </a>
                        ),
                      }}
                    >
                      {text}
                    </Markdown>
                  </div>
                  {message.role === "assistant" && text && !busy && (
                    <button
                      className="icon-button copy"
                      title={copied === message.id ? "Copied" : "Copy response"}
                      aria-label="Copy response"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(text);
                          setCopied(message.id);
                          setCopyError(false);
                        } catch {
                          setCopyError(true);
                        }
                      }}
                    >
                      {copied === message.id ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  )}
                </article>
              );
            })
          )}
          {status === "submitted" && (
            <div className="thinking" role="status">
              <LoaderCircle size={16} className="spin" /> Thinking...
            </div>
          )}
          <div ref={bottom} />
        </div>
      </section>
      <footer className="composer-area">
        {mode === "Not configured" && (
          <p className="notice" role="status">
            The assistant is not available yet.
          </p>
        )}
        {error && (
          <div className="error" role="alert">
            <span>
              Couldn&apos;t complete that response. Try again, or start a new
              chat.
            </span>
            <button
              onClick={() => {
                clearError();
                void regenerate();
              }}
              title="Retry response"
            >
              <RotateCcw size={16} /> Retry
            </button>
          </div>
        )}
        {copyError && (
          <p role="status">
            Couldn&apos;t copy. Select the response text to copy it.
          </p>
        )}
        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <textarea
            aria-label="Message"
            placeholder="Ask anything..."
            rows={3}
            maxLength={MAX_INPUT}
            value={input}
            disabled={mode === "Not configured"}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                send(input);
              }
            }}
          />
          <div className="composer-bottom">
            <span>
              {input.length.toLocaleString()} / {MAX_INPUT.toLocaleString()}
            </span>
            {busy ? (
              <button
                type="button"
                className="send"
                onClick={() => stop()}
                title="Stop response"
                aria-label="Stop response"
              >
                <Square size={17} />
              </button>
            ) : (
              <button
                className="send"
                type="submit"
                disabled={!input.trim() || mode === "Not configured"}
                title="Send message"
                aria-label="Send message"
              >
                <ArrowUp size={20} />
              </button>
            )}
          </div>
        </form>
        <p className="footnote">
          {mode === "Demo"
            ? "Demo mode · Responses are simulated"
            : "AI can make mistakes. Check important information."}
        </p>
      </footer>
    </main>
  );
}
