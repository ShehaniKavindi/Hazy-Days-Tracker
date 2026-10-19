# 🌿 Hazy Days Tracker

A lighthearted habit tracker for logging clean, weed, alcohol, or "both" days on a calendar — with streaks, monthly stats, a date-range summary, dark mode, and a mood card that reacts to how your month's actually going.

Built with [Expo](https://expo.dev) (SDK 55) and [Expo Router](https://docs.expo.dev/router/introduction).

## Demo

https://github.com/user-attachments/assets/48b29d9f-3ce4-4bc1-8406-4cac34d90089

## Features

**Onboarding**
- 3-step welcome flow (welcome → name → ready) on first launch

**Calendar**
- Tap any day to log it clean, weed, alcohol, or both
- Color-coded legend, today highlighted separately from logged days
- Monthly verdict (mostly clean / mixed / heavier) based on your ratio
- "Both" days count toward the weed *and* alcohol totals, not just their own
- Reset button in the log modal to clear an accidental or future-dated entry

**Summary**
- Pick any date range on a range calendar (tap a start date, then an end date), or use a preset: This month, Last 30 days, 3 months, All time
- See how many days were clean, weed, alcohol, or both in that range
- Weed and alcohol totals include "both" days, matching the calendar tab
- Proportion bar showing each logged day once, plus a "logged X of Y days" footnote so unlogged days aren't mistaken for clean ones
- Opened from the Profile tab

**Profile**
- Clean days, current streak, best streak, and days tracked — computed live
- "Tracking since" shows the month of your earliest logged entry
- Editable name, avatar, nickname, and a personal goal/note
- Blank name shows a warning and falls back to "Idiot," not a silent failure
- Mood card whose tone shifts with your clean ratio, addressing you by name/nickname mid-message

**Reminders**
- Daily log reminder with a custom time picker, backed by real scheduled notifications
- Requires a development build on Android — see [Notifications](#notifications)

**Data**
- Export all entries to a `.json` backup via the native share sheet
- Import a backup back in — matching dates are overwritten, the rest is untouched
- Everything persists on-device via `AsyncStorage`, surviving app restarts

**Settings & theming**
- Week start day (Sun/Mon)
- Accent color picker that themes the whole app
- Dark mode — a manual switch in Settings (light is the default), using a soft neutral dark palette that works with every accent color
- Custom app icon, adaptive Android icon, and splash screen

## Try it

| Platform | How to use it |
|---|---|
| 🤖 **Android** | [Download the APK](https://expo.dev/accounts/shehanikavindi/projects/Hazy-Days-Tracker/builds/3fbf1793-778b-4dfb-9044-dddfde114033). Open the link on your phone, download the file, and install it. If Android asks, allow **Install unknown apps**. |
| 🍎 **iPhone** | [Open the web app](https://hazy-days-tracker.vercel.app) in **Safari**, tap **Share → Add to Home Screen**, and it opens full screen like an app. |

> **Notes**
> - The iPhone version is a web app, so daily reminder notifications aren't supported there.
> - Data is stored on each device separately (Android app and web app don't sync). Use **Settings → Export data** to back up, and **Import data** to restore.
> - Clearing browser data on iPhone (or app data on Android) erases your logs, so export a backup now and then.


## Tech stack

- [Expo](https://expo.dev) + [Expo Router](https://docs.expo.dev/router/introduction) (file-based routing)
- React Native, TypeScript
- [react-native-calendars](https://github.com/wix/react-native-calendars) for the calendar and range-picker views
- React Context for shared state (`SettingsContext`, `EntriesContext`, `ProfileContext`)
- A shared light/dark palette (`src/palette.ts`) consumed through a `useStyles` hook, so every screen restyles when the theme changes
- `@react-native-async-storage/async-storage` for local persistence
- `expo-notifications` for scheduled daily reminders (guarded against Expo Go on Android, where it isn't supported)
- `expo-file-system`, `expo-sharing`, and `expo-document-picker` for data export/import
- `react-native-safe-area-context` for safe-area handling

### Screenshots

| Calendar | Settings | Profile — gentle warning | Reminder time picker |
|---|---|---|---|
| ![Calendar](./docs/screenshots/calendar.png) | ![Settings](./docs/screenshots/settings.png) | ![Warning message](./docs/screenshots/warning%20msg.png) | ![Timer set](./docs/screenshots/timer%20set.png) |

| Profile — proud | Profile — disappointed | Profile — dramatic | Profile — no entries yet |
|---|---|---|---|
| ![Proud message](./docs/screenshots/msg%20-%20proud.png) | ![Disappointed message](./docs/screenshots/msg%20-%20dissapointed.png) | ![Dramatic message](./docs/screenshots/msg%20-%20dramatic.png) | ![No entries yet](./docs/screenshots/msg%20-%20no%20entries%20yet.png) |

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

## Notifications

Local scheduled reminders use `expo-notifications`. Two important platform notes:

- **Expo Go on Android can't do this at all** since SDK 53 — push notification support was removed from Expo Go on Android, and that removal also breaks local notification scheduling there. The app detects this at runtime (via `expo-constants`'s `ExecutionEnvironment`) and toggling the reminder on inside Expo Go on Android will silently no-op with a console warning instead of crashing.
- **To actually test reminders**, run a real development build instead of Expo Go:

  ```bash
  npx expo run:android
  ```

  This compiles and installs your own native build (with its own icon, separate from the Expo Go app) onto a simulator, emulator, or physical device, and real notification scheduling works there. EAS Build (`npx eas build --profile development --platform android`) is the equivalent cloud-based option if you'd rather not build locally.

## Building an APK

To install the app on a phone or share it with others (Android):

1. Set a unique `android.package` in `app.json`.
2. Add an `eas.json` in the project root:

   ```json
   {
     "build": {
       "preview": {
         "distribution": "internal",
         "android": { "buildType": "apk" }
       }
     }
   }
   ```

3. Log in and build:

   ```bash
   npm install -g eas-cli
   eas login
   eas build -p android --profile preview
   ```

4. Open the download link on your phone, install the APK, and allow "Install unknown apps" if Android asks.

Prefer a local build? `npx expo run:android --variant release` puts the APK in `android/app/build/outputs/apk/release/`.

## Data & privacy

All data is stored locally on-device via `AsyncStorage` — nothing is sent to a server. From Settings, you can export everything to a `.json` file (via the OS share sheet) as a manual backup, and import a previously exported file back in later. Clearing app data, uninstalling the app, or simply never exporting means the data is gone for good — there's currently no automatic cloud backup.

## Project structure

```
src/
  palette.ts               # Light and dark color palettes
  app/
    _layout.tsx            # Root layout — wraps app in providers, themed stack
    index.tsx              # Start gate — redirects to onboarding or (tabs) based on saved status
    onboarding.tsx         # 3-step first-launch welcome flow
    edit-profile.tsx       # Modal screen for editing name/avatar/nickname/goal note
    summary.tsx            # Date-range summary (range calendar, stat cards, proportion bar)
    (tabs)/
      index.tsx            # Calendar tab
      profile.tsx          # Profile tab (stats + mood card + Summary button)
      settings.tsx         # Settings tab (theming, dark mode, reminders, data export/import)
  context/
    SettingsContext.tsx    # Reminder scheduling, week start, accent color, dark mode, useStyles hook
    EntriesContext.tsx     # Logged days, streaks, monthly and range stats, persistence
    ProfileContext.tsx     # Name, avatar, nickname, goal note, persistence
assets/
  images/
    emoticons/             # Mood card artwork
    pfp/                   # Preset avatar choices for Edit Profile
    welcome/               # Onboarding illustrations
docs/
  screenshots/             # Screenshots and demo video used in this README
```

## Documentation

Additional docs live in [`docs/`](./docs).

## Roadmap / known gaps

- Entries are stored as a single JSON blob; fine at current scale, but would need restructuring for very large histories.
- Onboarding only collects a name — avatar/nickname/goal note are still set later via Edit Profile, not during the initial flow.
- Export/import round-trips the raw `entries` object as JSON; there's no CSV option yet for opening a backup in a spreadsheet.
- Dark mode is a manual switch only — it doesn't follow the system appearance setting yet.

## Future enhancements

- 📊 **Summary extras** — remember the last-used range, tap a stat card to see the days it counts, and compare against the previous period.
- 🌗 **Follow system appearance** — an optional "System" choice for dark mode.
- ☁️ **Cloud sync** — optional Google sign-in + Firebase/Supabase backend so entries survive an uninstall or sync across devices, staying local-only by default for anyone who doesn't sign in.

## Author

**Shehani Kavindi**
**Software Engineer Undergraduate at Birmingham City University**
