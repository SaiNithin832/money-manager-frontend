# Money Manager Frontend

React + Vite + Tailwind CSS frontend for the Money Manager web application.

## Tech Stack

- React 18, React Router
- Vite, Tailwind CSS

## Project Deploy Link:
https://moneymanagementguvi.netlify.app/

--
## Setup

1. Create `.env` (optional):
   - `VITE_API_URL` – Backend API base URL (e.g. `http://localhost:5000/api`). If omitted, uses `/api` with Vite proxy.

2. Install and run:

```bash
npm install
# If you see peer dependency errors: npm install --legacy-peer-deps
npm run dev
```

Open http://localhost:3000. Ensure the backend is running on port 5000 (or set `VITE_API_URL`).

## Build

```bash
npm run build
```

Output is in `dist/`. Deploy to Netlify, Vercel, or any static host. Set `VITE_API_URL` to your deployed backend URL before building.

## Features

- **Dashboard:** Monthly / Weekly / Yearly income, expense, balance and history; edit recent entries (within 12 hours).
- **Add Income / Expense:** Modal with Income / Expense tabs; amount, date/time, description, category, division, account.
- **Filters:** By category, division, and date range.
- **Category Summary:** Total spent per category (with optional date range).
- **Account Transactions:** View balances (Cash, Bank, Wallet); transfer between accounts.
