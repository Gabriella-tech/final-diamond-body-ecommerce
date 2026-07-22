import { useEffect, useState } from "react";
import { Container, Button, Badge } from "../components/UI";
import { useApp, formatNGN, type Order } from "../store/store";
import { PRODUCTS } from "../data/products";
import { parseRoute, useRouter, Link } from "../router";
import { IconLogout, IconTruck, IconHeart, IconUser, IconStar } from "../components/Icons";
import { clearTokens } from "../api/client";

type Tab = "overview" | "orders" | "wishlist" | "addresses" | "profile";

const statusTone = (s: string): "success" | "warning" | "info" | "default" | "error" => {
  if (["Delivered", "Paid"].includes(s)) return "success";
  if (["Shipped", "Processing"].includes(s)) return "info";
  if (["Pending", "Awaiting Payment", "Awaiting Verification"].includes(s)) return "warning";
  if (["Cancelled", "Failed"].includes(s)) return "error";
  return "default";
};

export function UserDashboard() {
  const { user, setUser, wishlist, toggleWishlist, toast } = useApp();
  const { path, navigate } = useRouter();
  const { params } = parseRoute(path);
  const [tab, setTab] = useState<Tab>((params.get("tab") as Tab) || "overview");

  // =====================================================================
  // Direct API fetch — pulls this user's orders from PostgreSQL
  // This ensures the user sees their orders on ANY device.
  // =====================================================================
  const [apiOrders, setApiOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchMy = async () => {
      try {
        const base = "https://the-diamond-body-backend.onrender.com/api/v1";
        const tok = localStorage.getItem("db_access_token");
        const headers: Record<string, string> = {};
        if (tok) headers["Authorization"] = `Bearer ${tok}`;
        const res = await fetch(`${base}/members/me/orders?limit=200`, { headers });
        if (res.ok) {
          const json = await res.json();
          setApiOrders((json.data?.items || json.data || []).map((o: any) => ({
            id: o.id, date: o.createdAt, customerName: o.customerName,
            items: (o.items || []).map((it: any) => ({ productId: it.productId || "", name: it.name, price: Number(it.price), quantity: it.quantity })),
            total: Number(o.total), status: o.status, paymentStatus: o.paymentStatus === "PAID" ? "Paid" : "Unpaid",
            deliveryMethod: o.deliveryMethod === "PICKUP_STATION" ? "Pickup Station" : "Home Delivery",
          } as Order)));
        }
      } catch { /* unreachable */ }
    };
    fetchMy();
  }, []);

  // Only show orders fetched from the backend API.
  const myOrders = apiOrders;
  const myWishlist = PRODUCTS.filter((p) => wishlist.includes(p.id));

  const tabs: { k: Tab; l: string }[] = [
    { k: "overview", l: "Overview" },
    { k: "orders", l: `Orders (${myOrders.length})` },
    { k: "wishlist", l: `Wishlist (${myWishlist.length})` },
    { k: "addresses", l: "Addresses" },
    { k: "profile", l: "Profile" },
  ];

  if (!user) {
    return (
      <Container className="py-24 text-center">
        <h2 className="font-display text-3xl font-bold mb-4">Please sign in</h2>
        <Link to="/login"><Button>Login</Button></Link>
      </Container>
    );
  }

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <Container className="py-10">
        <div className="bg-gradient-to-r from-[#4A0E16] to-[#6b1722] rounded-3xl p-6 sm:p-8 text-white mb-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-white/70 mb-1">My Dashboard</div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">Welcome, {user.name}</h1>
              <p className="text-white/80 text-sm mt-1">{user.email}</p>
            </div>
            <button
              onClick={() => { clearTokens(); navigate("/"); setTimeout(() => { setUser(null); toast({ type: "info", message: "Signed out" }); }, 0); }}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-semibold"
            >
              <IconLogout size={16}/> Sign out
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          <aside>
            <nav className="bg-white rounded-2xl border border-gray-100 p-2">
              {tabs.map((t) => (
                <button
                  key={t.k}
                  onClick={() => { setTab(t.k); navigate(`/dashboard/user?tab=${t.k}`); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition ${tab === t.k ? "bg-[#4A0E16] text-white" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  {t.l}
                </button>
              ))}
            </nav>
          </aside>

          <main className="space-y-6">
            {tab === "overview" && (
              <div className="grid sm:grid-cols-3 gap-4">
                <StatCard label="Total Orders" value={myOrders.length} icon={<IconTruck/>}/>
                <StatCard label="Wishlist Items" value={myWishlist.length} icon={<IconHeart/>}/>
                <StatCard label="Total Spent" value={formatNGN(myOrders.reduce((s, o) => s + o.total, 0))} icon={<IconUser/>}/>
              </div>
            )}

            {tab === "orders" && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-display text-xl font-bold mb-4">My Orders</h3>
                <div className="space-y-3">
                  {myOrders.length === 0 ? (
                    <p className="text-gray-500 text-sm">You haven't placed any orders yet.</p>
                  ) : (
                    myOrders.map((o) => (
                      <OrderRow key={o.id} order={o} onReview={() => {
                        if (o.items.length > 0) {
                          const product = PRODUCTS.find(p => p.id === o.items[0].productId);
                          if (product) {
                            navigate(`/product/${product.slug}`);
                          }
                        }
                      }} />
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === "wishlist" && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-display text-xl font-bold mb-4">My Wishlist</h3>
                {myWishlist.length === 0 ? (
                  <p className="text-gray-500 text-sm">Your wishlist is empty.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myWishlist.map((p) => (
                      <div key={p.id} className="border border-gray-100 rounded-xl p-3">
                        <Link to={`/product/${p.slug}`}>
                          <img src={p.image} className="w-full aspect-square object-cover rounded-lg bg-[#F5F5F5]"/>
                          <div className="font-semibold mt-2 text-sm">{p.name}</div>
                        </Link>
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-[#4A0E16] font-bold text-sm">{formatNGN(p.price)}</div>
                          <button onClick={() => toggleWishlist(p.id)} className="text-xs text-gray-500 hover:text-red-600">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "addresses" && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-display text-xl font-bold mb-4">Saved Addresses</h3>
                <p className="text-gray-500 text-sm">Address management is available in the Profile tab.</p>
              </div>
            )}

            {tab === "profile" && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 max-w-2xl">
                <h3 className="font-display text-xl font-bold mb-4">Profile Settings</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <ProfileField label="Name" value={user.name} onChange={(v) => setUser({...user, name: v})}/>
                  <ProfileField label="Email" value={user.email} onChange={(v) => setUser({...user, email: v})}/>
                  <ProfileField label="Phone" value={user.phone || ""} onChange={(v) => setUser({...user, phone: v})}/>
                </div>
                <Button className="mt-6" onClick={() => toast({ type: "success", message: "Profile updated" })}>Save Changes</Button>
              </div>
            )}
          </main>
        </div>
      </Container>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-[#4A0E16] text-white flex items-center justify-center">{icon}</div>
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
        <div className="font-display text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}

function ProfileField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-700 mb-1">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4A0E16] text-sm"/>
    </label>
  );
}

function OrderRow({ order, onReview }: { order: Order; onReview: () => void }) {
  return (
    <div className="border-b border-gray-100 last:border-0 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <div className="font-semibold text-sm">{order.id}</div>
          <div className="text-xs text-gray-500">{new Date(order.date).toLocaleString()} • {order.items.length} item(s)</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone={statusTone(order.paymentStatus)}>{order.paymentStatus}</Badge>
          <Badge tone={statusTone(order.status)}>{order.status}</Badge>
          <div className="font-bold text-[#4A0E16]">{formatNGN(order.total)}</div>
          {order.status === "Delivered" && (
            <Button size="sm" variant="outline" onClick={onReview}>
              <IconStar size={14} /> Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}