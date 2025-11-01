-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'în procesare',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create promotions table
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount DECIMAL(5, 2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view products"
ON public.products FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert products"
ON public.products FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update products"
ON public.products FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete products"
ON public.products FOR DELETE
USING (true);

-- Orders policies (public write, admin read)
CREATE POLICY "Anyone can create orders"
ON public.orders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view orders"
ON public.orders FOR SELECT
USING (true);

CREATE POLICY "Anyone can update orders"
ON public.orders FOR UPDATE
USING (true);

-- Promotions policies (public read, admin write)
CREATE POLICY "Anyone can view active promotions"
ON public.promotions FOR SELECT
USING (active = true);

CREATE POLICY "Anyone can manage promotions"
ON public.promotions FOR ALL
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on products
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_featured ON public.products(featured);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_promotions_code ON public.promotions(code);

-- Insert demo products
INSERT INTO public.products (name, description, price, category, stock, featured, notes, image_url) VALUES
('Oud Royale', 'Un parfum luxos cu note intense de oud autentic din Orientul Mijlociu, îmbinat cu trandafir și mosc alb. Perfect pentru ocazii speciale.', 299.99, 'Oud', 50, true, 'Note de vârf: Bergamotă, Portocală\nNote de inimă: Trandafir, Oud\nNote de bază: Mosc alb, Ambră', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800'),
('Amber Nights', 'O compoziție captivantă de ambră caldă și vanilie, cu accente de condimente orientale. Ideal pentru serile de iarnă.', 249.99, 'Ambră', 75, true, 'Note de vârf: Cardamom, Scorțișoară\nNote de inimă: Ambră, Vanilie\nNote de bază: Lemn de santal, Paciuli', 'https://images.unsplash.com/photo-1595425959632-34f49a863d8c?w=800'),
('Desert Rose', 'Un parfum floral-oriental sofisticat cu trandafir de Damasc și iasomie, îmbinat cu note lemnoase calde.', 279.99, 'Floral', 60, true, 'Note de vârf: Bergamotă, Mandarine\nNote de inimă: Trandafir de Damasc, Iasomie\nNote de bază: Lemn de cедru, Paciuli', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800'),
('Musk Al Haramain', 'Un mosc pur și intens, perfect pentru cei care apreciază simplitatea și eleganța aromelor clasice orientale.', 189.99, 'Mosc', 100, false, 'Note de vârf: Lămâie\nNote de inimă: Mosc alb\nNote de bază: Mosc, Ambră', 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800'),
('Saffron Gold', 'O compoziție luxoasă cu șofran preț ios și aur lichid, simbolizând opulența și rafinamentul oriental.', 349.99, 'Oriental', 40, false, 'Note de vârf: Șofran, Iasomie\nNote de inimă: Ambră gri, Lemn de cedru\nNote de bază: Mosc, Fistic', 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800'),
('White Oud', 'O interpretare modernă a oud-ului clasic, cu note proaspete de citrice și mosc alb pentru o experiență mai ușoară.', 269.99, 'Oud', 55, false, 'Note de vârf: Bergamotă, Lămâie\nNote de inimă: Oud alb, Trandafir alb\nNote de bază: Mosc alb, Ambră', 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800');