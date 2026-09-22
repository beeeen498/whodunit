// ========================
// Character constants
// Single source of truth for names, colors,
// and image paths across all sequences
// ========================

export const CHARACTERS = {
  narrator: {
    name: "narrator",
    color: undefined, // uses default text color
    portrait: undefined,
    fullBody: undefined,
  },
  messenger: {
    name: "messenger",
    color: "#8b9dad",
    portrait: "/assets/images/characters/messenger.png",
    fullBody: undefined,
  },
  walter: {
    name: "Walter",
    color: "#c4a882",
    portrait: "/assets/images/characters/owner-portrait.png",
    fullBody: "/assets/images/characters/owner-full-body.png",
  },
  agnes: {
    name: "Agnes",
    color: "#8b9dad",
    portrait: "/assets/images/characters/wife-portrait.png",
    fullBody: "/assets/images/characters/wife-full-body.png",
  },
  tom: {
    name: "Tom",
    color: "#a0b0a0",
    portrait: "/assets/images/characters/tom-portrait.png",
    fullBody: "/assets/images/characters/tom-full-body.png",
  },
  harold: {
    name: "Harold",
    color: "#a08070",
    portrait: "/assets/images/characters/harold-portrait.png",
    fullBody: "/assets/images/characters/harold-full-body.png",
  },
  clara: {
    name: "Clara",
    color: "#d4a0b0",
    portrait: "/assets/images/characters/clara-portrait.png",
    fullBody: "/assets/images/characters/clara-full-body.png",
  },
} as const;
