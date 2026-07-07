import { useState } from "react";
import { Container, Button } from "../components/UI";
import { useApp, dashboardPath, type Role } from "../store/store";
import { Link, useRouter } from "../router";
import { IconDiamond, IconEye, IconEyeOff } from "../components/Icons";
import { setTokens } from "../api/client";

// ============================================================================
// LOGIN — real backend authentication only
// ============================================================================
export function Login() {
  const { setUser, toast } = useApp();
  const { navigate } = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const lower = email.trim().toLowerCase();
    if (!lower || !password) { setErr("Please enter your email and password."); return; }

    setLoading(true);
    try {
      const { authService } = await import("../api/services");
      const result = await authService.login({ email: lower, password });

      setTokens(result.accessToken, result.refreshToken);

      const role: Role =
        result.user.role === "NATION_LEADER" ? "nation" :
        result.user.role === "SUPER_ADMIN" ? "super_admin" :
        result.user.role === "ADMIN" ? "admin" : "customer";

      setUser({
        id: result.user.id,
        name: result.user.fullName,
        email: result.user.email,
        phone: result.user.phone,
        role,
        emailVerified: result.user.emailVerified,
        addresses: [],
        nationId: result.user.nationId,
      });
      toast({ type: "success", message: "Welcome back!" });
      navigate(dashboardPath(role));
    } catch (apiErr: any) {
      if (apiErr?.isNetworkError) {
        setErr("Cannot connect to the server. Please try again later.");
      } else {
        setErr(apiErr?.message || "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue your wellness journey">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={setEmail} required autoComplete="email" />
        <PasswordInput label="Password" value={password} onChange={setPassword} required autoComplete="current-password" />
        <div className="flex justify-between text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" className="accent-[#4A0E16]" /> Remember me</label>
          <Link to="/forgot" className="text-[#4A0E16] font-semibold">Forgot password?</Link>
        </div>
        {err && <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</div>}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
        <p className="text-center text-sm text-gray-600">
          New here? <Link to="/register" className="text-[#4A0E16] font-semibold">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}

// ============================================================================
// REGISTER — real backend registration only
// ============================================================================
export function Register() {
  const { toast } = useApp();
  const { navigate } = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    if (form.password.length < 8) { setErr("Password must be at least 8 characters."); return; }

    setLoading(true);
    try {
      const { authService } = await import("../api/services");
      await authService.register({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        fullName: form.name.trim(),
        phone: form.phone.trim() || undefined,
      });
      toast({ type: "success", message: "Account created! You can now sign in." });
      navigate("/login");
    } catch (apiErr: any) {
      setErr(apiErr?.isNetworkError
        ? "Cannot connect to the server. Please try again later."
        : apiErr?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Join Diamond Body" subtitle="Start your wellness journey today">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
        <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
        <PasswordInput label="Password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required autoComplete="new-password" />
        <p className="text-[10px] text-gray-500 -mt-2 ml-1">Min 8 characters</p>
        {err && <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</div>}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating..." : "Create Account"}</Button>
        <p className="text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-[#4A0E16] font-semibold">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}

// ============================================================================
// FORGOT PASSWORD
// ============================================================================
export function ForgotPassword() {
  const { toast } = useApp();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { authService } = await import("../api/services");
      await authService.forgotPassword(email.trim());
    } catch { /* always say success to avoid email enumeration */ }
    setSent(true);
    toast({ type: "success", message: "If that email exists, a reset link has been sent." });
    setLoading(false);
  };

  return (
    <AuthShell title="Forgot password?" subtitle="We'll send you a reset link">
      {sent ? (
        <div className="text-center py-6">
          <div className="text-5xl mb-4">📧</div>
          <p className="text-gray-700">If an account exists with that email, you'll receive a reset link shortly.</p>
          <Link to="/login" className="text-[#4A0E16] font-semibold mt-4 inline-block">← Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={setEmail} required />
          <Button type="submit" className="w-full" disabled={loading}>Send Reset Link</Button>
          <p className="text-center text-sm text-gray-600">
            <Link to="/login" className="text-[#4A0E16] font-semibold">← Back to sign in</Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}

// ============================================================================
// SHARED
// ============================================================================
function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-[80vh] flex items-center diamond-bg">
      <Container className="max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#4A0E16] text-white flex items-center justify-center mb-4">
              <IconDiamond size={26} />
            </div>
            <h1 className="font-display text-3xl font-bold text-[#222]">{title}</h1>
            <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
          </div>
          {children}
        </div>
      </Container>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required, placeholder, autoComplete }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string; autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-700 mb-1">{label}{required && " *"}</span>
      <input type={type} value={value} required={required} placeholder={placeholder} autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4A0E16] text-sm" />
    </label>
  );
}

function PasswordInput({ label, value, onChange, required, autoComplete }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-700 mb-1">{label}{required && " *"}</span>
      <div className="relative">
        <input type={visible ? "text" : "password"} value={value} required={required} autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4A0E16] text-sm" />
        <button type="button" onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-[#4A0E16] rounded-lg hover:bg-gray-50 transition touch-manipulation">
          {visible ? <IconEyeOff size={18} /> : <IconEye size={18} />}
        </button>
      </div>
    </label>
  );
}
