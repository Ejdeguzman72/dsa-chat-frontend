export class ChatPage {
    websocketUrl = "ws://localhost:8080/chat";
    tokenKey = "dsa_chat_access_token";
    messages = document.querySelector("#messages");
    form = document.querySelector("#message-form");
    input = document.querySelector("#message-input");
    sendButton = document.querySelector("#send-button");
    connectionStatus = document.querySelector("#connection-status");
    hint = document.querySelector("#hint");
    reconnectButton = document.querySelector("#reconnect");
    socket = null;
    constructor() {
        this.initializeEvents();
        this.connect();
    }
    initializeEvents() {
        this.form?.addEventListener("submit", event => {
            event.preventDefault();
            this.sendMessage();
        });
        this.reconnectButton?.addEventListener("click", () => {
            this.connect();
        });
        window.addEventListener("beforeunload", () => {
            this.socket?.close();
        });
    }
    getToken() {
        return sessionStorage.getItem(this.tokenKey) ??
            localStorage.getItem(this.tokenKey);
    }
    setStatus(label, online = false) {
        if (this.connectionStatus) {
            this.connectionStatus.textContent = label;
            this.connectionStatus.classList.toggle("online", online);
        }
        if (this.input) {
            this.input.disabled = !online;
        }
        if (this.sendButton) {
            this.sendButton.disabled = !online;
        }
    }
    setHint(message) {
        if (this.hint) {
            this.hint.textContent = message;
        }
    }
    connect() {
        const token = this.getToken();
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        if (!token) {
            this.setStatus("Unauthorized");
            this.setHint("Please sign in again.");
            return;
        }
        this.setStatus("Connecting");
        this.setHint("Connecting to the chat server…");
        const url = new URL(this.websocketUrl);
        // Local development only: use a short-lived
        // WebSocket ticket instead for production.
        url.searchParams.set("token", token);
        let ws;
        try {
            ws = new WebSocket(url.toString());
        }
        catch (error) {
            console.error("WebSocket initialization failed:", error);
            this.setStatus("Disconnected");
            this.setHint("Unable to initialize chat connection.");
            return;
        }
        this.socket = ws;
        ws.addEventListener("open", () => {
            if (this.socket !== ws)
                return;
            this.setStatus("Connected", true);
            this.setHint("Connected · Press Enter to send");
            this.input?.focus();
        });
        ws.addEventListener("message", event => {
            if (this.socket !== ws)
                return;
            this.handleMessage(event);
        });
        ws.addEventListener("close", event => {
            if (this.socket !== ws)
                return;
            this.setStatus("Disconnected");
            this.setHint(event.code === 1008
                ? "Chat access denied. Please sign in again."
                : "Connection closed. Select Reconnect to try again.");
        });
        ws.addEventListener("error", () => {
            if (this.socket !== ws)
                return;
            this.setHint("Unable to connect. Check your backend or authentication.");
        });
    }
    handleMessage(event) {
        const raw = String(event.data);
        // Backend format: [username]: message
        const match = raw.match(/^\[(.+?)\]:\s*([\s\S]*)$/);
        if (match) {
            this.addMessage(match[1], match[2]);
        }
        else {
            // Join/leave notifications.
            this.addMessage("System", raw);
        }
    }
    sendMessage() {
        if (!this.input || !this.socket)
            return;
        const content = this.input.value.trim();
        if (!content ||
            this.socket.readyState !== WebSocket.OPEN) {
            return;
        }
        try {
            // Your Java handler expects plain text.
            this.socket.send(content);
            this.input.value = "";
            // The server broadcasts the message back,
            // so don't render it here to avoid duplicates.
        }
        catch (error) {
            console.error("Failed to send message:", error);
            this.setHint("Unable to send message. Please try again.");
        }
    }
    addMessage(author, content, timestamp, mine = false) {
        if (!this.messages)
            return;
        document.querySelector("#empty")?.remove();
        const row = document.createElement("article");
        row.className = mine
            ? "message mine"
            : "message";
        const avatar = document.createElement("div");
        avatar.className = "avatar";
        avatar.textContent =
            (author || "?").slice(0, 2).toUpperCase();
        const body = document.createElement("div");
        body.className = "message-body";
        const meta = document.createElement("div");
        meta.className = "meta";
        const name = document.createElement("strong");
        name.textContent = author || "Member";
        const time = document.createElement("time");
        const date = timestamp
            ? new Date(timestamp)
            : new Date();
        if (!Number.isNaN(date.getTime())) {
            time.dateTime = date.toISOString();
            time.textContent =
                date.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit"
                });
        }
        meta.append(name, time);
        const paragraph = document.createElement("p");
        paragraph.textContent = content;
        body.append(meta, paragraph);
        row.append(avatar, body);
        this.messages.append(row);
        this.messages.scrollTop =
            this.messages.scrollHeight;
    }
}
document.addEventListener("DOMContentLoaded", () => {
    new ChatPage();
});
