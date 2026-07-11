import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  AppCtx,
  type AppState,
  type CartItem,
  type Order,
  type Toast,
  type User,
} from "./store";
import type { Review } from "../data/products";
import { REVIEWS as SEED_REVIEWS } from "../data/products";
import { NATIONS, type Nation } from "../data/nations";
import { SEED_PICKUP_STATIONS, type PickupStation } from "../data/pickupStations";
import { clearTokens } from "../api/client";

// ============================================================================
// LOCAL PERSISTENCE — cart, wishlist, orders, reviews survive refresh
// ============================================================================
const LS_CART     = "db_cart_v1";
const LS_WISHLIST = "db_wishlist_v1";
const LS_REVIEWS  = "db_reviews_v1";
const LS_ORDERS   = "db_orders_v1";

function loadCart(): CartItem[] {
  try { const r = localStorage.getItem(LS_CART); return r ? JSON.parse(r) : []; } catch { return []; }
}
function loadWishlist(): string[] {
  try { const r = localStorage.getItem(LS_WISHLIST); return r ? JSON.parse(r) : []; } catch { return []; }
}
function loadReviews(): Review[] {
  try { const r = localStorage.getItem(LS_REVIEWS); return r ? JSON.parse(r) : SEED_REVIEWS; } catch { return SEED_REVIEWS; }
}
function loadOrders(): Order[] {
  try { const r = localStorage.getItem(LS_ORDERS); return r ? JSON.parse(r) : []; } catch { return []; }
}

// ============================================================================
// PROVIDER
// ============================================================================

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [wishlist, setWishlist] = useState<string[]>(loadWishlist);
  const [orders, setOrders] = useState<Order[]>(loadOrders);
  const [reviews, setReviews] = useState<Review[]>(loadReviews);
  const [pickupStations, setPickupStations] = useState<PickupStation[]>(SEED_PICKUP_STATIONS);
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const nations: Nation[] = NATIONS;

  // Persist everything that survives refresh
  useEffect(() => { try { localStorage.setItem(LS_CART, JSON.stringify(cart)); } catch {} }, [cart]);
  useEffect(() => { try { localStorage.setItem(LS_WISHLIST, JSON.stringify(wishlist)); } catch {} }, [wishlist]);
  useEffect(() => { try { localStorage.setItem(LS_REVIEWS, JSON.stringify(reviews)); } catch {} }, [reviews]);
  useEffect(() => { try { localStorage.setItem(LS_ORDERS, JSON.stringify(orders)); } catch {} }, [orders]);

  // Restore session from stored JWT (with timeout so slow backends don't block the UI)
  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      const tok = localStorage.getItem("db_access_token");
      if (!tok) { setReady(true); return; }
      try {
        // Give the backend 5 seconds max to respond
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        // Use raw fetch with abort signal for timeout control
        const base = (await import("../api/client")).api.baseUrl || "http://localhost:5000/api/v1";
        const res = await fetch(`${base}/auth/me`, {
          headers: { Authorization: `Bearer ${tok}` },
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (!cancelled && res.ok) {
          const json = await res.json();
          const u = json.data?.user;
          if (u) {
            setUser({
              id: u.id, name: u.fullName, email: u.email, phone: u.phone,
              role: u.role === "NATION_LEADER" ? "nation" : u.role === "SUPER_ADMIN" ? "super_admin" : u.role === "ADMIN" ? "admin" : "customer",
              emailVerified: u.emailVerified, addresses: [], nationId: u.nationId,
            });
          }
        }
      } catch {
        // Backend unreachable — keep local orders, don't clear anything
        if (!cancelled) { /* user stays null — they'll need to login again */ }
      } finally {
        if (!cancelled) setReady(true);
      }
    };
    restore();
    return () => { cancelled = true; };
  }, []);

  // ---------- Cart ----------
  const addToCart = useCallback((productId: string, quantity = 1) => {
    setCart((cur) => {
      const found = cur.find((c) => c.productId === productId);
      if (found) return cur.map((c) => c.productId === productId ? { ...c, quantity: c.quantity + quantity } : c);
      return [...cur, { productId, quantity }];
    });
    toast({ type: "success", message: "Added to cart" });
  }, []);
  const removeFromCart = useCallback((id: string) => setCart((c) => c.filter((i) => i.productId !== id)), []);
  const updateCartQty = useCallback((id: string, qty: number) => {
    setCart((c) => c.map((i) => i.productId === id ? { ...i, quantity: qty } : i).filter((i) => i.quantity > 0));
  }, []);
  const clearCart = useCallback(() => setCart([]), []);
  const toggleWishlist = useCallback((id: string) => {
    setWishlist((c) => {
      if (c.includes(id)) { toast({ type: "info", message: "Removed from wishlist" }); return c.filter((x) => x !== id); }
      toast({ type: "success", message: "Added to wishlist" }); return [...c, id];
    });
  }, []);

  // ---------- Orders ----------
  const addOrder = useCallback((o: Order) => setOrders((c) => [o, ...c]), []);
  const updateOrder = useCallback((id: string, p: Partial<Order>) => setOrders((c) => c.map((o) => o.id === id ? { ...o, ...p } : o)), []);

  // ---------- Pickup stations ----------
  const addPickupStation = useCallback((p: PickupStation) => setPickupStations((c) => [p, ...c]), []);
  const updatePickupStation = useCallback((id: string, p: Partial<PickupStation>) => setPickupStations((c) => c.map((s) => s.id === id ? { ...s, ...p } : s)), []);
  const deletePickupStation = useCallback((id: string) => setPickupStations((c) => c.filter((s) => s.id !== id)), []);

  // ---------- Reviews ----------
  const addReview = useCallback((r: Review) => {
    setReviews((c) => [r, ...c]);
    toast({ type: "success", message: "Review submitted!" });
  }, []);
  const deleteReview = useCallback((id: string) => setReviews((c) => c.filter((r) => r.id !== id)), []);

  // ---------- Subscribers ----------
  const subscribe = useCallback((email: string) => {
    setSubscribers((c) => (c.includes(email) ? c : [...c, email]));
    toast({ type: "success", message: "Subscribed!" });
  }, []);

  // ---------- Toast ----------
  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((c) => [...c, { ...t, id }]);
    setTimeout(() => setToasts((c) => c.filter((x) => x.id !== id)), 3500);
  }, []);
  const dismissToast = useCallback((id: string) => setToasts((c) => c.filter((x) => x.id !== id)), []);

  const handleSetUser = useCallback((u: User | null) => {
    setUser(u);
    if (!u) clearTokens();
  }, []);

  const value: AppState = {
    user, cart, wishlist, orders, nations, pickupStations, subscribers, toasts, reviews,
    setUser: handleSetUser, addToCart, removeFromCart, updateCartQty, clearCart, toggleWishlist,
    addOrder, updateOrder, addPickupStation, updatePickupStation, deletePickupStation,
    subscribe, toast, dismissToast,
    addReview, deleteReview,
  };

  // Don't render until the initial session check completes (prevents flash)
  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#4A0E16] border-t-transparent rounded-full animate-spin" />
          <div className="text-sm text-gray-500">Loading Diamond Body...</div>
        </div>
      </div>
    );
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
