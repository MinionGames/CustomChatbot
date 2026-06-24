import React, { useMemo, useRef, useState } from 'react';

const HARD_CODED_BACKEND_URL = 'https://api.legatusaisolutions.com/chat';

const DEFAULT_CONFIG = {
  launcherLabel: 'AI',
  title: 'AI Assistant',
  subtitle: 'Online now',
  greeting: 'Hi, I am your AI assistant. How can I help you today?',
  inputPlaceholder: 'Ask me anything...'
};

function clampUnread(count) {
  if (count <= 0) {
    return '0';
  }

  return count > 99 ? '99+' : String(count);
}

export default function ChatbotWidget({ config = {} }) {
  const mergedConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: mergedConfig.greeting, trackUnread: false }
  ]);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesRef = useRef(null);

  const setOpen = (nextIsOpen) => {
    setIsOpen(nextIsOpen);
    if (nextIsOpen) {
      setUnreadCount(0);
    }
  };

  const appendMessage = (role, text, options = {}) => {
    setMessages((prev) => [...prev, { role, text, trackUnread: options.trackUnread !== false }]);

    if (role === 'bot' && options.trackUnread !== false && !isOpen) {
      setUnreadCount((prev) => prev + 1);
    }

    requestAnimationFrame(() => {
      if (messagesRef.current) {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }
    });
  };

  const sendMessage = async () => {
    const message = inputValue.trim();

    if (!message || isSending) {
      return;
    }

    appendMessage('user', message, { trackUnread: false });
    setInputValue('');
    setIsSending(true);

    try {
      const response = await fetch(HARD_CODED_BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      let responseData = {};
      try {
        responseData = await response.json();
      } catch {
        responseData = {};
      }

      if (!response.ok) {
        const errorMessage = typeof responseData.error === 'string'
          ? responseData.error
          : 'The server returned an error.';
        appendMessage('bot', `Error ${response.status}: ${errorMessage}`);
        return;
      }

      const reply = typeof responseData.reply === 'string' ? responseData.reply.trim() : '';
      appendMessage('bot', reply || 'The model returned an empty response.');
    } catch {
      appendMessage('bot', `Request failed - is the backend running at:\n${HARD_CODED_BACKEND_URL}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className={`fixed right-6 bottom-6 z-1000 ${isOpen ? 'chat-widget-open' : ''}`}>
      <button
        className="relative grid h-16 w-16 place-items-center rounded-full border-0 bg-[linear-gradient(160deg,#165f82,#0e4b67)] text-[1.05rem] font-bold text-sky-50 shadow-[0_16px_36px_rgba(16,48,66,0.24)] transition-transform duration-200 hover:-translate-y-px hover:scale-[1.03]"
        aria-label="Open chat"
        aria-expanded={isOpen}
        onClick={() => setOpen(!isOpen)}
        type="button"
      >
        <span>{mergedConfig.launcherLabel}</span>
        <span
          className={`absolute -right-1 -top-1 grid min-h-5.5 min-w-5.5 place-items-center rounded-full border-2 border-slate-50 bg-rose-500 px-1.5 text-[0.72rem] font-bold leading-none text-white transition-[opacity,transform] duration-150 ${unreadCount > 0 ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-75'}`}
          aria-live="polite"
          aria-label="Unread messages"
        >
          {clampUnread(unreadCount)}
        </span>
      </button>

      <div
        className={`absolute bottom-19 right-0 grid h-[min(620px,calc(100vh-100px))] w-[min(390px,calc(100vw-20px))] grid-rows-[minmax(0,2fr)_minmax(0,6fr)_minmax(0,1fr)] overflow-hidden rounded-[18px] border border-slate-200 bg-(--widget-bg) shadow-[0_16px_36px_rgba(16,48,66,0.24)] transition-[opacity,transform] duration-200 origin-bottom-right ${isOpen ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-5 scale-[0.97] opacity-0'}`}
        aria-hidden={!isOpen}
        role="dialog"
        aria-label="AI chat panel"
      >
        <header className="flex h-full items-center justify-between gap-3 bg-[var(--header-start)] px-4 py-3.5 pl-4 text-[var(--sidebar-primary-foreground)] sm:pl-4" role="banner">
          <div className="min-w-0 flex-1">
            <h2 className="m-0 text-[1.03rem] tracking-[0.2px] text-inherit">{mergedConfig.title}</h2>
            <p className="mt-1.5 text-[0.82rem] text-sky-100/80">{mergedConfig.subtitle}</p>
          </div>

          <button
            className="h-8 w-8 shrink-0 rounded-lg border-0 bg-sky-100 text-[1.1rem] leading-none text-slate-700 transition-colors hover:bg-sky-200"
            aria-label="Minimize chat"
            onClick={() => setOpen(false)}
            type="button"
          >
            -
          </button>
        </header>

        <div
          ref={messagesRef}
          aria-live="polite"
          role="log"
          className="flex min-h-0 flex-col gap-2.5 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(31,111,151,0.12),transparent_38%)] p-3.5"
        >
          {messages.map((entry, idx) => (
            <div
              key={`${entry.role}-${idx}`}
              className={`max-w-[82%] whitespace-pre-wrap wrap-break-word rounded-[14px] px-3 py-2.5 text-[0.92rem] leading-[1.42] ${entry.role === 'user' ? 'ml-auto rounded-br-[5px] bg-(--user-bubble) text-(--user-ink)' : 'mr-auto rounded-bl-[5px] border border-slate-200 bg-(--bot-bubble) text-(--bot-ink)'}`}
            >
              {entry.text}
            </div>
          ))}
        </div>

        <div className="grid h-full grid-cols-[1fr_auto] items-stretch gap-2 border-t border-slate-200 bg-slate-50 p-2.5">
          <input
            id="msg"
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                sendMessage();
              }
            }}
            placeholder={mergedConfig.inputPlaceholder}
            autoComplete="off"
            aria-label="Your message"
            className="h-full rounded-[10px] border border-slate-300 px-3 py-0 text-[0.93rem] text-slate-900 outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-slate-400 focus:border-sky-600 focus:shadow-[0_0_0_3px_rgba(31,111,151,0.16)]"
          />
          <button
            id="sendBtn"
            type="button"
            onClick={sendMessage}
            disabled={isSending}
            className="min-w-16.5 h-full rounded-[10px] border-0 bg-[var(--primary)] px-3.5 font-bold text-[var(--primary-foreground)] transition-colors duration-200 hover:bg-[var(--sidebar-primary)] disabled:cursor-wait disabled:opacity-70"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
