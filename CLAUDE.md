# Loops - Piano Audio Marketplace

## Stack
- **Framework**: Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- **API**: tRPC v11 + React Query
- **Database/Auth/Storage**: Supabase
- **Payments**: Stripe
- **UI**: shadcn/ui (dark theme)
- **Audio**: fluent-ffmpeg pour génération des previews

## Structure Clé
```
src/
├── app/                    # Pages Next.js App Router
├── server/
│   ├── trpc.ts            # Init tRPC + context + procedures (public/protected/admin)
│   └── routers/           # loops, genres, purchases, admin
├── lib/
│   ├── supabase/          # client.ts, server.ts, admin.ts
│   ├── stripe.ts          # getStripe() - lazy loaded
│   └── database.types.ts  # Types Supabase
├── components/            # UI components
└── hooks/                 # use-auth, use-audio-player, use-filters
```

## Base de Données (Supabase)
- `genres` - id, name, slug
- `loops` - id, title, genre_id, bpm, key, duration, price (cents), audio_url, preview_url
- `profiles` - id (FK auth.users), is_admin
- `purchases` - id, user_id, loop_id, stripe_session_id

## Storage Buckets
- `loops-full` - Audio complet (privé, accès après achat)
- `loops-preview` - Previews 30s (public)

## Commandes
```bash
npm run dev          # Dev server
npm run build        # Build production
supabase start       # Supabase local
supabase db reset    # Appliquer migrations
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Variables d'Environnement (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Notes Techniques
- Les clients Supabase sont lazy-loaded pour éviter les erreurs SSR
- `getStripe()` au lieu d'un export direct pour éviter erreur build
- Preview audio généré server-side via `/api/admin/preview` (ffmpeg)
- Auth par Magic Link (Supabase Auth)
