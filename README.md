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

Deploy the API as a Node web service with repository root as its working directory, build command `npm install`, and start command `npm start`. Set these server environment variables in the hosting provider: `dbUrl`, `JWT_SECRET`, `FRONTEND_URL`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET`.

Deploy the client as a static Vite site with root directory `Client/vite-project`, build command `npm install && npm run build`, and output directory `dist`. Set `VITE_API_BASE_URL` to the deployed API's HTTPS origin. Configure the API's `FRONTEND_URL` to the deployed client origin so credentialed requests can pass CORS.

Do not commit `.env` files or put secret values in frontend variables. Vite variables are included in the public client bundle; only the Razorpay public key ID belongs in browser code, while the key secret stays on the API.
