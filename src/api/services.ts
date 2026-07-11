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
  register: (body: RegisterPayload) => api.post<{ user: UserDto }>("/api/v1/auth/register", body),
  refresh: (refreshToken: string) => api.post<{ accessToken: string; refreshToken: string }>("/api/v1/auth/refresh", { refreshToken }),
  logout: (refreshToken: string) => api.post("/api/v1/auth/logout", { refreshToken }),
  me: () => api.get<{ user: UserDto }>("/api/v1/auth/me"),
  changePassword: (currentPassword: string, newPassword: string) => api.post("/api/v1/auth/change-password", { currentPassword, newPassword }),
  forgotPassword: (email: string) => api.post("/api/v1/auth/forgot-password", { email }),
  resetPassword: (userId: string, token: string, newPassword: string) => api.post("/api/v1/auth/reset-password", { userId, token, newPassword }),
};

// ---------- Products ----------

export const productService = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get<{ items: Product[]; meta: { pagination: { total: number; page: number; limit: number; totalPages: number } } }>(`/api/v1/products${qs}`);
  },
  featured: () => api.get<Product[]>("/api/v1/products/featured"),
  bestSellers: () => api.get<Product[]>("/api/v1/products/best-sellers"),
  getBySlug: (slug: string) => api.get<Product>(`/api/v1/products/${slug}`),
  categories: () => api.get<{ id: string; slug: string; name: string; icon?: string; _count?: { products: number } }[]>("/api/v1/products/categories"),
};

// ---------- Nations ----------

export const nationService = {
  list: () => api.get<Nation[]>("/api/v1/nations"),
  getBySlug: (slug: string) => api.get<Nation>(`/api/v1/nations/slug/${slug}`),
};

// ---------- Pickup Stations ----------

export const pickupStationService = {
  list: () => api.get<PickupStation[]>("/api/v1/pickup-stations"),
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
  create: (body: CreateOrderPayload) => api.post<Record<string, unknown>>("/api/v1/orders", body),
  uploadProof: (orderId: string, file: File) => {
    const fd = new FormData();
    fd.append("proof", file);
    return api.upload(`/api/v1/orders/${orderId}/payment-proof`, fd);
  },
  myOrders: (page = 1, limit = 10) => api.get(`/api/v1/members/me/orders?page=${page}&limit=${limit}`),
  myOrderDetail: (id: string) => api.get(`/api/v1/members/me/orders/${id}`),
};

// ---------- Admin ----------

export const adminService = {
  dashboard: () => api.get("/api/v1/admin/dashboard"),
  orders: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get(`/api/v1/admin/orders${qs}`);
  },
  updateOrderStatus: (id: string, body: { status?: string; trackingNumber?: string }) => api.patch(`/api/v1/admin/orders/${id}/status`, body),
  reviewProof: (id: string, action: "APPROVE" | "REJECT", rejectionReason?: string) => api.patch(`/api/v1/admin/payment-proofs/${id}`, { action, rejectionReason }),
  nations: () => api.get("/api/v1/admin/nations"),
  updateNation: (id: string, body: Record<string, unknown>) => api.patch(`/api/v1/admin/nations/${id}`, body),
  leaders: () => api.get("/api/v1/admin/leaders"),
  createLeader: (body: Record<string, unknown>) => api.post("/api/v1/admin/leaders", body),
  updateLeader: (id: string, body: Record<string, unknown>) => api.patch(`/api/v1/admin/leaders/${id}`, body),
  setLeaderStatus: (id: string, status: string) => api.patch(`/api/v1/admin/leaders/${id}/status`, { status }),
  resetLeaderPassword: (id: string, newPassword?: string) => api.post(`/api/v1/admin/leaders/${id}/reset-password`, { newPassword }),
  deleteLeader: (id: string) => api.delete(`/api/v1/admin/leaders/${id}`),
  pickupStations: () => api.get("/api/v1/admin/pickup-stations"),
  createPickupStation: (body: Record<string, unknown>) => api.post("/api/v1/admin/pickup-stations", body),
  updatePickupStation: (id: string, body: Record<string, unknown>) => api.patch(`/api/v1/admin/pickup-stations/${id}`, body),
  deletePickupStation: (id: string) => api.delete(`/api/v1/admin/pickup-stations/${id}`),
};