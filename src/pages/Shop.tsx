import { useMemo, useState, useEffect } from "react";
import { PRODUCTS, CATEGORIES } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { Container, Button } from "../components/UI";
import { IconFilter, IconClose } from "../components/Icons";
import { parseRoute, useRouter } from "../router";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

export function Shop() {
  const { path } = useRouter();
  const { params } = parseRoute(path);
  const initialCat = params.get("cat") || "all";
  const initialQ = params.get("q") || "";

  const [category, setCategory] = useState(initialCat);
  const [query, setQuery] = useState(initialQ);
  const [sort, setSort] = useState<SortKey>("featured");
  const [priceMax, setPriceMax] = useState(50000000);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const perPage = 8;

  useEffect(() => {
    setCategory(initialCat);
    setQuery(initialQ);
    setPage(1);
  }, [initialCat, initialQ]);

  const filtered = useMemo(() => {
    let list = [...PRODUCTS];
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    list = list.filter((p) => p.price <= priceMax);
    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      case "newest": list.reverse(); break;
      default:
        list.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    }
    return list;
  }, [category, query, sort, priceMax]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const FilterPanel = (
    <div className="space-y-8">
      <div>
        <h4 className="font-bold text-sm uppercase tracking-wider mb-3 text-[#222]">Category</h4>
        <div className="space-y-2">
          <button
            onClick={() => { setCategory("all"); setPage(1); }}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${category === "all" ? "bg-[#4A0E16] text-white font-semibold" : "hover:bg-gray-100 text-gray-700"}`}
          >
            All Products ({PRODUCTS.length})
          </button>
          {CATEGORIES.map((c) => {
            const count = PRODUCTS.filter((p) => p.category === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => { setCategory(c.id); setPage(1); }}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${category === c.id ? "bg-[#4A0E16] text-white font-semibold" : "hover:bg-gray-100 text-gray-700"}`}
              >
                {c.icon} {c.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="font-bold text-sm uppercase tracking-wider mb-3 text-[#222]">Max Price</h4>
        <input
          type="range" min={5000} max={50000000} step={1000}
          value={priceMax} onChange={(e) => { setPriceMax(Number(e.target.value)); setPage(1); }}
          className="w-full accent-[#4A0E16]"
        />
        <div className="text-sm text-gray-600 mt-2">Up to ₦{priceMax.toLocaleString()}</div>
      </div>
    </div>
  );

  return (
    <div className="bg-white">
      <section className="bg-gradient-to-br from-[#4A0E16] to-[#34090f] text-white py-12 sm:py-16">
        <Container>
          <div className="text-center">
            <div className="text-xs font-bold tracking-[0.25em] uppercase text-white/70 mb-3">Shop Wellness</div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold">All Products</h1>
            <p className="mt-3 text-white/80 max-w-xl mx-auto">Premium wellness, formulated for real results.</p>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block sticky top-24 self-start">
            {FilterPanel}
          </aside>

          {/* Mobile filter drawer */}
          {filtersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
              <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold">Filters</h3>
                  <button onClick={() => setFiltersOpen(false)}><IconClose/></button>
                </div>
                {FilterPanel}
              </div>
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="text-sm text-gray-600">
                Showing <span className="font-bold text-[#222]">{paged.length}</span> of {filtered.length} products
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold"
                >
                  <IconFilter size={16}/> Filters
                </button>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium bg-white focus:outline-none focus:border-[#4A0E16]"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {paged.length === 0 ? (
              <div className="text-center py-20 bg-[#F5F5F5] rounded-2xl">
                <div className="text-5xl mb-4">🔎</div>
                <h3 className="font-display text-xl font-bold mb-2">No products match your filters</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or browse all products.</p>
                <Button onClick={() => { setCategory("all"); setQuery(""); setPriceMax(50000000); }}>Reset filters</Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {paged.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-full font-semibold text-sm transition ${
                      page === i + 1 ? "bg-[#4A0E16] text-white" : "bg-white border border-gray-200 hover:border-[#4A0E16]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
