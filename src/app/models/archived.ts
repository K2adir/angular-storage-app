import { Item } from './item';

export type ArchiveReason = 'Shipped' | 'Removed' | 'Damaged' | 'Other' | string;

export interface ArchivedItemRecord {
  item: Item;
  reason: ArchiveReason;
  notes?: string;
  archivedAt: string; // ISO date
}

