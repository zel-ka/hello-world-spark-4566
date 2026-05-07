import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, ShoppingCart, Plus, Minus, Trash2, Heart, Star, Package, ShieldCheck, Dumbbell, HeartPulse, Moon, Brain, Wind, ClipboardList, X, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/hooks/useI18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type Product = {
  id: string;
  category: string;
  name_en: string;
  name_sw: string;
  desc_en: string;
  desc_sw: string;
  price: number;
  rating: number;
  badge: string | null;
  emoji: string;
  stock: number;
};

const CATEGORIES = [
  { id: "all", icon: Package, en: "All", sw: "Vyote" },
  { id: "exercise", icon: Dumbbell, en: "Exercise", sw: "Mazoezi" },
  { id: "health", icon: HeartPulse, en: "Health", sw: "Afya" },
  { id: "sleep", icon: Moon, en: "Sleep", sw: "Usingizi" },
  { id: "stress", icon: Brain, en: "Stress", sw: "Msongo" },
  { id: "air", icon: Wind, en: "Air", sw: "Hewa" },
  { id: "productivity", icon: ClipboardList, en: "Productivity", sw: "Productivity" },
];

type CartItem = { id: string; qty: number };

const fmt = (n: number) => `TZS ${n.toLocaleString()}`;

export default function Shop() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSw = lang === "sw";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem("afya_cart") || "[]"); } catch { return []; }
  });
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("afya_favs") || "[]"); } catch { return []; }
  });
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  useEffect(() => { localStorage.setItem("afya_cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("afya_favs", JSON.stringify(favs)); }, [favs]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: true });
      if (error) {
        toast.error(isSw ? "Imeshindwa kupakia bidhaa" : "Failed to load products");
      } else {
        setProducts((data as Product[]) ?? []);
      }
      setLoading(false);
    })();
  }, [isSw]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(p => {
      if (activeCat !== "all" && p.category !== activeCat) return false;
      if (!q) return true;
      return (p.name_en + p.name_sw + p.desc_en + p.desc_sw).toLowerCase().includes(q);
    });
  }, [activeCat, search, products]);

  const cartDetailed = cart
    .map(c => ({ ...c, p: products.find(p => p.id === c.id) }))
    .filter((x): x is { id: string; qty: number; p: Product } => !!x.p);
  const subtotal = cartDetailed.reduce((s, x) => s + Number(x.p.price) * x.qty, 0);
  const shipping = subtotal > 0 ? (subtotal > 200000 ? 0 : 5000) : 0;
  const total = subtotal + shipping;
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const addToCart = (id: string) => {
    setCart(c => {
      const ex = c.find(i => i.id === id);
      if (ex) return c.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { id, qty: 1 }];
    });
    toast.success(isSw ? "Imeongezwa kwenye kikapu" : "Added to cart");
  };
  const updateQty = (id: string, d: number) => {
    setCart(c => c.flatMap(i => {
      if (i.id !== id) return [i];
      const q = i.qty + d;
      return q <= 0 ? [] : [{ ...i, qty: q }];
    }));
  };
  const removeItem = (id: string) => setCart(c => c.filter(i => i.id !== id));
  const toggleFav = (id: string) => setFavs(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);

  const placeOrder = async () => {
    if (!user) {
      toast.error(isSw ? "Tafadhali ingia kwanza" : "Please sign in to place an order");
      navigate("/auth");
      return;
    }
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      toast.error(isSw ? "Jaza taarifa zote" : "Fill in all details");
      return;
    }
    setSubmitting(true);
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        subtotal, shipping, total,
        customer_name: form.name,
        phone: form.phone,
        address: form.address,
        status: "pending",
      })
      .select()
      .single();

    if (orderErr || !order) {
      setSubmitting(false);
      toast.error(isSw ? "Imeshindwa kuagiza" : "Failed to place order");
      return;
    }

    const items = cartDetailed.map(x => ({
      order_id: order.id,
      product_id: x.p.id,
      quantity: x.qty,
      unit_price: x.p.price,
    }));
    const { error: itemsErr } = await supabase.from("order_items").insert(items);
    setSubmitting(false);
    if (itemsErr) {
      toast.error(isSw ? "Imeshindwa kuhifadhi vitu" : "Failed to save items");
      return;
    }
    setOrderPlaced(true);
    setCart([]);
    setTimeout(() => { setOrderPlaced(false); setCheckoutOpen(false); }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br gradient-soft">
      {/* Nav */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 text-slate-900 hover:text-primary transition">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-semibold">{isSw ? "Rudi Nyumbani" : "Back to Home"}</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative gap-2 rounded-full">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">{isSw ? "Kikapu" : "Cart"}</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{cartCount}</span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="flex flex-col w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>{isSw ? "Kikapu Chako" : "Your Cart"}</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                  {cartDetailed.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">{isSw ? "Kikapu kiko tupu" : "Your cart is empty"}</p>
                    </div>
                  )}
                  {cartDetailed.map(({ p, qty, id }) => (
                    <div key={id} className="flex gap-3 p-3 rounded-2xl border border-slate-200 bg-white">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center text-3xl shrink-0">{p.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{isSw ? p.name_sw : p.name_en}</p>
                        <p className="text-xs text-primary font-semibold mt-0.5">{fmt(Number(p.price))}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQty(id, -1)} className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"><Minus className="h-3 w-3" /></button>
                          <span className="text-sm font-semibold w-6 text-center">{qty}</span>
                          <button onClick={() => updateQty(id, 1)} className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"><Plus className="h-3 w-3" /></button>
                          <button onClick={() => removeItem(id)} className="ml-auto h-7 w-7 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center justify-center"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {cartDetailed.length > 0 && (
                  <div className="border-t border-slate-200 pt-4 space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-slate-600">{isSw ? "Jumla ndogo" : "Subtotal"}</span><span className="font-semibold">{fmt(subtotal)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-600">{isSw ? "Usafirishaji" : "Shipping"}</span><span className="font-semibold">{shipping === 0 ? (isSw ? "Bure" : "Free") : fmt(shipping)}</span></div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-200"><span>{isSw ? "Jumla" : "Total"}</span><span className="text-primary">{fmt(total)}</span></div>
                    <Button onClick={() => setCheckoutOpen(true)} className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold">
                      {isSw ? "Endelea Kulipia" : "Checkout"}
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-4 sm:px-6 pt-8 sm:pt-14 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl gradient-mesh p-6 sm:p-10 text-slate-900 shadow-floating relative overflow-hidden border border-white/60">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-300/30 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-cyan-300/30 blur-3xl" />
            <div className="relative max-w-2xl">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight text-slate-900">{isSw ? "Vifaa vya Kuboresha Afya Yako" : "Tools to Improve Your Health"}</h1>
              <p className="mt-3 text-sm sm:text-base text-slate-700">{isSw ? "Vifaa vinavyopendekezwa kulingana na mwenendo wa afya yako." : "Curated tools recommended based on your health trends."}</p>
              <div className="flex flex-wrap gap-4 mt-5 text-xs sm:text-sm text-slate-700">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-blue-600" /> {isSw ? "Bidhaa halisi" : "Verified products"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Categories */}
      <section className="px-4 sm:px-6 pb-4 sticky top-[60px] z-30 bg-gradient-to-b from-slate-50/95 to-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={isSw ? "Tafuta bidhaa..." : "Search products..."} className="pl-9 h-11 rounded-xl bg-white/90 border-slate-200" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
            {CATEGORIES.map(c => {
              const Icon = c.icon;
              const active = activeCat === c.id;
              return (
                <button key={c.id} onClick={() => setActiveCat(c.id)} className={`shrink-0 inline-flex items-center gap-2 px-4 h-10 rounded-full border text-sm font-semibold transition-all ${active ? "bg-primary text-primary-foreground border-primary shadow-glow" : "bg-white text-slate-700 border-slate-200 hover:border-primary/40"}`}>
                  <Icon className="h-4 w-4" />{isSw ? c.sw : c.en}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-16 text-slate-500"><Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin" /><p>{isSw ? "Inapakia bidhaa..." : "Loading products..."}</p></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500"><Package className="h-12 w-12 mx-auto mb-3 opacity-40" /><p>{isSw ? "Hakuna bidhaa zilizopatikana" : "No products found"}</p></div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {filtered.map(p => (
                <div key={p.id} className="group rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-soft hover:shadow-elevated hover:-translate-y-1 transition-all flex flex-col">
                  <div className="relative aspect-square bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center text-6xl sm:text-7xl">
                    {p.emoji}
                    {p.badge && (
                      <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase px-2 py-1 rounded-full ${p.badge === "best" ? "bg-amber-100 text-amber-800" : p.badge === "new" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                        {p.badge === "best" ? (isSw ? "Bora" : "Best") : p.badge === "new" ? (isSw ? "Mpya" : "New") : (isSw ? "Punguzo" : "Deal")}
                      </span>
                    )}
                    <button onClick={() => toggleFav(p.id)} className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:scale-110 transition">
                      <Heart className={`h-4 w-4 ${favs.includes(p.id) ? "fill-rose-500 text-rose-500" : "text-slate-400"}`} />
                    </button>
                  </div>
                  <div className="p-3 sm:p-4 flex-1 flex flex-col">
                    <p className="text-sm font-bold text-slate-900 line-clamp-1">{isSw ? p.name_sw : p.name_en}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 flex-1">{isSw ? p.desc_sw : p.desc_en}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold text-slate-700">{p.rating}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-3">
                      <span className="text-sm sm:text-base font-black text-primary">{fmt(Number(p.price))}</span>
                      <Button size="sm" onClick={() => addToCart(p.id)} className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold">
                        <Plus className="h-3 w-3 sm:mr-1" /><span className="hidden sm:inline">{isSw ? "Ongeza" : "Add"}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => !orderPlaced && !submitting && setCheckoutOpen(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button onClick={() => setCheckoutOpen(false)} className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center"><X className="h-4 w-4" /></button>
            {orderPlaced ? (
              <div className="text-center py-6">
                <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4"><CheckCircle2 className="h-8 w-8 text-emerald-600" /></div>
                <h3 className="text-xl font-black text-slate-900">{isSw ? "Agizo Limepokelewa!" : "Order Placed!"}</h3>
                <p className="text-sm text-slate-600 mt-2">{isSw ? "Tutawasiliana nawe hivi punde." : "We'll contact you shortly."}</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-black text-slate-900 mb-4">{isSw ? "Maelezo ya Kulipia" : "Checkout Details"}</h3>
                {!user && (
                  <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    {isSw ? "Tafadhali ingia kwanza ili kuagiza." : "Please sign in to place an order."}
                  </div>
                )}
                <div className="space-y-3">
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={isSw ? "Jina kamili" : "Full name"} className="h-11 rounded-xl" />
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder={isSw ? "Nambari ya simu" : "Phone number"} className="h-11 rounded-xl" />
                  <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder={isSw ? "Anwani ya kupelekwa" : "Delivery address"} className="h-11 rounded-xl" />
                </div>
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 space-y-2">
                  <div className="flex justify-between text-sm"><span>{isSw ? "Jumla ndogo" : "Subtotal"}</span><span className="font-semibold">{fmt(subtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span>{isSw ? "Usafirishaji" : "Shipping"}</span><span className="font-semibold">{shipping === 0 ? (isSw ? "Bure" : "Free") : fmt(shipping)}</span></div>
                  <div className="flex justify-between text-base font-black pt-2 border-t border-slate-200"><span>{isSw ? "Jumla" : "Total"}</span><span className="text-primary">{fmt(total)}</span></div>
                </div>
                <Button onClick={placeOrder} disabled={submitting || cartDetailed.length === 0} className="w-full mt-4 h-12 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (isSw ? "Thibitisha Agizo" : "Confirm Order")}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
