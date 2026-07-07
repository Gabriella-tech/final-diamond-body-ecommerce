import { Container, SectionTitle, Button } from "../components/UI";
import { IconCheck, IconLeaf, IconShield, IconHeart, IconBolt, IconDiamond, IconArrowRight } from "../components/Icons";
import { Link } from "../router";

export function About() {
  return (
    <div className="bg-white">
      <section className="bg-gradient-to-br from-[#4A0E16] to-[#34090f] text-white py-20">
        <Container className="text-center max-w-3xl">
          <div className="text-xs font-bold tracking-[0.25em] uppercase text-white/70 mb-3">Our Story</div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Wellness that <em className="text-white/80">starts within.</em>
          </h1>
          <p className="mt-6 text-white/80 text-lg">
            Diamond Body was founded on a simple belief: looking good means nothing if you don't feel good.
          </p>
        </Container>
      </section>

      <Container className="py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionTitle align="left" eyebrow="Our Mission" title="Helping bodies become their ultimate version" subtitle="We focus on internal health — the organs and systems that keep your body running. Through natural, science-backed formulas, Diamond Body supports detox, digestion, energy, circulation, and long-term vitality." />
            <div className="mt-8 space-y-4">
              {[
                "Clean, science-backed ingredients sourced from trusted partners",
                "Manufactured in certified facilities with strict quality controls",
                "Independently tested for purity, potency and safety",
                "Designed for long-term wellness, not quick fixes",
              ].map((t) => (
                <div key={t} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#4A0E16] text-white flex items-center justify-center flex-shrink-0">
                    <IconCheck size={14}/>
                  </div>
                  <span className="text-gray-700">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-[#4A0E16] to-[#6b1722] rounded-3xl flex items-center justify-center text-white">
              <div className="text-center px-8">
                <IconDiamond size={80} className="mx-auto mb-6 opacity-90"/>
                <div className="font-display text-3xl font-bold mb-3">Clean. Real. Honest.</div>
                <p className="text-white/80">No shortcuts. No empty promises. Just wellness that works.</p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <section className="py-20 bg-[#F5F5F5]">
        <Container>
          <SectionTitle eyebrow="Our Values" title="What we believe in"/>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {[
              { i: <IconLeaf size={28}/>, t: "Natural First", d: "Every formula starts with nature's most powerful ingredients." },
              { i: <IconShield size={28}/>, t: "Science Backed", d: "Research-driven formulations, lab tested for results." },
              { i: <IconHeart size={28}/>, t: "Family Wellness", d: "From kids to grandparents, wellness for every age." },
              { i: <IconBolt size={28}/>, t: "Real Energy", d: "Sustained vitality without crashes or shortcuts." },
            ].map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center border border-gray-100">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#4A0E16] text-white flex items-center justify-center mb-4">{v.i}</div>
                <div className="font-display text-lg font-bold mb-2">{v.t}</div>
                <p className="text-sm text-gray-600">{v.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container className="text-center max-w-2xl">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">When your inside is a diamond, everything else shines.</h2>
          <p className="text-gray-600 mb-8">Join thousands of customers transforming their wellness from the inside out.</p>
          <Link to="/shop"><Button size="lg">Start Your Journey <IconArrowRight size={18}/></Button></Link>
        </Container>
      </section>
    </div>
  );
}
