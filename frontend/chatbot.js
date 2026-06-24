import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatbotWidget from './components/ChatbotWidget.jsx';
import './style.css';

const EMBED_ROOT_ID = 'custom-chatbot-embed-root';

function ensureMountNode(target) {
  if (target instanceof HTMLElement) {
    return target;
  }

  const existingNode = document.getElementById(EMBED_ROOT_ID);
  if (existingNode) {
    return existingNode;
  }

  const mountNode = document.createElement('div');
  mountNode.id = EMBED_ROOT_ID;
  document.body.appendChild(mountNode);
  return mountNode;
}

export function mountCustomChatbot({ target, config } = {}) {
  const mountNode = ensureMountNode(target);
  const root = createRoot(mountNode);
  root.render(React.createElement(ChatbotWidget, { config }));
  return root;
}

if (typeof window !== 'undefined') {
  const autoMount = window.CustomChatbotAutoMount !== false;
  const embedConfig = window.CustomChatbotConfig || {};

  if (autoMount) {
    mountCustomChatbot({ config: embedConfig });
  }

  window.mountCustomChatbot = mountCustomChatbot;
}
