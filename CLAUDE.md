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
make dev             # Dev server
make build           # Build production
make lint            # ESLint
make db-start        # Démarrer Supabase local (Docker)
make db-stop         # Arrêter Supabase local
make db-reset        # Reset DB avec migrations
make db-studio       # Ouvrir Supabase Studio local
make stripe-listen   # Webhook listener Stripe
make admin EMAIL=x   # Rendre un user admin
```

## Environnements

### Développement (local)
- Supabase local via Docker (`make db-start`)
- Variables dans `.env.local` (credentials locaux)
- Studio: http://127.0.0.1:54323

### Production (Vercel)
- Supabase Cloud (projet: sjqcpuqzyjvtapclrahd)
- Variables d'environnement configurées sur Vercel
- URL: https://loops-store.vercel.app

## Variables d'Environnement
Voir `.env.example` pour le template. En local, utiliser les credentials de `supabase status`.

## Notes Techniques
- Les clients Supabase sont lazy-loaded pour éviter les erreurs SSR
- `getStripe()` au lieu d'un export direct pour éviter erreur build
- Preview audio généré server-side via `/api/admin/preview` (ffmpeg)
- Auth par Magic Link (Supabase Auth)
