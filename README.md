# 🌿 Hazy Days Tracker

A lighthearted habit tracker for logging clean, weed, alcohol, or "both" days on a calendar — with streaks, monthly stats, and a mood card that reacts to how your month's actually going.

Built with [Expo](https://expo.dev) (SDK 55) and [Expo Router](https://docs.expo.dev/router/introduction).

## Demo

https://github.com/user-attachments/assets/PASTE-YOUR-UPLOADED-VIDEO-ID-HERE

> **Note:** GitHub only renders video inline if it's uploaded through the web editor's drag-and-drop (see [docs/screenshots/screenrecord.mp4](./docs/screenshots/screenrecord.mp4) for the raw file). Once you drag that file into the README edit box on github.com, GitHub will replace it with a `user-attachments` link — swap the placeholder line above with that link and this section will play inline. Until then, this links to the raw file, which opens/downloads instead of playing in the README.

## Features

- **Onboarding** — a short 3-step welcome flow (welcome → name → ready) on first launch, which sets your profile name before you land on the Calendar.
- **Calendar logging** — tap any day to mark it clean, weed, alcohol, or both. Color-coded legend and a monthly "verdict" (mostly clean / mixed / heavier month) based on your ratio for that month.
- **Profile stats** — clean days, current streak, best streak, and total days tracked, all computed live from your logged entries.
- **Edit profile** — customize your display name, pick from a set of preset avatars, set a nickname the mood messages address you by, and add a short personal goal/note.
- **This month's mood** — a card that shifts tone (proud → gentle warning → disappointed → dramatic) based on this month's clean ratio, with a "waiting for data" state until at least 3 days are logged.
- **Real reminders** — a daily log reminder with a custom time picker, backed by actual scheduled local notifications (requires a development build — see [Notifications](#notifications) below).
- **Settings** — week start day (Sun/Mon), accent color picker, and data export/clear.
- **Local persistence** — entries, profile, and settings are all saved on-device with `AsyncStorage`, so everything survives app restarts.
- **Custom branding** — dedicated app icon, adaptive Android icon, and a splash screen matching the app's own color palette (not the default Expo template).

## Tech stack

- [Expo](https://expo.dev) + [Expo Router](https://docs.expo.dev/router/introduction) (file-based routing)
- React Native, TypeScript
- [react-native-calendars](https://github.com/wix/react-native-calendars) for the calendar view
- React Context for shared state (`SettingsContext`, `EntriesContext`, `ProfileContext`)
- `@react-native-async-storage/async-storage` for local persistence
- `expo-notifications` for scheduled daily reminders
- Google Fonts (Poppins) via `@expo-google-fonts/poppins`

### Screenshots

| Calendar | Settings | Profile — proud |
|---|---|---|
| ![Calendar](./docs/screenshots/calendar.png) | ![Settings](./docs/screenshots/settings.png) | ![Proud message](./docs/screenshots/msg%20-%20proud.png) |

| Profile — gentle warning | Profile — disappointed | Profile — dramatic |
|---|---|---|
| ![Warning message](./docs/screenshots/warning%20msg.png) | ![Disappointed message](./docs/screenshots/msg%20-%20dissapointed.png) | ![Dramatic message](./docs/screenshots/msg%20-%20dramatic.png) |

| Profile — no entries yet | Edit Profile | Reminder time picker |
|---|---|---|
| ![No entries yet](./docs/screenshots/msg%20-%20no%20entries%20yet.png) | ![Edit Profile](./docs/screenshots/edit-profile.jpg) | ![Timer set](./docs/screenshots/timer%20set.png) |

See [Demo](#demo) above for a full screen recording of the app in action.

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the app**

   ```bash
   npx expo start
   ```

   From the output you can open the app in a [development build](https://docs.expo.dev/develop/development-builds/introduction/), an Android emulator, an iOS simulator, or [Expo Go](https://expo.dev/go).

> **Note:** This project tracks Expo SDK 55, which changed significantly from earlier SDKs. If you're extending this app, check the [versioned docs](https://docs.expo.dev/versions/v55.0.0/) before assuming an older API still applies.

## Notifications

Local scheduled reminders use `expo-notifications`. Two important platform notes:

- **Expo Go on Android can't do this at all** since SDK 53 — push notification support was removed from Expo Go on Android, and that removal also breaks local notification scheduling there. Toggling the reminder on inside Expo Go on Android will silently no-op with a console warning instead of crashing.
- **To actually test reminders**, run a real development build instead of Expo Go:

  ```bash
  npx expo run:android
  ```

  This compiles and installs your own native build (with its own icon, separate from the Expo Go app) onto a simulator, emulator, or physical device, and real notification scheduling works there.

## Project structure

```
src/
  app/
    _layout.tsx           # Root layout — wraps app in providers, loads fonts
    index.tsx              # Start gate — redirects to onboarding or (tabs) based on saved status
    onboarding.tsx          # 3-step first-launch welcome flow
    edit-profile.tsx         # Modal screen for editing name/avatar/nickname/goal note
    (tabs)/
      index.tsx              # Calendar tab
      profile.tsx              # Profile tab (stats + mood card)
      settings.tsx              # Settings tab
  context/
    SettingsContext.tsx    # Reminder scheduling, week start, accent color
    EntriesContext.tsx      # Logged days, streaks, monthly stats, persistence
    ProfileContext.tsx       # Name, avatar, nickname, goal note, persistence
assets/
  images/
    emoticons/              # Mood card artwork
    pfp/                     # Preset avatar choices for Edit Profile
    welcome/                  # Onboarding illustrations
docs/
  screenshots/              # Screenshots and demo video used in this README
```

## Documentation

Additional docs live in [`docs/`](./docs).

## Data & privacy

All data is stored locally on-device via `AsyncStorage` — nothing is sent to a server. Clearing app data or uninstalling the app removes it permanently, and there is currently no export-to-file or backup mechanism (the Settings screen's "Export" is a placeholder).

## Roadmap / known gaps

- Accent color picker in Settings doesn't yet theme the app.
- No real data export (CSV/JSON) yet — only local `AsyncStorage`.
- Entries are stored as a single JSON blob; fine at current scale, but would need restructuring for very large histories.
- Onboarding only collects a name — avatar/nickname/goal note are still set later via Edit Profile, not during the initial flow.

## Future enhancements

- 🌙 **Dark mode** — a proper dark theme, ideally following system appearance settings. (The Settings screen already has a disabled "Coming soon" toggle for this.)
- ☁️ **Backup/sync** — optional cloud backup so entries survive an uninstall or device switch.

## Author
Shehani Kavindi
Software Engineer Undergraduate at Birminhgam City University
