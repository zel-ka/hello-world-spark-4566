
-- Products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name_en text NOT NULL,
  name_sw text NOT NULL,
  desc_en text NOT NULL DEFAULT '',
  desc_sw text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  rating numeric NOT NULL DEFAULT 4.5,
  badge text,
  emoji text NOT NULL DEFAULT '📦',
  stock integer NOT NULL DEFAULT 100,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (active = true);

CREATE POLICY "Admins manage products" ON public.products
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  subtotal numeric NOT NULL DEFAULT 0,
  shipping numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  customer_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON public.orders
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update orders" ON public.orders
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Order items
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own order items" ON public.order_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid()));
CREATE POLICY "Users create own order items" ON public.order_items
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid()));
CREATE POLICY "Admins view all order items" ON public.order_items
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed products
INSERT INTO public.products (category, name_en, name_sw, desc_en, desc_sw, price, rating, badge, emoji) VALUES
('exercise','Skipping Rope Pro','Kamba ya Kurukia','Adjustable speed rope for cardio.','Kamba ya kurekebisha kwa mazoezi ya moyo.',18000,4.7,'best','🪢'),
('exercise','Dumbbells Set 10kg','Dumbbells Seti 10kg','Pair of rubber dumbbells.','Jozi ya dumbbells za mpira.',95000,4.8,NULL,'🏋️'),
('exercise','Yoga Mat Premium','Mkeka wa Yoga','Non-slip 6mm exercise mat.','Mkeka wa mazoezi 6mm.',35000,4.6,NULL,'🧘'),
('health','Digital BP Machine','Mashine ya Presha','Accurate upper-arm BP monitor.','Kipima presha cha mkono cha kisasa.',145000,4.9,'best','🩺'),
('health','Glucometer Kit','Kipima Sukari','Blood sugar monitor + 50 strips.','Kipima sukari + vipande 50.',78000,4.7,NULL,'💉'),
('health','Smart Body Scale','Mizani ya Mwili','BMI, body fat, muscle mass.','Hupima BMI, mafuta, na misuli.',62000,4.5,'new','⚖️'),
('health','Pulse Oximeter','Kipima Oksijeni','SpO2 + heart rate fingertip.','Hupima oksijeni na mapigo.',28000,4.6,NULL,'🫁'),
('sleep','Silk Eye Mask','Kifuniko cha Macho','Soft sleep mask for deep rest.','Kifuniko laini cha kulala vizuri.',12000,4.4,NULL,'😴'),
('sleep','White Noise Machine','Mashine ya Sauti','20 calming sounds for sleep.','Sauti 20 za utulivu kwa usingizi.',85000,4.7,'deal','🎵'),
('stress','Aromatherapy Diffuser','Diffuser ya Harufu','Essential oil mist for calm.','Inazalisha harufu za kutuliza.',55000,4.6,NULL,'🌿'),
('stress','Stress Relief Puzzle','Mchezo wa Kupunguza Msongo','Brain games for relaxation.','Michezo ya akili kwa utulivu.',22000,4.3,NULL,'🧩'),
('air','HEPA Air Purifier','Kisafishaji Hewa','Removes 99.97% of allergens.','Husafisha 99.97% ya vumbi.',280000,4.8,'best','🌬️'),
('productivity','Focus Timer Cube','Saa ya Umakini','Pomodoro productivity timer.','Saa ya kuongeza umakini.',32000,4.5,NULL,'⏱️'),
('productivity','Blue Light Glasses','Miwani ya Kompyuta','Reduce eye strain at screens.','Hupunguza uchovu wa macho.',38000,4.4,'new','👓');
