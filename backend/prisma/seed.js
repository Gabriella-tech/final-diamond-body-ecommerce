"use strict";

// ============================================================================
// DIAMOND BODY — DATABASE SEED
// Populates: 1 Super Admin, 1 Admin, 8 Nations + 8 Leaders, 7 Categories,
// 16 Products, 5 Pickup Stations. Idempotent (safe to run multiple times).
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
  { slug: "coffee",        name: "Coffee & Wellness", icon: "☕" },
  { slug: "circulation",   name: "Circulation",       icon: "❤️" },
  { slug: "immune",        name: "Immune Support",    icon: "🛡️" },
  { slug: "family",        name: "Family Wellness",   icon: "👨‍👩‍👧" },
  { slug: "wellness-tech", name: "Wellness Tech",     icon: "💎" },
];

const PRODUCTS = [
  // Liven Products
  { slug: "liven-latte",       name: "Liven Latte",       tagline: "Creamy Premium Latte",        description: "Livén Latte combines premium Arabica coffee with a smooth, creamy milk blend to create a rich café-style latte.", price: 21500, comparePrice: 25500, inventory: 85, category: "coffee",        featured: true,  bestSeller: true,  badge: "Popular",    image: "/images/liven-latte.jpeg" },
  { slug: "liven-sugar-free",  name: "Livén Sugar-Free Original", tagline: "Sugar-Free Alkaline Coffee",  description: "Livén Sugar-Free Original is specially formulated for people who prefer coffee without added sugar.", price: 21500, comparePrice: 25500, inventory: 95, category: "coffee",        featured: true,  bestSeller: true,  badge: "Healthy Choice", image: "/images/liven-sugar-free.jpeg" },
  { slug: "liven-original",    name: "Livén Original",    tagline: "Classic Alkaline Coffee",     description: "Livén Original is a premium alkaline coffee made from carefully selected Arabica coffee beans.", price: 21500, comparePrice: 25500, inventory: 100, category: "coffee",        featured: true,  bestSeller: true,  badge: "Best Seller",  image: "/images/liven-original.jpeg" },
  { slug: "liven-cappuccino",  name: "Livén Cappuccino",  tagline: "Rich & Creamy Cappuccino",    description: "Livén Cappuccino blends premium Arabica coffee with a creamy cappuccino mix, delivering a rich aroma and velvety texture.", price: 21500, comparePrice: 25500, inventory: 90, category: "coffee",        featured: true,  bestSeller: true,  badge: "Top Rated",    image: "/images/liven-cappuccino.jpeg" },
  // RP Products
  { slug: "rp-c247",           name: "RP C247",           tagline: "24/7 Internal Cleanse",        description: "Premium daily detoxifier for gut health.",       price: 18750, comparePrice: 22000, inventory: 124, category: "detox",         featured: true,  bestSeller: true,  badge: "Best Seller", image: "/images/rp-c247.jpg" },
  { slug: "rp-complete",       name: "RP Complete",       tagline: "Complete Daily Wellness",      description: "All-in-one multivitamin complex.",                price: 17700, comparePrice: 21400, inventory: 88,  category: "energy",        featured: true,  bestSeller: true,  badge: "Top Rated",   image: "/images/rp-complete.jpeg" },
  { slug: "rp-choleduz",       name: "RP Choleduz",       tagline: "Daily Eyes Nourishment",       description: "Supports cardiovascular wellness.",               price: 18900, inventory: 67,  category: "circulation",                                                                image: "/images/rp-choledux.jpeg" },
  { slug: "rp-restorlyf",      name: "RP Restorlyf",      tagline: "Healthy Aging Formula",        description: "Cellular restoration and anti-aging support.",    price: 23100, comparePrice: 28100, inventory: 45,  category: "energy",        featured: true,                    badge: "Premium",    image: "/images/rp-restorlyf.jpeg" },
  { slug: "rp-burn-slim",      name: "RP Burn Slim",      tagline: "Weight Loss Support",          description: "Natural metabolism support.",                     price: 17700, inventory: 102, category: "energy",                          bestSeller: true,                     image: "/images/rp-burn-slim.jpeg" },
  { slug: "rp-kiddie-247",     name: "RP Kiddie 24/7",    tagline: "Children Multivitamins with DHA", description: "Gentle daily nutrition for kids.",                price: 15900, inventory: 156, category: "family",                                                                     image: "/images/rp-kiddie-247.jpeg" },
  { slug: "rp-careleaf",       name: "RP Careleaf",       tagline: "Herbal Pain Relief Patch",     description: "Provides fast, natural relief from body aches and pains.", price: 18600, comparePrice: 20600, inventory: 120, category: "wellness-tech", bestSeller: true,  badge: "Pain Relief", image: "/images/rp-careleaf.jpg" },
  // Other Products
  { slug: "nc-tooth-paste",    name: "NC Tooth Paste",    tagline: "Fresh Breath Daily",           description: "Fluoride-free natural whitening toothpaste.",     price: 10800, inventory: 230, category: "family",                                                                     image: "/images/nc-tooth-paste.jpg" },
  { slug: "ener-chi-diffuser", name: "Ener-Chi Diffuser", tagline: "EMR Protection",               description: "Premium ultrasonic essential oil diffuser.",      price: 16200, inventory: 38,  category: "wellness-tech", featured: true,                    badge: "New",        image: "/images/ener-chi-diffuser.jpg" },
  { slug: "vida-maxx",         name: "Vida Maxx",         tagline: "Heart Health Formula",         description: "Maintains cardiovascular wellness.",              price: 58000, inventory: 71,  category: "circulation",                          bestSeller: true,                     image: "/images/vida-maxx.jpg" },
  { slug: "ener-chi-bracelet", name: "Ener-Chi Bracelet", tagline: "Wearable Wellness",            description: "Magnetic therapy bracelet for circulation.",      price: 635100, inventory: 95,  category: "wellness-tech",                                                              image: "/images/ener-chi bracelet.jpeg" },
  { slug: "ultra-h2",          name: "Ultra H2",          tagline: "Hydrogen-Rich Water Bottle",   description: "Molecular hydrogen water generator bottle.",      price: 1551900, comparePrice: 1751900, inventory: 22,  category: "wellness-tech", featured: true,                    badge: "Premium",    image: "/images/ultra-h2.jpeg" },
  { slug: "mychoco",           name: "MyChoco",           tagline: "Alkaline Chocolate Drink",     description: "MyChoco Alkaline Chocolate Drink is a nutrient-dense beverage.", price: 22000, inventory: 50, category: "energy",                                                                     image: "/images/mychocco.jpeg" },
];

const PICKUP_STATIONS = [
  { code: "PKS001", name: "Diamond Body — Lagos",       address: "Braisas Mall, off Adiralty Way  Lekki Phase 1",                city: "Lekki",            state: "Lagos", phone: "+234 702 500 8596", hours: "Mon–Sat, 9am–6pm" },
  { code: "PKS003", name: "Diamond Body — Abuja",       address: "No 306b Bahamas Plaza, 1080 Joseph Gwomwalk Street",           city: "Abuja",            state: "FCT",   phone: "+234 702 500 8596", hours: "Mon–Sat, 9am–6pm" },
  { code: "PKS002", name: "Diamond Body — Abuja Central",  address: "Plot 5, Wuse II",                                           city: "Abuja",            state: "FCT",   phone: "+234 800 1000 003", hours: "Mon–Sat, 9am–6pm" },
  { code: "PKS004", name: "Diamond Body — Port Harcourt",  address: "22 Aba Road",                                               city: "Port Harcourt",    state: "Rivers",phone: "+234 800 1000 004", hours: "Mon–Sat, 9am–6pm" },
  { code: "PKS005", name: "Diamond Body — Ibadan",         address: "10 Bodija Street",                                          city: "Ibadan",           state: "Oyo",   phone: "+234 800 1000 005", hours: "Mon–Sat, 9am–6pm" },
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