import { Link } from "../router";
import type { Product } from "../data/products";
import { useApp, formatNGN } from "../store/store";
import { Badge, StarRating } from "./UI";
import { IconCart, IconHeart } from "./Icons";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, wishlist } = useApp();
  const wished = wishlist.includes(product.id);

  return (
    <div className="product-card bg-white rounded-2xl overflow-hidden border border-gray-100 group flex flex-col">
      <div className="relative overflow-hidden aspect-square bg-[#F5F5F5]">
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        {product.badge && (
          <div className="absolute top-3 left-3">
            <Badge tone="oxblood">{product.badge}</Badge>
          </div>
        )}
        {product.comparePrice && (
          <div className="absolute top-3 right-3">
            <Badge tone="error">
              -{Math.round((1 - product.price / product.comparePrice) * 100)}%
            </Badge>
          </div>
        )}
        <button
          onClick={() => toggleWishlist(product.id)}
          className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition ${
            wished ? "bg-[#4A0E16] text-white" : "bg-white text-gray-700 hover:bg-[#4A0E16] hover:text-white"
          }`}
          aria-label="Toggle wishlist"
        >
          <IconHeart size={18} />
        </button>
      </div>
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
          {product.tagline}
        </div>
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-display text-lg font-bold text-[#222222] hover:text-[#4A0E16] transition mb-2 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-3">
          <StarRating value={product.rating} />
          <span className="text-xs text-gray-500">({product.reviewsCount})</span>
        </div>
        <div className="flex items-baseline gap-2 mb-4">
          <div className="text-lg font-bold text-[#4A0E16]">{formatNGN(product.price)}</div>
          {product.comparePrice && (
            <div className="text-xs text-gray-400 line-through">{formatNGN(product.comparePrice)}</div>
          )}
        </div>
        <button
          onClick={() => addToCart(product.id)}
          className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#4A0E16] text-white text-sm font-semibold hover:bg-[#6b1722] transition"
        >
          <IconCart size={16} /> Add to Cart
        </button>
      </div>
    </div>
  );
}
