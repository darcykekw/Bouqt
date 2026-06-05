-- ============================================================
-- Bouqt Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

-- Bouquets table
create table if not exists public.bouquets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  photo_url text,
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

-- Orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  bouquet_id uuid not null references public.bouquets(id) on delete restrict,
  quantity int not null check (quantity >= 1),
  note text,
  fulfillment text not null default 'pickup' check (fulfillment in ('pickup', 'delivery')),
  delivery_address text,
  delivery_fee numeric(10,2) not null default 0 check (delivery_fee >= 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.bouquets enable row level security;
alter table public.orders enable row level security;

-- Profiles: users can read and update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Allow service role to manage profiles
create policy "Service role manages profiles"
  on public.profiles for all
  using (auth.role() = 'service_role');

-- Bouquets: anyone can read available bouquets
create policy "Anyone can read available bouquets"
  on public.bouquets for select
  using (true);

-- Only service role can insert/update/delete bouquets
create policy "Service role manages bouquets"
  on public.bouquets for all
  using (auth.role() = 'service_role');

-- Orders: customers can read their own orders
create policy "Customers read own orders"
  on public.orders for select
  using (auth.uid() = customer_id);

-- Customers can insert their own orders
create policy "Customers create own orders"
  on public.orders for insert
  with check (auth.uid() = customer_id);

-- Service role can do everything on orders (for admin actions)
create policy "Service role manages orders"
  on public.orders for all
  using (auth.role() = 'service_role');

-- ============================================================
-- Auto-create profile on signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce((new.raw_app_meta_data->>'role')::text, 'customer')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Storage bucket setup (run manually in Supabase dashboard
-- or via storage API — included here for reference)
-- ============================================================
-- Create a public bucket named "bouquet-photos" in your
-- Supabase Storage dashboard with public access enabled.

-- ============================================================
-- Sample data (optional)
-- ============================================================
insert into public.bouquets (name, description, price, stock_quantity, is_available)
values
  (
    'Sunrise Garden',
    'A bright mix of sunflowers, yellow roses, and baby''s breath. Like waking up to golden light.',
    850.00, 12, true
  ),
  (
    'Soft Blush Romance',
    'Blush peonies, dusty pink roses, and eucalyptus. Made for the moments that feel like poetry.',
    1200.00, 8, true
  ),
  (
    'Purple Dream',
    'Lavender, purple lisianthus, and white freesia. Fresh, calming, and absolutely stunning.',
    950.00, 6, true
  ),
  (
    'Classic Red Elegance',
    'Twelve red roses wrapped with care. Because some feelings are best said with red.',
    1100.00, 15, true
  ),
  (
    'Wildflower Joy',
    'Chamomile, daisies, and seasonal blooms. A little bit wild, a whole lot of happy.',
    750.00, 10, true
  ),
  (
    'White Wedding',
    'White lilies, ivory roses, and delicate greenery. Pure, clean, and timelessly beautiful.',
    1350.00, 5, true
  )
on conflict do nothing;
