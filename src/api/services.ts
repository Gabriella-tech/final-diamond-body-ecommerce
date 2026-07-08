// ============================================================================
// Diamond Body — API Service Layer
// Typed convenience functions for every backend endpoint.
// Use these in components instead of raw apiFetch() calls.
// ============================================================================

import { api } from "./client";
import type { Product } from "../data/products";
import type { Nation } from "../data/nations";
import type { PickupStation } from "../data/pickupStations";

// ---------- Auth ----------

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = { email: string; password: string; fullName: string; phone?: string; nationId?: string };
export type AuthResult = { user: UserDto; accessToken: string; refreshToken: string };
export type UserDto = { id: string; email: string; fullName: string; phone?: string; role: string; status: string; emailVerified: boolean; nationId?: string; createdAt: string };

export const authService = {
  login: (body: LoginPayload) => api.post<AuthResult>("/api/v1/auth/login", body),
  register: (body: RegisterPayload) => api.post<{ user: UserDto }>("/auth/register", body),
  refresh: (refreshToken: string) => api.post<{ accessToken: string; refreshToken: string }>("/auth/refresh", { refreshToken }),
  logout: (refreshToken: string) => api.post("/auth/logout", { refreshToken }),
  me: () => api.get<{ user: UserDto }>("/auth/me"),
  changePassword: (currentPassword: string, newPassword: string) => api.post("/auth/change-password", { currentPassword, newPassword }),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (userId: string, token: string, newPassword: string) => api.post("/auth/reset-password", { userId, token, newPassword }),
};

// ---------- Products ----------

export const productService = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get<{ items: Product[]; meta: { pagination: { total: number; page: number; limit: number; totalPages: number } } }>(`/products${qs}`);
  },
  featured: () => api.get<Product[]>("/products/featured"),
  bestSellers: () => api.get<Product[]>("/products/best-sellers"),
  getBySlug: (slug: string) => api.get<Product>(`/products/${slug}`),
  categories: () => api.get<{ id: string; slug: string; name: string; icon?: string; _count?: { products: number } }[]>("/products/categories"),
};

// ---------- Nations ----------

export const nationService = {
  list: () => api.get<Nation[]>("/nations"),
  getBySlug: (slug: string) => api.get<Nation>(`/nations/slug/${slug}`),
};

// ---------- Pickup Stations ----------

export const pickupStationService = {
  list: () => api.get<PickupStation[]>("/pickup-stations"),
};

// ---------- Orders ----------

export type CreateOrderPayload = {
  customerName: string; email: string; phone: string;
  nationSlug?: string; referralCode?: string;
  deliveryMethod: "HOME_DELIVERY" | "PICKUP_STATION";
  shippingStreet?: string; shippingCity?: string; shippingState?: string;
  pickupStationId?: string; shippingFee?: number; discount?: number;
  promoCode?: string; paymentMethod: "BANK_TRANSFER";
  items: { productId: string; quantity: number }[];
};

export const orderService = {
  create: (body: CreateOrderPayload) => api.post<Record<string, unknown>>("/orders", body),
  uploadProof: (orderId: string, file: File) => {
    const fd = new FormData();
    fd.append("proof", file);
    return api.upload(`/orders/${orderId}/payment-proof`, fd);
  },
  myOrders: (page = 1, limit = 10) => api.get(`/members/me/orders?page=${page}&limit=${limit}`),
  myOrderDetail: (id: string) => api.get(`/members/me/orders/${id}`),
};

// ---------- Admin ----------

export const adminService = {
  dashboard: () => api.get("/admin/dashboard"),
  orders: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get(`/admin/orders${qs}`);
  },
  updateOrderStatus: (id: string, body: { status?: string; trackingNumber?: string }) => api.patch(`/admin/orders/${id}/status`, body),
  reviewProof: (id: string, action: "APPROVE" | "REJECT", rejectionReason?: string) => api.patch(`/admin/payment-proofs/${id}`, { action, rejectionReason }),
  nations: () => api.get("/admin/nations"),
  updateNation: (id: string, body: Record<string, unknown>) => api.patch(`/admin/nations/${id}`, body),
  leaders: () => api.get("/admin/leaders"),
  createLeader: (body: Record<string, unknown>) => api.post("/admin/leaders", body),
  updateLeader: (id: string, body: Record<string, unknown>) => api.patch(`/admin/leaders/${id}`, body),
  setLeaderStatus: (id: string, status: string) => api.patch(`/admin/leaders/${id}/status`, { status }),
  resetLeaderPassword: (id: string, newPassword?: string) => api.post(`/admin/leaders/${id}/reset-password`, { newPassword }),
  deleteLeader: (id: string) => api.delete(`/admin/leaders/${id}`),
  pickupStations: () => api.get("/admin/pickup-stations"),
  createPickupStation: (body: Record<string, unknown>) => api.post("/admin/pickup-stations", body),
  updatePickupStation: (id: string, body: Record<string, unknown>) => api.patch(`/admin/pickup-stations/${id}`, body),
  deletePickupStation: (id: string) => api.delete(`/admin/pickup-stations/${id}`),
};
