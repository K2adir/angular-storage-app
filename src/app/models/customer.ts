export interface Customer {
  name: string;
  email: string; // unique id
  phone?: string;
  notes?: string;
  // Monthly price per cubic meter, used for auto-pricing
  ratePerM3?: number; // in currency units per m^3, e.g. 10 => $10/m^3
}
