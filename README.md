# NOX Web Prototype

Urban nightlife infrastructure web prototype built with **React 19**, **Vite**, **Tailwind CSS v3**, and **React Router 7**.

The app is a single-page marketing/product prototype for a nightlife platform. It demonstrates event discovery, venue and promoter tooling, digital tickets, and a user profile — all driven by mock data in [`src/data/events.js`](src/data/events.js). Pages are routed with React Router:

- `/` — **Discover**: event discovery with category filtering and a phone preview.
- `/venues` — **Venues**: venue network listing.
- `/promoters` — **Promoters**: promoter console, workflow, and analytics.
- `/tickets` — **Tickets**: digital QR entry passes.
- `/event/:id` — **Event detail**.
- `/profile` — **Profile**: user profile page.

Entry point: `src/main.jsx` → `src/App.jsx`.

## Run

```bash
npm install      # install dependencies
npm run dev      # start the Vite dev server
npm run build    # production build
npm test         # run the Vitest test suite
npm run check    # format:check + lint + test + build
```

## Flutter blueprint

A separate Flutter mobile blueprint lives under [`flutter_blueprint/`](flutter_blueprint/) and is independent of this web prototype.
