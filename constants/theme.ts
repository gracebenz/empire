// ─── PALETTE ─────────────────────────────────────────────────────────────────
// Swap these values to change the entire theme.

const palette = {
  powderBlue:     "#9fbbcc",
  wisteriaBlue:   "#7a9cc6",
  lightGold:      "#e3d985",
  darkTeal:       "#0b3c49",
  midnightViolet: "#422040",
  offWhite:       "#f5f0e8",
};

// ─── ROLES ───────────────────────────────────────────────────────────────────
// These map palette colors to their purpose in the UI.
// Change roles here if you want to reassign which palette color does what.

export const colors = {
  background:   palette.powderBlue,      // main screen background
  scrollBg:     palette.lightGold,       // cards, scrolls, input backgrounds
  scrollBorder: palette.wisteriaBlue,    // borders and dividers
  ink:          palette.darkTeal,        // primary text
  inkLight:     palette.wisteriaBlue,    // secondary / hint text
  accent:       palette.midnightViolet,  // primary buttons (CTAs)
  accentSoft:   palette.wisteriaBlue,    // secondary buttons
  cream:        palette.offWhite,        // text on dark backgrounds

  // Raw palette exposed for one-off use
  ...palette,
};
