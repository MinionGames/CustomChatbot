/**
 * chatbot.js — Embeddable AI Chatbot Widget
 * =========================================
 * Drop this single <script> tag into any page to inject the chatbot:
 *
 *   <script src="chatbot.js"></script>
 *
 * ── CONFIGURATION ──────────────────────────────────────────────────────────
 * Change the values below to match your setup before embedding.
 */
(function () {
  'use strict';

  // ┌─────────────────────────────────────────────────────────────────┐
  // │  CONFIG — edit these values                                     │
  // └─────────────────────────────────────────────────────────────────┘
  var CONFIG = {
    /** Full URL of the /chat endpoint on your backend */
    backendUrl: 'https://api.legatusaisolutions.com/chat',

    /** Text shown in the launcher bubble */
    launcherLabel: 'AI',

    /** Title shown in the chat panel header */
    title: 'AI Assistant',

    /** Subtitle shown below the title */
    subtitle: 'Online now',

    /** First message the bot sends automatically on load */
    greeting: 'Hi, I am your AI assistant. How can I help you today?',

    /** Placeholder text in the message input */
    inputPlaceholder: 'Ask me anything…',

    /**
     * CSS z-index for the entire widget.
     * Increase if the widget appears behind other fixed elements on the page.
     */
    zIndex: 2147483647,
  };
  // ─────────────────────────────────────────────────────────────────────────

  /* ── Prevent double-initialisation ─────────────────────────────────────── */
  if (document.getElementById('ccb-widget')) return;

  /* ── Inject scoped CSS ──────────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.id = 'ccb-styles';
  style.textContent = [
    '#ccb-widget {',
    '  position: fixed;',
    '  right: 24px;',
    '  bottom: 24px;',
    '  z-index: ' + CONFIG.zIndex + ';',
    '  font-family: "Trebuchet MS","Segoe UI",Tahoma,sans-serif;',
    '}',

    /* Launcher bubble */
    '#ccb-launcher {',
    '  position: relative;',
    '  width: 62px;',
    '  height: 62px;',
    '  border-radius: 999px;',
    '  border: 0;',
    '  cursor: pointer;',
    '  font-size: 1.05rem;',
    '  font-weight: 700;',
    '  color: #eff8ff;',
    '  background: linear-gradient(160deg,#165f82,#0e4b67);',
    '  box-shadow: 0 16px 36px rgba(16,48,66,.24);',
    '  transition: transform .18s ease;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '}',
    '#ccb-launcher:hover { transform: translateY(-1px) scale(1.03); }',

    /* Unread badge */
    '#ccb-badge {',
    '  position: absolute;',
    '  top: -4px;',
    '  right: -4px;',
    '  min-width: 22px;',
    '  height: 22px;',
    '  padding: 0 6px;',
    '  display: grid;',
    '  place-items: center;',
    '  border-radius: 999px;',
    '  border: 2px solid #f4fbff;',
    '  background: #e24f4f;',
    '  color: #fff;',
    '  font-size: .72rem;',
    '  font-weight: 700;',
    '  line-height: 1;',
    '  opacity: 0;',
    '  transform: scale(.75);',
    '  pointer-events: none;',
    '  transition: opacity .15s ease, transform .15s ease;',
    '}',
    '#ccb-badge.ccb-visible { opacity: 1; transform: scale(1); }',

    /* Chat panel */
    '#ccb-panel {',
    '  position: absolute;',
    '  bottom: 76px;',
    '  right: 0;',
    '  width: min(390px,calc(100vw - 20px));',
    '  height: min(620px,calc(100vh - 100px));',
    '  display: grid;',
    '  grid-template-rows: auto 1fr auto;',
    '  border-radius: 18px;',
    '  border: 1px solid #cfdfeb;',
    '  background: #fffdfa;',
    '  box-shadow: 0 16px 36px rgba(16,48,66,.24);',
    '  overflow: hidden;',
    '  opacity: 0;',
    '  pointer-events: none;',
    '  transform: translateY(20px) scale(.97);',
    '  transform-origin: bottom right;',
    '  transition: opacity .18s ease, transform .18s ease;',
    '}',
    '#ccb-widget.ccb-open #ccb-panel {',
    '  opacity: 1;',
    '  pointer-events: auto;',
    '  transform: translateY(0) scale(1);',
    '}',
    '#ccb-widget.ccb-open #ccb-launcher { display: none; }',

    /* Header */
    '#ccb-header {',
    '  display: flex;',
    '  justify-content: space-between;',
    '  align-items: center;',
    '  gap: 10px;',
    '  padding: 14px 14px 14px 16px;',
    '  color: #eaf5ff;',
    '  background: linear-gradient(90deg,#0f445c,#1c698c);',
    '}',
    '#ccb-header-text { flex: 1; min-width: 0; }',
    '#ccb-title { margin: 0; font-size: 1.03rem; letter-spacing: .2px; }',
    '#ccb-subtitle { margin: 5px 0 0; font-size: .82rem; color: #c8e4f6; }',

    /* Collapse button */
    '#ccb-collapse {',
    '  flex-shrink: 0;',
    '  width: 32px;',
    '  height: 32px;',
    '  border: 0;',
    '  border-radius: 8px;',
    '  cursor: pointer;',
    '  font-size: 1.1rem;',
    '  line-height: 1;',
    '  color: #184258;',
    '  background: #e2f2ff;',
    '}',

    /* Message list */
    '#ccb-messages {',
    '  overflow-y: auto;',
    '  padding: 14px;',
    '  display: flex;',
    '  flex-direction: column;',
    '  gap: 10px;',
    '  background-image: radial-gradient(circle at right top,rgba(31,111,151,.12),transparent 38%);',
    '}',

    /* Bubbles */
    '.ccb-msg {',
    '  max-width: 82%;',
    '  border-radius: 14px;',
    '  padding: 10px 12px;',
    '  font-size: .92rem;',
    '  line-height: 1.42;',
    '  white-space: pre-wrap;',
    '  word-break: break-word;',
    '  box-sizing: border-box;',
    '}',
    '.ccb-msg.ccb-user {',
    '  margin-left: auto;',
    '  background: #146086;',
    '  color: #eff8ff;',
    '  border-bottom-right-radius: 5px;',
    '}',
    '.ccb-msg.ccb-bot {',
    '  margin-right: auto;',
    '  background: #ecf4fb;',
    '  color: #2a3944;',
    '  border: 1px solid #d5e6f3;',
    '  border-bottom-left-radius: 5px;',
    '}',

    /* Composer row */
    '#ccb-composer {',
    '  display: grid;',
    '  grid-template-columns: 1fr auto;',
    '  gap: 8px;',
    '  padding: 12px;',
    '  border-top: 1px solid #d4e2ed;',
    '  background: #f8fcff;',
    '}',
    '#ccb-input {',
    '  border: 1px solid #c3d7e6;',
    '  border-radius: 10px;',
    '  padding: 10px 12px;',
    '  font-size: .93rem;',
    '  color: #1f252c;',
    '  outline: none;',
    '  font-family: inherit;',
    '  transition: border-color .2s ease, box-shadow .2s ease;',
    '  box-sizing: border-box;',
    '}',
    '#ccb-input:focus {',
    '  border-color: #1f6f97;',
    '  box-shadow: 0 0 0 3px rgba(31,111,151,.16);',
    '}',
    '#ccb-send {',
    '  border: 0;',
    '  border-radius: 10px;',
    '  min-width: 66px;',
    '  padding: 0 14px;',
    '  font-weight: 700;',
    '  font-family: inherit;',
    '  color: #eff9ff;',
    '  background: #1f6f97;',
    '  cursor: pointer;',
    '  transition: background-color .2s ease;',
    '}',
    '#ccb-send:hover { background: #185a7b; }',
    '#ccb-send:disabled { opacity: .7; cursor: wait; }',

    /* Mobile */
    '@media (max-width:640px) {',
    '  #ccb-widget { right: 10px; bottom: 10px; }',
    '  #ccb-panel { width: calc(100vw - 20px); height: min(74vh,560px); }',
    '}',
  ].join('\n');
  document.head.appendChild(style);

  /* ── Build DOM ──────────────────────────────────────────────────────────── */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'text') {
          node.textContent = attrs[k];
        } else {
          node.setAttribute(k, attrs[k]);
        }
      });
    }
    if (children) {
      children.forEach(function (c) { if (c) node.appendChild(c); });
    }
    return node;
  }

  var badge = el('span', { id: 'ccb-badge', 'aria-live': 'polite', 'aria-label': 'Unread messages', text: '0' });

  var launcher = el('button', { id: 'ccb-launcher', 'aria-label': 'Open chat', 'aria-expanded': 'false' }, [
    document.createTextNode(CONFIG.launcherLabel + ' '),
    badge,
  ]);

  var title    = el('h2', { id: 'ccb-title', text: CONFIG.title });
  var subtitle = el('p',  { id: 'ccb-subtitle', text: CONFIG.subtitle });
  var headerText = el('div', { id: 'ccb-header-text' }, [title, subtitle]);
  var collapseBtn = el('button', { id: 'ccb-collapse', 'aria-label': 'Minimize chat', text: '−' });
  var header = el('header', { id: 'ccb-header', role: 'banner' }, [headerText, collapseBtn]);

  var messages = el('div', { id: 'ccb-messages', 'aria-live': 'polite', role: 'log' });

  var input = el('input', { id: 'ccb-input', type: 'text', placeholder: CONFIG.inputPlaceholder, autocomplete: 'off', 'aria-label': 'Your message' });
  var sendBtn = el('button', { id: 'ccb-send', text: 'Send' });
  var composer = el('div', { id: 'ccb-composer' }, [input, sendBtn]);

  var panel = el('div', { id: 'ccb-panel', 'aria-hidden': 'true', role: 'dialog', 'aria-label': 'AI Chat' }, [header, messages, composer]);

  var widget = el('section', { id: 'ccb-widget' }, [launcher, panel]);

  document.body.appendChild(widget);

  /* ── State ──────────────────────────────────────────────────────────────── */
  var unreadCount = 0;

  /* ── Helpers ────────────────────────────────────────────────────────────── */
  function setUnread(n) {
    unreadCount = Math.max(0, n);
    badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
    if (unreadCount > 0) {
      badge.classList.add('ccb-visible');
    } else {
      badge.classList.remove('ccb-visible');
    }
  }

  function setOpen(isOpen) {
    if (isOpen) {
      widget.classList.add('ccb-open');
    } else {
      widget.classList.remove('ccb-open');
    }
    launcher.setAttribute('aria-expanded', String(isOpen));
    panel.setAttribute('aria-hidden', String(!isOpen));

    if (isOpen) {
      setUnread(0);
      input.focus();
    }
  }

  function appendMessage(role, text, opts) {
    opts = opts || {};
    var bubble = el('div', { class: 'ccb-msg ccb-' + role, text: text });
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;

    var trackUnread = opts.trackUnread !== false;
    var isOpen = widget.classList.contains('ccb-open');
    if (role === 'bot' && trackUnread && !isOpen) {
      setUnread(unreadCount + 1);
    }
  }

  /* ── Send message ───────────────────────────────────────────────────────── */
  function sendMessage() {
    var msg = input.value.trim();
    if (!msg) return;

    appendMessage('user', msg);
    input.value = '';
    sendBtn.disabled = true;

    fetch(CONFIG.backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg }),
    })
      .then(function (response) {
        return response.json()
          .catch(function () { return {}; })
          .then(function (data) { return { ok: response.ok, status: response.status, data: data }; });
      })
      .then(function (result) {
        if (!result.ok) {
          var errMsg = typeof result.data.error === 'string'
            ? result.data.error
            : 'The server returned an error.';
          appendMessage('bot', 'Error ' + result.status + ': ' + errMsg);
          return;
        }
        var reply = typeof result.data.reply === 'string' ? result.data.reply.trim() : '';
        appendMessage('bot', reply || 'The model returned an empty response.');
      })
      .catch(function () {
        appendMessage('bot', 'Request failed — is the backend running at:\n' + CONFIG.backendUrl);
      })
      .finally(function () {
        sendBtn.disabled = false;
        input.focus();
      });
  }

  /* ── Event listeners ────────────────────────────────────────────────────── */
  launcher.addEventListener('click', function () {
    setOpen(!widget.classList.contains('ccb-open'));
  });

  collapseBtn.addEventListener('click', function () {
    setOpen(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  /* ── Greeting ───────────────────────────────────────────────────────────── */
  appendMessage('bot', CONFIG.greeting, { trackUnread: false });
})();
