# ShopKart

A full-stack shopping application with a React/Vite client and an Express/MongoDB API. The API supports customer accounts, products, cart, wishlist, orders, and Razorpay checkout.

## Project layout

- `Client/vite-project/` — React 19, Vite, Tailwind CSS client
- `Server/` — Express API, MongoDB models, authentication, and Razorpay integration
- `package.json` — API start script and server dependencies

## Run locally

1. Install the API dependencies from the repository root: `npm install`.
2. Copy `Server/.env.example` to `Server/.env` and set `dbUrl`, a private `JWT_SECRET`, and Razorpay credentials if using checkout.
3. Start the API: `npm start` (or `npm run dev` for reloads).
4. In `Client/vite-project/`, run `npm install`, copy `.env.example` to `.env`, and set `VITE_API_BASE_URL=http://localhost:8000`.
5. Start the client from `Client/vite-project/` with `npm run dev`.

## Deploy

The included `render.yaml` deploys the API and built client together as a single Render web service. In Render, create a Blueprint from this repository and provide the prompted `dbUrl`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` values. The client is built with a same-origin API URL, and Express serves the built client alongside the API.

Do not commit `.env` files or put secret values in frontend variables. Vite variables are included in the public client bundle; only the Razorpay public key ID belongs in browser code, while the key secret stays on the API.
