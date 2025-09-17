# AnonStay

AnonStay is a full-stack accommodation marketplace that connects guests with property owners. The project combines a Node.js/Express API with a modern React front end to support hotel onboarding, room management, bookings with digital payments, and automated guest communications.

## Repository structure

```
.
├── backend/   # Express API, MongoDB models, payment/webhook logic and schedulers
├── frontend/  # React + Vite single-page application for guests and property owners
└── package-lock.json
```

## Features

- **Authentication & roles** – Secure user registration, login, logout, profile updates, and role checks for guests and owners using JWT cookies.【F:backend/controllers/user.controller.js†L1-L118】【F:backend/routes/user.routes.js†L1-L15】
- **Hotel & room management** – CRUD endpoints backed by MongoDB models so owners can register hotels, create rooms, and manage availability and pricing (including discounts).【F:backend/models/hotel.model.js†L1-L18】【F:backend/controllers/booking.controller.js†L41-L111】
- **Booking workflow** – Availability checks, booking creation, loyalty points, and price calculations with optional discounts for returning guests.【F:backend/controllers/booking.controller.js†L41-L119】【F:backend/controllers/booking.controller.js†L137-L227】
- **Payments** – Paystack integration for initializing payments and verifying transactions via secure API calls.【F:backend/index.js†L26-L33】【F:backend/controllers/booking.controller.js†L296-L353】
- **Email notifications & automation** – Nodemailer-based transactional emails plus a cron-driven scheduler that auto-confirms, expires, or locks bookings while notifying guests and awarding loyalty points.【F:backend/config/nodemailer.js†L1-L13】【F:backend/services/bookingScheduler.js†L1-L112】
- **Responsive UI** – React + Vite front end with Tailwind CSS, React Router, context providers, and dedicated portals for guests and property owners.【F:frontend/src/pages/Home.jsx†L1-L20】【F:frontend/src/pages/owner/OwnerLayout.jsx†L1-L67】

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- MongoDB instance (local or hosted)
- Paystack account (public and secret keys)
- Cloudinary account for media uploads
- SMTP provider for transactional email (credentials and sender address)

## Environment variables

Create a `.env` file inside the `backend/` directory with the following keys:

| Variable | Description |
| --- | --- |
| `PORT` | Port the Express server should listen on (defaults to `5000`). |
| `MONGO_URI` | MongoDB connection string. |
| `JWT_SECRET` | Secret string used to sign authentication tokens. |
| `FRONTEND_URL` | Base URL of the deployed front end for use in callbacks and emails. |
| `PAYSTACK_PUBLIC_KEY` | Paystack publishable key exposed to the front end. |
| `PAYSTACK_SECRET_KEY` | Paystack secret key used to authorize payment requests. |
| `CURRENCY` | Currency symbol used in pricing emails (for example `₦`). |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for media uploads. |
| `CLOUDINARY_API_KEY` | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret. |
| `SMTP_HOST` | SMTP host for sending emails. |
| `SMTP_USERNAME` | SMTP username. |
| `SMTP_PASSWORD` | SMTP password. |
| `SENDER_EMAIL` | Email address that appears in outgoing messages. |

> Tip: never commit your `.env` file to version control. Use local secrets for development and your deployment platform's secret manager in production.

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/AnonStay.git
   cd AnonStay
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

## Running the project

In separate terminals:

- **Start the API**
  ```bash
  cd backend
  npm run start
  ```
  The server listens on `http://localhost:5000` by default. Use `npm run server` if you have `nodemon` installed globally and prefer automatic restarts during development.

- **Start the front end**
  ```bash
  cd frontend
  npm run dev
  ```
  Vite serves the client at `http://localhost:5173` and proxies API requests to the backend URL configured in your environment variables or Axios client.

## Scripts & tooling

- **Backend**
  - `npm run start` – Start the Express server.
  - `npm run server` – Start the server with `nodemon` (hot reload).
  - `npm run test` – Execute Node.js tests.
  - `npm run migrate-images` – Move local uploads to Cloudinary via the provided script.【F:backend/package.json†L6-L12】【F:backend/scripts/migrateUploadsToCloudinary.js†L1-L64】

- **Frontend**
  - `npm run dev` – Launch Vite in development mode.
  - `npm run build` – Produce a production build.
  - `npm run preview` – Preview the production build.
  - `npm run lint` – Run ESLint against the React codebase.【F:frontend/package.json†L6-L28】

## Testing

- Backend tests use Node's test runner (`npm run test`).
- Frontend linting is provided via ESLint (`npm run lint`). Run both in CI to catch regressions before deployment.

## Deployment notes

- Ensure all environment variables are configured on your hosting platform.
- Update the `cors` whitelist in `backend/index.js` if you deploy to a new domain.【F:backend/index.js†L16-L24】
- Configure your DNS and SSL certificates to match the frontend's deployed URL specified in the `.env` file.

## Contributing

1. Fork the repository and create a feature branch from `work`.
2. Make your changes with clear, well-tested commits.
3. Run backend tests and frontend linting before opening a pull request.
4. Submit a PR describing your change and referencing relevant issues.

## License

This project is licensed under the ISC License as defined in the package metadata. See the `package.json` files for details.【F:backend/package.json†L1-L22】
