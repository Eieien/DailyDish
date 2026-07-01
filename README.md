# DailyDish
Courtesy of Derick Angelo Yu for the original project

## Prerequisites

Install the following before getting started:

- Node.js (v20 or later recommended)
- Bun
- Git
- Expo Go (for Android/iOS) or an Android Emulator/iOS Simulator

## Clone the repository

```bash
git clone git@github.com:Eieien/DailyDish.git
cd DailyDish
```

## Install dependencies

```bash
bun install
```

## Start the development server

```bash
bun run start
```

or

```bash
bunx expo start
```

## Run the app

### On a physical device

1. Install **Expo Go**.
2. Make sure your phone and computer are on the same Wi-Fi network.
3. Scan the QR code displayed in the terminal/browser.

### Android Emulator

```bash
bun run android
```

### iOS Simulator (macOS only)

```bash
bun run ios
```

### Web

```bash
bun run web
```

## Conventional Commits

This project follows the **Conventional Commits** specification. Please use the following commit message format:

```text
<type>(optional-scope): <description>
```

### Common commit types

| Type | Description |
|------|-------------|
| `feat` | Introduces a new feature |
| `fix` | Fixes a bug |
| `docs` | Documentation changes only |
| `style` | Formatting, whitespace, or styling changes (no code logic changes) |
| `refactor` | Code changes that neither fix a bug nor add a feature |
| `perf` | Performance improvements |
| `test` | Adds or updates tests |
| `build` | Changes to the build system or dependencies |
| `ci` | Changes to CI/CD configuration |
| `chore` | Maintenance tasks, tooling, or miscellaneous changes |
| `revert` | Reverts a previous commit |

### Examples

```bash
feat(auth): add Google sign-in

fix(profile): prevent app crash on startup

docs: update installation guide

refactor(api): simplify request handling

chore: update dependencies
```

## If you encounter issues

Clear the Metro cache:

```bash
bunx expo start --clear
```

Reinstall dependencies:

### macOS/Linux

```bash
rm -rf node_modules bun.lock
bun install
```

### Windows (PowerShell)

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item bun.lock
bun install
```

## Database (Drizzle ORM + Supabase)

This project uses [Drizzle ORM](https://orm.drizzle.team/) with a direct Postgres connection to Supabase (not the `supabase-js` REST client). The ORM only runs server-side — do not import `db` from `app/` screens or components.

### Setup

1. In your Supabase project, go to **Project Settings > Database > Connection string > URI** and copy the direct connection string (port `5432`, not the pooler on `6543`).
2. Add it to a `.env` file at the project root:

   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### Project layout

- `db/schema.ts` — Drizzle table definitions.
- `db/index.ts` — Drizzle client (`drizzle-orm/postgres-js`), reads `DATABASE_URL` from the environment.
- `drizzle.config.ts` — `drizzle-kit` config for generating and running migrations.

### Migration workflow

```bash
bun run db:generate  # generate SQL migrations from db/schema.ts
bun run db:migrate    # apply pending migrations to the database
bun run db:push       # push schema changes directly, skipping migration files (prototyping only)
bun run db:studio     # open Drizzle Studio to browse the database

```