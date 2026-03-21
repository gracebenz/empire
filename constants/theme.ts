// ─── PALETTE ─────────────────────────────────────────────────────────────────
// Swap these values to change the entire theme.

const palette = {
  powderBlue:      "#9fbbcc",
  wisteriaBlue:    "#7a9cc6",
  lightGold:       "#d6a912",
  darkTeal:        "#0b3c49",
  midnightViolet:  "#36151e",
  midnightViolet2: "#422040",
  offWhite:        "#f5f0e8",
};

// ─── ROLES ───────────────────────────────────────────────────────────────────

export const colors = {
  background:   palette.powderBlue,
  scrollBg:     palette.lightGold,
  scrollBorder: palette.wisteriaBlue,
  ink:          palette.darkTeal,
  inkLight:     palette.wisteriaBlue,
  accent:       palette.midnightViolet,
  accentSoft:   palette.midnightViolet2,
  cream:        palette.offWhite,
  ...palette,
};

// ─── FONTS ───────────────────────────────────────────────────────────────────

export const fonts = {
  heading:  "Cinzel_700Bold",
  button:   "Cinzel_400Regular",
  body:     "serif",
};
