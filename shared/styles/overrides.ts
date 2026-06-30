import type { Colors, DefaultTheme } from "styled-components";

/**
 * Fork-local theme overrides.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Outline has no .css files — every colour/font lives in `theme.ts` and is
 * distributed via the `s("token")` accessor. Editing `theme.ts` values directly
 * works, but those lines conflict on every `git rebase` onto a new upstream
 * release. Instead, put your values HERE (a file upstream will never touch) and
 * keep only four tiny "wire-in" spreads in `theme.ts`. On upgrade you re-apply
 * at most those four one-liners; your actual theme never conflicts.
 *
 * All four objects are empty by default — zero behaviour change until you fill
 * them in. See `theming.html` at the repo root for the full guide.
 *
 * PRECEDENCE (lowest → highest): upstream default → these overrides → a
 * workspace admin's "Custom theme" accent (Settings → Details). Put accent in
 * `paletteOverrides` (not light/darkOverrides) so admins can still override it.
 */

/**
 * Raw palette colours, merged BEFORE derived tokens are computed, so changing
 * `accent` here also recolours everything derived from it (link, selected,
 * tableSelected, the focus outline, notice/info backgrounds, …). Use this for
 * brand colours. `brand` is an object — if you set it, set every sub-key.
 *
 * Example:
 *   accent: "#7C3AED",
 *   danger: "#e5484d",
 */
export const paletteOverrides: Partial<Colors> = {
  // accent: "#0366d6",
};

/**
 * Tokens shared by BOTH light and dark themes: fonts, code-syntax colours, and
 * notice/callout colours that are identical in both modes.
 *
 * NOTE: changing `fontFamily` only swaps the CSS stack. To ship a custom web
 * font you must ALSO (1) drop the files in `public/fonts/` and (2) add an
 * `@font-face` block in `server/static/index.html` (see theming.html §Fonts).
 *
 * Example:
 *   fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif",
 *   fontFamilyMono: "'JetBrains Mono', SFMono-Regular, Menlo, monospace",
 *   codeKeyword: "#c678dd",
 */
export const baseOverrides: Partial<DefaultTheme> = {
  // fontFamily: "...",
};

/**
 * Light-mode semantic tokens (background, text, sidebar*, menu*, modal*, …).
 * Anything in `buildLightTheme`'s return is overridable here.
 *
 * Example:
 *   background: "#fbfbfd",
 *   sidebarBackground: "#f2f4f8",
 */
export const lightOverrides: Partial<DefaultTheme> = {
  // background: "#ffffff",
};

/**
 * Dark-mode semantic tokens. Anything in `buildDarkTheme`'s return is
 * overridable here.
 *
 * Example:
 *   background: "#0d1117",
 *   sidebarBackground: "#010409",
 */
export const darkOverrides: Partial<DefaultTheme> = {
  // background: "#111319",
};
