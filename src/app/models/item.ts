export interface Item {
  id: string; // generated
  name: string;
  quantity: number;
  // Dimensions in centimeters
  widthCm: number;
  lengthCm: number;
  heightCm: number;
  // Optional barcode identifier
  barcode?: string;
  // Pricing mode
  pricingMode?: 'auto' | 'manual'; // default 'auto'
  manualMonthlyCost?: number; // used when pricingMode === 'manual'
  // Item Prep cost controls
  prepPricingMode?: 'auto' | 'manual';
  manualPrepCost?: number; // per unit when manual
  // Fulfillment cost controls
  fulfillmentPricingMode?: 'auto' | 'manual';
  manualFulfillmentCost?: number; // per unit when manual
  dateAdded: string; // ISO date string
  location: string; // where it's located
  // Legacy field support (ignored going forward)
  size?: string;
}
