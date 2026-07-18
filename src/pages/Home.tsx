import { useState } from "react";
import { Link } from "../router";
import { PRODUCTS, CATEGORIES, TESTIMONIALS, FAQS } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { Button, Container, SectionTitle, Badge, StarRating } from "../components/UI";
import {
  IconArrowRight, IconLeaf, IconBolt, IconShield, IconTruck, IconDiamond,
  IconChevronDown, IconCheck, IconHeart
} from "../components/Icons";

export function Home() {
  const featured = PRODUCTS.filter((p) => p.featured);
  const bestSellers = PRODUCTS.filter((p) => p.bestSeller);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#4A0E16] via-[#5a1220] to-[#34090f] text-white">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }}/>
        <Container className="relative py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <Badge tone="default" className="bg-white/10 text-white border border-white/20 backdrop-blur mb-6">
                <IconDiamond size={12} /> Premium Wellness
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] mb-6">
                Getting your <span className="italic text-white/90">body</span><br/>
                to<span className="text-white">its</span><br/>
                ultimate <span className="text-white/80"> form.</span>
              </h1>
              <p className="text-lg text-white/80 mb-8 max-w-xl leading-relaxed">
                Natural, science backed formulas for detox, digestion, energy, and lifelong vitality.
                Because looking good means nothing if you don't feel good.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/shop">
                  <Button variant="white" size="lg" className="w-full sm:w-auto">
                    Shop Now <IconArrowRight size={18} />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto !text-white border border-white/30 hover:bg-white/10">
                    Explore Wellness
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-white/15">
                <div>
                  <div className="font-display text-2xl sm:text-3xl font-bold">50K+</div>
                  <div className="text-xs text-white/70 uppercase tracking-wider mt-1">Happy Customers</div>
                </div>
                <div>
                  <div className="font-display text-2xl sm:text-3xl font-bold">100%</div>
                  <div className="text-xs text-white/70 uppercase tracking-wider mt-1">Natural</div>
                </div>
                <div>
                  <div className="font-display text-2xl sm:text-3xl font-bold">4.9★</div>
                  <div className="text-xs text-white/70 uppercase tracking-wider mt-1">Rated</div>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-8 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl" />
                <div className="relative grid grid-cols-2 gap-4">
                  <div className="space-y-4 animate-float">
                    <img src={PRODUCTS[0].image} alt="" className="rounded-2xl shadow-2xl bg-white"/>
                    <img src={PRODUCTS[3].image} alt="" className="rounded-2xl shadow-2xl bg-white"/>
                  </div>
                  <div className="space-y-4 mt-12" style={{ animation: "float 5s ease-in-out infinite", animationDelay: "1s" }}>
                    <img src={PRODUCTS[1].image} alt="" className="rounded-2xl shadow-2xl bg-white"/>
                    <img src={PRODUCTS[8].image} alt="" className="rounded-2xl shadow-2xl bg-white"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust bar */}
      <section className="bg-[#F5F5F5] border-y border-gray-200">
        <Container className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
          {[
            { icon: <IconLeaf size={22}/>, t: "100% Natural", s: "Clean ingredients" },
            { icon: <IconShield size={22}/>, t: "Science Backed", s: "Lab tested" },
            { icon: <IconTruck size={22}/>, t: "Free Pickup", s: "At any pickup station" },
            { icon: <IconHeart size={22}/>, t: "Real Results", s: "No shortcuts" },
          ].map((x, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white text-[#4A0E16] flex items-center justify-center shadow-sm">
                {x.icon}
              </div>
              <div>
                <div className="font-bold text-sm text-[#222]">{x.t}</div>
                <div className="text-xs text-gray-500">{x.s}</div>
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* Featured products */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionTitle
            eyebrow="Featured Wellness"
            title="Discover Diamond Body"
            subtitle="Premium formulas designed to support your body's most important systems from the inside out."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mt-12">
            {featured.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-10">
            <Link to="/shop"><Button variant="outline">View All Products <IconArrowRight size={16}/></Button></Link>
          </div>
        </Container>
      </section>

      {/* Categories strip */}
      <section className="py-12 bg-[#F5F5F5]">
        <Container>
          <SectionTitle eyebrow="Shop By Category" title="Wellness for Every Need" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mt-10">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                to={`/shop?cat=${c.id}`}
                className="flex flex-col items-center justify-center gap-2 bg-white rounded-2xl p-4 hover:shadow-md hover:-translate-y-1 transition border border-gray-100"
              >
                <div className="text-3xl">{c.icon}</div>
                <div className="text-xs sm:text-sm font-semibold text-center text-[#222]">{c.name}</div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Best Sellers */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionTitle eyebrow="Best Sellers" title="Loved by Thousands" subtitle="The wellness formulas our community can't stop talking about." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mt-12">
            {bestSellers.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </Container>
      </section>

      {/* About / Wellness Benefits */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#34090f] to-[#4A0E16] text-white relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"/>
        <Container className="relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs font-bold tracking-[0.25em] uppercase text-white/70 mb-3">Our Philosophy</div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                True wellness <em className="text-white/80">starts within.</em>
              </h2>
              <p className="text-white/80 leading-relaxed mb-8">
                At Diamond Body, we focus on internal health, the organs and systems that keep your body running.
                Our formulas support detox, digestion, energy, circulation, and long-term vitality.
              </p>
              <div className="space-y-4">
                {[
                  "Clean, science-backed ingredients",
                  "Manufactured in certified facilities",
                  "Tested for purity and potency",
                  "Designed for long-term wellness",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                      <IconCheck size={14}/>
                    </div>
                    <span className="text-white/90">{t}</span>
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <Link to="/about"><Button variant="white">Our Story <IconArrowRight size={16}/></Button></Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <IconLeaf/>, title: "Detox", desc: "Daily cleansing for a balanced gut" },
                { icon: <IconBolt/>, title: "Energy", desc: "Sustained vitality without crashes" },
                { icon: <IconHeart/>, title: "Circulation", desc: "Heart-supportive nutrition" },
                { icon: <IconShield/>, title: "Immunity", desc: "Defense from the inside out" },
              ].map((b, i) => (
                <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/15 hover:bg-white/15 transition">
                  <div className="w-12 h-12 rounded-xl bg-white text-[#4A0E16] flex items-center justify-center mb-4">
                    {b.icon}
                  </div>
                  <div className="font-display text-xl font-bold mb-1">{b.title}</div>
                  <div className="text-sm text-white/75">{b.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionTitle eyebrow="Real Results" title="Stories from our community" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
                <StarRating value={t.rating} />
                <p className="mt-4 text-gray-700 leading-relaxed text-sm">"{t.text}"</p>
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <div className="font-semibold text-sm text-[#222]">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role} • {t.location}</div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-[#F5F5F5]">
        <Container>
          <SectionTitle eyebrow="Why Diamond Body" title="The Diamond Body Difference" />
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { n: "01", t: "Clean Ingredients", d: "We never compromise on quality. Every ingredient is sourced from trusted partners and rigorously tested." },
              { n: "02", t: "Real Results", d: "Our formulas are designed to deliver measurable wellness benefits not empty promises." },
              { n: "03", t: "No Shortcuts", d: "We believe in long-term wellness. No quick fixes, no harmful additives, just honest nutrition." },
            ].map((x) => (
              <div key={x.n} className="bg-white rounded-2xl p-8 border border-gray-100">
                <div className="font-display text-4xl font-bold text-[#4A0E16]/20 mb-3">{x.n}</div>
                <div className="font-display text-xl font-bold mb-2 text-[#222]">{x.t}</div>
                <p className="text-gray-600 text-sm leading-relaxed">{x.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24">
        <Container className="max-w-4xl">
          <SectionTitle eyebrow="FAQ" title="Frequently Asked Questions" />
          <div className="mt-12 space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-[#222] pr-4">{f.q}</span>
                  <IconChevronDown
                    size={20}
                    className={`text-[#4A0E16] flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed animate-fade-in">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-[#4A0E16] text-white">
        <Container className="text-center max-w-2xl">
          <h3 className="font-display text-3xl sm:text-4xl font-bold mb-4">Join the wellness movement</h3>
          <p className="text-white/80 mb-8">Subscribe for exclusive offers, wellness tips, and first access to new launches.</p>
          <form
            onSubmit={(e) => { e.preventDefault(); }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 rounded-full text-[#222] bg-white focus:outline-none"
            />
            <button type="submit" className="px-6 py-3 rounded-full bg-white text-[#4A0E16] font-bold hover:bg-gray-100 transition">
              Subscribe
            </button>
          </form>
        </Container>
      </section>
    </div>
  );
}
