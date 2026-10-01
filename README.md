# `Taskier` - Tasks Management App

This project involves producing Collaborative app for managing projects and reach new productivity peaks. From startups to home office, the way team works and how they organize tasks, these can all be accomplished with Taskier

## Requirements

- Node.js >= 18.18 (20 LTS recommended)
- A MongoDB database (Prisma uses the MongoDB connector)
- Accounts for [Clerk](https://clerk.com) (with Organizations enabled), [Stripe](https://stripe.com) and [Unsplash](https://unsplash.com/developers)

## Getting Started

1. Clone the project and install dependencies

   ```bash
   git clone <repo link>
   cd tasks-tracker
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in every value

   | Variable                                                                                             | Where to get it                                                               |
   | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`                                              | Clerk dashboard → API keys                                                    |
   | `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`                                     | Keep the defaults (`/sign-in`, `/sign-up`)                                    |
   | `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Keep the default (`/`)                                                        |
   | `DATABASE_URL`                                                                                       | Your MongoDB connection string                                                |
   | `UNSPLASH_ACCESS_KEY`                                                                                | Unsplash developer dashboard (server-side only, never exposed to the browser) |
   | `STRIPE_API_KEY`                                                                                     | Stripe dashboard → Developers → API keys (secret key)                         |
   | `STRIPE_WEBHOOK_SECRET`                                                                              | Stripe webhook endpoint signing secret (see below)                            |
   | `NEXT_PUBLIC_APP_URL`                                                                                | Public URL of the app, e.g. `http://localhost:3000`                           |

3. Push the Prisma schema to your database and start the dev server

   ```bash
   npx prisma db push
   npm run dev
   ```

### Stripe webhooks

Point a Stripe webhook at `/api/webhook` with the `checkout.session.completed` and `invoice.payment_succeeded` events. Locally, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

and use the signing secret it prints as `STRIPE_WEBHOOK_SECRET`.

## Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the development server         |
| `npm run build`     | Generate the Prisma client and build |
| `npm run start`     | Start the production server          |
| `npm run lint`      | Lint the project                     |
| `npm run typecheck` | Type-check the project               |

CI (`.github/workflows/ci.yml`) runs type-checking, linting, a production build and `npm audit` on every push and pull request.

## Technologies used

- [Next.js](https://nextjs.org/docs) 15 (App Router, Server Actions) with React 19
- [Clerk](https://clerk.com/docs) - authentication, authorization and organization management
- [Prisma](https://prisma.io) with MongoDB
- [Stripe](https://stripe.com/docs) - Pro subscriptions
- [shadcn/ui](https://ui.shadcn.com) and Tailwind CSS - components and styling

## Deployment

The project has live demo deployed on [`Vercel Platform`](https://vercel.com) who are the creators of Next.js.

Check out our live demo [`Taskier website`](https://taskier.vercel.app) for the visual design.
