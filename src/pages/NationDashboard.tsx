import { useEffect, useMemo, useState } from "react";
import { Container, Button, Badge } from "../components/UI";
import { useApp, formatNGN, type Order } from "../store/store";
import { IconDownload, IconTruck, IconLogout } from "../components/Icons";
import { clearTokens } from "../api/client";
import { Link, useRouter } from "../router";
import { exportOrdersExcel } from "../utils/excel";
import { BarChart, LineChart } from "../components/Charts";
import { findNationById, findNationByEmail } from "../data/nations";

export function NationDashboard() {
  const { user, setUser, orders, nations, toast, refreshOrders } = useApp();
  const { navigate } = useRouter();

  // Sync orders from backend on every mount (pulls orders from all devices)
  useEffect(() => { refreshOrders(); }, []);

  const nation = useMemo(() => {
    if (user?.nationId) return findNationById(user.nationId);
    if (user?.email) return findNationByEmail(user.email);
    return undefined;
  }, [user]);

  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");
  const [exporting, setExporting] = useState(false);

  if (!user || (user.role !== "nation" && user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <Container className="py-24 text-center">
        <h2 className="font-display text-3xl font-bold mb-4">Access denied</h2>
        <p className="text-gray-600 mb-6">You need a Nation owner account to access this dashboard.</p>
        <Link to="/login"><Button>Sign In</Button></Link>
      </Container>
    );
  }

  if (!nation) {
    return (
      <Container className="py-24 text-center">
        <h2 className="font-display text-3xl font-bold mb-4">No Nation linked</h2>
        <p className="text-gray-600">Ask an Admin to link your account to a Nation.</p>
      </Container>
    );
  }

  const nationId = nation.id;

  // =====================================================================
  // Direct API fetch — pulls only this nation's orders from PostgreSQL
  // =====================================================================
  const [apiOrders, setApiOrders] = useState<Order[]>([]);

 useEffect(() => {
  const fetchMyOrders = async () => {
    try {
      const base = "https://the-diamond-body-backend.onrender.com/api/v1";
      const tok = localStorage.getItem("db_access_token");
      const headers: Record<string, string> = {};
      if (tok) headers["Authorization"] = `Bearer ${tok}`;
      const res = await fetch(`${base}/admin/orders?limit=500&nationId=${nationId}`, { headers });
      if (res.ok) {
        const json = await res.json();
        setApiOrders((json.data?.items || []).map((o: any) => ({
          id: o.id, date: o.createdAt, customerName: o.customerName, email: o.email,
          items: (o.items || []).map((it: any) => ({ productId: it.productId || "", name: it.name, price: Number(it.price), quantity: it.quantity })),
          total: Number(o.total), paymentStatus: o.paymentStatus === "PAID" ? "Paid" : "Unpaid",
          status: o.status, referralCode: o.referralCode || undefined,
          nationId: o.nationId, nationName: o.nationName,
        } as Order)));
      }
    } catch { /* unreachable */ }
  };
  fetchMyOrders();
}, [nationId]);

const myOrders = useMemo(() => {
  const local = orders.filter((o) => o.nationId === nationId);
  const allIds = new Set(apiOrders.map((o) => o.id));
  const merged = [...apiOrders];
  for (const o of local) { if (!allIds.has(o.id)) merged.push(o); }
  let list = merged;
  if (filter === "paid") list = list.filter((o) => o.paymentStatus === "Paid");
  if (filter === "pending") list = list.filter((o) => o.paymentStatus !== "Paid");
  return list;
}, [orders, apiOrders, nationId, filter]);



  const paidOrders = myOrders.filter((o) => o.paymentStatus === "Paid");
  const revenue = paidOrders.reduce((s, o) => s + o.total, 0);
  const productsSold = myOrders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0), 0);
  const uniqueCustomers = new Set(myOrders.map((o) => o.email)).size;
  const referralCodesUsed = new Set(myOrders.map((o) => o.referralCode).filter(Boolean)).size;

  const months = useMemo(() => {
    const now = new Date();
    const arr: { label: string; year: number; month: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      arr.push({ label: d.toLocaleDateString("en-US", { month: "short" }), year: d.getFullYear(), month: d.getMonth() });
    }
    return arr;
  }, []);

  const monthlySales = months.map((m) => ({
    label: m.label,
    value: orders.filter((o) => {
      const d = new Date(o.date);
      return o.nationId === nationId && d.getFullYear() === m.year && d.getMonth() === m.month;
    }).length,
  }));

  const monthlyRevenue = months.map((m) => ({
    label: m.label,
    value: orders.filter((o) => {
      const d = new Date(o.date);
      return o.nationId === nationId && o.paymentStatus === "Paid" && d.getFullYear() === m.year && d.getMonth() === m.month;
    }).reduce((s, o) => s + o.total, 0),
  }));

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number }>();
    for (const o of myOrders) for (const it of o.items) {
      const c = map.get(it.productId) || { name: it.name, qty: 0 };
      c.qty += it.quantity;
      map.set(it.productId, c);
    }
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 6).map((p) => ({ label: p.name.split(" ").slice(0, 2).join(" "), value: p.qty }));
  }, [myOrders]);

  const handleExport = async () => {
    setExporting(true);
    try {
      // CHANGE 9: Nation can only export their own orders
      const r = await exportOrdersExcel(myOrders, { scope: "nation", nationId }, nations);
      toast({ type: "success", message: `Exported ${r.count} order(s) → ${r.filename}` });
    } catch {
      toast({ type: "error", message: "Export failed. Please try again." });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <Container className="py-10">
        <div className="bg-gradient-to-r from-[#4A0E16] to-[#34090f] rounded-3xl p-6 sm:p-8 text-white mb-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-white/70 mb-1">Nation Dashboard</div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">{nation.name}</h1>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-white/80">
                <span>Owner: <span className="font-semibold text-white">{nation.ownerName}</span></span>
                <span>•</span>
                <span>ID: <span className="font-mono font-semibold text-white">{nation.id}</span></span>
                <span>•</span>
                <span>URL: <span className="font-mono text-white">/{nation.slug}</span></span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="white" onClick={handleExport} disabled={exporting}>
                <IconDownload size={16}/> {exporting ? "Exporting..." : "Export My Orders"}
              </Button>
              <button
                onClick={() => { clearTokens(); navigate("/"); setTimeout(() => { setUser(null); toast({ type: "info", message: "Signed out" }); }, 0); }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-semibold"
              >
                <IconLogout size={16}/> Sign out
              </button>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard label="Total Orders" value={myOrders.length}/>
          <StatCard label="Revenue" value={formatNGN(revenue)}/>
          <StatCard label="Customers" value={uniqueCustomers}/>
          <StatCard label="Products Sold" value={productsSold}/>
          <StatCard label="Referral Codes Used" value={referralCodesUsed} highlight/>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Monthly Sales (Orders)">
            <BarChart data={monthlySales}/>
          </ChartCard>
          <ChartCard title="Monthly Revenue">
            <LineChart data={monthlyRevenue} valueLabel={(v) => formatNGN(v)}/>
          </ChartCard>
          <ChartCard title="Top Products (by units sold)" className="lg:col-span-2">
            {topProducts.length > 0 ? <BarChart data={topProducts} height={160}/> : <p className="text-sm text-gray-500">No products sold yet.</p>}
          </ChartCard>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5">
            <h3 className="font-display text-xl font-bold">Recent Orders</h3>
            <div className="flex gap-2">
              {(["all", "paid", "pending"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold capitalize ${filter === f ? "bg-[#4A0E16] text-white" : "bg-gray-100 text-gray-700"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  <th className="py-3 pr-4">Order ID</th>
                  <th className="py-3 pr-4">Customer</th>
                  <th className="py-3 pr-4 hidden md:table-cell">Date</th>
                  <th className="py-3 pr-4 hidden sm:table-cell">Referral</th>
                  <th className="py-3 pr-4">Total</th>
                  <th className="py-3 pr-4 hidden sm:table-cell">Payment</th>
                  <th className="py-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-500">
                    <IconTruck size={36} className="mx-auto mb-2 text-gray-300"/>
                    No orders yet.
                  </td></tr>
                )}
                {myOrders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 pr-4 font-semibold">{o.id}</td>
                    <td className="py-3 pr-4">
                      <div className="font-medium">{o.customerName}</div>
                      <div className="text-xs text-gray-500">{o.email}</div>
                    </td>
                    <td className="py-3 pr-4 text-gray-600 hidden md:table-cell">{new Date(o.date).toLocaleDateString()}</td>
                    <td className="py-3 pr-4 hidden sm:table-cell text-xs font-mono">{o.referralCode || "—"}</td>
                    <td className="py-3 pr-4 font-bold text-[#4A0E16]">{formatNGN(o.total)}</td>
                    <td className="py-3 pr-4 hidden sm:table-cell"><Badge tone={o.paymentStatus === "Paid" ? "success" : "warning"}>{o.paymentStatus}</Badge></td>
                    <td className="py-3 pr-4"><Badge tone="info">{o.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl p-6 border border-gray-100 ${className || ""}`}>
      <h4 className="font-display text-lg font-bold mb-4">{title}</h4>
      {children}
    </div>
  );
}