import { useState } from "react";
import { PRODUCTS } from "../data/products";
import { useApp, formatNGN } from "../store/store";
import { Container, Button, Badge, StarRating } from "../components/UI";
import { ProductCard } from "../components/ProductCard";
import { IconCart, IconHeart, IconMinus, IconPlus, IconTruck, IconShield, IconCheck, IconStar } from "../components/Icons";
import { Link, useRouter } from "../router";

export function ProductDetails({ slug }: { slug: string }) {
  const product = PRODUCTS.find((p) => p.slug === slug);
  const { addToCart, toggleWishlist, wishlist, user, reviews, addReview } = useApp();
  const { navigate } = useRouter();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"benefits" | "ingredients" | "reviews">("benefits");
  const [zoom, setZoom] = useState(false);
  // Review form
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", body: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  if (!product) {
    return (
      <Container className="py-32 text-center">
        <h2 className="font-display text-3xl font-bold mb-4">Product not found</h2>
        <Link to="/shop"><Button>Back to Shop</Button></Link>
      </Container>
    );
  }

  const productReviews = reviews.filter((r) => r.productId === product.id);
  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const wished = wishlist.includes(product.id);

  return (
    <div className="bg-white">
      <Container className="py-8">
        <nav className="text-xs text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#4A0E16]">Home</Link> /{" "}
          <Link to="/shop" className="hover:text-[#4A0E16]">Shop</Link> /{" "}
          <span className="text-[#4A0E16] font-semibold">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <div
              className="relative bg-[#F5F5F5] rounded-3xl overflow-hidden aspect-square cursor-zoom-in"
              onClick={() => setZoom(!zoom)}
            >
              <img
                src={product.image}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-500 ${zoom ? "scale-150" : ""}`}
              />
              {product.badge && (
                <div className="absolute top-4 left-4">
                  <Badge tone="oxblood">{product.badge}</Badge>
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3 mt-4">
              {product.gallery.map((g, i) => (
                <div key={i} className="aspect-square bg-[#F5F5F5] rounded-xl overflow-hidden border border-gray-100">
                  <img src={g} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-[0.2em] font-semibold mb-2">{product.tagline}</div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#222] mb-4">{product.name}</h1>
            <div className="flex items-center gap-3 mb-6">
              <StarRating value={product.rating} size={18} showNumber />
              <span className="text-sm text-gray-500">({product.reviewsCount} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <div className="font-display text-4xl font-bold text-[#4A0E16]">{formatNGN(product.price)}</div>
              {product.comparePrice && (
                <>
                  <div className="text-lg text-gray-400 line-through">{formatNGN(product.comparePrice)}</div>
                  <Badge tone="error">Save {formatNGN(product.comparePrice - product.price)}</Badge>
                </>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>

            <div className="flex items-center gap-2 mb-6 text-sm">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium ${product.inventory > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                <span className={`w-2 h-2 rounded-full ${product.inventory > 0 ? "bg-emerald-500" : "bg-red-500"}`}></span>
                {product.inventory > 0 ? `In Stock (${product.inventory})` : "Out of Stock"}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="inline-flex items-center border border-gray-200 rounded-full overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:bg-gray-100"><IconMinus size={16}/></button>
                <div className="w-12 text-center font-semibold">{qty}</div>
                <button onClick={() => setQty(qty + 1)} className="p-3 hover:bg-gray-100"><IconPlus size={16}/></button>
              </div>
              <div className="flex-1 flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => addToCart(product.id, qty)}
                >
                  <IconCart size={18}/> Add to Cart
                </Button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3 rounded-full border transition ${wished ? "bg-[#4A0E16] border-[#4A0E16] text-white" : "border-gray-200 text-gray-700 hover:border-[#4A0E16] hover:text-[#4A0E16]"}`}
                >
                  <IconHeart size={20}/>
                </button>
              </div>
            </div>

            <button
              onClick={() => { addToCart(product.id, qty); navigate("/checkout"); }}
              className="w-full px-6 py-3 rounded-full bg-[#222] text-white font-semibold hover:bg-black transition mb-6"
            >
              Buy Now
            </button>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 p-3 bg-[#F5F5F5] rounded-xl">
                <IconTruck size={18} className="text-[#4A0E16]"/>
                <div>
                  <div className="font-semibold text-xs">Free Pickup</div>
                  <div className="text-xs text-gray-500">At any station</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-[#F5F5F5] rounded-xl">
                <IconShield size={18} className="text-[#4A0E16]"/>
                <div>
                  <div className="font-semibold text-xs">Authentic</div>
                  <div className="text-xs text-gray-500">100% genuine</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex border-b border-gray-200 gap-6 overflow-x-auto no-scrollbar">
            {[
              { k: "benefits", l: "Benefits" },
              { k: "ingredients", l: "Ingredients" },
              { k: "reviews", l: `Reviews (${reviews.length})` },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k as any)}
                className={`pb-3 px-1 font-semibold text-sm whitespace-nowrap border-b-2 transition ${
                  tab === t.k ? "border-[#4A0E16] text-[#4A0E16]" : "border-transparent text-gray-500 hover:text-[#222]"
                }`}
              >
                {t.l}
              </button>
            ))}
          </div>

          <div className="py-8">
            {tab === "benefits" && (
              <ul className="grid sm:grid-cols-2 gap-3">
                {product.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-3 p-4 bg-[#F5F5F5] rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-[#4A0E16] text-white flex items-center justify-center flex-shrink-0">
                      <IconCheck size={16}/>
                    </div>
                    <span className="text-sm text-[#222]">{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {tab === "ingredients" && (
              <div className="grid sm:grid-cols-3 gap-3">
                {product.ingredients.map((ing, i) => (
                  <div key={i} className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#222]">
                    {ing}
                  </div>
                ))}
              </div>
            )}
            {tab === "reviews" && (
              <div className="space-y-6 max-w-3xl">
                {/* ⭐ Write a review */}
                {user ? (
                  showReviewForm ? (
                    <div className="bg-[#F5F5F5] rounded-2xl p-6">
                      <h4 className="font-display font-bold text-lg mb-4">Write a Review</h4>
                      <div className="space-y-4">
                        <div>
                          <span className="block text-xs font-semibold text-gray-700 mb-2">Rating</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                                className={`p-1.5 rounded-lg transition ${s <= reviewForm.rating ? "text-amber-500" : "text-gray-300"}`}>
                                <IconStar size={28} filled={s <= reviewForm.rating} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <label className="block">
                          <span className="block text-xs font-semibold text-gray-700 mb-1">Title</span>
                          <input value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                            placeholder="Summary of your experience" maxLength={120}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4A0E16] text-sm" />
                        </label>
                        <label className="block">
                          <span className="block text-xs font-semibold text-gray-700 mb-1">Your Review</span>
                          <textarea value={reviewForm.body} onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                            rows={4} placeholder="Tell others about your experience with this product" maxLength={2000}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4A0E16] text-sm resize-none" />
                        </label>
                        <div className="flex gap-2">
                          <Button disabled={submittingReview || !reviewForm.title || !reviewForm.body} onClick={() => {
                            if (!reviewForm.title || !reviewForm.body) return;
                            setSubmittingReview(true);
                            addReview({
                              id: "rv-" + Date.now(),
                              productId: product.id,
                              author: user.name,
                              rating: reviewForm.rating,
                              title: reviewForm.title,
                              body: reviewForm.body,
                              date: new Date().toISOString(),
                              verified: false,
                            });
                            setReviewForm({ rating: 5, title: "", body: "" });
                            setShowReviewForm(false);
                            setSubmittingReview(false);
                          }}>{submittingReview ? "Submitting..." : "Submit Review"}</Button>
                          <button onClick={() => setShowReviewForm(false)} className="px-6 py-3 rounded-full border border-gray-200 text-sm font-semibold hover:bg-gray-50">Cancel</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-[#F5F5F5] rounded-2xl">
                      <p className="text-gray-600 text-sm mb-3">Share your experience with this product</p>
                      <Button onClick={() => setShowReviewForm(true)}><IconStar size={16} /> Write a Review</Button>
                    </div>
                  )
                ) : (
                  <div className="text-center py-6 bg-[#F5F5F5] rounded-2xl">
                    <p className="text-gray-600 text-sm mb-3">Please sign in to leave a review</p>
                    <Link to="/login"><Button variant="ghost">Sign In</Button></Link>
                  </div>
                )}

                {/* ⭐ Display reviews */}
                <h4 className="font-display font-bold text-lg">
                  {productReviews.length} Review{productReviews.length !== 1 ? "s" : ""}
                </h4>
                {productReviews.length === 0 ? (
                  <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
                ) : (
                  productReviews.map((r) => (
                    <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-[#222]">{r.author} {r.verified && <Badge tone="success" className="ml-2">Verified</Badge>}</div>
                          <div className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString()}</div>
                        </div>
                        <StarRating value={r.rating} />
                      </div>
                      <div className="font-semibold text-sm mb-1">{r.title}</div>
                      <p className="text-sm text-gray-700">{r.body}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-6 text-[#222]">You might also like</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => <ProductCard key={p.id} product={p}/>)}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
