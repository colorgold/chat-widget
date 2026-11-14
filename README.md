# Public Chat Widget (Firebase Realtime Database)

A lightweight, zero-dependency Web Component (`<public-chat-widget>`) for adding real-time public chat rooms to any website. Each site owner connects their own Firebase project, keeping data, billing, and moderation completely isolated.

## Features

- **Isolated Styles (Shadow DOM):** Never clashes with your website's existing CSS.
- **Bring Your Own Firebase:** Uses your own Firebase Realtime Database and Anonymous Authentication.
- **Live Presence Counter:** Displays real-time active users in the room (`onDisconnect`).
- **Emojis, Stickers & GIFs:** Built-in emoji picker, customizable sticker packs, and optional Giphy/Tenor GIF search with captions.
- **Inline or Floating Layout:** Fits naturally inside any `<div>` or floats in the bottom-right corner with the `floating` attribute.
- **Customizable Theme:** Easily styled with CSS custom variables.

---

## 1. Quick Start (Embed on Any Website)

Add the jsDelivr CDN script and the `<public-chat-widget>` tag to your HTML:

```html
<script src="https://jsdelivr.net" defer></script>

<public-chat-widget
  room-id="general"
  firebase-config='{
    "apiKey": "YOUR_API_KEY",
    "authDomain": "YOUR_://firebaseapp.com",
    "databaseURL": "https://YOUR_://firebaseio.com",
    "projectId": "YOUR_PROJECT"
  }'
>
</public-chat-widget>
```

---

## Live Language Switching

- lang: Built-in language code ("en" or "es").
- i18n: Either a path/URL to a custom .json translation file (e.g., i18n="./locales/fr.json") or an inline JSON string of key overrides

By default the widget has English and Spanish built in. Add the following code:

```js
window.addEventListener("app:lang-changed", (e) => {
  const widget = document.querySelector("public-chat-widget");
  console.log("Language changed to:", e.detail.language);
  if (widget) {
    console.log("Updating chat widget language to:", e.detail.language);
    widget.setAttribute("lang", e.detail.language);
  }
});
```

If you provide "i18n" attribute for your own custom translation file, add this:

```js
window.addEventListener("app:lang-changed", (e) => {
  const widget = document.querySelector("public-chat-widget");
  if (!widget) return;

  const newLang = e.detail.language;
  widget.setAttribute("lang", newLang);

  if (newLang === "es") {
    widget.setAttribute("i18n", "locales/es/chatWidget.json");
  } else {
    // Removing i18n lets the widget fall back to its built-in English strings
    widget.removeAttribute("i18n");
  }
});
```

## 2. Firebase Setup (Required)

1. Create a free project in the [Firebase Console](https://google.com).
2. Go to **Authentication → Sign-in method** and enable **Anonymous**.
3. Go to **Build → Realtime Database** and create a database.
4. Open the **Rules** tab and publish the following security rules (includes XSS URL validation and a 2-second per-user message rate limit):

```json
{
  "rules": {
    "rooms": {
      "\$roomId": {
        "presence": {
          ".read": "auth != null",
          "\$uid": {
            ".write": "auth != null && auth.uid === \$uid"
          }
        },
        "lastSent": {
          "\$uid": {
            ".write": "auth != null && auth.uid === \$uid",
            ".validate": "newData.val() === now && (!data.exists() || now - data.val() >= 2000)"
          }
        },
        "messages": {
          ".read": "auth != null",
          ".indexOn": ["createdAt"],
          "\$messageId": {
            ".write": "auth != null && !data.exists() && newData.exists()",
            ".validate": "newData.hasChildren(['uid', 'username', 'type', 'createdAt']) && newData.child('uid').val() === auth.uid && newData.child('username').isString() && newData.child('username').val().length > 0 && newData.child('username').val().length <= 30 && newData.child('createdAt').val() === now && (!root.child('rooms/' + roomId + '/lastSent/' + auth.uid).exists() || now - root.child('rooms/' + roomId + '/lastSent/' + auth.uid).val() >= 2000) && ((newData.child('type').val() === 'text' && newData.child('text').isString() && newData.child('text').val().length > 0 && newData.child('text').val().length <= 500 && !newData.hasChild('mediaUrl')) || ((newData.child('type').val() === 'sticker' || newData.child('type').val() === 'gif') && newData.child('mediaUrl').isString() && newData.child('mediaUrl').val().beginsWith('https://') && newData.child('mediaUrl').val().length <= 300 && (!newData.hasChild('text') || (newData.child('text').isString() && newData.child('text').val().length <= 500))))"
          }
        }
      }
    }
  }
}
```

---

## 3. HTML Attributes

| Attribute         | Required | Default       | Description                                                                                        |
| :---------------- | :------- | :------------ | :------------------------------------------------------------------------------------------------- |
| `firebase-config` | **Yes**  | —             | JSON string of your Firebase web app config (must include `databaseURL`).                          |
| `room-id`         | No       | `"general"`   | Unique identifier for the chat room.                                                               |
| `floating`        | No       | `false`       | Boolean attribute (`<public-chat-widget floating>`) to dock the widget in the bottom-right corner. |
| `giphy-api-key`   | No       | —             | Your Giphy API key to enable live GIF search.                                                      |
| `stickers`        | No       | Built-in pack | JSON array of custom HTTPS image URLs for the sticker tab.                                         |

---

## 4. Customizing Colors & Size (CSS Variables)

Override any of these variables in your site's stylesheet:

```css
public-chat-widget {
  --chat-width: 100%;
  --chat-height: 440px;
  --chat-font: system-ui, -apple-system, sans-serif;
  --chat-bg: #ffffff;
  --chat-border: #cccccc;
  --chat-radius: 10px;

  --chat-header-bg: #222222;
  --chat-header-text: #ffffff;
  --chat-badge-bg: #28a745;

  --chat-primary: #0070e7;
  --my-msg-border: #5eacff;
  --chat-my-msg-bg: #171717;
  --chat-my-msg-text: #ffffff;
  --chat-my-author-text: #5eacff;
  --chat-my-msg-border: 1px solid var(--my-msg-border);
  --chat-other-msg-bg: #f1f1f1;
  --chat-other-msg-text: #111111;
  --chat-other-author-text: #02a0b4;
  --other-msg-border: #02a0b4;
  --chat-other-msg-border: 1px solid var(--other-msg-border);

  --chat-input-bg: #ffffff;
  --chat-input-text: #111111;
  --picker-tab-text: #ffffff;
  --picker-tab-bg: #222222;
  --chat-drawer-bg: #f9f9f9;
}
```

---

## 5. Local Development

```bash
npm install
npm run build   # Compiles src/ into dist/public-chat-widget.js
```
