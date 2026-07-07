import { useState } from "react";
import { Link } from "../router";
import { useApp } from "../store/store";
import { Container } from "./UI";
import { IconDiamond, IconMail, IconPhone, IconMapPin } from "./Icons";

export function Footer() {
  const { subscribe } = useApp();
  const [email, setEmail] = useState("");

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      subscribe(email);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#222222] text-gray-300 mt-20">
      <Container className="py-16">
        <div className="grid lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#4A0E16] flex items-center justify-center text-white">
                <IconDiamond size={22} />
              </div>
              <div className="font-display text-xl font-bold text-white">Diamond Body</div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 mb-4">
              When your inside is a diamond, everything else shines. Clean ingredients. Real results. No shortcuts.
            </p>
            <div className="space-y-2 text-sm">
              <a href="mailto:thediamondbodynigeria@gmail.com" className="flex items-center gap-2 hover:text-white transition"><IconMail size={16} /> thediamondbodynigeria@gmail.com</a>
              <a href="tel:+2347025008596" className="flex items-center gap-2 hover:text-white transition"><IconPhone size={16} /> +234 702 500 8596</a>
              <div className="flex items-center gap-2"><IconMapPin size={16} /> Lagos, Nigeria</div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="hover:text-white">All Products</Link></li>
              <li><Link to="/shop?cat=detox" className="hover:text-white">Detox & Cleanse</Link></li>
              <li><Link to="/shop?cat=energy" className="hover:text-white">Energy & Vitality</Link></li>
              <li><Link to="/shop?cat=family" className="hover:text-white">Family Wellness</Link></li>
              <li><Link to="/shop?cat=wellness-tech" className="hover:text-white">Wellness Tech</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/blog" className="hover:text-white">Wellness Blog</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link to="/dashboard" className="hover:text-white">My Account</Link></li>
              <li><a href="#" className="hover:text-white">Become a Leader</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-3">Get wellness tips, product launches & exclusive offers.</p>
            <form onSubmit={onSubscribe} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#4A0E16] text-sm"
                required
              />
              <button type="submit" className="w-full px-4 py-3 rounded-full bg-[#4A0E16] hover:bg-[#6b1722] text-white font-semibold text-sm transition">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div>© 2026 Diamond Body Wellness Ltd. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Shipping & Returns</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
