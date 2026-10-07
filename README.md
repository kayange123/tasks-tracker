# `Taskier` - Tasks Management App

This project involves producing Collaborative app for managing projects and reach new productivity peaks. From startups to home office, the way team works and how they organize tasks, these can all be accomplished with Taskier

## Requirements

- Node.js >= 18.18 (22 LTS recommended)
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
   | `CRON_SECRET`                                                                                        | Any long random string; Vercel Cron sends it to `/api/cron/purge`             |
   | `CLERK_WEBHOOK_SIGNING_SECRET`                                                                       | Clerk webhook endpoint signing secret (see below)                             |

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

### Clerk webhooks

In the Clerk dashboard (Webhooks → Add endpoint), point an endpoint at `/api/webhooks/clerk` with the `organization.deleted` and `user.deleted` events, and set its signing secret as `CLERK_WEBHOOK_SIGNING_SECRET`. When Clerk deletes an organization, its boards, lists, cards, activity and plan records are removed and its Stripe subscription is cancelled. When Clerk deletes a user, their activity entries are kept but anonymized as "Deleted user".

### Data export and deletion

- **Organization admins** can download an organization's boards, lists, cards and activity as JSON or a CSV zip, and delete the organization, from its Settings page. Deleting cancels any Pro subscription.
- **Everyone** can download their own data and delete their account from Account → Data & privacy. Deletion is blocked while the person is the only admin of an organization with other members; organizations where they're the only member are deleted with the account, and their activity elsewhere is shown as "Deleted user".
- **Operators** can handle requests at `/admin`: find users and organizations, export or delete them, and purge data left by organizations deleted in Clerk. Every export and deletion is recorded. Everyone else gets a 404.

To make someone an operator, open the user in the Clerk dashboard and set their **public metadata** to `{ "role": "admin" }`. Users can't change public metadata themselves. Optionally, add `{ "metadata": "{{user.public_metadata}}" }` to the session token (Sessions → Customize session token) so the role is read from the token instead of fetched from Clerk on each console request; role changes then apply when the token refreshes, within about a minute.

In the Clerk dashboard, consider removing the "Delete organization" permission from the admin role and turning off self-service account deletion, so people use Taskier's flows, which explain what will be removed and check for organizations that would be left without an admin. The Clerk webhook still cleans up after deletions made in Clerk.

### Deleted items

Deleting a card, list or board can be undone from the toast. Deleted items are kept for 7 days, then a daily [Vercel Cron](https://vercel.com/docs/cron-jobs) job (`vercel.json`) removes them for good. Set `CRON_SECRET` in Vercel so only the cron job can call `/api/cron/purge`. Locally you can run it with:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/purge
```

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
