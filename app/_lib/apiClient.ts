// Expo Router's `+api.ts` routes are served from the same origin as the app
// only during development, via Metro's dev server. A standalone preview/
// production build has no dev server attached, so a bare relative
// `fetch("/api/...")` has no origin to resolve against and fails outright.
//
// Set EXPO_PUBLIC_API_BASE_URL to the deployed origin of these routes (e.g.
// an EAS Hosting URL) for preview/production builds. Leave it unset in
// development — relative paths already work there.
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '';

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
