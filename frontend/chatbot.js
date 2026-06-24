import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatbotWidget from './components/ChatbotWidget.jsx';
import './chatbot.css';

const EMBED_ROOT_ID = 'custom-chatbot-embed-root';

function ensureMountNode(target) {
  if (target instanceof HTMLElement) {
    target.classList.add('custom-chatbot-root');
    return target;
  }

  const existingNode = document.getElementById(EMBED_ROOT_ID);
  if (existingNode) {
    existingNode.classList.add('custom-chatbot-root');
    return existingNode;
  }

  const mountNode = document.createElement('div');
  mountNode.id = EMBED_ROOT_ID;
  mountNode.className = 'custom-chatbot-root';
  document.body.appendChild(mountNode);
  return mountNode;
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
    backendUrl,
    launcherLabel,
    title,
    subtitle,
    greeting,
    inputPlaceholder,
    target,
    autoMount
  } = script.dataset;

  const config = {};
  if (backendUrl) config.backendUrl = backendUrl;
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
