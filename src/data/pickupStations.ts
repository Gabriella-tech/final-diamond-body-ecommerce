export type PickupStationStatus = "active" | "disabled";

export type PickupStation = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  hours: string;
  status: PickupStationStatus;
};

export const SEED_PICKUP_STATIONS: PickupStation[] = [
  {
    id: "PKS001",
    name: "Diamond Body - Lagos",
    address: "Braisas Mall, off Adiralty Way  Lekki Phase 1",
    city: "Lekki",
    state: "Lagos",
    phone: "+234 702 500 8596",
    hours: "Mon–Sat, 9am–6pm",
    status: "active",
  },
  {
    id: "PKS003",
    name: "Diamond Body — Abuja",
    address: "No 306b Bahamas Plaza, 1080 Joseph Gwomwalk Street",
    city: "Abuja",
    state: "FCT",
    phone: "+234 702 500 8596",
    hours: "Mon–Sat, 9am–6pm",
    status: "active",
  },
];

export const DELIVERY_FEE = 5000;