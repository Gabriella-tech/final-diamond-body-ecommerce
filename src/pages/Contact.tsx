import { useState } from "react";
import { Container, Button } from "../components/UI";
import { IconMail, IconPhone, IconMapPin } from "../components/Icons";
import { useApp } from "../store/store";

export function Contact() {
  const { toast } = useApp();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ type: "success", message: "Message sent! We'll respond within 24 hours." });
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="bg-white">
      <section className="bg-gradient-to-br from-[#4A0E16] to-[#34090f] text-white py-16">
        <Container className="text-center max-w-2xl">
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3">Get in touch</h1>
          <p className="text-white/80">We'd love to hear from you. Our wellness team typically responds within 24 hours.</p>
        </Container>
      </section>

      <Container className="py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            {[
              { i: <IconMail size={22}/>, t: "Email", d: "thediamondbodynigeria@gmail.com", s: "We respond within 24 hours" },
              { i: <IconPhone size={22}/>, t: "Phone", d: "+234 702 500 8596", s: "Mon–Sat, 9am–6pm" },
              { i: <IconMapPin size={22}/>, t: "Office", d: "Lagos, Nigeria", s: "Lekki Phase 1, Lagos" },
            ].map((c, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#4A0E16] text-white flex items-center justify-center flex-shrink-0">{c.i}</div>
                <div>
                  <div className="font-display font-bold text-lg">{c.t}</div>
                  <div className="text-[#4A0E16] font-semibold text-sm">{c.d}</div>
                  <div className="text-xs text-gray-500 mt-1">{c.s}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-8">
            <h3 className="font-display text-2xl font-bold mb-6">Send us a message</h3>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-700 block mb-1">Name *</span>
                  <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4A0E16]"/>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-700 block mb-1">Email *</span>
                  <input type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4A0E16]"/>
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-semibold text-gray-700 block mb-1">Subject *</span>
                <input required value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4A0E16]"/>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-gray-700 block mb-1">Message *</span>
                <textarea required rows={6} value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4A0E16] resize-none"/>
              </label>
              <Button type="submit" disabled={sent}>{sent ? "Message sent!" : "Send Message"}</Button>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}
