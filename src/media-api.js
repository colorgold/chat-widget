export const DEFAULT_EMOJIS = [
  "😀",
  "😂",
  "🥹",
  "😍",
  "🥰",
  "😎",
  "🤩",
  "🥳",
  "🤔",
  "🫡",
  "😭",
  "😱",
  "🤯",
  "😡",
  "👍",
  "👎",
  "👏",
  "🙌",
  "🔥",
  "❤️",
  "💯",
  "✨",
  "🎉",
  "🚀",
  "👀",
  "💀",
  "🤝",
  "🙏",
  "☕",
  "🎶",
];

const NOTO_BASE = "https://fonts.gstatic.com/s/e/notoemoji/latest";

export const DEFAULT_STICKERS = [
  `${NOTO_BASE}/1f525/512.gif`,
  `${NOTO_BASE}/1f602/512.gif`,
  `${NOTO_BASE}/2764_fe0f/512.gif`,
  `${NOTO_BASE}/1f44d/512.gif`,
  `${NOTO_BASE}/1f389/512.gif`,
  `${NOTO_BASE}/1f680/512.gif`,
  `${NOTO_BASE}/1f60e/512.gif`,
  `${NOTO_BASE}/1f62d/512.gif`,
];

export async function searchGifs({ giphyKey, tenorKey, searchTerm = "" }) {
  if (giphyKey) {
    const base = "https://api.giphy.com/v1/gifs";
    const key = encodeURIComponent(giphyKey);
    const q = encodeURIComponent(searchTerm);
    const endpoint = searchTerm
      ? `${base}/search?api_key=${key}&q=${q}&limit=16&rating=pg-13`
      : `${base}/trending?api_key=${key}&limit=16&rating=pg-13`;

    const res = await fetch(endpoint);
    const data = await res.json();
    return (data.data || [])
      .map((g) => g.images?.fixed_height_small?.url)
      .filter(Boolean);
  }

  if (tenorKey) {
    const base = "https://tenor.googleapis.com/v2";
    const key = encodeURIComponent(tenorKey);
    const q = encodeURIComponent(searchTerm);
    const endpoint = searchTerm
      ? `${base}/search?key=${key}&q=${q}&limit=16&media_filter=tinygif`
      : `${base}/featured?key=${key}&limit=16&media_filter=tinygif`;

    const res = await fetch(endpoint);
    const data = await res.json();
    return (data.results || [])
      .map((g) => g.media_formats?.tinygif?.url)
      .filter(Boolean);
  }

  return [];
}
