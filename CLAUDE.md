# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

**is-yellow** is a mobile app that determines whether what the camera sees is yellow. It displays a live camera feed, samples the center 5×5 pixels, averages their hue, and renders either **"yellow"** or **"not yellow"** below the center of the frame in real time. The app is mobile-only (camera access is not available on web).

## Commands

```bash
npm install          # Install dependencies
npm start            # Start Expo dev server (opens QR code for Expo Go / simulators)
npm run android      # Start with Android emulator
npm run ios          # Start with iOS simulator
npm run web          # Start with web browser
npm run lint         # Run ESLint via expo lint
```

There is no test runner configured.

## Architecture

This is an **Expo Router** app using file-based routing. The entry point is `expo-router/entry` (set in `package.json`).

### Routing structure

- `app/_layout.tsx` — root layout: wraps the app in React Navigation's `ThemeProvider` (auto light/dark) and a `Stack` with `headerShown: false`.
- `app/index.tsx` — the single screen; this is where the camera logic lives.

### Theming

Theming is done via `constants/theme.ts`, which exports:
- `Colors` — light/dark color tokens (`text`, `background`, `tint`, `icon`, `tabIconDefault`, `tabIconSelected`).
- `Fonts` — platform-specific font stacks (iOS system fonts, web CSS stacks, Android defaults).

The `useThemeColor` hook (`hooks/use-theme-color.ts`) resolves a color token or prop override for the current scheme. Use it inside themed components to respect light/dark mode.

The `useColorScheme` hook has a platform split: `hooks/use-color-scheme.ts` (native) re-exports React Native's hook directly; `hooks/use-color-scheme.web.ts` adds a hydration guard so static web rendering always starts as `'light'` before the client hydrates.

### Shared components

- `ThemedText` / `ThemedView` — auto-colored wrappers; `ThemedText` accepts a `type` prop (`default`, `title`, `defaultSemiBold`, `subtitle`, `link`).

### Path aliases

`@/` maps to the repo root (configured in `tsconfig.json`). Use `@/components/...`, `@/hooks/...`, `@/constants/...` throughout.

### Platform-specific files

Expo resolves `.ios.tsx` before `.tsx`. Use this pattern when a component needs a fully different native implementation (e.g. `use-color-scheme.web.ts` for the web hydration guard).

### Notable config

- React Compiler and typed routes are enabled under `experiments` in `app.json`.
- New Architecture (`newArchEnabled: true`) is on.
- Web output is `static` (SSG).
