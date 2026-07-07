// ============================================================================
// THE 8 DIAMOND BODY NATIONS
// Customers enter through one of these /nation URLs. The selected Nation is
// stored automatically in the background — the customer never picks it.
// ============================================================================

export type NationStatus = "active" | "disabled";

export type Nation = {
  id: string;                  // e.g. NTN001
  slug: string;                // URL slug, e.g. "vision-nation"
  name: string;                // e.g. "Vision Nation"
  ownerName: string;           // Nation owner / login name
  email: string;               // Nation owner email (login)
  phone: string;
  status: NationStatus;
  createdAt: string;
};

// Locked roster — exactly 8 Nations.
export const MAX_NATIONS = 8;

// Shared demo password for every Nation owner.
export const SHARED_NATION_PASSWORD = "Diamond2026!";

export const NATIONS: Nation[] = [
  { id: "NTN001", slug: "vision-nation",            name: "Vision Nation",            ownerName: "Tunde Adebayo",  email: "tunde@diamondbody.com",    phone: "+2348011110001", status: "active", createdAt: "2026-01-05T09:00:00Z" },
  { id: "NTN002", slug: "unstoppable-nation",       name: "Unstoppable Nation",       ownerName: "Sarah Adeyemi",  email: "sarah@diamondbody.com",    phone: "+2348011110002", status: "active", createdAt: "2026-01-05T09:05:00Z" },
  { id: "NTN003", slug: "great-achievers-nation",   name: "Great Achievers Nation",   ownerName: "Blessing Akpan", email: "blessing@diamondbody.com", phone: "+2348011110003", status: "active", createdAt: "2026-01-05T09:10:00Z" },
  { id: "NTN004", slug: "star-nation",              name: "Star Nation",              ownerName: "David Mensah",   email: "david@diamondbody.com",    phone: "+2348011110004", status: "active", createdAt: "2026-01-05T09:15:00Z" },
  { id: "NTN005", slug: "legend-nation",            name: "Legend Nation",            ownerName: "Grace Okonkwo",  email: "grace@diamondbody.com",    phone: "+2348011110005", status: "active", createdAt: "2026-01-05T09:20:00Z" },
  { id: "NTN006", slug: "wealth-creation-nation",   name: "Wealth Creation Nation",   ownerName: "Emeka Uzo",      email: "emeka@diamondbody.com",    phone: "+2348011110006", status: "active", createdAt: "2026-01-05T09:25:00Z" },
  { id: "NTN007", slug: "champions-nation",         name: "Champions Nation",         ownerName: "Chioma Eze",     email: "chioma@diamondbody.com",   phone: "+2348011110007", status: "active", createdAt: "2026-01-05T09:30:00Z" },
  { id: "NTN008", slug: "eagle-and-diamond-nation", name: "Eagle and Diamond Nation", ownerName: "John Okafor",    email: "john@diamondbody.com",     phone: "+2348011110008", status: "active", createdAt: "2026-01-05T09:35:00Z" },
];

// localStorage key for the sticky Nation chosen via /nation URL
export const NATION_LS_KEY = "diamondbody.nation";

export function setActiveNation(slug: string) {
  try { localStorage.setItem(NATION_LS_KEY, slug); } catch {}
}

export function getActiveNation(): Nation | null {
  try {
    const slug = localStorage.getItem(NATION_LS_KEY);
    if (!slug) return null;
    return NATIONS.find((n) => n.slug === slug) || null;
  } catch { return null; }
}

export function clearActiveNation() {
  try { localStorage.removeItem(NATION_LS_KEY); } catch {}
}

export function findNationBySlug(slug: string): Nation | undefined {
  return NATIONS.find((n) => n.slug === slug);
}

export function findNationById(id: string): Nation | undefined {
  return NATIONS.find((n) => n.id === id);
}

export function findNationByEmail(email: string): Nation | undefined {
  const lower = email.toLowerCase();
  return NATIONS.find((n) => n.email.toLowerCase() === lower);
}
