# Petroleu Marketing Site

Public-facing Petroleu marketing website (React + Vite). Reads published CMS content from the Laravel API and submits contact/demo forms. Does not include CMS admin, ERP, or Electron.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — ESLint

## Environment

See `.env.example`. Dev proxy sends `/api` to `http://127.0.0.1:8001`.
