create table categories (id serial primary key, slug text unique not null, name text not null);
create table products (
  id uuid primary key default gen_random_uuid(), slug text unique not null, sku text unique not null,
  name text not null, description text, fabric text, occasion text, category_id int references categories(id),
  price_inr int not null, mrp_inr int not null, images text[] default '{}', is_active boolean default true,
  created_at timestamptz default now());
create table variants (
  id uuid primary key default gen_random_uuid(), product_id uuid references products(id) on delete cascade,
  size text not null check (size in ('XS','S','M','L','XL','XXL')), color text not null, stock int not null default 0);
create table coupons (code text primary key, percent_off int, flat_off_inr int, min_order_inr int default 0, active boolean default true);
create table orders (
  id uuid primary key default gen_random_uuid(), order_no text unique not null, user_id uuid references auth.users(id),
  email text not null, phone text, address jsonb not null, subtotal_inr int, discount_inr int, shipping_inr int, total_inr int,
  status text not null default 'placed' check (status in ('placed','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','return_requested','refunded')),
  razorpay_order_id text, razorpay_payment_id text, paid boolean default false, created_at timestamptz default now());
create table order_items (id uuid primary key default gen_random_uuid(), order_id uuid references orders(id) on delete cascade,
  variant_id uuid references variants(id), name text, size text, color text, qty int, unit_price_inr int);
create table wishlist (user_id uuid references auth.users(id), product_id uuid references products(id), primary key (user_id, product_id));
alter table categories enable row level security; alter table products enable row level security;
alter table variants enable row level security; alter table orders enable row level security;
alter table order_items enable row level security; alter table wishlist enable row level security; alter table coupons enable row level security;
create policy "public read categories" on categories for select using (true);
create policy "public read products" on products for select using (is_active);
create policy "public read variants" on variants for select using (true);
create policy "own orders" on orders for select using (auth.uid() = user_id);
create policy "own order items" on order_items for select using (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "own wishlist" on wishlist for all using (auth.uid() = user_id);
-- Writes to orders/coupons happen only via server routes using the service role key.
insert into categories (slug,name) values ('kurtis','Kurtis'),('dresses','Dresses'),('ethnic-wear','Ethnic Wear'),('co-ord-sets','Co-Ord Sets');
insert into products (slug,sku,name,description,fabric,occasion,category_id,price_inr,mrp_inr) values
('meher-anarkali-kurti','TEV-001','Meher Anarkali Kurti','Flared Anarkali in soft chanderi with gold zari trim.','Chanderi','festive',1,2499,3499),
('ishani-straight-kurti','TEV-002','Ishani Straight Kurti','Everyday straight kurti in breathable cotton.','Cotton','casual',1,1299,1799),
('noor-coord-set','TEV-003','Noor Co-Ord Set','Block-print kurta and trousers set.','Rayon','office',4,2199,2999),
('saanvi-ethnic-dress','TEV-004','Saanvi Ethnic Dress','A-line dress with burgundy embroidery.','Georgette','party',2,2899,3999);
insert into variants (product_id,size,color,stock) select p.id,s,c,10 from products p, unnest(array['XS','S','M','L','XL','XXL']) s, unnest(array['Burgundy','Ivory']) c;
insert into coupons (code,percent_off,min_order_inr) values ('WELCOME10',10,999);
create or replace function decrement_stock(vid uuid, n int) returns void language sql security definer as
$$ update variants set stock = greatest(stock - n, 0) where id = vid $$;
revoke all on function decrement_stock from public, anon, authenticated;
