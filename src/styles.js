export const WIDGET_STYLES = `
  :host {
    --chat-width: 100%;
    --chat-height: 440px;
    --chat-font: system-ui, -apple-system, sans-serif;
    --chat-bg: #ffffff;
    --chat-border: #cccccc;
    --chat-radius: 10px;
    --chat-header-bg: #222222;
    --chat-header-text: #ffffff;
    --chat-badge-bg: #28a745;
    --chat-primary: #007bff;
    --chat-my-msg-bg: var(--chat-primary);
    --chat-my-msg-text: #ffffff;
    --chat-other-msg-bg: #f1f1f1;
    --chat-other-msg-text: #111111;
    --chat-input-bg: #ffffff;
    --chat-input-text: #111111;
    --chat-drawer-bg: #f9f9f9;

    display: block;
    width: var(--chat-width);
    height: var(--chat-height);
    font-family: var(--chat-font);
    box-sizing: border-box;
  }
    // Styles for floating chat widget
  :host([floating]) {
    --chat-width: 320px;
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
  }
  #box {
    width: 100%;
    height: 100%;
    border: 1px solid var(--chat-border);
    background: var(--chat-bg);
    display: flex;
    flex-direction: column;
    border-radius: var(--chat-radius);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
  }
  #header {
    padding: 10px;
    background: var(--chat-header-bg);
    color: var(--chat-header-text);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    gap: 6px;
  }
  #online-count {
    background: var(--chat-badge-bg);
    color: #fff;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 11px;
    white-space: nowrap;
  }
  #name-input {
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.4);
    color: var(--chat-header-text);
    width: 95px;
    font-size: 12px;
  }
  #messages {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .msg {
    padding: 8px 10px;
    border-radius: 10px;
    max-width: 80%;
    font-size: 14px;
    word-break: break-word;
  }
  .author {
    display: block;
    font-size: 10px;
    opacity: 0.7;
    margin-bottom: 4px;
  }
  .media {
    display: block;
    border-radius: 6px;
    max-width: 100%;
    height: auto;
  }
  .media.sticker { max-width: 110px; }
  .media.gif { max-width: 190px; }
  .media + .text { margin-top: 6px; }
  .me {
    background: var(--chat-my-msg-bg);
    color: var(--chat-my-msg-text);
    align-self: flex-end;
  }
  .other {
    background: var(--chat-other-msg-bg);
    color: var(--chat-other-msg-text);
    align-self: flex-start;
  }
  #picker-drawer {
    display: none;
    flex-direction: column;
    height: 195px;
    background: var(--chat-drawer-bg);
    border-top: 1px solid var(--chat-border);
  }
  #picker-drawer.open { display: flex; }
  #picker-tabs {
    display: flex;
    border-bottom: 1px solid var(--chat-border);
    background: var(--chat-bg);
  }
  .tab-btn {
    flex: 1;
    padding: 6px;
    border: none;
    background: transparent;
    color: var(--chat-input-text);
    font-size: 12px;
    cursor: pointer;
    opacity: 0.65;
    border-bottom: 2px solid transparent;
  }
  .tab-btn.active {
    opacity: 1;
    font-weight: 600;
    border-bottom-color: var(--chat-primary);
  }
  #gif-search-wrap {
    display: none;
    padding: 6px;
    border-bottom: 1px solid var(--chat-border);
  }
  #gif-search {
    width: 100%;
    box-sizing: border-box;
    padding: 5px 8px;
    border: 1px solid var(--chat-border);
    border-radius: 6px;
    font-size: 12px;
    background: var(--chat-input-bg);
    color: var(--chat-input-text);
    outline: none;
  }
  #picker-body {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }
  .emoji-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
  }
  .emoji-item {
    background: transparent;
    border: none;
    font-size: 20px;
    padding: 4px;
    cursor: pointer;
    border-radius: 6px;
  }
  .emoji-item:hover { background: rgba(0, 0, 0, 0.08); }
  .media-grid { display: grid; gap: 6px; }
  .media-grid.stickers { grid-template-columns: repeat(4, 1fr); }
  .media-grid.gifs { grid-template-columns: repeat(2, 1fr); }
  .media-item {
    background: transparent;
    border: none;
    padding: 2px;
    cursor: pointer;
    border-radius: 6px;
    overflow: hidden;
  }
  .media-item:hover { background: rgba(0, 0, 0, 0.08); }
  .media-item img {
    width: 100%;
    height: 64px;
    object-fit: contain;
    display: block;
  }
  .media-grid.gifs .media-item img {
    object-fit: cover;
    border-radius: 4px;
  }
  .empty-msg {
    font-size: 12px;
    opacity: 0.7;
    text-align: center;
    padding: 20px 10px;
    color: var(--chat-input-text);
  }
  form {
    display: flex;
    align-items: center;
    border-top: 1px solid var(--chat-border);
    background: var(--chat-input-bg);
  }
  #picker-toggle {
    background: transparent;
    border: none;
    font-size: 18px;
    padding: 0 8px;
    cursor: pointer;
    opacity: 0.75;
  }
  #picker-toggle.active, #picker-toggle:hover { opacity: 1; }
  #msg-input {
    flex: 1;
    border: none;
    padding: 10px 6px;
    outline: none;
    background: transparent;
    color: var(--chat-input-text);
  }
  #send-btn {
    background: var(--chat-primary);
    color: #ffffff;
    border: none;
    padding: 0 14px;
    height: 100%;
    cursor: pointer;
    font-weight: 600;
  }
`;
