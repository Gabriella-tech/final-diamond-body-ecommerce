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
// LOCAL PERSISTENCE
// ============================================================================
const LS_CART = "db_cart_v1";
const LS_WISHLIST = "db_wishlist_v1";
const LS_REVIEWS = "db_reviews_v1";

function loadCart(): CartItem[] {
  try { const r = localStorage.getItem(LS_CART); return r ? JSON.parse(r) : []; } catch { return []; }
}
function loadWishlist(): string[] {
  try { const r = localStorage.getItem(LS_WISHLIST); return r ? JSON.parse(r) : []; } catch { return []; }
}
function loadReviews(): Review[] {
  try { const r = localStorage.getItem(LS_REVIEWS); return r ? JSON.parse(r) : SEED_REVIEWS; } catch { return SEED_REVIEWS; }
}

// ============================================================================
// PROVIDER
// ============================================================================

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [wishlist, setWishlist] = useState<string[]>(loadWishlist);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>(loadReviews);
  const [pickupStations, setPickupStations] = useState<PickupStation[]>(SEED_PICKUP_STATIONS);
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const nations: Nation[] = NATIONS;

  // Persist
  useEffect(() => { try { localStorage.setItem(LS_CART, JSON.stringify(cart)); } catch {} }, [cart]);
  useEffect(() => { try { localStorage.setItem(LS_WISHLIST, JSON.stringify(wishlist)); } catch {} }, [wishlist]);
  useEffect(() => { try { localStorage.setItem(LS_REVIEWS, JSON.stringify(reviews)); } catch {} }, [reviews]);

  // Restore session from token
  useEffect(() => {
    const restore = async () => {
      const tok = localStorage.getItem("db_access_token");
      if (!tok) return;
      try {
        const { authService } = await import("../api/services");
        const { user: u } = await authService.me();
        setUser({
          id: u.id, name: u.fullName, email: u.email, phone: u.phone,
          role: u.role === "NATION_LEADER" ? "nation" : u.role === "SUPER_ADMIN" ? "super_admin" : u.role === "ADMIN" ? "admin" : "customer",
          emailVerified: u.emailVerified, addresses: [], nationId: u.nationId,
        });
      } catch { clearTokens(); setUser(null); }
    };
    restore();
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

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
