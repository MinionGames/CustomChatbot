# CustomChatbot

Embeddable AI chatbot widget with a React/Vite frontend and an Express backend.

## Standalone Embed Script

Build the frontend artifacts:

```bash
npm run frontend:build
```

The standalone bundle is generated at `frontend/dist/chatbot.js`.

Embed it on any website with a single script tag:

```html
<script src="https://YOUR-DEPLOYMENT/chatbot.js"></script>
```

The widget backend is hardcoded to:

```text
https://api.legatusaisolutions.com/chat
```

Optional script attributes:

- `data-launcher-label`: launcher button label
- `data-title`: widget title
- `data-subtitle`: widget subtitle
- `data-greeting`: first bot message
- `data-input-placeholder`: input placeholder text
- `data-target`: CSS selector or `#id` where the widget should mount
- `data-auto-mount="false"`: prevent auto mounting

Example with options:

```html
<script
	src="https://YOUR-DEPLOYMENT/chatbot.js"
	data-title="Support Assistant"
	data-subtitle="We reply in minutes"
	data-target="#chatbot-slot"
></script>
```

You can also configure via global variables before loading the script:

```html
<script>
	window.CustomChatbotConfig = {
		title: 'Support Assistant'
	};
	window.CustomChatbotTarget = '#chatbot-slot';
</script>
<script src="https://YOUR-DEPLOYMENT/chatbot.js"></script>
```

If `auto-mount` is disabled, mount manually:

```html
<script>
	window.mountCustomChatbot({
		target: '#chatbot-slot',
		config: { title: 'Support Assistant' }
	});
</script>
```
