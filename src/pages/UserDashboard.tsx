import { useState } from "react";
import { Container, Button, Badge } from "../components/UI";
import { useApp, formatNGN, type Order, } from "../store/store";
import { PRODUCTS } from "../data/products";
import { parseRoute, useRouter, Link } from "../router";
import { IconLogout, IconUpload, IconTruck, IconHeart, IconUser, IconMapPin } from "../components/Icons";
import { clearTokens } from "../api/client";
import { orderService } from "../api/services";

type Tab = "overview" | "orders" | "wishlist" | "addresses" | "profile";

const statusTone = (s: string): "success" | "warning" | "info" | "default" | "error" => {
  if (["Delivered", "Paid"].includes(s)) return "success";
  if (["Shipped", "Processing"].includes(s)) return "info";
  if (["Pending", "Awaiting Payment", "Awaiting Verification"].includes(s)) return "warning";
  if (["Cancelled", "Failed"].includes(s)) return "error";
  return "default";
};

export function UserDashboard() {
  const { user, setUser, orders, wishlist, toggleWishlist, updateOrder, toast } = useApp();
  const { path, navigate } = useRouter();
  const { params } = parseRoute(path);
  const [tab, setTab] = useState<Tab>((params.get("tab") as Tab) || "overview");

  if (!user) {
    return (
      <Container className="py-24 text-center">
        <h2 className="font-display text-3xl font-bold mb-4">Please sign in</h2>
        <Link to="/login"><Button>Login</Button></Link>
      </Container>
    );
  }

  const myOrders = orders.filter((o) => o.email === user.email || o.userId === user.id);
  const myWishlist = PRODUCTS.filter((p) => wishlist.includes(p.id));

  const tabs: { k: Tab; l: string }[] = [
    { k: "overview", l: "Overview" },
    { k: "orders", l: `Orders (${myOrders.length})` },
    { k: "wishlist", l: `Wishlist (${myWishlist.length})` },
    { k: "addresses", l: "Addresses" },
    { k: "profile", l: "Profile" },
  ];

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <Container className="py-10">
        <div className="bg-gradient-to-r from-[#4A0E16] to-[#6b1722] rounded-3xl p-6 sm:p-8 text-white mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-white/70 text-xs uppercase tracking-wider mb-1">My Dashboard</div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">Welcome, {user.name}</h1>
              <p className="text-white/80 text-sm mt-1">{user.email}</p>
            </div>
            <button
              onClick={() => { clearTokens(); navigate("/"); setUser(null); toast({ type: "info", message: "Signed out" }); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-semibold"
            >
              <IconLogout size={16}/> Sign out
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          <aside className="h-fit">
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
                <div className="sm:col-span-3 bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-display text-xl font-bold mb-4">Recent Orders</h3>
                  {myOrders.slice(0, 3).map((o) => <OrderRow key={o.id} order={o}/>)}
                </div>
              </div>
            )}

            {tab === "orders" && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-display text-xl font-bold mb-4">My Orders</h3>
                <div className="space-y-3">
                  {myOrders.map((o) => (
                    <OrderRow key={o.id} order={o} expandable onUploadProof={async (file) => {
                      try {
                        await orderService.uploadProof(o.id, file);
                        updateOrder(o.id, { paymentStatus: "Awaiting Verification" });
                        toast({ type: "success", message: "Proof uploaded successfully" });
                      } catch {
                        toast({ type: "error", message: "Upload failed" });
                      }
                    }}/>
                  ))}
                </div>
              </div>
            )}

            {tab === "wishlist" && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-display text-xl font-bold mb-4">My Wishlist</h3>
                {myWishlist.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 py-3 border-b">
                    <img src={p.image} className="w-16 h-16 object-cover rounded-lg" alt={p.name}/>
                    <div className="flex-1 font-semibold">{p.name}</div>
                    <Button variant="outline" size="sm" onClick={() => toggleWishlist(p.id)}>Remove</Button>
                  </div>
                ))}
              </div>
            )}

            {tab === "addresses" && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-display text-xl font-bold mb-4">Saved Addresses</h3>
                <IconMapPin size={48} className="text-gray-300 mx-auto mt-10"/>
                <p className="text-center text-gray-500 mt-4">Manage your shipping addresses here.</p>
              </div>
            )}

            {tab === "profile" && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-display text-xl font-bold mb-4">Profile Settings</h3>
                <p className="text-gray-600">Update your account details below.</p>
                <div className="mt-4 p-4 bg-[#F5F5F5] rounded-xl">
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                </div>
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

function OrderRow({ order, expandable, onUploadProof }: { order: Order; expandable?: boolean; onUploadProof?: (f: File) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 py-3">
      <div className={`flex justify-between items-center ${expandable ? "cursor-pointer" : ""}`} onClick={() => expandable && setOpen(!open)}>
        <div>
          <div className="font-semibold text-sm">{order.id}</div>
          <div className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</div>
        </div>
        <div className="flex gap-2">
          <Badge tone={statusTone(order.paymentStatus)}>{order.paymentStatus}</Badge>
          <Badge tone={statusTone(order.status)}>{order.status}</Badge>
        </div>
      </div>
      {expandable && open && (
        <div className="mt-3 p-4 bg-[#F5F5F5] rounded-xl text-sm">
          {order.paymentMethod === "Bank Transfer" && order.paymentStatus === "Unpaid" && (
            <label className="block p-4 border-2 border-dashed rounded-xl text-center cursor-pointer">
              <IconUpload size={16}/> <span>Upload Proof</span>
              <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && onUploadProof?.(e.target.files[0])}/>
            </label>
          )}
        </div>
      )}
    </div>
  );
}