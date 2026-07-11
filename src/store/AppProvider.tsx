import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AppCtx, type AppState, type User } from "./store";
import { adminService, authService } from "../api/services";
import { clearTokens } from "../api/client";
import { REVIEWS as SEED_REVIEWS } from "../data/products";
import { NATIONS } from "../data/nations";
import { SEED_PICKUP_STATIONS } from "../data/pickupStations";

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>(SEED_REVIEWS);
  const [pickupStations, setPickupStations] = useState<any[]>(SEED_PICKUP_STATIONS);
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [toasts, setToasts] = useState<any[]>([]);

  const fetchAdminData = useCallback(async () => {
    try {
      const res: any = await adminService.orders();
if (res) setOrders(res.data || res); // Handles both direct arrays or objects with .data
    } catch (e) { console.error("Fetch failed", e); }
  }, []);

  useEffect(() => {
    const restore = async () => {
      const tok = localStorage.getItem("db_access_token");
      if (!tok) { setIsInitialized(true); return; }
      try {
        const { user: u } = await authService.me();
        setUser({
          id: u.id, name: u.fullName, email: u.email, phone: u.phone,
          role: u.role === "NATION_LEADER" ? "nation" : u.role === "SUPER_ADMIN" ? "super_admin" : u.role === "ADMIN" ? "admin" : "customer",
          emailVerified: u.emailVerified, addresses: [], nationId: u.nationId,
        });
        if (["admin", "super_admin"].includes(u.role.toLowerCase())) await fetchAdminData();
      } catch { clearTokens(); setUser(null); }
      setIsInitialized(true);
    };
    restore();
  }, [fetchAdminData]);

  // Original functions preserved
  const addToCart = useCallback((productId: string, quantity = 1) => {
    setCart((cur) => {
      const found = cur.find((c: any) => c.productId === productId);
      if (found) return cur.map((c: any) => c.productId === productId ? { ...c, quantity: c.quantity + quantity } : c);
      return [...cur, { productId, quantity }];
    });
  }, []);
  const removeFromCart = useCallback((id: string) => setCart((c) => c.filter((i: any) => i.productId !== id)), []);
  const updateCartQty = useCallback((id: string, qty: number) => setCart((c) => c.map((i: any) => i.productId === id ? { ...i, quantity: qty } : i).filter((i: any) => i.quantity > 0)), []);
  const clearCart = useCallback(() => setCart([]), []);
  const toggleWishlist = useCallback((id: string) => {
    setWishlist((c) => c.includes(id) ? c.filter((x) => x !== id) : [...c, id]);
  }, []);
  const addOrder = useCallback((o: any) => setOrders((c) => [o, ...c]), []);
  const updateOrder = useCallback((id: string, p: Partial<any>) => setOrders((c) => c.map((o: any) => o.id === id ? { ...o, ...p } : o)), []);
  const addPickupStation = useCallback((p: any) => setPickupStations((c) => [p, ...c]), []);
  const updatePickupStation = useCallback((id: string, p: Partial<any>) => setPickupStations((c) => c.map((s: any) => s.id === id ? { ...s, ...p } : s)), []);
  const deletePickupStation = useCallback((id: string) => setPickupStations((c) => c.filter((s: any) => s.id !== id)), []);
  const subscribe = useCallback((email: string) => setSubscribers((c) => c.includes(email) ? c : [...c, email]), []);
  const toast = useCallback((t: any) => { const id = Math.random().toString(36).slice(2); setToasts((c) => [...c, { ...t, id }]); setTimeout(() => setToasts((c) => c.filter((x) => x.id !== id)), 3500); }, []);
  const dismissToast = useCallback((id: string) => setToasts((c) => c.filter((x) => x.id !== id)), []);
  const addReview = useCallback((r: any) => setReviews((c) => [r, ...c]), []);
  const deleteReview = useCallback((id: string) => setReviews((c) => c.filter((r: any) => r.id !== id)), []);

  const handleSetUser = useCallback((u: User | null) => {
    setUser(u);
    if (!u) clearTokens();
    else if (u.role === "admin" || u.role === "super_admin") fetchAdminData();
  }, [fetchAdminData]);

  const value: AppState = {
    user, isInitialized, cart, wishlist, orders, nations: NATIONS, 
    pickupStations, subscribers, toasts, reviews,
    setUser: handleSetUser, addToCart, removeFromCart, updateCartQty, clearCart, 
    toggleWishlist, addOrder, updateOrder, addPickupStation, updatePickupStation, 
    deletePickupStation, subscribe, toast, dismissToast, addReview, deleteReview,
  };

  if (!isInitialized) return <div style={{padding: '50px', textAlign: 'center'}}>Loading...</div>;

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}