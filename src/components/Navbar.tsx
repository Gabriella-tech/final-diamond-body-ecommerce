import { useState } from "react";
import { Link, useRouter } from "../router";
import { useApp, dashboardPath } from "../store/store";
import { cartCount } from "../store/store";
import { IconCart, IconHeart, IconMenu, IconSearch, IconUser, IconClose, IconDiamond, IconChevronDown } from "./Icons";
import { Container } from "./UI";

export function Navbar() {
  const { cart, user, wishlist } = useApp();
  const { path, navigate } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [acctOpen, setAcctOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/about", label: "About" },
    { to: "/blog", label: "Blog" },
    { to: "/contact", label: "Contact" },
  ];

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setMenuOpen(false);
    }
  };

  return (
    <>

      {/* Main nav */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <Container className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-[#4A0E16] flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
              <IconDiamond size={20} />
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg lg:text-xl font-bold text-[#4A0E16]">Diamond Body</div>
              <div className="text-[10px] tracking-[0.2em] text-gray-500 uppercase hidden sm:block">Getting your body to its ultimate version</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {links.map((l) => {
              const active = path === l.to || (l.to !== "/" && path.startsWith(l.to));
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`text-sm font-semibold tracking-wide transition-colors ${
                    active ? "text-[#4A0E16]" : "text-gray-700 hover:text-[#4A0E16]"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setSearchOpen((s) => !s)}
              className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition"
              aria-label="Search"
            >
              <IconSearch size={20} />
            </button>

            <Link to={user ? `${dashboardPath(user.role)}?tab=wishlist` : "/dashboard/user?tab=wishlist"} className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition relative" >
              <IconHeart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#4A0E16] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition relative">
              <IconCart size={20} />
              {cartCount(cart) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#4A0E16] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {cartCount(cart)}
                </span>
              )}
            </Link>

            {/* Account */}
            <div className="relative hidden sm:block">
              <button
                onClick={(e) => { e.stopPropagation(); setAcctOpen((s) => !s); }}
                className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition flex items-center gap-1"
              >
                <IconUser size={20} />
                <IconChevronDown size={14} />
              </button>
              {acctOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setAcctOpen(false)} />
              )}
              {acctOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
                  {user ? (
                    <>
                      <div className="px-3 py-2 border-b border-gray-100 mb-1">
                        <div className="font-semibold text-sm">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                      <Link to={dashboardPath(user.role)} className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-50">My Dashboard</Link>
                      {user.role !== "customer" && user.role !== "nation" && (
                        <Link to="/dashboard/nation" className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-50">Nation Dashboard</Link>
                      )}
                      {user.role === "super_admin" && (
                        <Link to="/dashboard/admin" className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-50">Admin Dashboard</Link>
                      )}
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-50 font-semibold text-[#4A0E16]">Login</Link>
                      <Link to="/register" className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-50">Create Account</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2.5 rounded-full hover:bg-gray-100 text-gray-700"
              aria-label="Menu"
            >
              <IconMenu size={22} />
            </button>
          </div>
        </Container>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-gray-100 bg-white animate-fade-in">
            <Container className="py-4">
              <form onSubmit={onSearch} className="flex gap-2">
                <div className="flex-1 relative">
                  <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search wellness products..."
                    className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:border-[#4A0E16] focus:outline-none"
                  />
                </div>
                <button type="submit" className="px-6 py-3 bg-[#4A0E16] text-white rounded-full font-semibold text-sm">
                  Search
                </button>
              </form>
            </Container>
          </div>
        )}
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white p-6 animate-fade-in overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#4A0E16] flex items-center justify-center text-white">
                  <IconDiamond size={20} />
                </div>
                <div className="font-display font-bold text-[#4A0E16]">Diamond Body</div>
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-2"><IconClose size={22} /></button>
            </div>
            <nav className="space-y-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl hover:bg-gray-50 font-semibold text-gray-800"
                >
                  {l.label}
                </Link>
              ))}
              <div className="border-t border-gray-100 my-4" />
              {user ? (
                <>
                  <Link to={dashboardPath(user.role)} onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 font-semibold">My Dashboard</Link>
                  {user.role !== "customer" && user.role !== "nation" && (
                    <Link to="/dashboard/nation" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 font-semibold">Nation Dashboard</Link>
                  )}
                  {user.role === "super_admin" && (
                    <Link to="/dashboard/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 font-semibold">Admin Dashboard</Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl bg-[#4A0E16] text-white font-semibold text-center">Login</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl border border-[#4A0E16] text-[#4A0E16] font-semibold text-center mt-2">Register</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
