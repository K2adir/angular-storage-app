export type OrderStatus = 'Preparing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  itemId: string;
  itemName: string; // snapshot
  quantity: number;
  date: string; // ISO date
  materialCostPerFulfillment: number; // per unit
  status: OrderStatus;
  trackingNumber?: string;
  emailSubject?: string;
  emailBody?: string;
  createdAt: string; // ISO timestamp
}

