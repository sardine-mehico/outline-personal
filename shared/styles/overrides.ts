import type { Colors, DefaultTheme } from "styled-components";

/**
 * Fork-local theme overrides — currently: Apple SF fonts + GitHub Primer palette.
 *
 * Values live here (a file upstream never touches) and are merged into theme.ts
 * via four small spreads, so they survive `git rebase` onto new Outline releases.
 * See `theming.html` at the repo root for the full guide and the wire-in points.
 *
 * Colour values below are GitHub's Primer design tokens (light + dark). Fonts are
 * Apple SF Pro (UI) and SF Mono (code), embedded via @font-face in
 * server/static/index.html and shipped from public/fonts/.
 *
 * PRECEDENCE (low → high): upstream default → these → a workspace admin's
 * "Custom theme" accent. Accent sits in `paletteOverrides` so admins can still
 * override it.
 */

/** Raw palette, merged before derived tokens compute (accent propagates). */
export const paletteOverrides: Partial<Colors> = {
  accent: "#0969da", // Primer accent.fg / emphasis (light)
  danger: "#cf222e",
  warning: "#9a6700",
  success: "#1a7f37",
};

/** Shared by light AND dark: fonts. */
export const baseOverrides: Partial<DefaultTheme> = {
  fontFamily:
    "'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fontFamilyMono:
    "'SF Mono', ui-monospace, SFMono-Regular, 'Liberation Mono', Menlo, Consolas, monospace",
};

/** GitHub Primer — light. */
export const lightOverrides: Partial<DefaultTheme> = {
  background: "#ffffff",
  backgroundSecondary: "#f6f8fa",
  backgroundTertiary: "#eaeef2",
  backgroundQuaternary: "#d0d7de",
  text: "#1f2328",
  textSecondary: "#59636e",
  textTertiary: "#818b98",
  cursor: "#1f2328",
  link: "#0969da",
  selected: "#0969da",
  placeholder: "#818b98",
  textHighlight: "#fff8c5",
  textHighlightForeground: "#1f2328",
  textDiffInserted: "#1f2328",
  textDiffInsertedBackground: "#dafbe1",
  textDiffDeleted: "#1f2328",
  textDiffDeletedBackground: "#ffebe9",

  sidebarBackground: "#f6f8fa",
  sidebarHoverBackground: "#eef1f4",
  sidebarActiveBackground: "#eaeef2",
  sidebarControlHoverBackground: "rgba(101,109,118,0.16)",
  sidebarDraftBorder: "#d0d7de",
  sidebarText: "#1f2328",

  divider: "#d1d9e0",
  titleBarDivider: "#d1d9e0",
  inputBorder: "#d1d9e0",
  inputBorderFocused: "#0969da",
  inputBackground: "#ffffff",

  backdrop: "rgba(31,35,40,0.2)",
  shadow: "rgba(31,35,40,0.12)",
  modalBackdrop: "rgba(31,35,40,0.3)",
  modalBackground: "#ffffff",
  modalShadow:
    "0 1px 3px rgba(31,35,40,0.12), 0 8px 24px rgba(66,74,83,0.12)",
  menuBackground: "#ffffff",
  menuItemSelected: "#eaeef2",
  menuShadow: "0 1px 3px rgba(31,35,40,0.12), 0 8px 24px rgba(66,74,83,0.12)",
  listItemHoverBackground: "#f6f8fa",

  mentionBackground: "#ddf4ff",
  mentionHoverBackground: "#b6e3ff",
  tableSelected: "#0969da",
  tableSelectedBackground: "#ddf4ff",

  buttonNeutralBackground: "#f6f8fa",
  buttonNeutralHoverBackground: "#eef1f4",
  buttonNeutralText: "#1f2328",
  buttonNeutralBorder: "#d1d9e0",

  tooltipBackground: "#1f2328",
  tooltipText: "#ffffff",
  toastBackground: "#ffffff",
  toastText: "#1f2328",

  quote: "#d1d9e0",
  codeBackground: "#f6f8fa",
  codeBorder: "#d1d9e0",
  embedBorder: "#d1d9e0",
  horizontalRule: "#d1d9e0",
  progressBarBackground: "#d1d9e0",
  scrollbarBackground: "transparent",
  scrollbarThumb: "#d1d9e0",

  // Notice / alert blocks (Primer subtle)
  noticeInfoBackground: "#ddf4ff",
  noticeInfoText: "#1f2328",
  noticeTipBackground: "#dafbe1",
  noticeTipText: "#1f2328",
  noticeWarningBackground: "#fff8c5",
  noticeWarningText: "#1f2328",
  noticeSuccessBackground: "#dafbe1",
  noticeSuccessText: "#1f2328",

  // Code syntax (github-light)
  code: "#1f2328",
  codeComment: "#59636e",
  codeKeyword: "#cf222e",
  codeString: "#0a3069",
  codeFunction: "#6639ba",
  codeNumber: "#0550ae",
  codeConstant: "#0550ae",
  codeProperty: "#953800",
  codeTag: "#0550ae",
  codeClassName: "#953800",
  codeAttrName: "#0550ae",
  codeAttrValue: "#0a3069",
  codeEntity: "#6639ba",
  codeStatement: "#cf222e",
  codeSelector: "#116329",
  codeOperator: "#0550ae",
  codePunctuation: "#1f2328",
  codeParameter: "#1f2328",
  codeInserted: "#116329",
  codeImportant: "#cf222e",
  codePlaceholder: "#59636e",
};

/** GitHub Primer — dark. */
export const darkOverrides: Partial<DefaultTheme> = {
  accent: "#1f6feb", // Primer dark accent.emphasis (focus/selection)
  danger: "#f85149",
  warning: "#d29922",
  success: "#3fb950",

  background: "#0d1117",
  backgroundSecondary: "#151b23",
  backgroundTertiary: "#21262d",
  backgroundQuaternary: "#30363d",
  text: "#e6edf3",
  textSecondary: "#9198a1",
  textTertiary: "#6e7681",
  cursor: "#e6edf3",
  link: "#4493f8",
  selected: "#1f6feb",
  placeholder: "#6e7681",
  textHighlight: "rgba(187,128,9,0.4)",
  textHighlightForeground: "#e6edf3",
  textDiffInserted: "#e6edf3",
  textDiffInsertedBackground: "rgba(46,160,67,0.2)",
  textDiffDeleted: "#e6edf3",
  textDiffDeletedBackground: "rgba(248,81,73,0.15)",

  sidebarBackground: "#010409",
  sidebarHoverBackground: "#0d1117",
  sidebarActiveBackground: "#21262d",
  sidebarControlHoverBackground: "rgba(177,186,196,0.12)",
  sidebarDraftBorder: "#30363d",
  sidebarText: "#9198a1",

  divider: "#3d444d",
  titleBarDivider: "#3d444d",
  inputBorder: "#3d444d",
  inputBorderFocused: "#4493f8",
  inputBackground: "#0d1117",

  backdrop: "rgba(1,4,9,0.5)",
  shadow: "rgba(1,4,9,0.5)",
  modalBackdrop: "rgba(1,4,9,0.5)",
  modalBackground: "#151b23",
  modalShadow: "0 0 0 1px #3d444d, 0 16px 32px rgba(1,4,9,0.85)",
  menuBackground: "#151b23",
  menuItemSelected: "#21262d",
  menuShadow: "0 0 0 1px #3d444d, 0 8px 24px rgba(1,4,9,0.85)",
  listItemHoverBackground: "#21262d",

  mentionBackground: "rgba(56,139,253,0.1)",
  mentionHoverBackground: "rgba(56,139,253,0.2)",
  tableSelected: "#4493f8",
  tableSelectedBackground: "rgba(56,139,253,0.1)",

  buttonNeutralBackground: "#21262d",
  buttonNeutralHoverBackground: "#30363d",
  buttonNeutralText: "#e6edf3",
  buttonNeutralBorder: "#3d444d",

  tooltipBackground: "#3d444d",
  tooltipText: "#e6edf3",
  toastBackground: "#151b23",
  toastText: "#e6edf3",

  quote: "#3d444d",
  codeBackground: "#151b23",
  codeBorder: "#3d444d",
  embedBorder: "#3d444d",
  horizontalRule: "#3d444d",
  progressBarBackground: "#3d444d",
  scrollbarBackground: "transparent",
  scrollbarThumb: "#30363d",

  noticeInfoBackground: "rgba(56,139,253,0.1)",
  noticeInfoText: "#e6edf3",
  noticeTipBackground: "rgba(46,160,67,0.15)",
  noticeTipText: "#e6edf3",
  noticeWarningBackground: "rgba(187,128,9,0.15)",
  noticeWarningText: "#e6edf3",
  noticeSuccessBackground: "rgba(46,160,67,0.15)",
  noticeSuccessText: "#e6edf3",

  // Code syntax (github-dark)
  code: "#e6edf3",
  codeComment: "#9198a1",
  codeKeyword: "#ff7b72",
  codeString: "#a5d6ff",
  codeFunction: "#d2a8ff",
  codeNumber: "#79c0ff",
  codeConstant: "#79c0ff",
  codeProperty: "#ffa657",
  codeTag: "#7ee787",
  codeClassName: "#ffa657",
  codeAttrName: "#79c0ff",
  codeAttrValue: "#a5d6ff",
  codeEntity: "#d2a8ff",
  codeStatement: "#ff7b72",
  codeSelector: "#7ee787",
  codeOperator: "#ff7b72",
  codePunctuation: "#e6edf3",
  codeParameter: "#e6edf3",
  codeInserted: "#7ee787",
  codeImportant: "#ff7b72",
  codePlaceholder: "#9198a1",
};
