# Low-Calorie Meal Plan Generator

A small React + Vite web app that generates structured 7-day, low-calorie weight-loss meal plans using the OpenAI API. Built as an MVP and ready to deploy to Vercel.

## Security note (read this first)

You shared an OpenAI API key in plain text when you asked for this app. **Treat that key as compromised.** Go to https://platform.openai.com/api-keys, delete it, and create a new one. Use the new key in the steps below.

The new key will live in a `.env` file locally and in Vercel's encrypted env-var storage in production. It is **not** bundled into the front-end — all OpenAI calls go through a serverless function (`/api/generate.js`) so your key never reaches the browser.

## File structure

```
meal-plan-generator/
├── api/
│   └── generate.js          # Vercel serverless function (calls OpenAI)
├── src/
│   ├── components/
│   │   ├── MealForm.jsx     # Input form
│   │   ├── MealPlan.jsx     # Day-by-day plan cards
│   │   └── ShoppingList.jsx # Grouped shopping list
│   ├── App.jsx              # Top-level UI / state
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── .env.example             # Copy to .env with your real key
├── .gitignore
└── README.md
```

## Run locally

You need Node.js 18+ installed.

1. Open a terminal in the project folder and install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and paste your **new** OpenAI API key:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env`:

   ```
   OPENAI_API_KEY=sk-your-real-key-here
   OPENAI_MODEL=gpt-4o-mini
   ```

3. To run with the serverless function working locally, install the Vercel CLI and use it:

   ```bash
   npm install -g vercel
   vercel dev
   ```

   That serves both the React app and the `/api/generate` endpoint and reads `.env` automatically. Open http://localhost:3000.

   > If you only run `npm run dev` (plain Vite), the front-end works but `/api/generate` won't exist, so the form will show an error. Use `vercel dev` for end-to-end local testing.

## Deploy to Vercel

1. Push the project to a GitHub repo.
2. Go to https://vercel.com → **Add New → Project** → import the repo.
3. In the project's **Settings → Environment Variables**, add:
   - `OPENAI_API_KEY` = your real key
   - `OPENAI_MODEL` = `gpt-4o-mini` (optional)
4. Click **Deploy**. Vercel auto-detects Vite and the `/api` folder.

## How it works (quick overview)

1. The user fills out the form in `MealForm.jsx`.
2. `App.jsx` POSTs the form values as JSON to `/api/generate`.
3. `api/generate.js` (Vercel serverless function) builds the structured nutritionist prompt and calls OpenAI's chat completions API with `response_format: { type: "json_object" }` to force a valid JSON response.
4. The function parses the JSON and returns it to the front-end.
5. `MealPlan.jsx` renders the weekly plan and `ShoppingList.jsx` renders the grouped shopping list (if requested).

## Tweaks you might want later

- Swap `gpt-4o-mini` for `gpt-4o` for higher-quality plans (more expensive).
- Add a "Download as PDF" button.
- Persist the last plan in `localStorage` so refreshes don't wipe it.
- Add a per-day calorie/macro chart.

Keep it simple though — this is an MVP.
