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

  // CHANGE 4 & 5: Delivery method (Home Delivery default)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("Home Delivery");

  // Pickup station selector
  const activeStations = pickupStations.filter((p) => p.status === "active");
  const [pickupStationId, setPickupStationId] = useState<string>(activeStations[0]?.id || "");

  // CHANGE 3: Optional free-text referral code (NO leader dropdown)
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

    // —— Try the backend first ——
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
      toast({ type: "success", message: "Order placed! You'll receive a confirmation email." });
      setTimeout(() => navigate(`/dashboard/user?tab=orders`), 1500);
      return;
    } catch {
      // —— Offline fallback ——
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
        <p className="text-gray-600 mb-8">Thank you for choosing Diamond Body. Redirecting to your dashboard...</p>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-bold mb-8 text-[#222]">Checkout</h1>
      <form onSubmit={placeOrder} className="grid lg:grid-cols-[1fr_400px] gap-8">
        <div className="space-y-8">
          {/* CONTACT */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h3 className="font-display text-xl font-bold mb-4">Contact Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" value={form.fullName} onChange={(v) => setForm({...form, fullName: v})} required/>
              <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({...form, email: v})} required/>
              <Field label="Phone" value={form.phone} onChange={(v) => setForm({...form, phone: v})} required className="sm:col-span-2"/>
            </div>
          </div>

          {/* DELIVERY METHOD (Change 4 & 5) */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h3 className="font-display text-xl font-bold mb-4">Delivery Method</h3>
            <div className="space-y-3">
              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${deliveryMethod === "Home Delivery" ? "border-[#4A0E16] bg-[#4A0E16]/5" : "border-gray-200"}`}>
                <input type="radio" name="dm" checked={deliveryMethod === "Home Delivery"} onChange={() => setDeliveryMethod("Home Delivery")} className="mt-1 accent-[#4A0E16]"/>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="font-semibold">Home Delivery</div>
                    <div className="text-sm font-bold text-[#4A0E16]">{formatNGN(DELIVERY_FEE)}</div>
                  </div>
                  <div className="text-xs text-gray-500">Delivered to your address</div>
                </div>
              </label>
              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${deliveryMethod === "Pickup Station" ? "border-[#4A0E16] bg-[#4A0E16]/5" : "border-gray-200"}`}>
                <input type="radio" name="dm" checked={deliveryMethod === "Pickup Station"} onChange={() => setDeliveryMethod("Pickup Station")} className="mt-1 accent-[#4A0E16]"/>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="font-semibold">Pickup Station</div>
                    <div className="text-sm font-bold text-emerald-600">FREE</div>
                  </div>
                  <div className="text-xs text-gray-500">Collect from a Diamond Body station</div>
                </div>
              </label>
            </div>

            {/* Conditional fields */}
            {deliveryMethod === "Home Delivery" && (
              <div className="mt-5 grid sm:grid-cols-2 gap-4">
                <Field label="Street Address" value={form.street} onChange={(v) => setForm({...form, street: v})} className="sm:col-span-2" required/>
                <Field label="City" value={form.city} onChange={(v) => setForm({...form, city: v})} required/>
                <Field label="State" value={form.state} onChange={(v) => setForm({...form, state: v})} required/>
              </div>
            )}

            {deliveryMethod === "Pickup Station" && (
              <div className="mt-5">
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-700 mb-1">Select Pickup Station *</span>
                  <select
                    required
                    value={pickupStationId}
                    onChange={(e) => setPickupStationId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4A0E16] text-sm bg-white"
                  >
                    <option value="">— Choose a station —</option>
                    {activeStations.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.city}, {s.state}
                      </option>
                    ))}
                  </select>
                </label>
                {pickupStationId && (() => {
                  const s = activeStations.find((x) => x.id === pickupStationId);
                  return s ? (
                    <div className="mt-3 text-xs bg-[#F5F5F5] rounded-xl p-3 text-gray-700">
                      <div className="font-semibold text-[#4A0E16] mb-1">{s.name}</div>
                      <div>{s.address}, {s.city}, {s.state}</div>
                      <div>📞 {s.phone}</div>
                      <div>🕐 {s.hours}</div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>

          {/* PAYMENT */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h3 className="font-display text-xl font-bold mb-4">Payment Method</h3>
            <div className="space-y-3">
              {/* Paystack — Coming Soon */}
              <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-amber-200 bg-amber-50/50 cursor-not-allowed opacity-75">
                <input type="radio" name="pm" disabled className="mt-1 accent-amber-500"/>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Paystack — Coming Soon</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">Soon</span>
                  </div>
                  <div className="text-xs text-amber-600">Card, USSD & bank transfer payments will be available soon.</div>
                </div>
              </label>
              {/* Bank Transfer — Active */}
              <label className="flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition border-[#4A0E16] bg-[#4A0E16]/5">
                <input type="radio" name="pm" checked readOnly className="mt-1 accent-[#4A0E16]"/>
                <div className="flex-1">
                  <div className="font-semibold">Direct Bank Transfer</div>
                  <div className="text-xs text-gray-500">Transfer to our account and upload proof of payment</div>
                </div>
              </label>
            </div>

            {method === "Bank Transfer" && (
              <div className="mt-4 p-4 bg-[#F5F5F5] rounded-xl space-y-3 text-sm">
                <h4 className="font-semibold text-[#4A0E16]">Bank Details</h4>
                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                <div><strong>Bank:</strong> {BANK.bankName}</div>
                <div><strong>Account Name:</strong> {BANK.accountName}</div>
                <div><strong>Account Number:</strong> {BANK.accountNumber}</div>
                  <div><strong>Amount:</strong> {formatNGN(total)}</div>
                </div>
                <p className="text-xs text-gray-600">{BANK.reference}</p>

                <label className="block">
                  <span className="block text-xs font-semibold mb-2">Upload Payment Proof (stored in Cloudinary)</span>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-[#4A0E16] transition flex items-center justify-center gap-2">
                      <IconUpload size={18}/>
                      <span className="text-sm">{proofFile ? "Replace proof image" : "Click to upload"}</span>
                      <input type="file" accept="image/*" onChange={handleProofUpload} className="hidden"/>
                    </label>
                    {proofFile && <img src={proofFile} alt="proof" className="w-16 h-16 object-cover rounded-lg"/>}
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* OPTIONAL REFERRAL CODE (Change 3) */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h3 className="font-display text-xl font-bold mb-2">Referral Code (Optional)</h3>
            <label className="block">
              <span className="block text-xs text-gray-600 mb-2">
                Enter the referral code of the Diamond Body member who introduced you (Optional)
              </span>
              <input
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="e.g. REF-1234 (leave blank if none)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4A0E16] text-sm"
              />
            </label>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 h-fit lg:sticky lg:top-24">
          <h3 className="font-display text-xl font-bold mb-4">Order Summary</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
            {cart.map((c) => {
              const p = PRODUCTS.find((x) => x.id === c.productId)!;
              return (
                <div key={c.productId} className="flex gap-3 text-sm">
                  <div className="relative w-14 h-14 bg-[#F5F5F5] rounded-lg overflow-hidden flex-shrink-0">
                    <img src={p.image} className="w-full h-full object-cover" alt=""/>
                    <span className="absolute top-0 right-0 bg-[#4A0E16] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-bl-lg font-bold">{c.quantity}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-xs">{p.name}</div>
                    <div className="text-xs text-gray-500">{formatNGN(p.price)}</div>
                  </div>
                  <div className="text-sm font-semibold">{formatNGN(p.price * c.quantity)}</div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 mb-4">
            <input
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="Promo code"
              className="flex-1 px-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-[#4A0E16]"
            />
            <button type="button" onClick={applyPromo} className="px-4 py-2 rounded-full bg-[#222] text-white text-sm font-semibold">Apply</button>
          </div>

          <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatNGN(subtotal)}</span></div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                {deliveryMethod === "Pickup Station" ? "Pickup" : "Delivery Fee"}
              </span>
              <span className={shipping === 0 ? "text-emerald-600 font-semibold" : ""}>
                {shipping === 0 ? "FREE" : formatNGN(shipping)}
              </span>
            </div>
            {discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount ({appliedPromo?.code})</span><span>-{formatNGN(discount)}</span></div>}
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
              <span>Total</span><span className="text-[#4A0E16]">{formatNGN(total)}</span>
            </div>
          </div>

          <Button type="submit" className="w-full mt-6">Place Order</Button>
          <p className="text-xs text-gray-500 text-center mt-3">By placing this order you agree to our Terms.</p>
        </div>
      </form>
    </Container>
  );
}

function Field({ label, value, onChange, type = "text", required, className }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; className?: string;
}) {
  return (
    <label className={`block ${className || ""}`}>
      <span className="block text-xs font-semibold text-gray-700 mb-1">{label}{required && " *"}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4A0E16] text-sm"
      />
    </label>
  );
}
