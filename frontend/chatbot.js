import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatbotWidget from './components/ChatbotWidget.jsx';
import './chatbot.css';

const EMBED_ROOT_ID = 'custom-chatbot-embed-root';
const EMBED_MOUNT_ID = 'custom-chatbot-shadow-mount';
const EMBED_STYLE_ATTR = 'data-custom-chatbot-style';

function ensureMountNode(target) {
  let hostNode;

  if (target instanceof HTMLElement) {
    hostNode = target;
  } else {
    hostNode = document.getElementById(EMBED_ROOT_ID);
    if (!hostNode) {
      hostNode = document.createElement('div');
      hostNode.id = EMBED_ROOT_ID;
      document.body.appendChild(hostNode);
    }
  }

  const shadowRoot = hostNode.shadowRoot || hostNode.attachShadow({ mode: 'open' });
  ensureShadowStyles(shadowRoot);

  let mountNode = shadowRoot.getElementById(EMBED_MOUNT_ID);
  if (!mountNode) {
    mountNode = document.createElement('div');
    mountNode.id = EMBED_MOUNT_ID;
    mountNode.className = 'custom-chatbot-root';
    shadowRoot.appendChild(mountNode);
  } else {
    mountNode.classList.add('custom-chatbot-root');
  }

  return mountNode;
}

function getInjectedEmbedStyles() {
  const styleNodes = Array.from(document.querySelectorAll('style'));
  return styleNodes.filter((node) => {
    const content = node.textContent || '';
    return content.includes('tailwindcss v4.3.1') && content.includes('.custom-chatbot-root');
  });
}

function ensureShadowStyles(shadowRoot) {
  if (!(shadowRoot instanceof ShadowRoot)) {
    return;
  }

  const alreadyInjected = shadowRoot.querySelector(`style[${EMBED_STYLE_ATTR}]`);
  if (alreadyInjected) {
    return;
  }

  const sourceStyles = getInjectedEmbedStyles();
  sourceStyles.forEach((styleNode) => {
    const shadowStyle = document.createElement('style');
    shadowStyle.setAttribute(EMBED_STYLE_ATTR, 'true');
    shadowStyle.textContent = styleNode.textContent || '';
    shadowRoot.appendChild(shadowStyle);
    styleNode.remove();
  });
}

function readScriptConfig() {
  if (typeof document === 'undefined') {
    return {};
  }

  const script = document.currentScript;
  if (!(script instanceof HTMLScriptElement)) {
    return {};
  }

  const {
    launcherLabel,
    title,
    subtitle,
    greeting,
    inputPlaceholder,
    target,
    autoMount
  } = script.dataset;

  const config = {};
  if (launcherLabel) config.launcherLabel = launcherLabel;
  if (title) config.title = title;
  if (subtitle) config.subtitle = subtitle;
  if (greeting) config.greeting = greeting;
  if (inputPlaceholder) config.inputPlaceholder = inputPlaceholder;

  return {
    target,
    autoMount,
    config
  };
}

function resolveTarget(targetLike) {
  if (!targetLike || typeof document === 'undefined') {
    return undefined;
  }

  if (targetLike instanceof HTMLElement) {
    return targetLike;
  }

  if (typeof targetLike === 'string') {
    if (targetLike.startsWith('#')) {
      return document.getElementById(targetLike.slice(1)) || undefined;
    }

    return document.querySelector(targetLike) || undefined;
  }

  return undefined;
}

function whenDomReady(callback) {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
    return;
  }

  callback();
}

export function mountCustomChatbot({ target, config } = {}) {
  const mountNode = ensureMountNode(target);
  const root = mountNode.__customChatbotRoot || createRoot(mountNode);
  mountNode.__customChatbotRoot = root;
  root.render(React.createElement(ChatbotWidget, { config }));
  return root;
}

if (typeof window !== 'undefined') {
  const scriptConfig = readScriptConfig();
  const autoMount = scriptConfig.autoMount !== 'false' && window.CustomChatbotAutoMount !== false;
  const embedConfig = {
    ...(scriptConfig.config || {}),
    ...(window.CustomChatbotConfig || {})
  };
  const target = resolveTarget(window.CustomChatbotTarget || scriptConfig.target);

  if (autoMount) {
    whenDomReady(() => {
      mountCustomChatbot({ target, config: embedConfig });
    });
  }

  window.mountCustomChatbot = mountCustomChatbot;
}
