import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Customer } from '../models/customer';
import { Item } from '../models/item';

interface StorageData {
  customers: Customer[];
  itemsByEmail: Record<string, Item[]>;
  archivedByEmail: Record<string, Item[]>;
}

const STORAGE_KEY = 'storageApp.data.v1';

@Injectable({ providedIn: 'root' })
export class StorageService {
  readonly customers = signal<Customer[]>([]);
  readonly itemsByEmail = signal<Record<string, Item[]>>({});
  readonly archivedByEmail = signal<Record<string, Item[]>>({});
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    this.load();
  }

  private load() {
    if (!isPlatformBrowser(this.platformId)) return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed: StorageData = JSON.parse(raw);
      this.customers.set(parsed.customers ?? []);
      this.itemsByEmail.set(parsed.itemsByEmail ?? {});
      this.archivedByEmail.set(parsed.archivedByEmail ?? {});
    } catch {
      // ignore
    }
  }

  private persist() {
    if (!isPlatformBrowser(this.platformId)) return;
    const data: StorageData = {
      customers: this.customers(),
      itemsByEmail: this.itemsByEmail(),
      archivedByEmail: this.archivedByEmail(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  addCustomer(customer: Customer): { ok: boolean; error?: string } {
    const email = customer.email.trim().toLowerCase();
    if (!email) return { ok: false, error: 'Email is required' };
    const exists = this.customers().some((c) => c.email.toLowerCase() === email);
    if (exists) return { ok: false, error: 'Customer with this email already exists' };
    const list = [...this.customers(), { ...customer, email }];
    this.customers.set(list);
    if (!this.itemsByEmail()[email]) this.itemsByEmail.set({ ...this.itemsByEmail(), [email]: [] });
    if (!this.archivedByEmail()[email]) this.archivedByEmail.set({ ...this.archivedByEmail(), [email]: [] });
    this.persist();
    return { ok: true };
  }

  getCustomer(email: string): Customer | undefined {
    const key = email.trim().toLowerCase();
    return this.customers().find((c) => c.email.toLowerCase() === key);
  }

  addItem(email: string, item: Omit<Item, 'id'>): void {
    const key = email.trim().toLowerCase();
    const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)) as string;
    const current = this.itemsByEmail()[key] ?? [];
    const updated = [...current, { ...item, id }];
    this.itemsByEmail.set({ ...this.itemsByEmail(), [key]: updated });
    this.persist();
  }

  itemsFor(email: string): Item[] {
    const key = email.trim().toLowerCase();
    return this.itemsByEmail()[key] ?? [];
  }

  removeItem(email: string, itemId: string): void {
    // Now archives instead of deleting permanently
    const key = email.trim().toLowerCase();
    const current = this.itemsByEmail()[key] ?? [];
    const idx = current.findIndex((i) => i.id === itemId);
    if (idx === -1) return;
    const [removed] = current.splice(idx, 1);
    const updatedActive = [...current];
    const archived = this.archivedByEmail()[key] ?? [];
    const updatedArchived = [...archived, removed];
    this.itemsByEmail.set({ ...this.itemsByEmail(), [key]: updatedActive });
    this.archivedByEmail.set({ ...this.archivedByEmail(), [key]: updatedArchived });
    this.persist();
  }

  updateItem(email: string, updatedItem: Item): void {
    const key = email.trim().toLowerCase();
    const current = this.itemsByEmail()[key] ?? [];
    const updated = current.map((i) => (i.id === updatedItem.id ? { ...i, ...updatedItem } : i));
    this.itemsByEmail.set({ ...this.itemsByEmail(), [key]: updated });
    this.persist();
  }

  archivedItemsFor(email: string): Item[] {
    const key = email.trim().toLowerCase();
    return this.archivedByEmail()[key] ?? [];
  }

  restoreItem(email: string, itemId: string): void {
    const key = email.trim().toLowerCase();
    const archived = this.archivedByEmail()[key] ?? [];
    const idx = archived.findIndex((i) => i.id === itemId);
    if (idx === -1) return;
    const [restored] = archived.splice(idx, 1);
    const active = this.itemsByEmail()[key] ?? [];
    this.itemsByEmail.set({ ...this.itemsByEmail(), [key]: [...active, restored] });
    this.archivedByEmail.set({ ...this.archivedByEmail(), [key]: [...archived] });
    this.persist();
  }

  purgeArchived(email: string, itemId: string): void {
    const key = email.trim().toLowerCase();
    const archived = this.archivedByEmail()[key] ?? [];
    const updated = archived.filter((i) => i.id !== itemId);
    this.archivedByEmail.set({ ...this.archivedByEmail(), [key]: updated });
    this.persist();
  }

  updateCustomer(email: string, patch: Partial<Customer>): void {
    const key = email.trim().toLowerCase();
    const updated = this.customers().map((c) => (c.email.toLowerCase() === key ? { ...c, ...patch } : c));
    this.customers.set(updated);
    this.persist();
  }
}
