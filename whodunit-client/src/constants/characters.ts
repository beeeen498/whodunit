export const CHARACTERS = {
  narrator: {
    name: "narrator",
    color: undefined, // uses default text color
    portrait: undefined,
    fullBody: undefined,
  },
  detective: {
    name: "Detective",
    color: "#f95151ff", // cool pale blue — distinct from narrator's default and Walter's gold
    portrait: undefined,
    fullBody: undefined,
  },
  messenger: {
    name: "messenger",
    color: "#8b9dad", // steel blue-grey
    portrait: "/assets/images/characters/messenger.png",
    fullBody: undefined,
  },
  walter: {
    name: "Walter",
    color: "#b8863d", // deeper amber/brown-gold, pulled further from tan
    portrait: "/assets/images/characters/owner-portrait.png",
    fullBody: "/assets/images/characters/owner-full-body.png",
  },
  agnes: {
    name: "Agnes",
    color: "#7fb0c4", // pale slate blue — cold, calculated
    portrait: "/assets/images/characters/wife-portrait.png",
    fullBody: "/assets/images/characters/wife-full-body.png",
  },
  tom: {
    name: "Tom",
    color: "#9bbf7e", // muted olive green
    portrait: "/assets/images/characters/bartender-portrait.png",
    fullBody: "/assets/images/characters/bartender-full-body.png",
  },
  harold: {
    name: "Harold",
    color: "#b5734f", // rust/brown — butcher, earthy
    portrait: "/assets/images/characters/harold-portrait.png",
    fullBody: "/assets/images/characters/harold-full-body.png",
  },
  clara: {
    name: "Clara",
    color: "#d98bb0", // rose pink — matches her role as the singer
    portrait: "/assets/images/characters/clara-portrait.png",
    fullBody: "/assets/images/characters/clara-full-body.png",
  },
} as const;
