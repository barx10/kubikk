# kubikk

Norsk MC-turplanlegger (PWA) — planlegger svingete, naturskjønne ruter fremfor raskeste vei. Ingen navigasjon i appen: ruter eksporteres til Google Maps, Apple Maps eller GPX. Ingen brukerkonto, ingen sosiale funksjoner (kun en enkel "del rute"-lenke uten backend).

## Stack

React + Vite + TypeScript, Tailwind CSS, react-leaflet (OpenStreetMap-fliser), Dexie (IndexedDB), Recharts, `vite-plugin-pwa`, Vercel Serverless Functions.

## Kom i gang

```bash
npm install
cp .env.example .env   # fyll inn ORS_API_KEY og WEATHER_USER_AGENT
npm run dev
```

`npm run dev` kjører kun frontend — `/api`-funksjonene krever `vercel dev` (Vercel CLI) for å kjøre lokalt med miljøvariabler, eller deploy til Vercel.

## Arkitektur og bevisste valg

- **Svingete ruter:** OpenRouteService har ingen "foretrekk svinger"-parameter. `/api/route` henter flere alternative ruter fra ORS og regner ut en curviness-score (retningsendring per km) klient-/server-side for å velge den mest svingete innenfor akseptabel omvei (se `src/lib/curviness.ts`).
- **Offline:** PWA-en cacher app-skallet og lagrede ruter, ikke kartfliser — OSMs tile-policy forbyr bulk/offline-nedlasting av fliser.
- **Fareadvarsler:** `HazardBanner` lenker til Statens vegvesens offisielle fjellovergangsside i stedet for å bygge mot et ubekreftet NVDB/DATEX II-endepunkt.
- **Apple Maps-eksport** støtter kun start/slutt (ingen via-punkter) — det er en begrensning i Apple Maps' eget URL-scheme. GPX-eksport er den anbefalte veien for eksakt ruté-troskap.

## Miljøvariabler

Se `.env.example`. `ORS_API_KEY` (OpenRouteService, gratis) og `WEATHER_USER_AGENT` (påkrevd av api.met.no) må settes i Vercel-prosjektets miljøvariabler før produksjonsbruk.
