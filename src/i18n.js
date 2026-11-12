export const BUILTIN_LOCALES = {
  en: {
    online: "{count} online",
    editNameTitle: "Click to edit name",
    emojisTab: "Emojis",
    stickersTab: "Stickers",
    gifsTab: "GIFs",
    searchGifsPlaceholder: "Search GIFs...",
    loadingGifs: "Loading GIFs...",
    noGifsFound: "No GIFs found.",
    gifError: "Could not load GIFs.",
    missingGifKey: "Add a giphy-api-key attribute to enable GIF search.",
    inputPlaceholder: "Say something...",
    sendButton: "Send",
    rateLimitAlert: "Please wait a moment before sending another message.",
    pickerTitle: "Emojis, Stickers & GIFs",
  },
  es: {
    online: "{count} en línea",
    editNameTitle: "Haz clic para editar tu nombre",
    emojisTab: "Emojis",
    stickersTab: "Stickers",
    gifsTab: "GIFs",
    searchGifsPlaceholder: "Buscar GIFs...",
    loadingGifs: "Cargando GIFs...",
    noGifsFound: "No se encontraron GIFs.",
    gifError: "No se pudieron cargar los GIFs.",
    missingGifKey: "Agrega un atributo giphy-api-key para buscar GIFs.",
    inputPlaceholder: "Escribe un mensaje...",
    sendButton: "Enviar",
    rateLimitAlert: "Espera un momento antes de enviar otro mensaje.",
    pickerTitle: "Emojis, Stickers y GIFs",
  },
};

export function resolveTranslations(lang = "en", customJson = null) {
  const shortLang = (lang || "en").slice(0, 2).toLowerCase();
  const base = BUILTIN_LOCALES[shortLang] || BUILTIN_LOCALES.en;

  if (!customJson) return { ...BUILTIN_LOCALES.en, ...base };

  try {
    const custom = JSON.parse(customJson);
    return { ...BUILTIN_LOCALES.en, ...base, ...custom };
  } catch {
    console.warn("PublicChatWidget: Invalid JSON in 'i18n' attribute.");
    return { ...BUILTIN_LOCALES.en, ...base };
  }
}
