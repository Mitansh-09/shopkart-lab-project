# ShopKart

ShopKart is a full-stack shopping app built with React and Vite, an Express API, and MongoDB. Customers can browse products, create an account, manage a cart and wishlist, place orders, and use Razorpay checkout.

## Live deployments

- Storefront: [shopkart-lab-client.vercel.app](https://shopkart-lab-client.vercel.app)
- API: [shopkart-lab-api.vercel.app](https://shopkart-lab-api.vercel.app)
- Product listing API: [shopkart-lab-api.vercel.app/api/products](https://shopkart-lab-api.vercel.app/api/products)

## Features

- Product catalogue and product detail pages
- Customer registration, login, profile, and logout
- Cart and wishlist management
- Order history and order details
- Razorpay order creation and payment verification
- Cookie-based authentication between the client and API

## Technology

- **Client:** React 19, Vite, React Router, Axios, Tailwind CSS
- **API:** Node.js, Express 5
- **Database:** MongoDB with Mongoose
- **Payments:** Razorpay
- **Hosting:** Vercel

## Repository layout

```text
.
├── Client/vite-project/       # React/Vite storefront
│   ├── src/pages/             # Screens and routes
│   ├── src/components/        # Shared UI components
│   ├── src/context/           # Cart state
│   ├── src/services/api.js    # Axios API client
│   └── vercel.json            # API proxy and SPA fallback
├── Server/
│   ├── Config/                # Razorpay configuration
│   ├── Controllers/           # API handlers
│   ├── Middlewares/           # Authentication middleware
│   ├── Models/                # Mongoose models
│   ├── Routes/                # Express routes
│   ├── app.js                 # Express application
│   └── index.js               # Local development server
├── index.js                  # Vercel API entry point
└── package.json              # API dependencies and scripts
```

## Requirements

- Node.js and npm
- A MongoDB connection string
- Razorpay API keys if you want to use checkout

## Run locally

### 1. Configure the API

From the repository root, install the API dependencies and create the server environment file:

```bash
npm install
cp Server/.env.example Server/.env
```

Set the values in `Server/.env`:

```dotenv
dbUrl=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=<a-long-random-secret>
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=<your-razorpay-key-id>
RAZORPAY_KEY_SECRET=<your-razorpay-key-secret>
```

`dbUrl` and `JWT_SECRET` are required for the API. Razorpay keys are needed for checkout. Keep the key secret on the server.

Start the API on port 8000:

```bash
npm start
```

For automatic restarts while developing, use `npm run dev` instead.

### 2. Configure and start the client

In a second terminal:

```bash
cd Client/vite-project
npm install
cp .env.example .env
```

Set `VITE_API_BASE_URL` in `Client/vite-project/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). The API allows that origin by default; set `FRONTEND_URL` in `Server/.env` if the client runs at a different origin.

## API routes

All API routes are under `/api`. Authenticated routes use the `token` cookie set at login; the client sends credentials with API requests.

| Resource | Routes | Authentication |
| --- | --- | --- |
| Customers | `POST /api/customers/register`, `POST /api/customers/login`, `GET /api/customers/me`, `POST /api/customers/logout` | Register/login are public; profile/logout require login |
| Products | `GET /api/products`, `GET /api/products/:id`, `POST /api/products` | Public |
| Cart | `GET /api/cart`, `POST /api/cart/:productId`, `PATCH /api/cart/:productId`, `DELETE /api/cart/:productId` | Required |
| Wishlist | `GET /api/wishlist`, `POST /api/wishlist/:productId`, `DELETE /api/wishlist/:productId` | Required |
| Orders | `GET /api/orders`, `GET /api/orders/:id`, `POST /api/orders/create-payment-order`, `POST /api/orders/verify-payment` | Required |

Example: `GET https://shopkart-lab-api.vercel.app/api/products` returns the product catalogue.

## Deploy on Vercel

The GitHub repository is connected to two Vercel projects:

### API project

1. Import the repository and set the project root to `./` (the repository root).
2. Select the **Express** framework preset.
3. Add these environment variables for Production and Preview:
   - `dbUrl`
   - `JWT_SECRET`
   - `FRONTEND_URL=https://shopkart-lab-client.vercel.app`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`

### Client project

1. Import the same repository as a separate Vercel project.
2. Set the project root to `Client/vite-project` and use the **Vite** preset.
3. Set `VITE_API_BASE_URL=/api` for Production and Preview.
4. `Client/vite-project/vercel.json` proxies `/api/*` requests to the API project and routes other paths to the SPA entry point.

Pushes to the connected `main` branch trigger deployments. If you change either project’s domain, update the API `FRONTEND_URL` and the API destination in the client `vercel.json` to match.

## Environment variables and secrets

- Never commit `.env` files or real credentials. The repository includes `.env.example` templates.
- Configure server credentials in the API host’s environment settings.
- Variables prefixed with `VITE_` are bundled into the public client. Do not put database credentials, JWT secrets, or `RAZORPAY_KEY_SECRET` in client variables.
- Use Razorpay test keys for testing and production keys only when enabling live payments.
