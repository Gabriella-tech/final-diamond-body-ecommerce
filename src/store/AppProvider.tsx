import { useEffect } from "react";
import { RouterProvider, useRouter, parseRoute } from "../router";
import { AppProvider } from "../store/AppProvider";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { Toasts } from "../components/Toasts";
import { Home } from "../pages/Home";
import { Shop } from "../pages/Shop";
import { ProductDetails } from "../pages/ProductDetails";
import { Cart } from "../pages/Cart";
import { Checkout } from "../pages/Checkout";
import { About } from "../pages/About";
import { Contact } from "../pages/Contact";
import { Blog } from "../pages/Blog";
import { Login, Register, ForgotPassword } from "../pages/Auth";
import { UserDashboard } from "../pages/UserDashboard";
import { NationDashboard } from "../pages/NationDashboard";
import { AdminDashboard } from "../pages/AdminDashboard";
import { NotFound } from "../pages/NotFound";
import { NationLanding } from "../pages/NationLanding";
import { NATIONS } from "../data/nations";

// Build a fast lookup set of valid nation slugs.
const NATION_SLUGS = new Set(NATIONS.map((n) => n.slug));

// Legacy routes that must be hard-blocked (redirect to /login).
const BLOCKED_LEGACY_ROUTES = new Set(["admin", "leader", "dashboard"]);

function LegacyRedirect({ to }: { to: string }) {
  const { navigate } = useRouter();
  useEffect(() => { navigate(to); }, [to, navigate]);
  return null;
}

function Routes() {
  const { path } = useRouter();
  const { segs } = parseRoute(path);
  const root = segs[0] || "";

  // Public pages
  if (root === "" || root === "home") return <Home/>;
  if (root === "shop") return <Shop/>;
  if (root === "product" && segs[1]) return <ProductDetails slug={segs[1]}/>;
  if (root === "cart") return <Cart/>;
  if (root === "checkout") return <Checkout/>;
  if (root === "about") return <About/>;
  if (root === "contact") return <Contact/>;
  if (root === "blog") return <Blog/>;
  if (root === "login") return <Login/>;
  if (root === "register") return <Register/>;
  if (root === "forgot") return <ForgotPassword/>;

  // CHANGE 2 — Nation landing routes (8 fixed slugs).
  if (NATION_SLUGS.has(root) && !segs[1]) {
    return <NationLanding slug={root}/>;
  }

  // Block legacy unscoped paths
  if (BLOCKED_LEGACY_ROUTES.has(root) && !segs[1]) {
    return <LegacyRedirect to="/login"/>;
  }

  // Role-based dashboard routes
  if (root === "dashboard") {
    const sub = segs[1];
    if (sub === "user") return <UserDashboard/>;
    if (sub === "nation") return <NationDashboard/>;
    if (sub === "admin") return <AdminDashboard/>;
    if (sub === "super-admin") return <AdminDashboard superAdmin/>;
    return <NotFound reason="Unknown dashboard route."/>;
  }

  return <NotFound/>;
}

export default function App() {
  return (
    <AppProvider>
      <RouterProvider>
        <div className="flex flex-col min-h-screen bg-white">
          <Navbar/>
          <main className="flex-1">
            <Routes/>
          </main>
          <Footer/>
          <WhatsAppButton/>
          <Toasts/>
        </div>
      </RouterProvider>
    </AppProvider>
  );
}