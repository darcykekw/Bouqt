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


