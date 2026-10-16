# Lock In

A study app that turns your classes into 15-minute exam games. Connect Canvas or upload your slides and past exams. Lock In forecasts what's likely on the test and builds practice sessions around it.

## Run it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
cp .env.example .env.local   # then paste your Gemini API key into GEMINI_API_KEY
npm run dev                  # open http://localhost:3000
```

No key? It still runs. Forecasts fall back to a built-in heuristic, and uploads use sample questions.

## Put it on your phone

Lock In is an installable web app (a PWA). It gets its own icon, opens full screen, and works offline once loaded. Install only works from an `https://` address, so host it first (see below), then:

- **iPhone (Safari):** open the site, tap Share, then **Add to Home Screen**.
- **Android (Chrome):** open the site, tap ⋮, then **Install app**.
- **Laptop (Chrome or Edge):** click the install icon in the address bar.

## Host it

Lock In is a small Node server (`server.ts`) plus the React app. The server keeps your Gemini key private and talks to Canvas for you. Any host that runs Node works:

1. `npm run build`
2. Start with `NODE_ENV=production npm start`
3. Set `GEMINI_API_KEY` in the host's environment settings.

Render, Railway and Google Cloud Run all have free or cheap tiers and give you `https://` automatically. AI Studio's own Deploy button also targets Cloud Run.

## Project map

| Path | What it is |
|---|---|
| `src/index.css` | Design tokens: every color, the font, radius and shadow |
| `src/App.tsx` | App state, saving to the browser, navigation |
| `src/screens/` | Setup, Today, Exams, Forecast, Games, Mastery, Sources, Results |
| `src/components/GameSession.tsx` | The study game |
| `src/components/ui.tsx` | Buttons, cards, chips, rings, bars, mastery tags |
| `src/lib/derive.ts` | Read-only helpers (mastery %, next exam, countdowns) |
| `src/lib/streak.ts` | Day-based streak |
| `server.ts` | Canvas proxy and Gemini calls |
| `public/` | App manifest, icons and the offline service worker |

Your data (classes, XP, streak) lives in your browser's local storage. Clearing site data resets it.
