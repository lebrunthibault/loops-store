# Loops

Marketplace de loops piano pour la production musicale. Achetez et téléchargez des boucles audio de haute qualité.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- tRPC v11 + React Query
- Supabase (Auth, Database, Storage)
- Stripe (Payments)
- shadcn/ui

## Getting Started

```bash
make install
cp .env.local.example .env.local  # Edit with your keys
make dev
```

## Commands

```bash
make dev            # Start dev server
make build          # Build for production
make stripe-listen  # Start Stripe webhook listener
make db-reset       # Reset database with migrations
make admin EMAIL=x  # Make a user admin
```

## CI/CD

GitHub Actions runs lint on every push/PR and deploys to Vercel on `main`.

Required secrets in GitHub:
- `VERCEL_TOKEN` - From https://vercel.com/account/tokens
