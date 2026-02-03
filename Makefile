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

# Supabase
.PHONY: db-push db-reset db-status
db-push:
	supabase db push

db-reset:
	supabase db reset

db-status:
	supabase migration list

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
