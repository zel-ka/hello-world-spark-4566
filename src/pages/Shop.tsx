import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, ShoppingCart, Plus, Minus, Trash2, Heart, Star, Package, Truck, ShieldCheck, Dumbbell, HeartPulse, Moon, Brain, Wind, ClipboardList, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/hooks/useI18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import { toast } from "sonner";

type Product = {
  id: string;
  category: string;
  nameEn: string;
  nameSw: string;
  descEn: string;
  descSw: string;
  price: number; // TZS
  rating: number;
  badge?: "best" | "new" | "deal";
  emoji: string;
};

const PRODUCTS: Product[] = [
  // Mazoezi
  { id: "p1", category: "exercise", nameEn: "Skipping Rope Pro", nameSw: "Kamba ya Kurukia", descEn: "Adjustable speed rope for cardio.", descSw: "Kamba ya kurekebisha kwa mazoezi ya moyo.", price: 18000, rating: 4.7, badge: "best", emoji: "🪢" },
  { id: "p2", category: "exercise", nameEn: "Dumbbells Set 10kg", nameSw: "Dumbbells Seti 10kg", descEn: "Pair of rubber dumbbells.", descSw: "Jozi ya dumbbells za mpira.", price: 95000, rating: 4.8, emoji: "🏋️" },
  { id: "p3", category: "exercise", nameEn: "Yoga Mat Premium", nameSw: "Mkeka wa Yoga", descEn: "Non-slip 6mm exercise mat.", descSw: "Mkeka wa mazoezi 6mm.", price: 35000, rating: 4.6, emoji: "🧘" },
  // Afya
  { id: "p4", category: "health", nameEn: "Digital BP Machine", nameSw: "Mashine ya Presha", descEn: "Accurate upper-arm BP monitor.", descSw: "Kipima presha cha mkono cha kisasa.", price: 145000, rating: 4.9, badge: "best", emoji: "🩺" },
  { id: "p5", category: "health", nameEn: "Glucometer Kit", nameSw: "Kipima Sukari", descEn: "Blood sugar monitor + 50 strips.", descSw: "Kipima sukari + vipande 50.", price: 78000, rating: 4.7, emoji: "💉" },
  { id: "p6", category: "health", nameEn: "Smart Body Scale", nameSw: "Mizani ya Mwili", descEn: "BMI, body fat, muscle mass.", descSw: "Hupima BMI, mafuta, na misuli.", price: 62000, rating: 4.5, badge: "new", emoji: "⚖️" },
  { id: "p7", category: "health", nameEn: "Pulse Oximeter", nameSw: "Kipima Oksijeni", descEn: "SpO2 + heart rate fingertip.", descSw: "Hupima oksijeni na mapigo.", price: 28000, rating: 4.6, emoji: "🫁" },
  // Usingizi
  { id: "p8", category: "sleep", nameEn: "Silk Eye Mask", nameSw: "Kifuniko cha Macho", descEn: "Soft sleep mask for deep rest.", descSw: "Kifuniko laini cha kulala vizuri.", price: 12000, rating: 4.4, emoji: "😴" },
  { id: "p9", category: "sleep", nameEn: "White Noise Machine", nameSw: "Mashine ya Sauti", descEn: "20 calming sounds for sleep.", descSw: "Sauti 20 za utulivu kwa usingizi.", price: 85000, rating: 4.7, badge: "deal", emoji: "🎵" },
  // Msongo
  { id: "p10", category: "stress", nameEn: "Aromatherapy Diffuser", nameSw: "Diffuser ya Harufu", descEn: "Essential oil mist for calm.", descSw: "Inazalisha harufu za kutuliza.", price: 55000, rating: 4.6, emoji: "🌿" },
  { id: "p11", category: "stress", nameEn: "Stress Relief Puzzle", nameSw: "Mchezo wa Kupunguza Msongo", descEn: "Brain games for relaxation.", descSw: "Michezo ya akili kwa utulivu.", price: 22000, rating: 4.3, emoji: "🧩" },
  // Hewa
  { id: "p12", category: "air", nameEn: "HEPA Air Purifier", nameSw: "Kisafishaji Hewa", descEn: "Removes 99.97% of allergens.", descSw: "Husafisha 99.97% ya vumbi.", price: 280000, rating: 4.8, badge: "best", emoji: "🌬️" },
  // Productivity
  { id: "p13", category: "productivity", nameEn: "Focus Timer Cube", nameSw: "Saa ya Umakini", descEn: "Pomodoro productivity timer.", descSw: "Saa ya kuongeza umakini.", price: 32000, rating: 4.5, emoji: "⏱️" },
  { id: "p14", category: "productivity", nameEn: "Blue Light Glasses", nameSw: "Miwani ya Kompyuta", descEn: "Reduce eye strain at screens.", descSw: "Hupunguza uchovu wa macho.", price: 38000, rating: 4.4, badge: "new", emoji: "👓" },
];

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
  const { t, lang } = useI18n();
  const isSw = lang === "sw";
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

  useEffect(() => { localStorage.setItem("afya_cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("afya_favs", JSON.stringify(favs)); }, [favs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PRODUCTS.filter(p => {
      if (activeCat !== "all" && p.category !== activeCat) return false;
      if (!q) return true;
      return (p.nameEn + p.nameSw + p.descEn + p.descSw).toLowerCase().includes(q);
    });
  }, [activeCat, search]);

  const cartDetailed = cart.map(c => ({ ...c, p: PRODUCTS.find(p => p.id === c.id)! })).filter(x => x.p);
  const subtotal = cartDetailed.reduce((s, x) => s + x.p.price * x.qty, 0);
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

  const placeOrder = () => {
    setOrderPlaced(true);
    setCart([]);
    setTimeout(() => { setOrderPlaced(false); setCheckoutOpen(false); }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Nav */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 text-slate-900 hover:text-blue-700 transition">
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
                    <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">{cartCount}</span>
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
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-3xl shrink-0">{p.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{isSw ? p.nameSw : p.nameEn}</p>
                        <p className="text-xs text-blue-700 font-semibold mt-0.5">{fmt(p.price)}</p>
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
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-200"><span>{isSw ? "Jumla" : "Total"}</span><span className="text-blue-700">{fmt(total)}</span></div>
                    <Button onClick={() => setCheckoutOpen(true)} className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold">
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
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 p-6 sm:p-10 text-white shadow-floating relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="relative max-w-2xl">
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 mb-3">{isSw ? "Duka la Afya" : "Health Store"}</Badge>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight">{isSw ? "Vifaa vya Kuboresha Afya Yako" : "Tools to Improve Your Health"}</h1>
              <p className="mt-3 text-sm sm:text-base text-blue-50">{isSw ? "Vifaa vinavyopendekezwa kulingana na mwenendo wa afya yako." : "Curated tools recommended based on your health trends."}</p>
              <div className="flex flex-wrap gap-4 mt-5 text-xs sm:text-sm">
                <span className="inline-flex items-center gap-1.5"><Truck className="h-4 w-4" /> {isSw ? "Usafirishaji bure >200k" : "Free shipping >200k"}</span>
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> {isSw ? "Bidhaa halisi" : "Verified products"}</span>
                <span className="inline-flex items-center gap-1.5"><Package className="h-4 w-4" /> {isSw ? "Utoaji haraka" : "Fast delivery"}</span>
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
                <button key={c.id} onClick={() => setActiveCat(c.id)} className={`shrink-0 inline-flex items-center gap-2 px-4 h-10 rounded-full border text-sm font-semibold transition-all ${active ? "bg-blue-600 text-white border-blue-600 shadow-glow" : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"}`}>
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
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500"><Package className="h-12 w-12 mx-auto mb-3 opacity-40" /><p>{isSw ? "Hakuna bidhaa zilizopatikana" : "No products found"}</p></div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {filtered.map(p => (
                <div key={p.id} className="group rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-soft hover:shadow-elevated hover:-translate-y-1 transition-all flex flex-col">
                  <div className="relative aspect-square bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center text-6xl sm:text-7xl">
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
                    <p className="text-sm font-bold text-slate-900 line-clamp-1">{isSw ? p.nameSw : p.nameEn}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 flex-1">{isSw ? p.descSw : p.descEn}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold text-slate-700">{p.rating}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-3">
                      <span className="text-sm sm:text-base font-black text-blue-700">{fmt(p.price)}</span>
                      <Button size="sm" onClick={() => addToCart(p.id)} className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => !orderPlaced && setCheckoutOpen(false)}>
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
                <div className="space-y-3">
                  <Input placeholder={isSw ? "Jina kamili" : "Full name"} className="h-11 rounded-xl" />
                  <Input placeholder={isSw ? "Nambari ya simu" : "Phone number"} className="h-11 rounded-xl" />
                  <Input placeholder={isSw ? "Anwani ya kupelekwa" : "Delivery address"} className="h-11 rounded-xl" />
                </div>
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 space-y-2">
                  <div className="flex justify-between text-sm"><span>{isSw ? "Jumla ndogo" : "Subtotal"}</span><span className="font-semibold">{fmt(subtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span>{isSw ? "Usafirishaji" : "Shipping"}</span><span className="font-semibold">{shipping === 0 ? (isSw ? "Bure" : "Free") : fmt(shipping)}</span></div>
                  <div className="flex justify-between text-base font-black pt-2 border-t border-slate-200"><span>{isSw ? "Jumla" : "Total"}</span><span className="text-blue-700">{fmt(total)}</span></div>
                </div>
                <Button onClick={placeOrder} className="w-full mt-4 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold">
                  {isSw ? "Thibitisha Agizo" : "Confirm Order"}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
