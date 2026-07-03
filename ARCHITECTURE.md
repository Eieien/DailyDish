# Architecture Guide

This document explains how DailyDish is organized and how [Expo Router](https://docs.expo.dev/router/introduction/)'s file-based routing drives navigation. For setup/run instructions, see the main [README](README.md).

## Folder structure

```
DailyDish/
├── app/                    # Expo Router routes — one file = one screen/route
│   ├── _layout.tsx         # Root layout, wraps every route (providers, Stack navigator)
│   ├── +html.tsx           # Web-only HTML document shell (web export only)
│   ├── +not-found.tsx      # Catch-all 404 route
│   ├── index.tsx           # Route: "/" (Home screen)
│   └── details.tsx         # Route: "/details"
│
├── components/             # Reusable UI components shared across routes
│   ├── Button.tsx
│   ├── Container.tsx
│   ├── EditScreenInfo.tsx
│   └── ScreenContent.tsx
│
├── db/                      # Server-side only database layer (Drizzle ORM)
│   ├── index.ts             # Drizzle client, reads DATABASE_URL
│   └── schema.ts            # Table definitions (user, recipes, meal, sessions, chatMessages)
│
├── drizzle/                 # Generated SQL migrations + snapshots (drizzle-kit output)
│
├── assets/                  # Static images (icons, splash screen, favicon)
│
├── app.json                 # Expo app config (name, plugins, platforms, icons)
├── babel.config.js          # Babel config (expo preset, nativewind, reanimated)
├── metro.config.js          # Metro bundler config
├── drizzle.config.ts        # drizzle-kit config for migrations
├── tailwind.config.js       # Tailwind/NativeWind config
├── global.css               # Tailwind entrypoint imported in the root layout
└── tsconfig.json            # TypeScript config, defines the `@/*` path alias
```

Key boundary: **`db/` is server-only.** Nothing under `app/` or `components/` should import from `db/` directly — it holds a Postgres connection string and isn't safe to bundle into a client app. Once server endpoints/API routes are introduced, they are the only consumers of `db/`.

## Expo Router: file-based routing

Expo Router turns the `app/` directory into your app's navigation tree. There's no manually configured navigator or route list — the file system *is* the route table.

### How a file path becomes a route

| File | Route |
|---|---|
| `app/index.tsx` | `/` |
| `app/details.tsx` | `/details` |
| `app/settings/profile.tsx` | `/settings/profile` |
| `app/users/[id].tsx` | `/users/:id` (dynamic segment) |
| `app/users/[...rest].tsx` | `/users/*` (catch-all) |

- **`index.tsx`** inside any folder is that folder's default route (matches the folder path itself, e.g. `app/settings/index.tsx` → `/settings`).
- **`[param].tsx`** creates a dynamic segment. Read the value inside the screen with `useLocalSearchParams()` (see `app/details.tsx`).
- **`[...param].tsx`** creates a catch-all segment matching any number of path parts.
- **`_layout.tsx`** does not become a route itself — it wraps every sibling/child route in that folder (see below).
- Files prefixed with **`+`** are special, framework-reserved files, not routes:
  - `+html.tsx` — customizes the root HTML document on web exports.
  - `+not-found.tsx` — rendered when no route matches (404).

### Layouts (`_layout.tsx`)

A `_layout.tsx` defines the navigator and shared UI for every route in its folder (and subfolders, unless they define their own `_layout.tsx`). This project's root layout:

```tsx
// app/_layout.tsx
export default function Layout() {
  return (
    <SafeAreaProvider>
      <Stack />
    </SafeAreaProvider>
  );
}
```

- `<Stack />` renders whichever child route is currently active inside a stack navigator (push/pop, native headers).
- Global providers (safe area, theming, auth context, query clients, etc.) belong here since every screen renders inside this tree.
- Nesting works the same way React Navigation nests navigators: adding `app/(tabs)/_layout.tsx` with a `<Tabs />` would give every route inside `(tabs)/` a tab bar, nested inside the root `<Stack />`.

### Groups `(group)`

A folder wrapped in parentheses, e.g. `app/(tabs)/`, organizes routes without adding a path segment to the URL. `app/(tabs)/home.tsx` still resolves to `/home`, not `/(tabs)/home`. Groups are useful for giving a section of the app its own layout (e.g. a tab bar) or for splitting large route trees into folders without changing the public URL structure. This project doesn't use groups yet, but it's the standard way to add tab/drawer navigation later.

### Per-screen options

Each screen can configure its own header/title via `<Stack.Screen options={{...}} />`, rendered inside the screen component itself:

```tsx
// app/index.tsx
export default function Home() {
  return (
    <View>
      <Stack.Screen options={{ title: 'Home' }} />
      {/* ... */}
    </View>
  );
}
```

This is how `app/index.tsx` and `app/details.tsx` set their navigation bar titles without touching the shared layout.

### Navigating between routes

Use the `Link` component or the `router` API from `expo-router` — never hardcode navigation logic:

```tsx
import { Link } from 'expo-router';

<Link href={{ pathname: '/details', params: { name: 'Dan' } }} asChild>
  <Button title="Show Details" />
</Link>
```

Params passed this way are read on the destination screen with `useLocalSearchParams()`.

### Adding a new screen

1. Create a file under `app/`, e.g. `app/recipes/index.tsx` for a list screen and `app/recipes/[id].tsx` for a detail screen.
2. Export a default React component — that's the whole registration step, no router config needed.
3. Set the header via `<Stack.Screen options={{ title: '...' }} />` if it needs one.
4. Link to it with `<Link href="/recipes" />` or `<Link href={{ pathname: '/recipes/[id]', params: { id } }} />`.

### TypeScript path alias

`tsconfig.json` and `app.json` (`experiments.tsconfigPaths`) enable the `@/*` alias, so components/db modules are imported as `@/components/Button` instead of relative `../../components/Button` paths, regardless of how deep a route file is nested.
