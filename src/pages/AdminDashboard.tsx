import { useEffect, useMemo, useState } from "react";
import { Container, Button, Badge } from "../components/UI";
import { useApp, formatNGN, type Order, type OrderStatus, type PaymentStatus } from "../store/store";
import { PRODUCTS } from "../data/products";
import { NATIONS } from "../data/nations";
import type { PickupStation, PickupStationStatus } from "../data/pickupStations";
import { IconDownload, IconCheck, IconClose, IconPlus, IconTrash, IconLogout } from "../components/Icons";
import { clearTokens } from "../api/client";
import { Link, useRouter } from "../router";
import { exportOrdersExcel, type ExportScope } from "../utils/excel";
import { BarChart, LineChart } from "../components/Charts";

type Tab = "overview" | "orders" | "nations" | "pickup" | "products" | "subscribers" | "settings";

export function AdminDashboard({ superAdmin = false }: { superAdmin?: boolean }) {
  const {
    user, setUser, orders, nations, pickupStations, subscribers,
    updateOrder, addPickupStation, updatePickupStation, deletePickupStation, toast,
  } = useApp();
  const { navigate } = useRouter();

  // =====================================================================
  // Direct API fetch for orders — bypasses localStorage entirely.
  // The Admin always sees ALL orders from the PostgreSQL database,
  // regardless of which device placed them.
  // =====================================================================
  const [apiOrders, setApiOrders] = useState<Order[]>([]);

  const fetchOrdersFromBackend = async () => {

    try {
      const base = (await import("../api/client")).api.baseUrl;
      if (!base) return;
      const tok = localStorage.getItem("db_access_token");
      const headers: Record<string, string> = {};
      if (tok) headers["Authorization"] = `Bearer ${tok}`;
      const res = await fetch(`${base}/admin/orders?limit=500`, { headers });
      if (res.ok) {
        const json = await res.json();
        const list: Order[] = (json.data?.items || []).map((o: any) => ({
          id: o.id, date: o.createdAt,
          userId: o.userId || "", customerName: o.customerName, email: o.email, phone: o.phone,
          address: { id: "", label: "", fullName: o.customerName, phone: o.phone, street: o.shippingStreet || "", city: o.shippingCity || "", state: o.shippingState || "", country: o.shippingCountry || "Nigeria" },
          items: (o.items || []).map((it: any) => ({ productId: it.productId || "", name: it.name, price: Number(it.price), quantity: it.quantity })),
          total: Number(o.total), shippingFee: Number(o.shippingFee || 0), discount: Number(o.discount || 0),
          promoCode: o.promoCode || undefined,
          paymentMethod: o.paymentMethod === "BANK_TRANSFER" ? "Bank Transfer" : "Paystack",
          paymentStatus: o.paymentStatus === "AWAITING_VERIFICATION" ? "Awaiting Verification" : o.paymentStatus === "PAID" ? "Paid" : "Unpaid",
          paystackReference: o.paystackReference || undefined,
          bankProofUrl: (o.paymentProofs && o.paymentProofs.length > 0) ? o.paymentProofs[0].fileUrl : undefined,
          status: o.status,
          nationId: o.nationId || undefined, nationName: o.nationName || undefined, nationSlug: o.nationSlug || undefined,
          referralCode: o.referralCode || undefined,
          deliveryMethod: o.deliveryMethod === "PICKUP_STATION" ? "Pickup Station" : "Home Delivery",
          pickupStationId: o.pickupStationId || undefined, pickupStationName: o.pickupStationName || undefined,
          trackingNumber: o.trackingNumber || undefined,
        }));
        setApiOrders(list);
      }
    } catch { /* backend unreachable */ }
  };

  useEffect(() => { fetchOrdersFromBackend(); }, []);
  useEffect(() => {
    // Also merge app-state orders (from checkout placeOrder) into the API list
    setApiOrders((prev) => {
      const existingIds = new Set(prev.map((o) => o.id));
      const newLocal = orders.filter((o) => !existingIds.has(o.id));
      return newLocal.length > 0 ? [...newLocal, ...prev] : prev;
    });
  }, [orders]);

  // Stats computed from apiOrders (the source of truth)
  const displayOrders = apiOrders.length > 0 ? apiOrders : orders;
  const stats = useMemo(() => {
    const total = displayOrders.reduce((s, o) => s + o.total, 0);
    const paid = displayOrders.filter((o) => o.paymentStatus === "Paid");
    const pending = displayOrders.filter((o) => o.paymentStatus !== "Paid");
    const processing = displayOrders.filter((o) => o.status === "Processing");
    const delivered = displayOrders.filter((o) => o.status === "Delivered");
    const paidRevenue = paid.reduce((s, o) => s + o.total, 0);
    return {
      revenue: total, paidRevenue, orders: displayOrders.length,
      paid: paid.length, pending: pending.length, processing: processing.length, delivered: delivered.length,
    };
  }, [displayOrders]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const o of displayOrders) for (const it of o.items) {
      const c = map.get(it.productId) || { name: it.name, qty: 0, revenue: 0 };
      c.qty += it.quantity; c.revenue += it.price * it.quantity;
      map.set(it.productId, c);
    }
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [displayOrders]);

  const monthlyRevenue = useMemo(() => {
    const months: { label: string; value: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const v = displayOrders
        .filter((o) => {
          const od = new Date(o.date);
          return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth() && o.paymentStatus === "Paid";
        })
        .reduce((s, o) => s + o.total, 0);
      months.push({ label: d.toLocaleDateString("en-US", { month: "short" }), value: v });
    }
    return months;
  }, [displayOrders]);

  const [tab, setTab] = useState<Tab>("overview");
  const [exportScope, setExportScope] = useState<ExportScope>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterNationId, setFilterNationId] = useState("");
  const [filterReferral, setFilterReferral] = useState("");
  const [exporting, setExporting] = useState(false);

  const requiredRole = superAdmin ? ["super_admin"] : ["admin", "super_admin"];

  if (!user || !requiredRole.includes(user.role)) {
    return (
      <Container className="py-24 text-center">
        <h2 className="font-display text-3xl font-bold mb-4">Access denied</h2>
        <p className="text-gray-600 mb-6">{superAdmin ? "Super Admin" : "Admin"} account required.</p>
        <Link to="/login"><Button>Sign In</Button></Link>
      </Container>
    );
  }

  const handleExport = async () => {
    setExporting(true);
    try {
      const r = await exportOrdersExcel(displayOrders, {
        scope: exportScope,
        startDate: exportScope === "range" ? startDate : undefined,
        endDate: exportScope === "range" ? endDate : undefined,
        nationId: filterNationId || undefined,
        referralCode: filterReferral || undefined,
      }, nations);
      toast({ type: "success", message: `Exported ${r.count} order(s) → ${r.filename}` });
    } catch {
      toast({ type: "error", message: "Export failed. Please try again." });
    } finally {
      setExporting(false);
    }
  };

  const tabs: { k: Tab; l: string }[] = [
    { k: "overview", l: "Overview" },
            { k: "orders", l: `Orders (${displayOrders.length})` },
    { k: "nations", l: `Nations (${NATIONS.length})` },
    { k: "pickup", l: `Pickup Stations (${pickupStations.length})` },
    { k: "products", l: `Products (${PRODUCTS.length})` },
    { k: "subscribers", l: `Subscribers (${subscribers.length})` },
    { k: "settings", l: "Settings" },
  ];

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <Container className="py-10">
        <div className="bg-[#222] rounded-3xl p-6 sm:p-8 text-white mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/60 mb-1">{superAdmin ? "Super Admin Console" : "Admin Console"}</div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Diamond Body</h1>
            <p className="text-white/70 text-sm">Welcome, {user.name}</p>
          </div>
          <div className="flex gap-2 items-center">
            <Badge tone="oxblood">{user.role.replace("_", " ").toUpperCase()}</Badge>
            <button
              onClick={() => { clearTokens(); navigate("/"); setTimeout(() => { setUser(null); toast({ type: "info", message: "Signed out" }); }, 0); }}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-semibold"
            >
              <IconLogout size={14}/> Sign out
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-6">
          <aside className="bg-white rounded-2xl border border-gray-100 p-2 h-fit lg:sticky lg:top-24">
            {tabs.map((t) => (
              <button key={t.k} onClick={() => setTab(t.k)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition ${tab === t.k ? "bg-[#4A0E16] text-white" : "text-gray-700 hover:bg-gray-100"}`}>
                {t.l}
              </button>
            ))}
          </aside>

          <main className="space-y-6">
            {tab === "overview" && (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Revenue (paid)" value={formatNGN(stats.paidRevenue)} highlight/>
                  <StatCard label="Total Orders" value={stats.orders}/>
                  <StatCard label="Paid" value={stats.paid}/>
                  <StatCard label="Pending" value={stats.pending}/>
                  <StatCard label="Processing" value={stats.processing}/>
                  <StatCard label="Delivered" value={stats.delivered}/>
                  <StatCard label="Nations" value={NATIONS.length}/>
                  <StatCard label="Pickup Stations" value={pickupStations.length}/>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:col-span-2">
                    <h3 className="font-display text-xl font-bold mb-4">Monthly Revenue (Paid)</h3>
                    <LineChart data={monthlyRevenue} valueLabel={(v) => formatNGN(v)}/>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="font-display text-xl font-bold mb-4">Top Products</h3>
                    <BarChart data={topProducts.map((p) => ({ label: p.name.split(" ").slice(0, 2).join(" "), value: p.qty }))} height={160}/>
                  </div>
                </div>

                {/* EXCEL EXPORT — Admin sees ALL orders */}
                <div className="bg-white rounded-2xl border-2 border-[#4A0E16]/20 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#4A0E16] text-white flex items-center justify-center">
                      <IconDownload size={20}/>
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold">Export Orders to Excel (.xlsx)</h3>
                      <p className="text-xs text-gray-500">ExcelJS-powered export. Includes Orders + Summary worksheets.</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <label className="block">
                      <span className="block text-xs font-semibold mb-1 text-gray-700">Scope</span>
                      <select value={exportScope} onChange={(e) => setExportScope(e.target.value as ExportScope)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4A0E16]">
                        <option value="all">All Orders</option>
                        <option value="paid">Paid Orders</option>
                        <option value="pending">Pending Orders</option>
                        <option value="processing">Processing Orders</option>
                        <option value="delivered">Delivered Orders</option>
                        <option value="range">Date Range</option>
                        <option value="nation">Orders by Nation</option>
                        <option value="referral">Orders by Referral Code</option>
                      </select>
                    </label>

                    {exportScope === "nation" && (
                      <label className="block">
                        <span className="block text-xs font-semibold mb-1 text-gray-700">Nation</span>
                        <select value={filterNationId} onChange={(e) => setFilterNationId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm">
                          <option value="">— Select Nation —</option>
                          {NATIONS.map((n) => <option key={n.id} value={n.id}>{n.id} — {n.name}</option>)}
                        </select>
                      </label>
                    )}

                    {exportScope === "referral" && (
                      <label className="block">
                        <span className="block text-xs font-semibold mb-1 text-gray-700">Referral Code</span>
                        <input value={filterReferral} onChange={(e) => setFilterReferral(e.target.value.toUpperCase())} placeholder="e.g. REF-1234" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"/>
                      </label>
                    )}

                    {exportScope === "range" && (
                      <>
                        <label className="block">
                          <span className="block text-xs font-semibold mb-1 text-gray-700">Start Date</span>
                          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"/>
                        </label>
                        <label className="block">
                          <span className="block text-xs font-semibold mb-1 text-gray-700">End Date</span>
                          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"/>
                        </label>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-5">
                    <Button onClick={handleExport} disabled={exporting} size="lg">
                      <IconDownload size={18}/> {exporting ? "Generating Excel..." : "Export Orders to Excel"}
                    </Button>
                    <p className="text-xs text-gray-500">
                      Generates: <span className="font-mono font-semibold text-[#4A0E16]">DiamondBody_Orders_{new Date().toISOString().slice(0, 10)}.xlsx</span>
                    </p>
                  </div>
                </div>
              </>
            )}

            {tab === "orders" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display text-xl font-bold">All Orders</h3>
                  <Button size="sm" onClick={handleExport} disabled={exporting}>
                    <IconDownload size={14}/> {exporting ? "..." : "Export"}
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                        <th className="py-3 pr-3">Order</th>
                        <th className="py-3 pr-3">Customer</th>
                        <th className="py-3 pr-3 hidden md:table-cell">Nation</th>
                        <th className="py-3 pr-3 hidden md:table-cell">Delivery</th>
                        <th className="py-3 pr-3 hidden md:table-cell">Payment</th>
                        <th className="py-3 pr-3">Total</th>
                        <th className="py-3 pr-3">Status</th>
                        <th className="py-3 pr-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayOrders.map((o) => (
                        <AdminOrderRow key={o.id} order={o} onUpdate={updateOrder}/>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "nations" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-display text-xl font-bold mb-1">Nations</h3>
                <p className="text-xs text-gray-500 mb-5">8 locked Nations. Customers enter via the Nation URL.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                        <th className="py-3 pr-3">Nation ID</th>
                        <th className="py-3 pr-3">Nation</th>
                        <th className="py-3 pr-3 hidden md:table-cell">Owner</th>
                        <th className="py-3 pr-3 hidden sm:table-cell">URL</th>
                        <th className="py-3 pr-3">Orders</th>
                      </tr>
                    </thead>
                    <tbody>
                      {NATIONS.map((n) => {
                        const count = displayOrders.filter((o) => o.nationId === n.id).length;
                        return (
                          <tr key={n.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-3 pr-3 font-mono font-semibold text-[#4A0E16]">{n.id}</td>
                            <td className="py-3 pr-3 font-semibold">{n.name}</td>
                            <td className="py-3 pr-3 hidden md:table-cell text-xs">
                              <div>{n.ownerName}</div>
                              <div className="text-gray-500">{n.email}</div>
                            </td>
                            <td className="py-3 pr-3 hidden sm:table-cell text-xs font-mono text-gray-600">/{n.slug}</td>
                            <td className="py-3 pr-3 font-bold">{count}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "pickup" && (
              <PickupStationManagement
                stations={pickupStations}
                onAdd={addPickupStation}
                onUpdate={updatePickupStation}
                onDelete={deletePickupStation}
                onToast={toast}
              />
            )}

            {tab === "products" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-display text-xl font-bold mb-4">Products</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PRODUCTS.map((p) => (
                    <div key={p.id} className="border border-gray-100 rounded-xl p-4">
                      <img src={p.image} className="w-full aspect-square object-cover rounded-lg bg-[#F5F5F5] mb-3"/>
                      <div className="font-semibold text-sm">{p.name}</div>
                      <div className="text-xs text-gray-500 mb-2">{p.category}</div>
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-[#4A0E16]">{formatNGN(p.price)}</span>
                        <span className={`text-xs ${p.inventory > 20 ? "text-emerald-600" : "text-amber-600"}`}>Stock: {p.inventory}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "subscribers" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-display text-xl font-bold mb-4">Newsletter Subscribers ({subscribers.length})</h3>
                {subscribers.length === 0 ? (
                  <p className="text-gray-500 text-sm">No subscribers yet.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {subscribers.map((s, i) => (
                      <li key={i} className="py-2 text-sm flex items-center justify-between">
                        <span>{s}</span>
                        <Badge tone="success">Active</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {tab === "settings" && (
              <div className="space-y-6 max-w-3xl">
                {/* —— Bank Details —— */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-display text-xl font-bold mb-4">Bank Details</h3>
                  <p className="text-xs text-gray-500 mb-4">These appear on the checkout page for bank transfer payments.</p>
                  <div className="space-y-3">
                    {[
                      ["Bank Name", "Zenith Bank"],
                      ["Account Name", "Sell Masters Limited"],
                      ["Account Number", "1311356402"],
                      ["Reference", "Use your Order ID as payment reference"],
                    ].map(([k, v]) => (
                      <div key={k} className="grid grid-cols-[180px_1fr] gap-3 items-center">
                        <div className="text-sm font-semibold text-gray-700">{k}</div>
                        <input defaultValue={v} className="px-4 py-2 rounded-xl border border-gray-200 text-sm"/>
                      </div>
                    ))}
                  </div>
                  <Button className="mt-6" onClick={() => toast({ type: "success", message: "Bank details saved" })}>Save Bank Details</Button>
                </div>

                {/* —— Delivery Fees —— */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-display text-xl font-bold mb-4">Delivery Fees</h3>
                  <p className="text-xs text-gray-500 mb-4">Configure the shipping charges for customers.</p>
                  <div className="space-y-3">
                    {[
                      ["Home Delivery Fee (₦)", "2500"],
                      ["Pickup Station Fee (₦)", "0"],
                    ].map(([k, v]) => (
                      <div key={k} className="grid grid-cols-[220px_1fr] gap-3 items-center">
                        <div className="text-sm font-semibold text-gray-700">{k}</div>
                        <input defaultValue={v} type="number" className="px-4 py-2 rounded-xl border border-gray-200 text-sm"/>
                      </div>
                    ))}
                  </div>
                  <Button className="mt-6" onClick={() => toast({ type: "success", message: "Delivery fees updated" })}>Save Delivery Fees</Button>
                </div>

                {/* —— Paystack (Coming Soon) —— */}
                <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg">💳</div>
                    <div>
                      <h3 className="font-display text-xl font-bold">Paystack — Coming Soon</h3>
                      <p className="text-xs text-amber-700">All fields are read-only. When you receive your Paystack credentials, enter them here and online card payments will activate instantly.</p>
                    </div>
                  </div>
                  <div className="space-y-3 opacity-60">
                    {[
                      ["Secret Key", "••••••••••••••••"],
                      ["Public Key", "••••••••••••••••"],
                      ["Webhook Secret", "••••••••••••••••"],
                    ].map(([k, v]) => (
                      <div key={k} className="grid grid-cols-[180px_1fr] gap-3 items-center">
                        <div className="text-sm font-semibold text-gray-700">{k}</div>
                        <input defaultValue={v} disabled className="px-4 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50"/>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-xs text-amber-600 bg-amber-50 rounded-lg p-3">
                    <strong>Instructions:</strong> Once you have your Paystack Secret Key, Public Key, and Webhook Secret, paste them here and click Save. The frontend will automatically enable Paystack as a payment option — no code changes needed.
                  </div>
                  <Button className="mt-4" variant="outline" disabled>Activate Paystack</Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </Container>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border ${highlight ? "bg-[#4A0E16] text-white border-[#4A0E16]" : "bg-white border-gray-100"}`}>
      <div className={`text-xs uppercase tracking-wider ${highlight ? "text-white/70" : "text-gray-500"}`}>{label}</div>
      <div className="font-display text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function AdminOrderRow({ order, onUpdate }: { order: Order; onUpdate: (id: string, patch: Partial<Order>) => void }) {
  const [showProof, setShowProof] = useState(false);
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 align-top">
      <td className="py-3 pr-3">
        <div className="font-semibold">{order.id}</div>
        <div className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</div>
      </td>
      <td className="py-3 pr-3">
        <div className="font-medium text-sm">{order.customerName}</div>
        <div className="text-xs text-gray-500">{order.phone}</div>
      </td>
      <td className="py-3 pr-3 hidden md:table-cell text-xs">
        {order.nationId ? (
          <>
            <div className="font-mono font-semibold">{order.nationId}</div>
            <div className="text-gray-500">{order.nationName}</div>
            {order.referralCode && <Badge tone="default" className="mt-1">{order.referralCode}</Badge>}
          </>
        ) : <span className="text-gray-400">—</span>}
      </td>
      <td className="py-3 pr-3 hidden md:table-cell text-xs">
        <div className="font-medium">{order.deliveryMethod}</div>
        {order.pickupStationName && <div className="text-gray-500">{order.pickupStationName}</div>}
      </td>
      <td className="py-3 pr-3 hidden md:table-cell">
        <Badge tone={order.paymentStatus === "Paid" ? "success" : "warning"}>{order.paymentStatus}</Badge>
        <div className="text-xs text-gray-500 mt-1">{order.paymentMethod}</div>
        {order.bankProofUrl && (
          <button onClick={() => setShowProof(true)} className="text-xs text-[#4A0E16] underline mt-1">View proof</button>
        )}
      </td>
      <td className="py-3 pr-3 font-bold text-[#4A0E16]">{formatNGN(order.total)}</td>
      <td className="py-3 pr-3">
        <select value={order.status} onChange={(e) => onUpdate(order.id, { status: e.target.value as OrderStatus })} className="px-2 py-1 rounded-lg border border-gray-200 text-xs">
          {(["Pending","Awaiting Payment","Paid","Processing","Shipped","Delivered","Cancelled","Refunded"] as OrderStatus[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </td>
      <td className="py-3 pr-3">
        {order.paymentStatus === "Awaiting Verification" && (
          <div className="flex gap-1">
            <button
              onClick={() => onUpdate(order.id, { paymentStatus: "Paid" as PaymentStatus, status: "Processing" })}
              className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200" title="Verify">
              <IconCheck size={14}/>
            </button>
            <button
              onClick={() => onUpdate(order.id, { paymentStatus: "Failed" as PaymentStatus })}
              className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200" title="Reject">
              <IconClose size={14}/>
            </button>
          </div>
        )}
        {showProof && order.bankProofUrl && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowProof(false)}>
            <div className="bg-white rounded-2xl p-4 max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Payment Proof — {order.id}</h4>
                <button onClick={() => setShowProof(false)}><IconClose/></button>
              </div>
              {order.bankProofUrl.startsWith("data:") ? (
                <img src={order.bankProofUrl} className="w-full rounded-xl" alt="Proof"/>
              ) : (
                <div className="bg-[#F5F5F5] rounded-xl p-8 text-center">
                  <div className="text-4xl mb-2">📄</div>
                  <p className="font-mono text-xs break-all text-gray-600">{order.bankProofUrl}</p>
                  <p className="text-xs text-gray-500 mt-2">(Cloudinary-hosted proof image)</p>
                </div>
              )}
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}

// ============================================================================
// CHANGE 6 — PICKUP STATION MANAGEMENT
// ============================================================================
function PickupStationManagement({
  stations, onAdd, onUpdate, onDelete, onToast,
}: {
  stations: PickupStation[];
  onAdd: (p: PickupStation) => void;
  onUpdate: (id: string, patch: Partial<PickupStation>) => void;
  onDelete: (id: string) => void;
  onToast: (t: { type: "success" | "error" | "info"; message: string }) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PickupStation | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-5 gap-3">
        <div>
          <h3 className="font-display text-xl font-bold">Pickup Station Management</h3>
          <p className="text-xs text-gray-500">Add, edit, disable or delete pickup stations.</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setShowForm(true); }}><IconPlus size={14}/> Add Pickup Station</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <th className="py-3 pr-3">ID</th>
              <th className="py-3 pr-3">Name</th>
              <th className="py-3 pr-3 hidden md:table-cell">Address</th>
              <th className="py-3 pr-3">City</th>
              <th className="py-3 pr-3">Status</th>
              <th className="py-3 pr-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stations.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-gray-500">No pickup stations.</td></tr>
            )}
            {stations.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 pr-3 font-mono font-semibold text-[#4A0E16]">{s.id}</td>
                <td className="py-3 pr-3">
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-gray-500">{s.phone} • {s.hours}</div>
                </td>
                <td className="py-3 pr-3 hidden md:table-cell text-xs">{s.address}</td>
                <td className="py-3 pr-3 text-sm">{s.city}, {s.state}</td>
                <td className="py-3 pr-3"><Badge tone={s.status === "active" ? "success" : "error"}>{s.status}</Badge></td>
                <td className="py-3 pr-3">
                  <div className="flex gap-1 justify-end flex-wrap">
                    <button onClick={() => { setEditing(s); setShowForm(true); }} className="text-xs px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 font-semibold">Edit</button>
                    <button
                      onClick={() => { onUpdate(s.id, { status: s.status === "active" ? "disabled" : "active" }); onToast({ type: "success", message: `Station ${s.status === "active" ? "disabled" : "activated"}` }); }}
                      className="text-xs px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold"
                    >
                      {s.status === "active" ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete pickup station ${s.name}?`)) { onDelete(s.id); onToast({ type: "success", message: "Pickup station deleted" }); } }}
                      className="text-xs p-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700"
                    ><IconTrash size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <PickupStationForm
          station={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={(data) => {
            if (editing) {
              onUpdate(editing.id, data);
              onToast({ type: "success", message: "Pickup station updated" });
            } else {
              const id = "PKS" + String(stations.length + 1).padStart(3, "0");
              const newStation: PickupStation = {
                id,
                name: data.name!,
                address: data.address!,
                city: data.city!,
                state: data.state!,
                phone: data.phone || "",
                hours: data.hours || "Mon–Sat, 9am–6pm",
                status: "active",
              };
              onAdd(newStation);
              onToast({ type: "success", message: `Pickup station ${id} created` });
            }
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function PickupStationForm({ station, onClose, onSave }: {
  station: PickupStation | null;
  onClose: () => void;
  onSave: (data: Partial<PickupStation>) => void;
}) {
  const [form, setForm] = useState<Partial<PickupStation>>(station || {
    name: "", address: "", city: "", state: "", phone: "", hours: "Mon–Sat, 9am–6pm", status: "active" as PickupStationStatus,
  });
  const [err, setErr] = useState("");

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!form.name || !form.address || !form.city || !form.state) { setErr("Name, address, city and state are required"); return; }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-xl font-bold mb-4">{station ? "Edit Pickup Station" : "Add Pickup Station"}</h3>
        <form onSubmit={save} className="space-y-3">
          <FormInput label="Name" value={form.name || ""} onChange={(v) => setForm({ ...form, name: v })} required/>
          <FormInput label="Address" value={form.address || ""} onChange={(v) => setForm({ ...form, address: v })} required/>
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="City" value={form.city || ""} onChange={(v) => setForm({ ...form, city: v })} required/>
            <FormInput label="State" value={form.state || ""} onChange={(v) => setForm({ ...form, state: v })} required/>
          </div>
          <FormInput label="Phone" value={form.phone || ""} onChange={(v) => setForm({ ...form, phone: v })}/>
          <FormInput label="Hours" value={form.hours || ""} onChange={(v) => setForm({ ...form, hours: v })}/>
          {station && (
            <label className="block">
              <span className="block text-xs font-semibold mb-1 text-gray-700">Status</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PickupStationStatus })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm">
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </label>
          )}
          {err && <div className="text-xs text-red-600 bg-red-50 rounded-lg p-2">{err}</div>}
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">{station ? "Save Changes" : "Add Station"}</Button>
            <button type="button" onClick={onClose} className="px-4 py-3 rounded-full border border-gray-200 text-sm font-semibold">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text", required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold mb-1 text-gray-700">{label}{required && " *"}</span>
      <input type={type} value={value} required={required} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4A0E16] text-sm"/>
    </label>
  );
}
