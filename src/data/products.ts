export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  benefits: string[];
  ingredients: string[];
  price: number;
  comparePrice?: number;
  category: string;
  inventory: number;
  rating: number;
  reviewsCount: number;
  bestSeller?: boolean;
  featured?: boolean;
  image: string;
  gallery: string[];
  badge?: string;
};

export type Review = {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
};

// Premium product imagery generated via stable gradient placeholders
const img = (label: string, c1: string, c2: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stop-color='${c1}'/>
          <stop offset='1' stop-color='${c2}'/>
        </linearGradient>
        <radialGradient id='r' cx='50%' cy='40%' r='60%'>
          <stop offset='0' stop-color='rgba(255,255,255,0.35)'/>
          <stop offset='1' stop-color='rgba(255,255,255,0)'/>
        </radialGradient>
      </defs>
      <rect width='600' height='600' fill='url(#g)'/>
      <rect width='600' height='600' fill='url(#r)'/>
      <g transform='translate(300,290)'>
        <rect x='-95' y='-150' width='190' height='300' rx='18' fill='rgba(255,255,255,0.96)' stroke='rgba(0,0,0,0.06)'/>
        <rect x='-95' y='-150' width='190' height='70' rx='18' fill='${c1}'/>
        <text x='0' y='-105' text-anchor='middle' fill='white' font-family='Inter,sans-serif' font-weight='700' font-size='22'>DIAMOND</text>
        <text x='0' y='-85' text-anchor='middle' fill='white' font-family='Inter,sans-serif' font-weight='400' font-size='12' opacity='0.85'>BODY</text>
        <text x='0' y='10' text-anchor='middle' fill='${c1}' font-family='Playfair Display,serif' font-weight='700' font-size='24'>${label}</text>
        <text x='0' y='40' text-anchor='middle' fill='#444' font-family='Inter,sans-serif' font-size='10' letter-spacing='2'>WELLNESS</text>
        <circle cx='0' cy='90' r='22' fill='none' stroke='${c1}' stroke-width='2'/>
        <path d='M-10,85 L0,95 L10,85' stroke='${c1}' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/>
      </g>
    </svg>`
  )}`;

export const CATEGORIES = [
  { id: "detox", name: "Detox & Cleanse", icon: "🌿" },
  { id: "digestion", name: "Digestion", icon: "🍃" },
  { id: "energy", name: "Energy & Vitality", icon: "⚡" },
  { id: "coffee", name: "Coffee & Wellness", icon: "☕", },
  { id: "circulation", name: "Circulation", icon: "❤️" },
  { id: "immune", name: "Immune Support", icon: "🛡️" },
  { id: "family", name: "Family Wellness", icon: "👨‍👩‍👧" },
  { id: "wellness-tech", name: "Wellness Tech", icon: "💎" },
];

export const PRODUCTS: Product[] = [
  {
  id: "liven-latte",
  slug: "liven-latte",
  name: "Liven Latte",
  image: "/images/liven-latte.jpeg",
  gallery: ["/images/liven-latte.jpeg"],
  tagline: "Creamy Premium Latte",
  description:
    "Livén Latte combines premium Arabica coffee with a smooth, creamy milk blend to create a rich café-style latte. It offers a balanced taste and long-lasting energy while maintaining the alkaline coffee formulation.",
  benefits: [
    "Smooth and creamy latte flavor",
    "Provides sustained energy",
    "Made with premium Arabica coffee",
    "Rich in antioxidants",
    "Ideal for everyday enjoyment"
  ],
  ingredients: [
    "Premium Arabica Coffee",
    "Milk Powder",
    "Alkaline Minerals",
    "Natural Flavor"
  ],
  price: 21500,
  comparePrice: 25500,
  category: "coffee",
  inventory: 85,
  rating: 4.9,
  reviewsCount: 82,
  featured: true,
  bestSeller: true,
  badge: "Popular",
},
{
  id: "liven-sugar-free",
  slug: "liven-sugar-free",
  name: "Livén Sugar-Free Original",
  image: "/images/liven-sugar-free.jpeg",
  gallery: ["/images/liven-sugar-free.jpeg"],
  tagline: "Sugar-Free Alkaline Coffee",
  description:
    "Livén Sugar-Free Original is specially formulated for people who prefer coffee without added sugar. It delivers the rich taste of premium Arabica coffee while supporting a balanced lifestyle with its alkaline formulation.",
  benefits: [
    "No added sugar",
    "Suitable for low-sugar lifestyles",
    "Provides natural energy and focus",
    "Rich in antioxidants",
    "Smooth, full-bodied coffee flavor"
  ],
  ingredients: [
    "Premium Arabica Coffee",
    "Alkaline Minerals",
    "Natural Sweetener",
    "Natural Coffee Extract"
  ],
  price: 21500,
  comparePrice: 25500,
  category: "coffee",
  inventory: 95,
  rating: 5.0,
  reviewsCount: 104,
  featured: true,
  bestSeller: true,
  badge: "Healthy Choice"
},
 {
  id: "liven-original",
  slug: "liven-original",
  name: "Livén Original",
  image: "/images/liven-original.jpeg",
  gallery: ["/images/liven-original.jpeg"],
  tagline: "Classic Alkaline Coffee",
  description:
    "Livén Original is a premium alkaline coffee made from carefully selected Arabica coffee beans. It delivers a smooth, rich coffee taste while helping maintain the body's alkaline balance. It is formulated for those who enjoy traditional coffee with added wellness benefits.",
  benefits: [
    "Rich and smooth coffee flavor",
    "Helps support a balanced alkaline lifestyle",
    "Provides natural energy and alertness",
    "Contains antioxidants from premium coffee beans",
    "Suitable for daily coffee lovers"
  ],
  ingredients: [
    "Premium Arabica Coffee",
    "Alkaline Minerals",
    "Natural Coffee Extract"
  ],
  price: 21500,
  comparePrice: 25500,
  category: "coffee",
  inventory: 100,
  rating: 4.8,
  reviewsCount: 96,
  featured: true,
  bestSeller: true,
  badge: "Best Seller"
},
{
  id: "liven-cappuccino",
  slug: "liven-cappuccino",
  name: "Livén Cappuccino",
  image: "/images/liven-cappuccino.jpeg",
  gallery: ["/images/liven-cappuccino.jpeg"],
  tagline: "Rich & Creamy Cappuccino",
  description:
    "Livén Cappuccino blends premium Arabica coffee with a creamy cappuccino mix, delivering a rich aroma and velvety texture. It offers a satisfying coffee experience while supporting a balanced alkaline lifestyle.",
  benefits: [
    "Rich cappuccino taste with creamy texture",
    "Provides a refreshing energy boost",
    "Contains antioxidants",
    "Supports an active lifestyle",
    "Perfect for coffee enthusiasts"
  ],
  ingredients: [
    "Premium Arabica Coffee",
    "Milk Powder",
    "Alkaline Minerals",
    "Natural Cappuccino Flavor"
  ],
  price: 21500,
  comparePrice: 25500,
  category: "coffee",
  inventory: 90,
  rating: 4.9,
  reviewsCount: 88,
  featured: true,
  bestSeller: true,
  badge: "Top Rated"
},
  {
    id: "p-enerchidiffuser",
    slug: "ener-chi-diffuser",
    name: "Ener-Chi Diffuser",
    image: "/images/ener-chi-diffuser.jpg",
    gallery: ["/images/ener-chi-diffuser.jpg"],
    tagline: "EMR Protection",
    description:
      "Ener-Chi Diffuser helps reduce EMR exposure effects from phones and gadgets. It provides EMR protection support and promotes everyday environmental wellness.",
    benefits: ["Promotes relaxation", "Improves air quality", "Reduces EMR exposure", "EMR protection support"],
    ingredients: ["BPA-free reservoir", "Ultrasonic atomizer", "Scalar energy", "Tourmaline"],
    price: 16200,
    category: "wellness-tech",
    inventory: 38,
    rating: 4.9,
    reviewsCount: 89,
    featured: true,
    badge: "New",
  },
  {
    id: "p-rpc247",
    slug: "rp-c247",
    name: "RP C247",
    image: "/images/rp-c247.jpg",
    gallery: ["/images/rp-c247.jpg", "/images/products/rp-c247-alt.jpg"],
    tagline: "24/7 Internal Cleanse",
    description:
      "A premium daily detoxifier with an essential nutrient blend. It gently flushes toxins, balance pH, and supports complete daily nutrition for whole body wellness.",
    benefits: [
      "Supports daily detoxification",
      "Promotes regular, healthy digestion",
      "Reduces bloating and discomfort",
      "Helps restore gut balance",
      "Boosts nutrient absorption",
    ],
    ingredients: ["Quercetin", "Selenium", "18 Amino Acids", "Vitamin C", "Ginger Root", "B-Complex"],
    price: 18750,
    comparePrice: 22000,
    category: "detox",
    inventory: 124,
    rating: 4.8,
    reviewsCount: 20,
    bestSeller: true,
    featured: true,
    badge: "Best Seller",
  },
  {
    id: "p-rpcomplete",
    slug: "rp-complete",
    name: "RP Complete",
    image: "/images/rp-complete.jpeg",
    gallery: ["/images/rp-complete.jpeg"],
    tagline: "Complete Daily Wellness",
    description:
      "RP Complete is a complete food supplement designed for general wellness. Specially formulated to support nutritional needs for pregnant and breastfeeding women.",
    benefits: [
      "General wellness",
      "Complete daily nutrition",
      "Best for pregnant and breastfeeding women",
      "Promotes healthy skin and hair",
    ],
    ingredients: ["22 Vitamins & minerals", "Antioxidants", "Amino Acids", "Herbal Blends"],
    price: 17700,
    comparePrice: 21400,
    category: "energy",
    inventory: 88,
    rating: 4.9,
    reviewsCount: 90,
    featured: true,
    bestSeller: true,
    badge: "Top Rated",
  },
  {
    id: "p-rpcholeduz",
    slug: "rp-choleduz",
    name: "RP Choleduz",
    image: "/images/rp-choledux.jpeg",
    gallery: ["/images/rp-choledux.jpeg"],
    tagline: "Daily Eyes Nourishment",
    description:
      "RP Choleduz is an omega-3 supplement that provides daily nourishment for your eyes. It supports healthy vision, protects against blue light damage, and delivers nutritional support for the eyes.",
    benefits: ["Supports healthy vision", "Daily eye nourishment", "Nutritional support for the eyes", "Eye wellness support"],
    ingredients: ["Omega-3 DHA", "Lutein", "Zeaxanthin", "Vitamin E"],
    price: 18900,
    category: "circulation",
    inventory: 67,
    rating: 4.7,
    reviewsCount: 189,
  },
  {
    id: "p-rprestorlyf",
    slug: "rp-restorlyf",
    name: "RP Restorlyf",
    image: "/images/rp-restorlyf.jpeg",
    gallery: ["/images/rp-restorlyf.jpeg"],
    tagline: "Healthy Aging Formula",
    description:
      "RP Restorlyf is an advanced anti-aging formula designed to support youthful vitality. It promotes healthy aging at the cellular level while providing beauty and wellness support from within.",
    benefits: ["Beauty and wellness support", "Anti-aging support", "Improves stamina", "Reduces oxidative stress"],
    ingredients: ["Resveratrol", "Green Tea Extract", "Siberian Ginseng", "Polyphenols"],
    price: 23100,
    comparePrice: 28100,
    category: "energy",
    inventory: 45,
    rating: 4.9,
    reviewsCount: 12,
    featured: true,
    badge: "Premium",
  },
  {
    id: "p-rpburnslim",
    slug: "rp-burn-slim",
    name: "RP Burn Slim",
    image: "/images/rp-burn-slim.jpeg",
    gallery: ["/images/rp-burn-slim.jpeg"],
    tagline: "Weight Loss Support",
    description:
      "RP Burn Slim is a weight management supplement designed to help reduce belly fat naturally. It boosts metabolism and supports healthy weight loss goals.",
    benefits: ["Weight loss", "Belly fat reduction", "Metabolism boost", "Sustained energy"],
    ingredients: ["Green Tea Extract", "Garcinia Cambogia", "L-Carnitine", "CLA", "Chromium"],
    price: 17700,
    category: "energy",
    inventory: 102,
    rating: 4.6,
    reviewsCount: 198,
    bestSeller: true,
  },
  {
    id: "p-rpkiddie",
    slug: "rp-kiddie-247",
    name: "RP Kiddie 24/7",
    image: "/images/rp-kiddie.jpeg",
    gallery: ["/images/rp-kiddie.jpeg"],
    tagline: "Children Multivitamins with DHA",
    description:
      "RP Kiddie 24/7 is a complete kids multivitamin with DHA for growing children. It supports memory restoration, brain development, and overall growth.",
    benefits: ["Supports healthy growth", "Boosts immunity for kids", "Improves focus and learning", "Kids multivitamins with DHA"],
    ingredients: ["Children's Multivitamin", "DHA", "Calcium", "12 Vitamins", "6 Minerals", "Chlorella Growth Factor"],
    price: 15900,
    category: "family",
    inventory: 156,
    rating: 4.8,
    reviewsCount: 274,
  },
  {
    id: "p-enerchibracelet",
    slug: "ener-chi-bracelet",
    name: "Ener-Chi Bracelet",  
    image: "/images/ener-chi bracelet.jpeg",
    gallery: ["/images/ener-chi bracelet.jpeg"],
    tagline: "Wearable Wellness",
    description:
      "Magnetic therapy bracelet designed to support circulation, balance and energy flow throughout the day.",
    benefits: [
      "Supports circulation",
      "Promotes energy balance",
      "Stylish and durable",
      "Hypoallergenic materials",
    ],
    ingredients: ["Surgical-grade stainless steel", "Neodymium magnets", "Germanium beads"],
    price: 635100,
    category: "wellness-tech",
    inventory: 95,
    rating: 4.6,
    reviewsCount: 144,
    featured: false,
    badge: "New",
  },
  {
    id: "p-ultrah2",
    slug: "ultra-h2",
    name: "Ultra H2",
    image: "/images/ultra-h2.jpeg",
    gallery: ["/images/ultra-h2.jpeg"],
    tagline: "Hydrogen-Rich Water Bottle",
    description:
      "Cutting-edge hydrogen water generator bottle that infuses your water with molecular hydrogen for antioxidant-rich hydration.",
    benefits: [
      "Powerful antioxidant water",
      "Improves hydration",
      "Reduces inflammation",
      "Supports cellular health",
    ],
    ingredients: ["SPE/PEM technology", "Borosilicate glass", "Food-grade titanium plates"],
    price: 1551900,
    comparePrice: 1751900,
    category: "wellness-tech",
    inventory: 22,
    rating: 4.9,
    reviewsCount: 67,
    featured: true,
    badge: "Premium",
  },
  {
    id: "p-nctoothpaste",
    slug: "nc-tooth-paste",
    name: "NC Tooth Paste",
    image: "/images/nc-tooth-paste.jpg",
    gallery: ["/images/nc-tooth-paste.jpg"],
    tagline: "Fresh Breath Daily",
    description:
      "NC Tooth Paste is a herbal toothpaste formulated to correct bleeding gums and maintain oral health. It freshens breath instantly while helping heal gum issues naturally.",
    benefits: ["Corrects gum issues", "Strengthens enamel", "Freshens breath", "Fights plaque buildup"],
    ingredients: ["Calcium Carbonate", "Xylitol", "Aloe Vera", "Peppermint Oil", "Tea Tree Oil"],
    price: 10800,
    category: "family",
    inventory: 230,
    rating: 4.7,
    reviewsCount: 167,
  },
  {
    id: "p-vidamaxx",
    slug: "vida-maxx", 
    name: "Vida Maxx",
    image: "/images/vida-maxx.jpg",
    gallery: ["/images/vida-maxx.jpg"],
    tagline: "Heart Health Formula",  
    description: 
      "Vida Maxx is a premium heart health supplement that maintains cardiovascular wellness. It regulates blood flow and improves vascular functions for optimal heart performance.",
    benefits: ["Maintains heart health", "Regulates blood flow", "Improves vascular functions", "Supports adrenal health"],
    ingredients: ["Resveratrol", "Grape Seed Extract", "CoQ10", "Lycopene", "B-Vitamins"],
    price: 58000,
    category: "circulation",
    inventory: 71,
    rating: 4.8,
    reviewsCount: 23,
    bestSeller: true, 
  },
  {
    id: "p-mychoco",
    slug: "mychoco",
    name: "MyChoco",
    image: "/images/mychocco.jpeg",
    gallery: ["/images/mychocco.jpeg"],
    tagline: "Alkaline Chocolate Drink",
    description: "MyChoco Alkaline Chocolate Drink is a nutrient-dense beverage. Its core ingredients feature a premium cocoa blend, milk, sugar, and DHA powder for brain development. It is also fortified with a Complete Phyto-Energizer, a proprietary blend of over 130 nutrients including vitamins, fruits, vegetables, and enzymes.",
    benefits: ["Supports brain development", "Nutrient-dense beverage fortified with over 130 nutrients", "Provides essential vitamins, fruits, vegetables, and enzymes"],
    ingredients: ["Premium Cocoa Blend", "Milk", "Sugar", "1/3 of Complete Phyto-Energizer", "DHA Powder"],
    price: 22000,
    category: "energy",
    inventory: 50,
    rating: 4.9,
    reviewsCount: 12,
    bestSeller: false,
  },       
  {
  id: "p-rpcareleaf",
  slug: "rp-careleaf",
  name: "RP Careleaf",
  image: "/images/rp-careleaf.jpg",
  gallery: ["/images/rp-careleaf.jpg"],
  tagline: "Herbal Pain Relief Patch",
  description:
    "RP Careleaf is a premium herbal patch designed to provide fast, natural relief from body aches and pains. It uses advanced nano-technology to deliver herbal ingredients directly through the skin for targeted comfort.",
  benefits: [
    "Provides fast pain relief",
    "Targets muscle and joint discomfort",
    "Supports circulation and healing",
    "Natural herbal ingredients",
    "Convenient and easy to use",
  ],
  ingredients: [
    "Menthol",
    "Camphor",
    "Capsicum Extract",
    "Nano-Diamond Technology",
    "Herbal Oils"
  ],
  price: 18600,
  comparePrice: 20600,
  category: "wellness-tech",
  inventory: 120,
  rating: 4.7,
  reviewsCount: 85,
  bestSeller: true,
  badge: "Pain Relief",
},
];

    
export const REVIEWS: Review[] = [
  {
    id: "r1",
    productId: "p-rpc247",
    author: "Amara O.",
    rating: 5,
    title: "Changed my mornings",
    body: "I feel lighter, less bloated, and my digestion has never been better. Three weeks in and I'm a believer.",
    date: "2026-01-12",
    verified: true,
  },
  {
    id: "r2",
    productId: "p-rpc247",
    author: "Tunde A.",
    rating: 5,
    title: "Real results",
    body: "Clean ingredients, no jittery feeling. Just a smooth daily cleanse. Highly recommend.",
    date: "2026-01-04",
    verified: true,
  },
  {
    id: "r3",
    productId: "p-rpcomplete",
    author: "Ngozi I.",
    rating: 5,
    title: "Energy all day",
    body: "I no longer have that 3pm crash. RP Complete is now part of my morning ritual.",
    date: "2026-02-02",
    verified: true,
  },
  {
    id: "r4",
    productId: "p-vidamaxx",
    author: "Kemi B.",
    rating: 5,
    title: "Adaptogens that work",
    body: "Calm, focused energy. Perfect for my busy schedule and workouts.",
    date: "2026-01-22",
    verified: true,
  },
  {
    id: "r5",
    productId: "p-ultrah2",
    author: "David M.",
    rating: 5,
    title: "Premium quality",
    body: "Beautiful bottle and the water tastes incredibly smooth. Worth every naira.",
    date: "2026-02-10",
    verified: true,
  },
];

export const TESTIMONIALS = [
  {
    id: "t1",
    name: "Chioma E.",
    role: "Verified Customer",
    location: "Lagos",
    text: "Diamond Body transformed my wellness journey. I have more energy, clearer skin and better digestion. The products genuinely deliver on their promise.",
    rating: 5,
  },
  {
    id: "t2",
    name: "Dr. Adeola K.",
    role: "Nutritionist",
    location: "Abuja",
    text: "I recommend Diamond Body to my clients. Clean formulations backed by science exactly what the wellness industry needs.",
    rating: 5,
  },
  {
    id: "t3",
    name: "Emeka U.",
    role: "Fitness Coach",
    location: "Port Harcourt",
    text: "Vida Maxx and RP Complete are part of my daily stack. The quality is consistent and the results speak for themselves.",
    rating: 5,
  },
  {
    id: "t4",
    name: "Funmi A.",
    role: "Verified Customer",
    location: "Ibadan",
    text: "My entire family uses Diamond Body now, even my kids love the Kiddie 24/7. Real wellness for real families.",
    rating: 5,
  },
];

export const FAQS = [
  {
    q: "Are Diamond Body products safe and natural?",
    a: "Yes. Every product is formulated with clean, science backed ingredients, manufactured in certified facilities and tested for purity and potency.",
  },
  {
    q: "How long until I see results?",
    a: "Most customers report noticeable improvements in energy and digestion within 7–14 days of consistent use. Long-term wellness benefits build over 60–90 days.",
  },
  {
    q: "Do you ship nationwide?",
    a: "Yes. We deliver to all 36 states in Nigeria. Lagos and Abuja typically receive orders within 1–2 business days. Other locations within 3–5 business days.",
  },
];

export const BLOG_POSTS = [
  {
    id: "b1",
    slug: "why-internal-wellness-matters",
    title: "Why Internal Wellness Matters More Than You Think",
    excerpt: "True health starts within. Discover why caring for your internal organs is the foundation of every wellness journey.",
    author: "Dr. Michael O.",
    date: "2026-02-14",
    readTime: "6 min",
    category: "Wellness",
  },
  {
    id: "b2",
    slug: "the-science-of-daily-detox",
    title: "The Science of Daily Detox: Myths vs Reality",
    excerpt: "Detox is more than a trend. Learn how your body naturally cleanses itself and what really helps.",
    author: "Wellness Team",
    date: "2026-02-08",
    readTime: "8 min",
    category: "Detox",
  },
  {
    id: "b3",
    slug: "energy-without-the-crash",
    title: "Energy Without The Crash: Natural Vitality That Lasts",
    excerpt: "Stop relying on caffeine. Discover adaptogens and how they fuel sustained energy all day long.",
    author: "Coach Emeka U.",
    date: "2026-01-30",
    readTime: "5 min",
    category: "Energy", 
  },
  {
    id: "b4",
    slug: "family-wellness-rituals",
    title: "Building Family Wellness Rituals That Stick",  
    excerpt: "From kids to grandparents, simple daily habits that bring lifelong health to the whole family.",
    author: "Funmi A.", 
    date: "2026-01-22", 
    readTime: "7 min", 
    category: "Family",   
  },
];

export const BANK_DETAILS = {
  bankName: "Zenith Bank",
  accountName: "Sell Masters Limited",
  accountNumber: "1311356402",
  reference: "Use your Order ID as payment reference",
};
