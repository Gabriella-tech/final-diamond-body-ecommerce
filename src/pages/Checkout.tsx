import { useState } from "react";
import { useApp, cartTotal, formatNGN, type Order, type DeliveryMethod } from "../store/store";
import { PRODUCTS } from "../data/products";
import { DELIVERY_FEE } from "../data/pickupStations";
import { getActiveNation } from "../data/nations";
import { BANK } from "../data/settings";
import { Container, Button } from "../components/UI";
import { IconCheck, IconUpload } from "../components/Icons";
import { Link, useRouter } from "../router";

export function Checkout() {
  const { cart, clearCart, addOrder, user, toast, pickupStations } = useApp();
  const { navigate } = useRouter();
  const subtotal = cartTotal(cart, PRODUCTS);

  const [promo, setPromo] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("Home Delivery");
  const activeStations = pickupStations.filter((p) => p.status === "active");
  const [pickupStationId, setPickupStationId] = useState<string>(activeStations[0]?.id || "");
  const [referralCode, setReferralCode] = useState("");

  const shipping = deliveryMethod === "Pickup Station" ? 0 : DELIVERY_FEE;
  const discount = appliedPromo?.discount || 0;
  const total = subtotal + shipping - discount;

  const [form, setForm] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    street: "",
    city: "",
    state: "",
    country: "Nigeria",
  });
  const method: "Bank Transfer" = "Bank Transfer";
  const [proofFile, setProofFile] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const applyPromo = () => {
    if (promo.toUpperCase() === "DIAMOND10") {
      setAppliedPromo({ code: "DIAMOND10", discount: Math.round(subtotal * 0.1) });
      toast({ type: "success", message: "Promo code applied: 10% off" });
    } else if (promo.toUpperCase() === "FAMILY10") {
      setAppliedPromo({ code: "FAMILY10", discount: Math.round(subtotal * 0.1) });
      toast({ type: "success", message: "FAMILY10 applied: 10% off" });
    } else {
      toast({ type: "error", message: "Invalid promo code" });
    }
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProofFile(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    let pickupStation = null;
    if (deliveryMethod === "Pickup Station") {
      pickupStation = pickupStations.find((p) => p.id === pickupStationId && p.status === "active");
      if (!pickupStation) { toast({ type: "error", message: "Please select a pickup station." }); return; }
    }
    const nation = getActiveNation();

    try {
      const { orderService } = await import("../api/services");
      await orderService.create({
        customerName: form.fullName,
        email: form.email,
        phone: form.phone,
        nationSlug: nation?.slug,
        referralCode: referralCode.trim() || undefined,
        deliveryMethod: deliveryMethod === "Home Delivery" ? "HOME_DELIVERY" : "PICKUP_STATION",
        shippingStreet: deliveryMethod === "Home Delivery" ? form.street : undefined,
        shippingCity: deliveryMethod === "Home Delivery" ? form.city : undefined,
        shippingState: deliveryMethod === "Home Delivery" ? form.state : undefined,
        pickupStationId: pickupStation?.id,
        shippingFee: shipping,
        discount,
        promoCode: appliedPromo?.code,
        paymentMethod: "BANK_TRANSFER",
        items: cart.map((c) => ({ productId: c.productId, quantity: c.quantity })),
      });
      clearCart();
      setSubmitted(true);
      toast({ type: "success", message: "Order placed successfully!" });
      setTimeout(() => navigate(`/dashboard/user?tab=orders`), 1500);
      return;
    } catch (err) {
      console.error("Backend order failed, using offline fallback:", err);
    }

    const id = "DB-2026-" + String(Math.floor(1000 + Math.random() * 9000));
    const order: Order = {
      id, date: new Date().toISOString(),
      userId: user?.id || "guest-" + Math.random().toString(36).slice(2, 8),
      customerName: form.fullName, email: form.email, phone: form.phone,
      address: {
        id: "addr-" + id, label: "Shipping", fullName: form.fullName, phone: form.phone,
        street: deliveryMethod === "Home Delivery" ? form.street : (pickupStation?.address || ""),
        city: deliveryMethod === "Home Delivery" ? form.city : (pickupStation?.city || ""),
        state: deliveryMethod === "Home Delivery" ? form.state : (pickupStation?.state || ""),
        country: form.country,
      },
      items: cart.map((c) => { const p = PRODUCTS.find((x) => x.id === c.productId)!; return { productId: p.id, name: p.name, price: p.price, quantity: c.quantity }; }),
      total, shippingFee: shipping, discount, promoCode: appliedPromo?.code,
      paymentMethod: method,
      paymentStatus: proofFile ? "Awaiting Verification" : "Unpaid",
      bankProofUrl: proofFile || undefined, status: "Awaiting Payment",
      nationId: nation?.id, nationName: nation?.name, nationSlug: nation?.slug,
      referralCode: referralCode.trim() || undefined,
      deliveryMethod, pickupStationId: pickupStation?.id, pickupStationName: pickupStation?.name,
    };
    addOrder(order);
    clearCart();
    setSubmitted(true);
    toast({ type: "success", message: "Order placed (offline mode)!" });
    setTimeout(() => navigate(`/dashboard/user?tab=orders`), 1500);
  };

  if (cart.length === 0 && !submitted) {
    return (
      <Container className="py-24 text-center">
        <h2 className="font-display text-3xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/shop"><Button>Continue Shopping</Button></Link>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container className="py-20 max-w-lg text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
          <IconCheck size={40}/>
        </div>
        <h2 className="font-display text-3xl font-bold mb-3">Order Confirmed</h2>
        <p className="text-gray-600 mb-8">Thank you for choosing Diamond Body.</p>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>
      <form onSubmit={placeOrder} className="grid lg:grid-cols-[1fr_400px] gap-8">
        {/* The rest of your original UI code goes here */}
        <div className="space-y-8">
          <Field label="Full Name" value={form.fullName} onChange={(v) => setForm({...form, fullName: v})} required/>
          <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({...form, email: v})} required/>
          <Field label="Phone" value={form.phone} onChange={(v) => setForm({...form, phone: v})} required/>
          <Button type="submit" className="w-full">Place Order</Button>
        </div>
      </form>
    </Container>
  );
}

function Field({ label, value, onChange, type = "text", required, className }: any) {
  return (
    <label className={`block ${className || ""}`}>
      <span className="block text-xs font-semibold text-gray-700 mb-1">{label}{required && " *"}</span>
      <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200" />
    </label>
  );
}