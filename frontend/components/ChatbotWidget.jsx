import React, { useMemo, useRef, useState } from 'react';

const HARD_CODED_BACKEND_URL = 'https://api.legatusaisolutions.com/chat';

const DEFAULT_CONFIG = {
  launcherLabel: 'Help',
  title: 'Company Name',
  subtitle: 'How can we help you today?',
  greeting: 'Welcome. I can help with services, pricing, and business inquiries.',
  inputPlaceholder: 'Type your question...'
};

const QUICK_ACTIONS = ['Get a Quote', 'Contact Us', 'Business Hours', 'Services'];

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
        className="relative grid h-15 w-15 place-items-center rounded-full border border-white/70 bg-[var(--brand-primary)] px-3 text-[0.9rem] font-semibold text-[var(--text-inverse)] shadow-[var(--widget-shadow)] transition-all duration-200 ease-in-out hover:-translate-y-px hover:bg-[var(--send-hover)]"
        aria-label="Open chat"
        aria-expanded={isOpen}
        onClick={() => setOpen(!isOpen)}
        type="button"
      >
        <span>{mergedConfig.launcherLabel}</span>
        <span
          className={`absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-[var(--brand-accent)] px-1.5 text-[0.69rem] font-semibold leading-none text-[var(--text-primary)] transition-[opacity,transform] duration-200 ${unreadCount > 0 ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-75'}`}
          aria-live="polite"
          aria-label="Unread messages"
        >
          {clampUnread(unreadCount)}
        </span>
      </button>

      <div
        className={`absolute bottom-18 right-0 grid h-[min(640px,calc(100vh-84px))] w-[min(420px,calc(100vw-16px))] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[18px] border border-[var(--widget-border)] bg-[var(--widget-bg)] text-[var(--text-primary)] shadow-[var(--widget-shadow)] transition-[opacity,transform] duration-200 ease-in-out origin-bottom-right ${isOpen ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-5 scale-[0.97] opacity-0'}`}
        aria-hidden={!isOpen}
        role="dialog"
        aria-label="AI chat panel"
      >
        <header className="flex items-start justify-between gap-3 bg-[var(--header-bg)] px-4 py-3.5 text-[var(--text-inverse)]" role="banner">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 text-[0.72rem] font-semibold tracking-[0.06em] text-white">
              CO
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="m-0 text-[1rem] font-bold leading-5 tracking-[0.01em] text-inherit">{mergedConfig.title}</h2>
              <p className="mt-1 text-[0.85rem] font-medium text-white/90">{mergedConfig.subtitle}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[0.72rem] font-medium text-white/90">
                <span className="h-1.75 w-1.75 rounded-full bg-[var(--brand-accent)]" aria-hidden="true" />
                Online now
              </div>
            </div>
          </div>

          <button
            className="h-8 w-8 shrink-0 rounded-lg border border-white/20 bg-white/10 text-[1.1rem] leading-none text-white transition-colors duration-200 hover:bg-white/20"
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
          className="flex min-h-0 flex-col gap-3 overflow-y-auto bg-[var(--page-bg)] px-3.5 py-4"
        >
          <div className="mb-1 flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((actionLabel) => (
              <button
                key={actionLabel}
                type="button"
                onClick={() => setInputValue(actionLabel)}
                className="rounded-full border border-[var(--brand-secondary)] bg-white px-3 py-1.5 text-[0.76rem] font-semibold text-[var(--brand-secondary)] transition-all duration-200 ease-in-out hover:-translate-y-px hover:bg-[var(--brand-secondary)] hover:text-white"
              >
                {actionLabel}
              </button>
            ))}
          </div>

          {messages.map((entry, idx) => (
            <div
              key={`${entry.role}-${idx}`}
              className={`chat-message max-w-[86%] whitespace-pre-wrap wrap-break-word rounded-[16px] px-3.5 py-2.75 text-[0.93rem] leading-[1.5] shadow-[var(--message-shadow)] ${entry.role === 'user' ? 'ml-auto bg-[var(--user-bubble)] text-[var(--user-ink)]' : 'mr-auto border border-[var(--widget-border)] bg-[var(--bot-bubble)] text-[var(--bot-ink)]'}`}
            >
              {entry.text}
            </div>
          ))}
        </div>

        <div className="grid h-full grid-cols-[1fr_auto] items-center gap-2.5 border-t border-[var(--widget-border)] bg-[var(--widget-bg)] p-3">
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
            className="h-11 rounded-[12px] border border-[var(--composer-border)] bg-[var(--composer-bg)] px-3.5 py-0 text-[0.93rem] font-medium text-[var(--text-primary)] outline-none transition-[border-color,box-shadow] duration-200 ease-in-out placeholder:font-normal placeholder:text-slate-400 focus:border-[var(--brand-secondary)] focus:shadow-[0_0_0_3px_rgba(44,106,160,0.14)]"
          />
          <button
            id="sendBtn"
            type="button"
            onClick={sendMessage}
            disabled={isSending}
            className="min-w-18 h-11 rounded-[12px] border border-transparent bg-[var(--brand-primary)] px-3.5 text-[0.9rem] font-semibold text-white transition-all duration-200 ease-in-out hover:-translate-y-px hover:bg-[var(--send-hover)] disabled:cursor-wait disabled:opacity-70"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
