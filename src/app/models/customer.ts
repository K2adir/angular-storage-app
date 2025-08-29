export interface Customer {
  name: string; // display name
  firstName?: string;
  lastName?: string;
  email: string; // unique id
  phone?: string;
  notes?: string;
  // Monthly price per cubic meter, used for auto-pricing
  ratePerM3?: number; // in currency units per m^3, e.g. 10 => $10/m^3
  // Default per-unit add-on costs
  prepCostPerUnit?: number; // Item Prep cost per unit
  fulfillmentCostPerUnit?: number; // Fulfillment cost per unit
  // Address fields
  company?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  county?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}
