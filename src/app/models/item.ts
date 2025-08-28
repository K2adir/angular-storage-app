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
  dateAdded: string; // ISO date string
  location: string; // where it's located
  // Legacy field support (ignored going forward)
  size?: string;
}
