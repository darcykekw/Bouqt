-- ============================================================
-- Bouqt Migration v2
-- Adds: order_items, profile columns, realtime enable
-- ============================================================

-- 1. Update profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS saved_address text;

-- 2. Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  bouquet_id uuid NOT NULL REFERENCES public.bouquets(id) ON DELETE RESTRICT,
  quantity int NOT NULL CHECK (quantity >= 1),
  note text,
  price_snapshot numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Migrate any existing orders into order_items
INSERT INTO public.order_items (order_id, bouquet_id, quantity, note, price_snapshot)
SELECT
  o.id,
  o.bouquet_id,
  o.quantity,
  o.note,
  COALESCE(b.price, 0)
FROM public.orders o
JOIN public.bouquets b ON b.id = o.bouquet_id
WHERE o.bouquet_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 4. Drop old columns from orders
ALTER TABLE public.orders DROP COLUMN IF EXISTS bouquet_id;
ALTER TABLE public.orders DROP COLUMN IF EXISTS quantity;
ALTER TABLE public.orders DROP COLUMN IF EXISTS note;

-- 5. RLS for order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers read own order items"
  ON public.order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE customer_id = auth.uid()
    )
  );

CREATE POLICY "Customers create own order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders WHERE customer_id = auth.uid()
    )
  );

CREATE POLICY "Service role manages order items"
  ON public.order_items FOR ALL
  USING (auth.role() = 'service_role');

-- 6. Enable Realtime on orders table
-- (Run in Supabase Dashboard → Realtime → Tables → enable "orders")
-- The following enables it via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
