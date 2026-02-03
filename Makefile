# Development
.PHONY: dev build start lint
dev:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

# Stripe webhook listener (run in separate terminal)
.PHONY: stripe-listen
stripe-listen:
	stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Supabase Local
.PHONY: db-start db-stop db-push db-reset db-status db-studio
db-start:
	supabase start

db-stop:
	supabase stop

db-push:
	supabase db push

db-reset:
	supabase db reset

db-status:
	supabase migration list

db-studio:
	@echo "Opening Supabase Studio at http://127.0.0.1:54323"
	@xdg-open http://127.0.0.1:54323 2>/dev/null || open http://127.0.0.1:54323 2>/dev/null || echo "Open http://127.0.0.1:54323 in your browser"

# Make user admin (usage: make admin EMAIL=user@example.com)
.PHONY: admin
admin:
	@if [ -z "$(EMAIL)" ]; then echo "Usage: make admin EMAIL=user@example.com"; exit 1; fi
	supabase db execute "UPDATE profiles SET is_admin = true WHERE id = (SELECT id FROM auth.users WHERE email = '$(EMAIL)')"

# Install dependencies
.PHONY: install
install:
	npm install

# Setup (first time)
.PHONY: setup
setup: install
	cp -n .env.local.example .env.local || true
	@echo "Edit .env.local with your keys, then run: make db-push"
