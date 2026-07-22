import { useMemo, useState } from "react";
import { Container, Button } from "../components/UI";
import { useApp, formatNGN } from "../store/store";
import { PRODUCTS } from "../data/products";
import { parseRoute, useRouter, Link } from "../router";
import { clearTokens } from "../api/client";
import { useServerOrders, SyncBar, StatCard, StatusPill, SkeletonRows, AmbientBg, Reveal, naira } from "../api/serverOrders";

type Tab = "overview" | "orders" | "wishlist" | "addresses" | "profile";

export function UserDashboard() {
  const app = useApp() as any;
  const user = app.user;
  const wishlist: string[] = app.wishlist || [];
  const toggleWishlist = app.toggleWishlist;
  const addresses: any[] = app.addresses || [];
  const addAddress = app.addAddress;
  const removeAddress = app.removeAddress;
  const toast = app.toast;
  const { path, navigate } = useRouter();
  const { params } = parseRoute(path);
  const [tab, setTab] = useState<Tab>((params.get("tab") as Tab) || "overview");
  const { orders, loading, synced, reload, error } = useServerOrders(user?.role);

  const myWishlist = useMemo(() => PRODUCTS.filter((p: any) => wishlist.includes(p.id)), [wishlist]);
  const paid = orders.filter((o: any) => (o.paymentStatus || "").toLowerCase() === "paid");
  const totalSpent = paid.reduce((s: number, o: any) => s + Number(o.total || 0), 0);
  const completed = orders.filter((o: any) => (o.status || "").toLowerCase() === "delivered").length;
  const transit = orders.filter((o: any) => ["processing", "shipped"].includes((o.status || "").toLowerCase())).length;
  const [addrForm, setAddrForm] = useState({ label: "Home", street: "", city: "", state: "" });

  const tabs: { k: Tab; l: string; n?: number }[] = [
    { k: "overview", l: "Overview" }, { k: "orders", l: "Orders", n: orders.length },
    { k: "wishlist", l: "Wishlist", n: myWishlist.length }, { k: "addresses", l: "Addresses", n: addresses.length }, { k: "profile", l: "Profile" },
  ];

  if (!user) return <div className="min-h-screen bg-light-gray"><AmbientBg /><Container className="py-24 text-center"><h2 className="font-display text-3xl font-bold mb-4 text-charcoal">Please sign in</h2><Link to="/login"><Button>Login</Button></Link></Container></div>;

  return (
    <div className="min-h-screen bg-light-gray">
      <AmbientBg />
      <Container className="py-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-oxblood via-oxblood to-[#2b0810] text-white p-7 sm:p-9 mb-7 shadow-xl">
            <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute right-10 bottom-0 w-40 h-40 rounded-full bg-gold/20 blur-2xl" />
            <div className="relative">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/70 font-bold">My Dashboard</p>
              <h1 className="font-display text-3xl sm:text-5xl font-bold mt-1.5 leading-tight">Welcome back,<br className="hidden sm:block" /> {user.name || "friend"}.</h1>
              <p className="text-white/75 mt-3 max-w-lg">Your order history lives on our server — sign in on any phone or laptop and you'll see exactly the same thing.</p>
              <div className="mt-5"><SyncBar loading={loading} synced={synced} reload={reload} count={orders.length} error={error} /></div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="flex flex-wrap gap-1.5 mb-6 p-1 bg-white rounded-2xl border border-gray-100 shadow-sm w-fit">
            {tabs.map((t) => (
              <button key={t.k} onClick={() => setTab(t.k)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === t.k ? "bg-oxblood text-white shadow" : "text-gray-500 hover:text-charcoal hover:bg-gray-50"}`}>{t.l}{typeof t.n === "number" ? ` (${t.n})` : ""}</button>
            ))}
          </div>
        </Reveal>

        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Orders" value={orders.length} hint="across all devices" delay={0} />
              <StatCard label="Completed" value={completed} hint="delivered" accent="text-emerald-700" delay={80} />
              <StatCard label="In Transit" value={transit} hint="on the way" accent="text-sky-700" delay={160} />
              <StatCard label="Total Spent" value={naira(totalSpent)} hint="lifetime" accent="text-oxblood" delay={240} />
            </div>
            <Reveal delay={120}><div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"><h2 className="font-display text-lg font-bold text-charcoal">Recent Orders</h2><button onClick={() => setTab("orders")} className="text-xs font-bold text-oxblood hover:underline">View all →</button></div>
              <OrderTable rows={orders.slice(0, 6)} loading={loading} />
            </div></Reveal>
          </div>
        )}

        {tab === "orders" && <Reveal><div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"><div className="px-6 py-4 border-b border-gray-100"><h2 className="font-display text-lg font-bold text-charcoal">All Orders</h2></div><OrderTable rows={orders} loading={loading} /></div></Reveal>}

        {tab === "wishlist" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {myWishlist.length === 0 ? <p className="col-span-full text-center text-gray-500 py-20">Your wishlist is empty. Tap the heart on any product.</p> :
              myWishlist.map((p: any, i: number) => (
                <Reveal key={p.id} delay={i * 50}><div className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all">
                  <Link to={`/product/${p.slug || p.id}`}><div className="overflow-hidden"><img src={p.image} alt={p.name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500" /></div></Link>
                  <div className="p-4"><div className="font-semibold text-charcoal line-clamp-1">{p.name}</div><div className="text-oxblood font-bold mt-1 tabular-nums">{formatNGN(p.price)}</div><Button onClick={() => { toggleWishlist?.(p.id); toast?.("Removed", "info"); }} className="mt-3 w-full text-xs">Remove</Button></div>
                </div></Reveal>
              ))}
          </div>
        )}

        {tab === "addresses" && (
          <Reveal><div className="grid lg:grid-cols-3 gap-6">
            <form onSubmit={(e) => { e.preventDefault(); addAddress?.({ ...addrForm, id: "a" + Date.now() }); setAddrForm({ label: "Home", street: "", city: "", state: "" }); toast?.("Address saved", "success"); }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-display text-lg font-bold text-charcoal mb-4">Add address</h2>
              <div className="space-y-3">
                <Fld label="Label" value={addrForm.label} onChange={(v) => setAddrForm({ ...addrForm, label: v })} />
                <Fld label="Street" value={addrForm.street} onChange={(v) => setAddrForm({ ...addrForm, street: v })} />
                <Fld label="City" value={addrForm.city} onChange={(v) => setAddrForm({ ...addrForm, city: v })} />
                <Fld label="State" value={addrForm.state} onChange={(v) => setAddrForm({ ...addrForm, state: v })} />
                <Button className="w-full">Save address</Button>
              </div>
            </form>
            <div className="lg:col-span-2 space-y-3">
              {addresses.length === 0 ? <p className="text-gray-500 py-10 text-center bg-white rounded-2xl border border-gray-100">No saved addresses yet.</p> :
                addresses.map((a: any) => (<div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between gap-4 hover:shadow-md transition-shadow"><div><div className="font-bold text-charcoal">{a.label}</div><div className="text-sm text-gray-600 mt-1">{a.street}, {a.city}, {a.state}</div></div><button onClick={() => { removeAddress?.(a.id); toast?.("Removed", "info"); }} className="text-xs font-bold text-rose-600 hover:underline">Delete</button></div>))}
            </div>
          </div></Reveal>
        )}

        {tab === "profile" && (
          <Reveal><div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-xl">
            <h2 className="font-display text-lg font-bold text-charcoal mb-5">Profile</h2>
            <div className="space-y-4">
              <Info label="Name" value={user.name} /><Info label="Email" value={user.email} /><Info label="Phone" value={user.phone} /><Info label="Member since" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"} />
              <Button onClick={() => { clearTokens(); app.setUser?.(null); navigate("/login"); }} className="w-full">Sign out</Button>
            </div>
          </div></Reveal>
        )}
      </Container>
    </div>
  );
}

function Fld({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <label className="block"><span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-oxblood focus:ring-2 focus:ring-oxblood/10" /></label>;
}
function Info({ label, value }: { label: string; value?: string }) {
  return <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">{label}</span><span className="text-charcoal font-medium">{value || "—"}</span></div>;
}
function OrderTable({ rows, loading }: { rows: any[]; loading: boolean }) {
  return <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-100 bg-gray-50/70"><th className="py-3 px-4">Order</th><th className="py-3 px-4">Items</th><th className="py-3 px-4 text-right">Total</th><th className="py-3 px-4">Payment</th><th className="py-3 px-4">Status</th><th className="py-3 px-4">Date</th></tr></thead>
    {loading ? <SkeletonRows rows={5} cols={6} /> : rows.length === 0 ? <tbody><tr><td colSpan={6} className="py-16 text-center text-gray-500">No orders yet. Place one — it will appear here on every device.</td></tr></tbody> : (
      <tbody>{rows.map((o: any) => (<tr key={o.id || o.orderNumber} className="border-b border-gray-50 hover:bg-oxblood/[0.03] transition-colors"><td className="py-3 px-4 font-mono font-bold text-charcoal">{o.orderNumber || o.id}</td><td className="py-3 px-4 text-gray-600 tabular-nums">{o.items?.length || 0}</td><td className="py-3 px-4 text-right font-bold tabular-nums">{naira(o.total)}</td><td className="py-3 px-4"><StatusPill s={o.paymentStatus} /></td><td className="py-3 px-4"><StatusPill s={o.status} /></td><td className="py-3 px-4 text-gray-500 text-xs tabular-nums">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</td></tr>))}</tbody>
    )}</table></div>;
}

export default UserDashboard;