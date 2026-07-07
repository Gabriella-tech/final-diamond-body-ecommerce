import { useApp, cartTotal, formatNGN } from "../store/store";
import { PRODUCTS } from "../data/products";
import { Container, Button } from "../components/UI";
import { IconTrash, IconMinus, IconPlus, IconArrowRight } from "../components/Icons";
import { Link } from "../router";

export function Cart() {
  const { cart, removeFromCart, updateCartQty } = useApp();
  const subtotal = cartTotal(cart, PRODUCTS);

  if (cart.length === 0) {
    return (
      <Container className="py-24 text-center max-w-md">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="font-display text-3xl font-bold mb-3">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Discover our premium wellness products and start your journey.</p>
        <Link to="/shop"><Button>Shop Now <IconArrowRight size={16}/></Button></Link>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-bold mb-8 text-[#222]">Shopping Cart</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-4">
          {cart.map((item) => {
            const p = PRODUCTS.find((x) => x.id === item.productId);
            if (!p) return null;
            return (
              <div key={item.productId} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-28 h-28 bg-[#F5F5F5] rounded-xl overflow-hidden flex-shrink-0">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover"/>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between gap-3">
                    <div>
                      <Link to={`/product/${p.slug}`} className="font-display font-bold text-lg text-[#222] hover:text-[#4A0E16]">{p.name}</Link>
                      <div className="text-xs text-gray-500">{p.tagline}</div>
                    </div>
                    <button onClick={() => removeFromCart(p.id)} className="text-gray-400 hover:text-red-600">
                      <IconTrash size={18}/>
                    </button>
                  </div>
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <div className="inline-flex items-center border border-gray-200 rounded-full">
                      <button onClick={() => updateCartQty(p.id, item.quantity - 1)} className="p-2 hover:bg-gray-100 rounded-l-full"><IconMinus size={14}/></button>
                      <div className="w-10 text-center font-semibold text-sm">{item.quantity}</div>
                      <button onClick={() => updateCartQty(p.id, item.quantity + 1)} className="p-2 hover:bg-gray-100 rounded-r-full"><IconPlus size={14}/></button>
                    </div>
                    <div className="font-bold text-[#4A0E16]">{formatNGN(p.price * item.quantity)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 h-fit sticky top-24">
          <h3 className="font-display text-xl font-bold mb-4 text-[#222]">Order Summary</h3>
          <div className="space-y-3 text-sm mb-4">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-semibold">{formatNGN(subtotal)}</span></div>
            <div className="flex justify-between text-gray-500 text-xs"><span>Delivery</span><span>Calculated at checkout</span></div>
            <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold">
              <span>Subtotal</span><span className="text-[#4A0E16]">{formatNGN(subtotal)}</span>
            </div>
          </div>
          <Link to="/checkout">
            <Button className="w-full">Proceed to Checkout <IconArrowRight size={16}/></Button>
          </Link>
          <Link to="/shop">
            <button className="w-full mt-2 text-sm text-gray-600 hover:text-[#4A0E16] py-2">← Continue Shopping</button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
