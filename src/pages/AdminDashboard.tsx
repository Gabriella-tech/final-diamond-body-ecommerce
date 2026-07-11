import { useMemo, useState } from "react";
import { Container, Button, Badge } from "../components/UI";
import { useApp, formatNGN, type Order, type OrderStatus } from "../store/store";
import { PRODUCTS } from "../data/products";
import { NATIONS } from "../data/nations";
import { IconDownload, IconCheck, IconClose, IconLogout } from "../components/Icons";
import { clearTokens } from "../api/client";
import { adminService } from "../api/services";
import { Link, useRouter } from "../router";
import { exportOrdersExcel, type ExportScope } from "../utils/excel";
import { BarChart, LineChart } from "../components/Charts";

type Tab = "overview" | "orders" | "nations" | "pickup" | "products" | "subscribers" | "settings";

export function AdminDashboard({ superAdmin = false }: { superAdmin?: boolean }) {
 const {
    user, setUser, orders, nations, pickupStations, subscribers,
    updateOrder, toast,
  } = useApp();
  const { navigate } = useRouter();
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

  const stats = useMemo(() => {
    const total = orders.reduce((s, o) => s + o.total, 0);
    const paid = orders.filter((o) => o.paymentStatus === "Paid");
    const pending = orders.filter((o) => o.paymentStatus !== "Paid");
    const processing = orders.filter((o) => o.status === "Processing");
    const delivered = orders.filter((o) => o.status === "Delivered");
    const paidRevenue = paid.reduce((s, o) => s + o.total, 0);
    return {
      revenue: total, paidRevenue, orders: orders.length,
      paid: paid.length, pending: pending.length, processing: processing.length, delivered: delivered.length,
    };
  }, [orders]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const o of orders) for (const it of o.items) {
      const c = map.get(it.productId) || { name: it.name, qty: 0, revenue: 0 };
      c.qty += it.quantity; c.revenue += it.price * it.quantity;
      map.set(it.productId, c);
    }
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [orders]);

  const monthlyRevenue = useMemo(() => {
    const months: { label: string; value: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const v = orders
        .filter((o) => {
          const od = new Date(o.date);
          return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth() && o.paymentStatus === "Paid";
        })
        .reduce((s, o) => s + o.total, 0);
      months.push({ label: d.toLocaleDateString("en-US", { month: "short" }), value: v });
    }
    return months;
  }, [orders]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const r = await exportOrdersExcel(orders, {
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
    { k: "orders", l: `Orders (${orders.length})` },
    { k: "nations", l: `Nations (${nations.length})` },
    { k: "pickup", l: `Pickup (${pickupStations.length})` },
    { k: "products", l: `Products (${PRODUCTS.length})` },
    { k: "subscribers", l: `Subs (${subscribers.length})` },
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
                  <StatCard label="Nations" value={nations.length}/>
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
                <div className="bg-white rounded-2xl border-2 border-[#4A0E16]/20 p-6">
                  <h3 className="font-display text-xl font-bold mb-4">Export Orders</h3>
                  <Button onClick={handleExport} disabled={exporting}>{exporting ? "Generating..." : "Export to Excel"}</Button>
                </div>
              </>
            )}

            {tab === "orders" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <table className="w-full text-sm">
                  <tbody>{orders.map((o) => <AdminOrderRow key={o.id} order={o} onUpdate={updateOrder}/>)}</tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </Container>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return <div className={`p-4 rounded-xl border ${highlight ? "bg-[#4A0E16] text-white" : "bg-white"}`}>
    <div className="text-xs opacity-70">{label}</div>
    <div className="font-bold text-lg">{value}</div>
  </div>;
}

function AdminOrderRow({ order, onUpdate }: { order: Order; onUpdate: (id: string, patch: Partial<Order>) => void }) {
  const handleStatusChange = async (s: OrderStatus) => {
    await adminService.updateOrderStatus(order.id, { status: s });
    onUpdate(order.id, { status: s });
  };
  return (
    <tr className="border-b">
      <td className="py-2">{order.id}</td>
      <td className="py-2">{order.customerName}</td>
      <td className="py-2">{formatNGN(order.total)}</td>
      <td className="py-2">
        <select value={order.status} onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}>
          {(["Pending","Paid","Processing","Delivered","Cancelled"] as OrderStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>
    </tr>
  );
}