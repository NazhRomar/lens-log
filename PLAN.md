# Lens Log — Plan

A contact lens tracker that installs as a PWA, works offline, and keeps all data on the device.

## Decisions

| Topic | Decision |
|---|---|
| Framework | React with plain JavaScript (`.jsx`, no TypeScript), built with Vite |
| Visual style | Clean and clinical: white/cool-grey surfaces, one calm blue accent, clear status colors (green / amber / red), lots of spacing. Light + dark mode (follows system, overridable in Settings) |
| PWA | `vite-plugin-pwa` (manifest, service worker, offline caching) |
| Storage | Local only: IndexedDB via Dexie (`dexie-react-hooks` for live queries) |
| Styling | Tailwind CSS |
| Routing | React Router |
| Dates | `date-fns` |
| Accounts / sync | None. Backup through JSON export/import instead |
| Replacement clock | Calendar days counted from the day the pack is opened (first worn). Optional "count wear-days only" mode in settings |
| Eyes | Tracked separately (left/right), can be linked so both replace together |
| Platform | **Android app via Capacitor** (same React code wrapped as a native app), installed directly as an APK. No Play Store, $0. The web/PWA version still builds and can be hosted on Vercel |
| Reminders | **Local notifications** scheduled on the phone (`@capacitor/local-notifications`): no server, work offline, fire when the app is closed. Web version: in-app alerts + .ics only |
| Hosting (web) | Vercel (`vercel.json` handles page links + service worker caching) |

## Navigation

Bottom tab bar on mobile, side rail on desktop (≥ 768px).

1. **Home**: replacement timers, wear timer, quick status
2. **Guide**: how-tos and warnings
3. **Supplies**: lens stock, case, solution, prescription
4. **History**: past cycles, wear sessions, symptoms

Settings is opened from a gear icon in the Home header.

## Screens

### Home
- **Replacement card** (per eye, or one card when linked): progress ring, "Day 9 of 14", replace-by date.
  States: `ok` → `soon` (last 2 days) → `overdue`. "Replace now" closes the cycle and starts a new one.
- **Wear timer**: "Put in" / "Take out" toggle, live elapsed time, progress against max hours.
  Warns at max − 1h and at max.
- **Forgotten session check**: if a session is still open on next launch and it has been running more than max hours,
  ask "Did you take your lenses out?" with a time picker for when.
- **Status strip**: case age, solution days left, pairs in stock. Each one taps through to Supplies.
- **Red flags button**: always visible, opens the red-flag guide card.

### Guide
Card list → step-by-step detail pages. Content is stored as static data (no DB).
- Before you start (hand hygiene)
- Opening a blister pack
- Inside-out check
- Putting lenses in
- Taking lenses out
- Cleaning and storage (case + solution rules)
- Never do this (sleeping/napping, water, saliva, sharing, overwearing)
- Red flags: when to remove the lenses and see an eye doctor
- Makeup and lenses
- Disclaimer: general guidance only, follow your eye care professional

### Supplies
- Lens stock count **per eye** (prescriptions differ), goes down automatically on "Replace now" for that eye
- Case: opened date, replace every ~90 days
- Solution: opened date, discard-after days (user sets from the bottle)
- Prescription: per eye power / BC / DIA (+ cyl/axis optional), brand, type

### History
- List of past lens cycles (per eye) with whether they were replaced on time
- Wear sessions per day (v2: calendar heatmap)
- Symptom log (v2)

### Settings
- Lens type (daily / 2-week / monthly / custom days), brand
- Link / unlink eyes
- Max wear hours (default 10)
- Replacement counting mode (calendar days / wear days)
- Bedtime reminder time
- Theme (system / light / dark)
- Export / import data (JSON), reset all data

### First launch
Short onboarding: lens type → link eyes? → max wear hours → "Did you open a pack today?" → optional guide walkthrough.

## Data model (IndexedDB, Dexie)

Example records for each table (plain JS objects). Times are epoch milliseconds; `eye` is `'left'` or `'right'`.

```js
// db.js
db.version(1).stores({
  settings: 'id',
  cycles: '++id, eye, openedAt, closedAt',
  sessions: '++id, startedAt, endedAt',
  supplies: 'id',
  stock: 'eye',
  prescriptions: 'eye',
  symptoms: '++id, at',          // v2
});

// settings: single row
{
  id: 'settings',
  lensType: 'biweekly',          // 'daily' | 'biweekly' | 'monthly' | 'custom'
  replacementDays: 14,           // 1, 14, 30 or custom
  brand: 'Acme Lens',
  eyesLinked: true,
  maxWearHours: 10,
  countMode: 'calendar',         // 'calendar' | 'wearDays'
  bedtimeReminder: '22:30',      // optional
  theme: 'system',               // 'system' | 'light' | 'dark'
  onboarded: true,
}

// cycles: one opened lens
{
  id: 1,
  eye: 'left',
  openedAt: 1762387200000,
  replacementDays: 14,           // copied from settings when opened
  closedAt: null,                // set by "Replace now"
  closeReason: null,             // 'scheduled' | 'damaged' | 'lost' | 'other'
}

// sessions: one wear session
{
  id: 1,
  startedAt: 1762412400000,
  endedAt: null,                 // null = currently wearing
  endedEstimated: false,         // true if filled in by the forgotten-session prompt
}

// supplies: 'case' and 'solution'
{ id: 'case', openedAt: 1762387200000, discardAfterDays: 90 }

// stock: one row per eye (prescriptions differ)
{ eye: 'left', count: 6, lowThreshold: 2 }

// prescriptions: one row per eye
{ eye: 'left', power: -2.25, baseCurve: 8.6, diameter: 14.2, cylinder: null, axis: null, brand: 'Acme Lens' }

// symptoms (v2)
{ id: 1, at: 1762412400000, tags: ['dry', 'itchy'], note: '' }
```

Derived values (computed, not stored): days elapsed, replace-by date, cycle state, today's wear time, supply days left.
When `countMode = 'wearDays'`, days elapsed = number of distinct days with a wear session since `openedAt`.

## Project structure

```
lenslog/
  public/
    icons/                 # PWA icons (192, 512, maskable)
  src/
    main.jsx
    App.jsx                # router + layout
    db/
      db.js                # Dexie schema
      export.js            # JSON export / import
    domain/
      cycles.js            # replacement math, states
      wear.js              # session math, warnings
      supplies.js
      ics.js               # calendar file generation
    hooks/                 # useSettings, useActiveCycles, useActiveSession, useNow (ticking clock)
    components/
      layout/              # TabBar, SideRail, Header
      ui/                  # Button, Card, ProgressRing, Sheet, Toggle
    features/
      home/
      guide/
        content.js         # guide text and steps as data
      supplies/
      history/
      settings/
      onboarding/
    styles/index.css       # color tokens for light + dark themes
  index.html
  vite.config.js           # includes vite-plugin-pwa config
```

## Android app

- Capacitor config: `capacitor.config.json` (app id `com.nazhromar.lenslog`, web build from `dist/`). Native project in `android/`.
- `src/platform/native.js`: `isNative` flag. `src/platform/notifications.js`: schedule / cancel reminders, fixed id per reminder kind.
- The service worker is registered only in the browser; the APK ships its files.
- Android 13+ asks for notification permission. Android 12+ may delay reminders unless "Alarms & reminders" is allowed (Settings → Notifications → Exact alarms).
- Data is in the app's own IndexedDB: kept across updates, deleted on uninstall or "Clear storage". Use backup export before reinstalling.
- Build / install:
  1. `npm run android:sync` (builds the web app and copies it into `android/`)
  2. `npm run android:open` → Android Studio → Run on a USB-connected phone, or Build → Build APK(s)
  3. Or from a terminal: `cd android && ./gradlew assembleDebug` → `android/app/build/outputs/apk/debug/app-debug.apk`

## Phases

**v1 (MVP)**
- Project setup, PWA install and offline support
- Onboarding + settings
- Replacement timers (per eye / linked) + "Replace now"
- Wear timer + max-hours warnings + forgotten-session prompt
- Guide (all cards) + red-flags shortcut + disclaimer
- Supplies: stock, case, solution, prescription
- Local notifications (Android): replace-by, replace-soon, wear near-max / max, bedtime, case and solution
- .ics export for replacement dates (web version)
- JSON export / import

**v2**
- Symptom log
- History stats + calendar heatmap
- Eye exam reminder

**v3**
- Multiple profiles
- Optional cloud sync

## Illustrations
- Guide steps use custom inline SVG line drawings (approved sample: inside-out check, bowl vs flared edge).
- Style: simple strokes, blue lens outlines with a light tint, grey-blue hands/fingertips, green = correct, red = wrong.
- Colors come from theme tokens (CSS variables), so the same drawings work in dark mode.
- Stored as React components in `src/features/guide/illustrations/`, one per step.
- UI icons: Lucide (`lucide-react`, MIT).
- Never copy images from lens manufacturers or clinic sites (copyrighted).

## Mockups
Design canvas: https://claude.ai/artifact/XbfveuYqPnEn7n4gLus7vT
(Home, Guide, Guide step, Supplies, History, Home dark mode)
