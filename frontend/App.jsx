import React, { useEffect, useMemo, useState } from 'react';

const THEME_STORAGE_KEY = 'custom-chatbot-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const isDark = theme === 'dark';
  const nextThemeLabel = useMemo(() => (isDark ? 'Light' : 'Dark'), [isDark]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [isDark, theme]);

  return (
    <main className="min-h-screen text-[var(--foreground)]">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16 sm:px-10 lg:px-12">
        <div className="max-w-3xl rounded-4xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--card)_88%,transparent)] p-8 shadow-[0_20px_60px_color-mix(in_oklab,var(--foreground)_18%,transparent)] backdrop-blur-xl sm:p-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="mb-0 inline-flex rounded-full border border-[var(--sidebar-border)] bg-[var(--sidebar-accent)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--sidebar-accent-foreground)]">
              React + Tailwind
            </p>
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label={`Switch to ${nextThemeLabel.toLowerCase()} theme`}
              className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--card-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
            >
              {nextThemeLabel} Mode
            </button>
          </div>

          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Example website shell with a separate embeddable chatbot.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
            The main site is a React app, while the chatbot ships as an independent
            mountable bundle you can drop into this page or any other site.
          </p>

          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--foreground)] p-4 text-sm text-[var(--background)] shadow-inner">
            <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[color-mix(in_oklab,var(--background)_70%,var(--foreground))]">
              <span>Embed snippet</span>
              <span>Standalone</span>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap wrap-break-word font-mono text-[0.92rem] leading-6 text-[color-mix(in_oklab,var(--sidebar-primary-foreground)_92%,var(--background))]">
{`<script type="module" src="/dist/frontend/chatbot.js"></script>`}
            </pre>
          </div>
        </div>
      </section>
    </main>
  );
}
