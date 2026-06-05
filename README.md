# Bouqt

A full-stack flower shop web application built with Next.js 16 and Supabase. Customers can browse bouquets, place pickup or delivery orders, and track their order status in real time. Admins can manage orders, bouquets, and stock through a dedicated dashboard.

## Features

**Customer**
- Browse and search bouquets by name and price
- Add to cart with quantity and custom note per item
- Pickup or delivery checkout with address saving
- Real-time order status tracking (pending → confirmed)
- Order history with soft delete (hides from view, preserves admin data)
- Downloadable and printable receipt

**Admin**
- Dashboard with revenue chart, top sellers, and order stats
- Pending orders highlighted and sorted to top
- Confirm or cancel orders with inline confirmation
- Real-time toast notification on new orders
- Bouquet management (create, edit, delete, toggle availability)
- Mobile-friendly card view alongside desktop table

**General**
- Authentication (email/password) via Supabase Auth
- Role-based access control (customer / admin)
- Framer Motion page transitions and animations
- Fully responsive layout

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Database & Auth | Supabase (PostgreSQL + Row Level Security) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| UI Components | shadcn/ui |
| State | Zustand (cart) |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Installation

```bash
git clone https://github.com/darcykekw/Bouqt.git
cd Bouqt
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `DATABASE_URL` | Direct PostgreSQL connection string |
| `NEXT_PUBLIC_SITE_URL` | Base URL e.g. `http://localhost:3000` |

### Database Setup

Run the SQL files in order against your Supabase project (SQL Editor):

1. `supabase/schema.sql` — base schema, RLS policies, triggers
2. `supabase/migration_v2.sql` — order items table and additional columns

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Admin Account

Create a user via the register page, then update the profile role in Supabase:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
```

## Project Structure

```
src/
├── app/                  # Next.js App Router pages and server actions
│   ├── admin/            # Admin dashboard
│   ├── bouquets/         # Catalog and detail pages
│   ├── cart/             # Cart page
│   ├── orders/           # Order history and tracking
│   └── actions.ts        # Server actions
├── components/           # Shared UI components
│   ├── admin/            # Admin-specific components
│   ├── cart/             # Cart components
│   └── ui/               # Base UI components (shadcn)
└── lib/
    ├── store/            # Zustand cart store
    ├── supabase/         # Supabase client helpers
    ├── types.ts          # Shared TypeScript types
    └── validation.ts     # Input validation helpers
```

## License

MIT
