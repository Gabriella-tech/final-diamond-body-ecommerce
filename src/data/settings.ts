// ============================================================================
// Diamond Body — Business Settings
// Single source of truth for contact info, social links, and bank details.
// These are fetched from the backend at runtime; the values below are fallbacks.
// ============================================================================

export const BUSINESS = {
  phone: "+234 702 500 8596",
  phoneRaw: "2347025008596",        // WhatsApp format (no + or spaces)
  email: "thediamondbodynigeria@gmail.com",
  mailto: "mailto:thediamondbodynigeria@gmail.com",
  address: "Lagos, Nigeria",
  hours: "Mon–Sat, 9am–6pm",
  name: "Diamond Body",
  tagline: "When your inside is a diamond, everything else shines.",
};

export const SOCIAL = {
  facebook: "#",
  instagram: "#",
  tiktok: "#",
  x: "#",
  linkedin: "#",
  youtube: "#",
};

export const BANK = {
  bankName: "Zenith Bank",
  accountName: "Sell Masters Limited",
  accountNumber: "1311356402",
  reference: "Use your Order ID as payment reference",
};

// Delivery fee config (editable by admin)
export const DELIVERY = {
  homeDeliveryFee: 5000,
  pickupStationFee: 0,
};
