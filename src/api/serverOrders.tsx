import { useEffect, useRef, useState, useCallback } from "react";

const RAW = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) || "https://the-diamond-body-backend.onrender.com";
const BASE = String(RAW).replace(/\/+$/, "");
export const API = BASE.endsWith("/api/v1") ? BASE : `${BASE}/api/v1`;

const tok = () => { try { return localStorage.getItem("db_access_token"); } catch { return null; } };
const authH = () => { const h: Record<string, string> = { Accept: "application/json" }; const t = tok(); if (t) h.Authorization = `Bearer ${t}`; return h; };
const jsonH = () => { const h = authH(); h["Content-Type"] = "application/json"; return h; };

function unwrap(j: any): any[] {
  const l = j?.data?.items || j?.data || j?.items || (Array.isArray(j) ? j : []);
  return Array.isArray(l) ? l : [];
}

export function naira(n: number | string | null | undefined) {
  const v = typeof n === "string" ? parseFloat(n) || 0 : Number(n) || 0;
  return "₦" + Math.round(v).toLocaleString("en-NG");
}

export async function patchOrder(id: string, patch: any) {
  for (const p of [`${API}/admin/orders/${id}`, `${API}/orders/${id}`]) {
    try { const r = await fetch(p, { method: "PATCH", headers: jsonH(), body: JSON.stringify(patch) }); if (r.ok) return; } catch {}
  }
}

export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el || shown) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }), { threshold: 0.12 });
    io.observe(el); return () => io.disconnect();
  }, [shown]);
  return { ref, shown };
}

export function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, shown } = useReveal();
  return <div ref={ref} className={className} style={{ opacity: shown ? 1 : 0, transform: shown ? "translateY(0)" : "translateY(16px)", transition: `opacity .6s ease ${delay}ms, transform .6s cubic-bezier(.2,.7,.2,1) ${delay}ms` }}>{children}</div>;
}

export function useCountUp(target: number, ms = 850) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now();
    const tick = (now: number) => { const p = Math.min(1, (now - start) / ms); setV(target * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

export function useServerOrders(role?: string, nationId?: string | null) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [synced, setSynced] = useState<Date | null>(null);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let alive = true; setLoading(true); setError(null);
    const r = (role || "").toLowerCase();
    const paths = r === "admin" || r === "super_admin" || r === "superadmin" ? ["/admin/orders?limit=500"]
      : r === "leader" ? ["/leader/orders", "/members/me/orders?limit=500"]
      : ["/members/me/orders?limit=200", "/orders/me"];
    (async () => {
      for (const p of paths) {
        try {
          const res = await fetch(`${API}${p}`, { headers: authH() });
          if (res.status === 401) { if (alive) { setOrders([]); setError("Please sign in to view orders."); setLoading(false); } return; }
          if (!res.ok) continue;
          let list = unwrap(await res.json());
          if (p.includes("/members/me/") && r === "leader" && nationId) list = list.filter((o: any) => (o.nationId || o.nation) === nationId);
          if (!alive) return;
          setOrders(list); setSynced(new Date()); setLoading(false); return;
        } catch {}
      }
      if (alive) { setOrders([]); setError("Could not reach the orders server."); setLoading(false); }
    })();
    return () => { alive = false; };
  }, [tick, role, nationId]);

  return { orders, loading, error, synced, reload };
}

export function timeAgo(d: Date | null) {
  if (!d) return "never";
  const s = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (s < 5) return "just now"; if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`; return `${Math.floor(m / 60)}h ago`;
}

export function SyncBar({ loading, synced, reload, count, error }: { loading: boolean; synced: Date | null; reload: () => void; count?: number; error?: string | null }) {
  const [, force] = useState(0);
  useEffect(() => { const id = setInterval(() => force((n) => n + 1), 1000); return () => clearInterval(id); }, []);
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-full bg-white/85 backdrop-blur border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2.5 text-xs">
        <span className="relative flex h-2.5 w-2.5"><span className={`absolute inline-flex h-full w-full rounded-full opacity-70 ${loading ? "bg-oxblood animate-ping" : "bg-emerald-500 animate-pulse"}`} /><span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${loading ? "bg-oxblood" : "bg-emerald-500"}`} /></span>
        <span className="font-bold text-charcoal">{loading ? "Syncing with server…" : error ? error : "Live · database"}</span>
        {!loading && !error && <span className="text-gray-400 tabular-nums">· {timeAgo(synced)}</span>}
        {typeof count === "number" && !loading && <span className="text-gray-400 tabular-nums">· {count} order{count === 1 ? "" : "s"}</span>}
      </div>
      <button type="button" onClick={reload} disabled={loading} className="inline-flex items-center gap-1.5 text-xs font-bold text-oxblood hover:text-oxblood-light disabled:opacity-50 transition-colors">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={loading ? "animate-spin" : ""}><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v6h-6" /></svg>Reload
      </button>
    </div>
  );
}

export function StatCard({ label, value, hint, accent = "text-charcoal", delay = 0 }: { label: string; value: number | string; hint?: string; accent?: string; delay?: number }) {
  const numeric = typeof value === "number"; const animated = useCountUp(numeric ? (value as number) : 0); const { ref, shown } = useReveal();
  return (
    <div ref={ref} className="group relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
      style={{ opacity: shown ? 1 : 0, transform: shown ? "translateY(0)" : "translateY(14px)", transition: `opacity .5s ease ${delay}ms, transform .5s cubic-bezier(.2,.7,.2,1) ${delay}ms` }}>
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-oxblood to-gold opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500 font-bold">{label}</div>
      <div className={`font-display text-4xl font-bold tabular-nums mt-2 ${accent}`}>{numeric ? Math.round(animated).toLocaleString() : value}</div>
      {hint && <div className="text-xs text-gray-400 mt-1.5">{hint}</div>}
    </div>
  );
}

const TONES: [string[], string, string][] = [
  [["delivered", "paid"], "bg-emerald-100 text-emerald-800 ring-emerald-200", "bg-emerald-500"],
  [["shipped", "processing"], "bg-sky-100 text-sky-800 ring-sky-200", "bg-sky-500"],
  [["pending", "awaiting payment", "awaiting verification"], "bg-amber-100 text-amber-800 ring-amber-200", "bg-amber-500"],
  [["cancelled", "failed", "rejected"], "bg-rose-100 text-rose-800 ring-rose-200", "bg-rose-500"],
];
export function StatusPill({ s }: { s?: string }) {
  const v = (s || "").toLowerCase();
  const m = TONES.find((t) => t[0].includes(v)); const cls = m ? m[1] : "bg-gray-100 text-gray-700 ring-gray-200"; const dot = m ? m[2] : "bg-gray-400";
  return <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ring-1 ${cls}`}><span className={`h-1.5 w-1.5 rounded-full ${dot}`} />{s || "Unknown"}</span>;
}

export function SkeletonRows({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return <tbody>{Array.from({ length: rows }).map((_, r) => (<tr key={r} className="border-b border-gray-50">{Array.from({ length: cols }).map((__, c) => (<td key={c} className="py-3.5 px-4"><div className="h-3.5 bg-gray-100 rounded skeleton" style={{ width: `${48 + ((r + c) % 4) * 13}%` }} /></td>))}</tr>))}</tbody>;
}

export function AmbientBg() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-light-gray">
      <div className="absolute -top-48 -left-48 w-[44rem] h-[44rem] rounded-full bg-oxblood/[0.08] blur-3xl" />
      <div className="absolute top-1/4 -right-56 w-[40rem] h-[40rem] rounded-full bg-gold/[0.08] blur-3xl" />
      <div className="absolute bottom-0 left-1/3 w-[36rem] h-[36rem] rounded-full bg-oxblood/[0.05] blur-3xl" />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #4A0E16 1px, transparent 0)", backgroundSize: "24px 24px" }} />
    </div>
  );
}