# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npm start            # Start Expo dev server (opens QR code for Expo Go / simulators)
npm run android      # Start with Android emulator
npm run ios          # Start with iOS simulator
npm run web          # Start with web browser
npm run lint         # Run ESLint via expo lint
npm run reset-project  # Move starter code to app-example/ and create blank app/
```

There is no test runner configured.

## Architecture

This is an **Expo Router** app using file-based routing. The entry point is `expo-router/entry` (set in `package.json`).

### Routing structure

- `app/_layout.tsx` — root layout: wraps the app in React Navigation's `ThemeProvider` (auto light/dark), registers a `Stack` with `(tabs)` and `modal` screens.
- `app/(tabs)/_layout.tsx` — tab navigator with two tabs: `index` (Home) and `explore`.
- `app/(tabs)/index.tsx`, `app/(tabs)/explore.tsx` — the two tab screens.
- `app/modal.tsx` — modal screen accessible from any tab.

The `unstable_settings.anchor` in the root layout anchors deep links to the `(tabs)` group.

### Theming

Theming is done via `constants/theme.ts`, which exports:
- `Colors` — light/dark color tokens (`text`, `background`, `tint`, `icon`, `tabIconDefault`, `tabIconSelected`).
- `Fonts` — platform-specific font stacks (iOS system fonts, web CSS stacks, Android defaults).

The `useThemeColor` hook (`hooks/use-theme-color.ts`) resolves a color token or prop override for the current scheme. Use it inside themed components to respect light/dark mode.

The `useColorScheme` hook has a platform split: `hooks/use-color-scheme.ts` (native) re-exports React Native's hook directly; `hooks/use-color-scheme.web.ts` adds a hydration guard so static web rendering always starts as `'light'` before the client hydrates.

### Shared components

- `ThemedText` / `ThemedView` — auto-colored wrappers; `ThemedText` accepts a `type` prop (`default`, `title`, `defaultSemiBold`, `subtitle`, `link`).
- `IconSymbol` — uses SF Symbols on iOS (`components/ui/icon-symbol.ios.tsx`) and falls back to Material Icons on Android/web (`components/ui/icon-symbol.tsx`). Icon names are SF Symbol names; add new mappings to the `MAPPING` object in the non-iOS file.
- `HapticTab` — tab bar button wrapper that fires haptic feedback on press.
- `ParallaxScrollView` — scroll view with a parallax header image region.

### Path aliases

`@/` maps to the repo root (configured in `tsconfig.json`). Use `@/components/...`, `@/hooks/...`, `@/constants/...` throughout.

### Platform-specific files

Expo resolves `.ios.tsx` before `.tsx`. Use this pattern (as `icon-symbol` does) when a component needs a fully different native implementation.

### Notable config

- React Compiler and typed routes are enabled under `experiments` in `app.json`.
- New Architecture (`newArchEnabled: true`) is on.
- Web output is `static` (SSG).
