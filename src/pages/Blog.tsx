import { Container, SectionTitle, Badge } from "../components/UI";
import { BLOG_POSTS } from "../data/products";
import { IconArrowRight } from "../components/Icons";

export function Blog() {
  return (
    <div className="bg-white">
      <section className="bg-gradient-to-br from-[#4A0E16] to-[#34090f] text-white py-16">
        <Container className="text-center max-w-2xl">
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3">Wellness Journal</h1>
          <p className="text-white/80">Insights, science and stories from the world of internal wellness.</p>
        </Container>
      </section>

      <Container className="py-16">
        <SectionTitle eyebrow="Latest Articles" title="From our wellness experts"/>
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mt-12">
          {BLOG_POSTS.map((p, i) => (
            <article key={p.id} className="group cursor-pointer">
              <div className={`aspect-[16/9] rounded-2xl mb-4 bg-gradient-to-br ${
                i % 4 === 0 ? "from-[#4A0E16] to-[#6b1722]" :
                i % 4 === 1 ? "from-[#34090f] to-[#4A0E16]" :
                i % 4 === 2 ? "from-[#6b1722] to-[#4A0E16]" :
                "from-[#4A0E16] to-[#8a1e2e]"
              } relative overflow-hidden flex items-center justify-center text-white group-hover:scale-[1.01] transition`}>
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: "radial-gradient(circle at 30% 30%, white 1px, transparent 1px)",
                  backgroundSize: "30px 30px"
                }}/>
                <div className="relative font-display text-3xl font-bold opacity-90 px-8 text-center">{p.category}</div>
              </div>
              <Badge tone="oxblood" className="mb-2">{p.category}</Badge>
              <h3 className="font-display text-xl sm:text-2xl font-bold mb-2 group-hover:text-[#4A0E16] transition">{p.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{p.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{p.author} • {new Date(p.date).toLocaleDateString()}</span>
                <span>{p.readTime}</span>
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-[#4A0E16] font-semibold text-sm">
                Read article <IconArrowRight size={14}/>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </div>
  );
}
