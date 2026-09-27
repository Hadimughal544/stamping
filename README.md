# e-Stamp Demo

A learning project: a stamp-vendor portal built with Next.js 15 and Neon Postgres. It is **not affiliated with any government body**, and printouts are watermarked "SPECIMEN – NOT A LEGAL DOCUMENT".

Working features:
- Vendor login, with one active session per user
- Low Denomination Stamp Issuance (applicant/agent details → OTP contact verification → confirmation). Serials like `ES-LHR-482917365` are generated automatically: when the vendor enters a denomination, stock is topped up to 50 random serials to pick from.
- Verify/Re-print Issued Stamp, with a printable specimen

The other dashboard tiles are UI only.

## Setup

1. Create a project at [neon.com](https://neon.com) and copy the **pooled** connection string.
2. `cp .env.example .env.local`, then fill in `DATABASE_URL` and `AUTH_SECRET`.
3. Install and prepare the database:
   ```bash
   npm install
   npm run db:push   # create tables
   npm run db:seed   # demo vendor and purposes
   ```
4. `npm run dev` and open http://localhost:3000
5. Log in as **demo.vendor** / **Demo@123**

## OTP in development
No SMS is sent. The code is printed in the server console and shown in a toast in the browser. To use a real gateway, replace `sendSms()` in `src/lib/otp.ts`.

## Scripts
| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run db:push` | Sync `src/db/schema.ts` to Neon |
| `npm run db:seed` | Seed demo data (safe to re-run) |
| `npm run db:studio` | Browse the database |
