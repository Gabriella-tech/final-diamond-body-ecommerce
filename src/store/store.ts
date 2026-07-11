import { createContext, useContext } from "react";
import type { Product } from "../data/products";
import type { Nation } from "../data/nations";
import type { PickupStation } from "../data/pickupStations";

export type Role = "customer" | "nation" | "admin" | "super_admin";

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  emailVerified: boolean;
  addresses: Address[];
  nationId?: string;          // for "nation" role: their own NTN id
  referralCode?: string;      // optional, saved with customer if they used one
};

export type Address = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  isDefault?: boolean;
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type OrderStatus =
  | "Pending"
  | "Awaiting Payment"
  | "Paid"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Refunded";

export type PaymentMethod = "Paystack" | "Bank Transfer";
export type PaymentStatus = "Unpaid" | "Awaiting Verification" | "Paid" | "Failed" | "Refunded";

export type DeliveryMethod = "Home Delivery" | "Pickup Station";

export type Order = {
  id: string;
  date: string;
  userId: string;
  customerName: string;
  email: string;
  phone: string;
  address: Address;                       // for Home Delivery
  items: { productId: string; name: string; price: number; quantity: number }[];
  total: number;
  shippingFee: number;
  discount: number;
  promoCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paystackReference?: string;
  bankProofUrl?: string;
  status: OrderStatus;
  // Nation tracking (auto from URL)
  nationId?: string;
  nationName?: string;
  nationSlug?: string;
  // Optional free-text referral code
  referralCode?: string;
  // Delivery
  deliveryMethod: DeliveryMethod;
  pickupStationId?: string;
  pickupStationName?: string;
  trackingNumber?: string;
};

export type Toast = {
  id: string;
  type: "success" | "error" | "info";
  message: string;
};

import type { Review } from "../data/products";

export type AppState = {
  user: User | null;
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  nations: Nation[];
  pickupStations: PickupStation[];
  subscribers: string[];
  toasts: Toast[];
  reviews: Review[];
  // mutators
  setUser: (u: User | null) => void;
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  // Pickup stations
  addPickupStation: (p: PickupStation) => void;
  updatePickupStation: (id: string, patch: Partial<PickupStation>) => void;
  deletePickupStation: (id: string) => void;
  // Misc
  subscribe: (email: string) => void;
  toast: (t: Omit<Toast, "id">) => void;
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

export function cartTotal(cart: CartItem[], products: Product[]) {
  return cart.reduce((sum, item) => {
    const p = products.find((x) => x.id === item.productId);
    return sum + (p ? p.price * item.quantity : 0);
  }, 0);
}

export function cartCount(cart: CartItem[]) {
  return cart.reduce((n, i) => n + i.quantity, 0);
}

export function formatNGN(amount: number) {
  return "₦" + amount.toLocaleString("en-NG");
}

export function dashboardPath(role: Role) {
  switch (role) {
    case "customer": return "/dashboard/user";
    case "nation": return "/dashboard/nation";
    case "admin": return "/dashboard/admin";
    case "super_admin": return "/dashboard/super-admin";
  }
}