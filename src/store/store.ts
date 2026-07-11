import { createContext, useContext } from "react";
import type { Product, Review } from "../data/products";
import type { Nation } from "../data/nations";
import type { PickupStation } from "../data/pickupStations";

export type Role = "customer" | "nation" | "admin" | "super_admin";
export type User = { id: string; name: string; email: string; phone?: string; role: Role; emailVerified: boolean; addresses: any[]; nationId?: string; referralCode?: string; };

export type OrderStatus = "Pending" | "Awaiting Payment" | "Paid" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Refunded";
export type Order = { id: string; status: OrderStatus; [key: string]: any };

export type AppState = {
  user: User | null;
  isInitialized: boolean;
  cart: any[];
  wishlist: string[];
  orders: any[];
  nations: Nation[];
  pickupStations: PickupStation[];
  subscribers: string[];
  toasts: any[];
  reviews: Review[];
  setUser: (u: User | null) => void;
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateCartQty: (id: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  addOrder: (o: any) => void;
  updateOrder: (id: string, p: Partial<any>) => void;
  addPickupStation: (p: PickupStation) => void;
  updatePickupStation: (id: string, p: Partial<PickupStation>) => void;
  deletePickupStation: (id: string) => void;
  subscribe: (email: string) => void;
  toast: (t: Omit<any, "id">) => void;
  dismissToast: (id: string) => void;
  addReview: (r: Review) => void;
  deleteReview: (id: string) => void;
};

export const AppCtx = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export function formatNGN(amount: number) { return "₦" + amount.toLocaleString("en-NG"); }
export function dashboardPath(role: Role) {
  switch (role) {
    case "customer": return "/dashboard/user";
    case "nation": return "/dashboard/nation";
    case "admin": return "/dashboard/admin";
    case "super_admin": return "/dashboard/super-admin";
  }
}