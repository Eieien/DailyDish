# DailyDish

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

## If you encounter issues

Clear the Metro cache:

```bash
bunx expo start --clear
```

Reinstall dependencies:

```bash
rm -rf node_modules bun.lock
bun install
```