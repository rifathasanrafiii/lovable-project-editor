
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create stores table (each user can have multiple stores)
CREATE TABLE public.stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  domain TEXT UNIQUE,
  theme_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.stores NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, slug)
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.stores NOT NULL,
  category_id UUID REFERENCES public.categories,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  sku TEXT,
  barcode TEXT,
  track_quantity BOOLEAN DEFAULT true,
  quantity INTEGER DEFAULT 0,
  allow_backorder BOOLEAN DEFAULT false,
  weight DECIMAL(8,2),
  requires_shipping BOOLEAN DEFAULT true,
  is_digital BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  images JSONB DEFAULT '[]',
  variants JSONB DEFAULT '[]',
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, slug)
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.stores NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  accepts_marketing BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, email)
);

-- Create customer addresses table
CREATE TABLE public.customer_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  address1 TEXT NOT NULL,
  address2 TEXT,
  city TEXT NOT NULL,
  province TEXT,
  country TEXT NOT NULL,
  zip TEXT NOT NULL,
  phone TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.stores NOT NULL,
  customer_id UUID REFERENCES public.customers,
  order_number TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  financial_status TEXT DEFAULT 'pending',
  fulfillment_status TEXT DEFAULT 'unfulfilled',
  subtotal_price DECIMAL(10,2) NOT NULL,
  total_tax DECIMAL(10,2) DEFAULT 0,
  total_discounts DECIMAL(10,2) DEFAULT 0,
  total_shipping DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_address JSONB,
  shipping_address JSONB,
  note TEXT,
  tags TEXT[],
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, order_number)
);

-- Create order line items table
CREATE TABLE public.order_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders NOT NULL,
  product_id UUID REFERENCES public.products,
  variant_id TEXT,
  title TEXT NOT NULL,
  sku TEXT,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  total_discount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create discount codes table
CREATE TABLE public.discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.stores NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL, -- 'percentage' or 'fixed_amount'
  value DECIMAL(10,2) NOT NULL,
  minimum_amount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, code)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stores
CREATE POLICY "Users can view own stores" ON public.stores FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own stores" ON public.stores FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own stores" ON public.stores FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own stores" ON public.stores FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for categories (users can only access categories from their stores)
CREATE POLICY "Users can view own store categories" ON public.categories FOR SELECT 
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own store categories" ON public.categories FOR INSERT 
  WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own store categories" ON public.categories FOR UPDATE 
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own store categories" ON public.categories FOR DELETE 
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

-- RLS Policies for products
CREATE POLICY "Users can view own store products" ON public.products FOR SELECT 
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own store products" ON public.products FOR INSERT 
  WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own store products" ON public.products FOR UPDATE 
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own store products" ON public.products FOR DELETE 
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

-- RLS Policies for customers
CREATE POLICY "Users can view own store customers" ON public.customers FOR SELECT 
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own store customers" ON public.customers FOR INSERT 
  WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own store customers" ON public.customers FOR UPDATE 
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

-- RLS Policies for customer addresses
CREATE POLICY "Users can view own store customer addresses" ON public.customer_addresses FOR SELECT 
  USING (customer_id IN (SELECT id FROM public.customers WHERE store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())));
CREATE POLICY "Users can insert own store customer addresses" ON public.customer_addresses FOR INSERT 
  WITH CHECK (customer_id IN (SELECT id FROM public.customers WHERE store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())));
CREATE POLICY "Users can update own store customer addresses" ON public.customer_addresses FOR UPDATE 
  USING (customer_id IN (SELECT id FROM public.customers WHERE store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())));

-- RLS Policies for orders
CREATE POLICY "Users can view own store orders" ON public.orders FOR SELECT 
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own store orders" ON public.orders FOR INSERT 
  WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own store orders" ON public.orders FOR UPDATE 
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

-- RLS Policies for order line items
CREATE POLICY "Users can view own store order items" ON public.order_line_items FOR SELECT 
  USING (order_id IN (SELECT id FROM public.orders WHERE store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())));
CREATE POLICY "Users can insert own store order items" ON public.order_line_items FOR INSERT 
  WITH CHECK (order_id IN (SELECT id FROM public.orders WHERE store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())));

-- RLS Policies for discount codes
CREATE POLICY "Users can view own store discounts" ON public.discount_codes FOR SELECT 
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own store discounts" ON public.discount_codes FOR INSERT 
  WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own store discounts" ON public.discount_codes FOR UPDATE 
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own store discounts" ON public.discount_codes FOR DELETE 
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_stores_user_id ON public.stores(user_id);
CREATE INDEX idx_stores_slug ON public.stores(slug);
CREATE INDEX idx_categories_store_id ON public.categories(store_id);
CREATE INDEX idx_products_store_id ON public.products(store_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_customers_store_id ON public.customers(store_id);
CREATE INDEX idx_orders_store_id ON public.orders(store_id);
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_order_line_items_order_id ON public.order_line_items(order_id);
CREATE INDEX idx_discount_codes_store_id ON public.discount_codes(store_id);

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN '#' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
