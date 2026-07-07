"use strict";

// ============================================================================
// DIAMOND BODY — DATABASE SEED
// Populates: 1 Super Admin, 1 Admin, 8 Nations + 8 Leaders, 7 Categories,
// 11 Products, 5 Pickup Stations. Idempotent (safe to run multiple times).
// ============================================================================

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const env = require("../src/config/env");

const prisma = new PrismaClient();

async function hash(plain) {
  return bcrypt.hash(String(plain), env.BCRYPT_ROUNDS);
}

// ---------- Data ----------

const NATIONS = [
  { code: "NTN001", slug: "vision-nation",            name: "Vision Nation",            leaderName: "Tunde Adebayo",   leaderEmail: "tunde@diamondbody.com" },
  { code: "NTN002", slug: "unstoppable-nation",       name: "Unstoppable Nation",       leaderName: "Sarah Adeyemi",   leaderEmail: "sarah@diamondbody.com" },
  { code: "NTN003", slug: "great-achievers-nation",   name: "Great Achievers Nation",   leaderName: "Blessing Akpan",  leaderEmail: "blessing@diamondbody.com" },
  { code: "NTN004", slug: "star-nation",              name: "Star Nation",              leaderName: "David Mensah",    leaderEmail: "david@diamondbody.com" },
  { code: "NTN005", slug: "legend-nation",            name: "Legend Nation",            leaderName: "Grace Okonkwo",   leaderEmail: "grace@diamondbody.com" },
  { code: "NTN006", slug: "wealth-creation-nation",   name: "Wealth Creation Nation",   leaderName: "Emeka Uzo",       leaderEmail: "emeka@diamondbody.com" },
  { code: "NTN007", slug: "champions-nation",         name: "Champions Nation",         leaderName: "Chioma Eze",      leaderEmail: "chioma@diamondbody.com" },
  { code: "NTN008", slug: "eagle-and-diamond-nation", name: "Eagle and Diamond Nation", leaderName: "John Okafor",     leaderEmail: "john@diamondbody.com" },
];

const CATEGORIES = [
  { slug: "detox",         name: "Detox & Cleanse",   icon: "🌿" },
  { slug: "digestion",     name: "Digestion",         icon: "🍃" },
  { slug: "energy",        name: "Energy & Vitality", icon: "⚡" },
  { slug: "circulation",   name: "Circulation",       icon: "❤️" },
  { slug: "immune",        name: "Immune Support",    icon: "🛡️" },
  { slug: "family",        name: "Family Wellness",   icon: "👨‍👩‍👧" },
  { slug: "wellness-tech", name: "Wellness Tech",     icon: "💎" },
];

const PRODUCTS = [
  { slug: "rp-c247",           name: "RP C247",           tagline: "24/7 Internal Cleanse",        description: "Premium daily detoxifier for gut health.",       price: 15000, comparePrice: 18000, inventory: 124, category: "detox",         featured: true,  bestSeller: true,  badge: "Best Seller", image: "/images/products/rp-c247.jpg" },
  { slug: "rp-complete",       name: "RP Complete",       tagline: "Complete Daily Wellness",      description: "All-in-one multivitamin complex.",                price: 22000, comparePrice: 26000, inventory: 88,  category: "energy",        featured: true,  bestSeller: true,  badge: "Top Rated",   image: "/images/products/rp-complete.jpg" },
  { slug: "rp-choleduz",       name: "RP Choleduz",       tagline: "Cholesterol & Heart Support",  description: "Supports cardiovascular wellness.",               price: 19500, inventory: 67,  category: "circulation",                                                                image: "/images/products/rp-choleduz.jpg" },
  { slug: "rp-restorlyf",      name: "RP Restorlyf",      tagline: "Cellular Restoration",         description: "Cellular restoration and anti-aging support.",    price: 27500, comparePrice: 32000, inventory: 45,  category: "energy",        featured: true,                    badge: "Premium",    image: "/images/products/rp-restorlyf.jpg" },
  { slug: "rp-burn-slim",      name: "RP Burn Slim",      tagline: "Healthy Weight Management",    description: "Natural metabolism support.",                     price: 18000, inventory: 102, category: "energy",                          bestSeller: true,                     image: "/images/products/rp-burn-slim.jpg" },
  { slug: "rp-kiddie-247",     name: "RP Kiddie 24/7",    tagline: "Children's Daily Wellness",    description: "Gentle daily nutrition for kids.",                price: 13500, inventory: 156, category: "family",                                                                     image: "/images/products/rp-kiddie-247.jpg" },
  { slug: "nc-tooth-paste",    name: "NC Tooth Paste",    tagline: "Natural Whitening Care",       description: "Fluoride-free natural whitening toothpaste.",     price: 6500,  inventory: 230, category: "family",                                                                     image: "/images/products/nc-tooth-paste.jpg" },
  { slug: "ener-chi-diffuser", name: "Ener-Chi Diffuser", tagline: "Aromatherapy Wellness",        description: "Premium ultrasonic essential oil diffuser.",      price: 32000, inventory: 38,  category: "wellness-tech", featured: true,                    badge: "New",        image: "/images/products/ener-chi-diffuser.jpg" },
  { slug: "vida-maxx",         name: "Vida Maxx",         tagline: "Maximum Life Energy",          description: "Powerful adaptogenic blend for sustained energy.", price: 24500, inventory: 71,  category: "energy",                          bestSeller: true,                     image: "/images/products/vida-maxx.jpg" },
  { slug: "ener-chi-bracelet", name: "Ener-Chi Bracelet", tagline: "Wearable Wellness",            description: "Magnetic therapy bracelet for circulation.",      price: 15500, inventory: 95,  category: "wellness-tech",                                                              image: "/images/products/ener-chi-bracelet.jpg" },
  { slug: "ultra-h2",          name: "Ultra H2",          tagline: "Hydrogen-Rich Water Bottle",   description: "Molecular hydrogen water generator bottle.",      price: 45000, comparePrice: 55000, inventory: 22,  category: "wellness-tech", featured: true,                    badge: "Premium",    image: "/images/products/ultra-h2.jpg" },
];

const PICKUP_STATIONS = [
  { code: "PKS001", name: "Diamond Body — Lekki HQ",       address: "12 Admiralty Way, Lekki Phase 1", city: "Lekki",         state: "Lagos", phone: "+234 800 1000 001", hours: "Mon–Sat, 9am–6pm" },
  { code: "PKS002", name: "Diamond Body — Ikeja",          address: "9 Allen Avenue, Ikeja",           city: "Ikeja",         state: "Lagos", phone: "+234 800 1000 002", hours: "Mon–Sat, 9am–6pm" },
  { code: "PKS003", name: "Diamond Body — Abuja Central",  address: "Plot 5, Wuse II",                 city: "Abuja",         state: "FCT",   phone: "+234 800 1000 003", hours: "Mon–Sat, 9am–6pm" },
  { code: "PKS004", name: "Diamond Body — Port Harcourt",  address: "22 Aba Road",                     city: "Port Harcourt", state: "Rivers", phone: "+234 800 1000 004", hours: "Mon–Sat, 9am–6pm" },
  { code: "PKS005", name: "Diamond Body — Ibadan",         address: "10 Bodija Street",                city: "Ibadan",        state: "Oyo",   phone: "+234 800 1000 005", hours: "Mon–Sat, 9am–6pm" },
];

// ---------- Runner ----------

async function upsertUser({ email, fullName, phone, role, password }) {
  const passwordHash = await hash(password);
  return prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { fullName, phone: phone || null, role, status: "ACTIVE", emailVerified: true, passwordHash },
    create: {
      email: email.toLowerCase(),
      passwordHash, fullName, phone: phone || null,
      role, status: "ACTIVE", emailVerified: true,
    },
  });
}

async function main() {
  console.log("Seeding Diamond Body database...");

  // Super Admin
  const superAdmin = await upsertUser({
    email: env.SUPER_ADMIN_EMAIL,
    fullName: env.SUPER_ADMIN_NAME,
    role: "SUPER_ADMIN",
    password: env.SUPER_ADMIN_PASSWORD,
  });
  console.log(`  ✓ Super Admin: ${superAdmin.email}`);

  // Admin
  const admin = await upsertUser({
    email: env.ADMIN_EMAIL,
    fullName: env.ADMIN_NAME,
    role: "ADMIN",
    password: env.ADMIN_PASSWORD,
  });
  console.log(`  ✓ Admin:       ${admin.email}`);

  // Nations + Leaders
  for (const n of NATIONS) {
    const leader = await upsertUser({
      email: n.leaderEmail,
      fullName: n.leaderName,
      role: "NATION_LEADER",
      password: env.NATION_LEADER_PASSWORD,
    });
    await prisma.nation.upsert({
      where: { code: n.code },
      update: { slug: n.slug, name: n.name, status: "ACTIVE", leaderId: leader.id },
      create: { code: n.code, slug: n.slug, name: n.name, status: "ACTIVE", leaderId: leader.id },
    });
    console.log(`  ✓ Nation: ${n.name} — ${n.leaderName}`);
  }

  // Categories
  const catMap = new Map();
  for (const c of CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon },
      create: c,
    });
    catMap.set(c.slug, cat.id);
  }
  console.log(`  ✓ Categories: ${CATEGORIES.length}`);

  // Products
  for (const p of PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name, tagline: p.tagline || null, description: p.description,
        price: p.price, comparePrice: p.comparePrice ?? null,
        inventory: p.inventory, image: p.image, gallery: p.gallery || [p.image],
        featured: !!p.featured, bestSeller: !!p.bestSeller, badge: p.badge || null,
        categoryId: catMap.get(p.category) || null,
        benefits: p.benefits || [], ingredients: p.ingredients || [],
        isActive: true,
      },
      create: {
        slug: p.slug, name: p.name, tagline: p.tagline || null, description: p.description,
        benefits: p.benefits || [], ingredients: p.ingredients || [],
        price: p.price, comparePrice: p.comparePrice ?? null,
        inventory: p.inventory, image: p.image, gallery: p.gallery || [p.image],
        featured: !!p.featured, bestSeller: !!p.bestSeller, badge: p.badge || null,
        categoryId: catMap.get(p.category) || null,
        isActive: true,
      },
    });
  }
  console.log(`  ✓ Products:   ${PRODUCTS.length}`);

  // Pickup Stations
  for (const s of PICKUP_STATIONS) {
    await prisma.pickupStation.upsert({
      where: { code: s.code },
      update: { name: s.name, address: s.address, city: s.city, state: s.state, phone: s.phone, hours: s.hours, status: "ACTIVE" },
      create: { ...s, status: "ACTIVE" },
    });
  }
  console.log(`  ✓ Pickup Stations: ${PICKUP_STATIONS.length}`);

  console.log("\n✅ Seed complete.");
  console.log("\n--- Login credentials ---");
  console.log(`Super Admin: ${env.SUPER_ADMIN_EMAIL} / ${env.SUPER_ADMIN_PASSWORD}`);
  console.log(`Admin:       ${env.ADMIN_EMAIL} / ${env.ADMIN_PASSWORD}`);
  console.log(`Leaders:     any nation email (e.g. tunde@diamondbody.com) / ${env.NATION_LEADER_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
