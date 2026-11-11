import { WIDGET_STYLES } from "./styles.js";
import { DEFAULT_EMOJIS, DEFAULT_STICKERS, searchGifs } from "./media-api.js";
import { ChatFirebaseService } from "./firebase-service.js";

class PublicChatWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.username =
      localStorage.getItem("chat_username") ||
      `Guest_${Math.floor(1000 + Math.random() * 9000)}`;
    this.activeTab = "emoji";
    this.drawerOpen = false;
    this.gifSearchTimer = null;
  }

  async connectedCallback() {
    const rawConfig = this.getAttribute("firebase-config");
    if (!rawConfig) {
      console.error("PublicChatWidget: Missing firebase-config attribute.");
      return;
    }

    const firebaseConfig = JSON.parse(rawConfig);
    this.roomId = this.getAttribute("room-id") || "general";
    this.giphyKey = this.getAttribute("giphy-api-key") || "";
    this.tenorKey = this.getAttribute("tenor-api-key") || "";

    const customStickers = this.getAttribute("stickers");
    this.stickers = customStickers
      ? JSON.parse(customStickers)
      : DEFAULT_STICKERS;

    this.service = new ChatFirebaseService(firebaseConfig, this.roomId);

    this.render();
    await this.service.connect();

    this.service.watchPresence((count) => {
      const badge = this.shadowRoot.querySelector("#online-count");
      if (badge) badge.textContent = `${count} online`;
    });

    this.service.watchMessages((messages) => this.renderMessages(messages));
  }

  renderMessages(messages) {
    const list = this.shadowRoot.querySelector("#messages");
    list.innerHTML = "";

    messages.forEach((msg) => {
      const isMe = msg.uid === this.service.userId;
      const item = document.createElement("div");
      item.className = isMe ? "msg me" : "msg other";

      const author = document.createElement("span");
      author.className = "author";
      author.textContent = msg.username;
      item.appendChild(author);

      const type = msg.type || "text";
      if (
        (type === "sticker" || type === "gif") &&
        typeof msg.mediaUrl === "string" &&
        msg.mediaUrl.startsWith("https://")
      ) {
        const img = document.createElement("img");
        img.src = msg.mediaUrl;
        img.alt = type;
        img.className = type === "sticker" ? "media sticker" : "media gif";
        img.loading = "lazy";
        item.appendChild(img);
      }

      if (msg.text) {
        const textDiv = document.createElement("div");
        textDiv.className = "text";
        textDiv.textContent = msg.text;
        item.appendChild(textDiv);
      }

      list.appendChild(item);
    });

    list.scrollTop = list.scrollHeight;
  }

  toggleDrawer(forceState) {
    this.drawerOpen =
      typeof forceState === "boolean" ? forceState : !this.drawerOpen;
    this.shadowRoot
      .querySelector("#picker-drawer")
      .classList.toggle("open", this.drawerOpen);
    this.shadowRoot
      .querySelector("#picker-toggle")
      .classList.toggle("active", this.drawerOpen);

    if (this.drawerOpen) this.renderTabContent();
  }

  switchTab(tab) {
    this.activeTab = tab;
    this.shadowRoot.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tab);
    });
    this.renderTabContent();
  }

  renderTabContent() {
    const body = this.shadowRoot.querySelector("#picker-body");
    const gifSearchWrap = this.shadowRoot.querySelector("#gif-search-wrap");
    const hasGifKey = Boolean(this.giphyKey || this.tenorKey);

    body.innerHTML = "";
    gifSearchWrap.style.display =
      this.activeTab === "gif" && hasGifKey ? "block" : "none";

    if (this.activeTab === "emoji") {
      const grid = document.createElement("div");
      grid.className = "emoji-grid";
      DEFAULT_EMOJIS.forEach((emoji) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "emoji-item";
        btn.textContent = emoji;
        btn.addEventListener("click", () => this.insertEmoji(emoji));
        grid.appendChild(btn);
      });
      body.appendChild(grid);
    } else if (this.activeTab === "sticker") {
      const grid = document.createElement("div");
      grid.className = "media-grid stickers";
      this.stickers.forEach((url) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "media-item";
        const img = document.createElement("img");
        img.src = url;
        img.loading = "lazy";
        btn.appendChild(img);
        btn.addEventListener("click", () => this.sendMedia("sticker", url));
        grid.appendChild(btn);
      });
      body.appendChild(grid);
    } else if (this.activeTab === "gif") {
      if (!hasGifKey) {
        body.innerHTML = `<div class="empty-msg">Add a <code>giphy-api-key</code> attribute to enable GIF search.</div>`;
        return;
      }
      const queryInput = this.shadowRoot.querySelector("#gif-search");
      this.loadGifs(queryInput.value.trim());
    }
  }

  insertEmoji(emoji) {
    const input = this.shadowRoot.querySelector("#msg-input");
    const start = input.selectionStart || input.value.length;
    const end = input.selectionEnd || input.value.length;
    input.value = input.value.slice(0, start) + emoji + input.value.slice(end);
    input.focus();
    input.setSelectionRange(start + emoji.length, start + emoji.length);
  }

  async sendMedia(type, mediaUrl) {
    const msgInput = this.shadowRoot.querySelector("#msg-input");
    const caption = msgInput.value;
    msgInput.value = "";
    this.toggleDrawer(false);

    try {
      await this.service.sendMessage({
        username: this.username,
        text: caption,
        type,
        mediaUrl,
      });
    } catch (err) {
      alert("Please wait a moment before sending another message.");
    }
  }

  async loadGifs(searchTerm = "") {
    const body = this.shadowRoot.querySelector("#picker-body");
    body.innerHTML = `<div class="empty-msg">Loading GIFs...</div>`;

    try {
      const urls = await searchGifs({
        giphyKey: this.giphyKey,
        tenorKey: this.tenorKey,
        searchTerm,
      });

      body.innerHTML = "";
      if (!urls.length) {
        body.innerHTML = `<div class="empty-msg">No GIFs found.</div>`;
        return;
      }

      const grid = document.createElement("div");
      grid.className = "media-grid gifs";
      urls.forEach((url) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "media-item";
        const img = document.createElement("img");
        img.src = url;
        img.loading = "lazy";
        btn.appendChild(img);
        btn.addEventListener("click", () => this.sendMedia("gif", url));
        grid.appendChild(btn);
      });
      body.appendChild(grid);
    } catch (e) {
      body.innerHTML = `<div class="empty-msg">Could not load GIFs.</div>`;
    }
  }

  escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${WIDGET_STYLES}</style>
      <div id="box">
        <div id="header">
          <span><strong>${this.escapeHTML(this.roomId)}</strong></span>
          <span id="online-count">1 online</span>
          <input id="name-input" value="${this.escapeHTML(this.username)}" title="Click to edit name" />
        </div>
        <div id="messages"></div>

        <div id="picker-drawer">
          <div id="picker-tabs">
            <button type="button" class="tab-btn active" data-tab="emoji">Emojis</button>
            <button type="button" class="tab-btn" data-tab="sticker">Stickers</button>
            <button type="button" class="tab-btn" data-tab="gif">GIFs</button>
          </div>
          <div id="gif-search-wrap">
            <input id="gif-search" type="search" placeholder="Search GIFs..." />
          </div>
          <div id="picker-body"></div>
        </div>

        <form id="chat-form">
          <button type="button" id="picker-toggle" title="Emojis, Stickers & GIFs">😊</button>
          <input id="msg-input" type="text" placeholder="Say something..." maxlength="500" />
          <button id="send-btn" type="submit">Send</button>
        </form>
      </div>
    `;

    const nameInput = this.shadowRoot.querySelector("#name-input");
    nameInput.addEventListener("change", (e) => {
      this.username = e.target.value.trim() || this.username;
      localStorage.setItem("chat_username", this.username);
    });

    this.shadowRoot
      .querySelector("#picker-toggle")
      .addEventListener("click", () => this.toggleDrawer());

    this.shadowRoot.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.switchTab(btn.dataset.tab));
    });

    const gifSearch = this.shadowRoot.querySelector("#gif-search");
    const triggerGifSearch = () => {
      if (!this.giphyKey && !this.tenorKey) return;
      clearTimeout(this.gifSearchTimer);
      this.gifSearchTimer = setTimeout(() => {
        this.loadGifs(gifSearch.value.trim());
      }, 350);
    };

    gifSearch.addEventListener("input", triggerGifSearch);
    gifSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        clearTimeout(this.gifSearchTimer);
        this.loadGifs(gifSearch.value.trim());
      }
    });

    const form = this.shadowRoot.querySelector("#chat-form");
    const msgInput = this.shadowRoot.querySelector("#msg-input");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = msgInput.value;
      if (!text.trim()) return;
      msgInput.value = "";
      this.toggleDrawer(false);
      try {
        await this.service.sendMessage({
          username: this.username,
          text,
          type: "text",
        });
      } catch (err) {
        alert("Please wait a moment before sending another message.");
      }
    });
  }
}

customElements.define("public-chat-widget", PublicChatWidget);
