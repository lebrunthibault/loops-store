-- Create genres table
create table public.genres (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz default now()
);

-- Create loops table
create table public.loops (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  genre_id uuid references public.genres(id) on delete set null,
  bpm int not null check (bpm > 0 and bpm <= 300),
  key text not null,
  duration int not null check (duration > 0),
  price int not null check (price >= 0),
  audio_url text not null,
  preview_url text not null,
  created_at timestamptz default now()
);

-- Create profiles table (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Create purchases table
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  loop_id uuid not null references public.loops(id) on delete cascade,
  stripe_session_id text not null unique,
  created_at timestamptz default now()
);

-- Create indexes
create index loops_genre_id_idx on public.loops(genre_id);
create index loops_bpm_idx on public.loops(bpm);
create index loops_key_idx on public.loops(key);
create index purchases_user_id_idx on public.purchases(user_id);
create index purchases_loop_id_idx on public.purchases(loop_id);

-- Enable Row Level Security
alter table public.genres enable row level security;
alter table public.loops enable row level security;
alter table public.profiles enable row level security;
alter table public.purchases enable row level security;

-- Genres policies (public read, admin write)
create policy "Genres are viewable by everyone"
  on public.genres for select
  using (true);

create policy "Genres are insertable by admins"
  on public.genres for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Genres are updatable by admins"
  on public.genres for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Genres are deletable by admins"
  on public.genres for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Loops policies (public read, admin write)
create policy "Loops are viewable by everyone"
  on public.loops for select
  using (true);

create policy "Loops are insertable by admins"
  on public.loops for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Loops are updatable by admins"
  on public.loops for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Loops are deletable by admins"
  on public.loops for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Purchases policies
create policy "Users can view their own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

create policy "Purchases are insertable by service role only"
  on public.purchases for insert
  with check (false);

-- Function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert some default genres
insert into public.genres (name, slug) values
  ('Lo-Fi', 'lo-fi'),
  ('Jazz', 'jazz'),
  ('Classical', 'classical'),
  ('Hip-Hop', 'hip-hop'),
  ('Ambient', 'ambient'),
  ('Soul', 'soul'),
  ('R&B', 'rnb'),
  ('Pop', 'pop');
