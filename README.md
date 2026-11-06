# Lens Log

A contact lens tracker for Android. It counts down to your next pair, times how long you wear your lenses each day, keeps track of your case, solution and spare lenses, and has step-by-step care guides.

Everything is stored on your phone. There is no account and no server.

## Features

- **Replacement countdown** for each eye, or one countdown when both eyes share a schedule. Supports daily, 2-week, monthly and custom lenses.
- **Wear timer** with your daily limit, and a prompt if it looks like you forgot to log taking them out (or slept in them).
- **Reminders** that arrive even when the app is closed:
  - the evening before and the morning new lenses are due
  - one hour before, and when you reach, your daily wear limit
  - when the lens case or solution bottle should be replaced
- **Supplies**: spare lenses per eye with low-stock warnings, case and solution trackers, and your prescription for each eye.
- **History**: a weekly wear chart and every past lens, with whether it was replaced on time, late, torn or lost.
- **Guide**: putting lenses in and taking them out, opening a blister pack, cleaning and storage, the inside-out check, makeup, what never to do, and red flags.
- Light and dark mode, and backup export/import.

> Lens Log gives general guidance only. Always follow your eye care professional's instructions.

## Install on your Android phone

1. Get the APK:
   - from this repository's **Releases** page (download `lens-log-<version>.apk`), or
   - by building it yourself (see below).
2. Copy it to your phone (USB cable, Google Drive, or email it to yourself), or download it on the phone directly.
3. Open the APK on your phone. Android will ask you to allow installing apps from that source (for example your browser or Files app). Allow it, go back, and tap **Install**.
4. Open Lens Log and follow the setup.
5. In **Settings → Notifications**, tap **Send test** and close the app. A notification should arrive about 10 seconds later. If reminders arrive late, tap **Exact alarms** and allow "Alarms & reminders".

### Updating

Install the newer APK over the old one. Your data is kept.

Updates only install over the old version if both APKs were signed with the same key. If Android says the app "conflicts with an existing package", you would have to uninstall first, which **deletes your data**. Export a backup in **Settings → Backup** before uninstalling, and import it afterwards.

## Build it yourself

You need [Node.js](https://nodejs.org) 20+ and [Android Studio](https://developer.android.com/studio) (for the Android SDK and Java).

```bash
npm install
npm run android:sync        # build the web app and copy it into android/
cd android
./gradlew assembleDebug     # on Windows: gradlew.bat assembleDebug
```

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`.

To run it straight on a phone connected by USB (with USB debugging on), open the project in Android Studio and press Run:

```bash
npm run android:open
```

## Development

```bash
npm run dev        # web version at http://localhost:5173
npm run build      # production web build in dist/
```

The web version works in any browser and can be installed as a PWA, but reminders only work in the Android app.

| Script | What it does |
|---|---|
| `npm run android:sync` | Build the web app and copy it into the Android project |
| `npm run android:open` | Open the Android project in Android Studio |
| `npm run android:icons` | Regenerate the Android launcher icon and splash screen from the logo (`scripts/android-icons.mjs`) |
| `npm run icons` | Regenerate the web/PWA icons from `public/favicon.svg` |

### Stack

React (plain JavaScript) with Vite, Tailwind CSS, React Router, Dexie (IndexedDB) for storage, date-fns, Lucide icons, `vite-plugin-pwa`, and Capacitor with `@capacitor/local-notifications` for the Android app.

### Project layout

```
src/
  db/            database schema, actions, backup export/import
  domain/        replacement, wear and supplies logic (no UI)
  platform/      Android-only code: notifications and reminder scheduling
  features/      screens: home, guide, supplies, history, settings, onboarding
  components/    layout and shared UI
android/         Capacitor Android project
PLAN.md          product plan and data model
```
