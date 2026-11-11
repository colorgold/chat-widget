import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  onDisconnect,
  query,
  limitToLast,
  serverTimestamp,
  update,
} from "firebase/database";

export class ChatFirebaseService {
  constructor(firebaseConfig, roomId) {
    this.roomId = roomId;
    const appName = `rtdb-chat-${roomId}`;
    const app = initializeApp(firebaseConfig, appName);
    this.auth = getAuth(app);
    this.db = getDatabase(app);
    this.userId = null;
  }

  async connect() {
    const userCred = await signInAnonymously(this.auth);
    this.userId = userCred.user.uid;
    return this.userId;
  }

  watchPresence(onCountChange) {
    const userRef = ref(
      this.db,
      `rooms/${this.roomId}/presence/${this.userId}`,
    );
    const roomRef = ref(this.db, `rooms/${this.roomId}/presence`);
    const connectedRef = ref(this.db, ".info/connected");

    onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        onDisconnect(userRef).remove();
        set(userRef, true);
      }
    });

    onValue(roomRef, (snap) => {
      onCountChange(snap.size || 1);
    });
  }

  watchMessages(onMessages) {
    const messagesRef = query(
      ref(this.db, `rooms/${this.roomId}/messages`),
      limitToLast(50),
    );

    onValue(messagesRef, (snapshot) => {
      const messages = [];
      snapshot.forEach((child) => {
        messages.push(child.val());
      });
      onMessages(messages);
    });
  }

  async sendMessage({ username, text = "", type = "text", mediaUrl = null }) {
    const cleanText = text.trim();
    if (type === "text" && !cleanText) return;
    if ((type === "sticker" || type === "gif") && !mediaUrl) return;

    const roomRef = ref(this.db, `rooms/${this.roomId}`);
    const newMsgKey = push(ref(this.db, `rooms/${this.roomId}/messages`)).key;

    const payload = {
      uid: this.userId,
      username,
      type,
      createdAt: serverTimestamp(),
    };

    if (cleanText) payload.text = cleanText;
    if (mediaUrl) payload.mediaUrl = mediaUrl;

    const updates = {};
    updates[`lastSent/${this.userId}`] = serverTimestamp();
    updates[`messages/${newMsgKey}`] = payload;

    await update(roomRef, updates);
  }
}
