import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Customer } from '../models/customer';
import { Item } from '../models/item';
import { ArchivedItemRecord } from '../models/archived';
import { ApiService } from './api.service';
import { Order, OrderStatus } from '../models/order';

interface StorageData {
  customers: Customer[];
  itemsByEmail: Record<string, Item[]>;
  archivedByEmail: Record<string, ArchivedItemRecord[] | Item[]>; // tolerate legacy arrays of Item
  ordersByEmail: Record<string, Order[]>;
}

const STORAGE_KEY = 'storageApp.data.v1';

@Injectable({ providedIn: 'root' })
export class StorageService {
  readonly customers = signal<Customer[]>([]);
  readonly itemsByEmail = signal<Record<string, Item[]>>({});
  readonly archivedByEmail = signal<Record<string, ArchivedItemRecord[]>>({});
  readonly ordersByEmail = signal<Record<string, Order[]>>({});
  private readonly platformId = inject(PLATFORM_ID);
  private readonly api = inject(ApiService);

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
      // Migrate legacy archived value shape (Item[] -> ArchivedItemRecord[])
      const rawArchived = parsed.archivedByEmail ?? {};
      const migrated: Record<string, ArchivedItemRecord[]> = {};
      Object.keys(rawArchived).forEach((email) => {
        const arr = (rawArchived as any)[email] as any[];
        migrated[email] = (arr ?? []).map((x: any) =>
          x && x.item ? x as ArchivedItemRecord : ({ item: x as Item, reason: 'Archived', archivedAt: new Date().toISOString() })
        );
      });
      this.archivedByEmail.set(migrated);
      this.ordersByEmail.set(parsed.ordersByEmail ?? {});
    } catch {
      // ignore
    }
    // Also try to load customers from API (if backend is running)
    this.api.getCustomers().subscribe({
      next: (list) => {
        this.customers.set(list as Customer[]);
      },
      error: () => {}
    });
  }

  private persist() {
    if (!isPlatformBrowser(this.platformId)) return;
    const data: StorageData = {
      customers: this.customers(),
      itemsByEmail: this.itemsByEmail(),
      archivedByEmail: this.archivedByEmail(),
      ordersByEmail: this.ordersByEmail(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  addCustomer(customer: Customer): { ok: boolean; error?: string } {
    const email = customer.email.trim().toLowerCase();
    if (!email) return { ok: false, error: 'Email is required' };
    const exists = this.customers().some((c) => c.email.toLowerCase() === email);
    if (exists) return { ok: false, error: 'Customer with this email already exists' };
    // Try API first
    this.api.addCustomer({ ...customer, email }).subscribe({
      next: (c) => {
        this.customers.set([...this.customers(), c]);
      },
      error: () => {
        const list = [...this.customers(), { ...customer, email }];
        this.customers.set(list);
        this.persist();
      }
    });
    if (!this.itemsByEmail()[email]) this.itemsByEmail.set({ ...this.itemsByEmail(), [email]: [] });
    if (!this.archivedByEmail()[email]) this.archivedByEmail.set({ ...this.archivedByEmail(), [email]: [] });
    if (!this.ordersByEmail()[email]) this.ordersByEmail.set({ ...this.ordersByEmail(), [email]: [] });
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
    // Backward-compat: archive with generic reason
    this.archiveItem(email, itemId, { reason: 'Archived' });
  }

  archiveItem(email: string, itemId: string, meta: { reason: string; notes?: string }): void {
    const key = email.trim().toLowerCase();
    const current = this.itemsByEmail()[key] ?? [];
    const idx = current.findIndex((i) => i.id === itemId);
    if (idx === -1) return;
    const [removed] = current.splice(idx, 1);
    const updatedActive = [...current];
    const archived = this.archivedByEmail()[key] ?? [];
    const record: ArchivedItemRecord = {
      item: removed,
      reason: meta.reason,
      notes: meta.notes,
      archivedAt: new Date().toISOString(),
    };
    const updatedArchived = [...archived, record];
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

  archivedItemsFor(email: string): ArchivedItemRecord[] {
    const key = email.trim().toLowerCase();
    return this.archivedByEmail()[key] ?? [];
  }

  restoreItem(email: string, itemId: string): void {
    const key = email.trim().toLowerCase();
    const archived = this.archivedByEmail()[key] ?? [];
    const idx = archived.findIndex((r) => r.item.id === itemId);
    if (idx === -1) return;
    const [record] = archived.splice(idx, 1);
    const active = this.itemsByEmail()[key] ?? [];
    this.itemsByEmail.set({ ...this.itemsByEmail(), [key]: [...active, record.item] });
    this.archivedByEmail.set({ ...this.archivedByEmail(), [key]: [...archived] });
    this.persist();
  }

  purgeArchived(email: string, itemId: string): void {
    const key = email.trim().toLowerCase();
    const archived = this.archivedByEmail()[key] ?? [];
    const updated = archived.filter((r) => r.item.id !== itemId);
    this.archivedByEmail.set({ ...this.archivedByEmail(), [key]: updated });
    this.persist();
  }

  updateCustomer(email: string, patch: Partial<Customer> & { email?: string }): { ok: boolean; newEmail?: string; error?: string } {
    const oldKey = email.trim().toLowerCase();
    const customers = this.customers();
    const existing = customers.find(c => c.email.toLowerCase() === oldKey);
    if (!existing) return { ok: false, error: 'Customer not found' };

    let currentKey = oldKey;
    if (patch.email && patch.email.trim().toLowerCase() !== oldKey) {
      const newKey = patch.email.trim().toLowerCase();
      const conflict = customers.some(c => c.email.toLowerCase() === newKey);
      if (conflict) return { ok: false, error: 'Another customer already uses this email' };
      // Move keyed records
      const items = this.itemsByEmail()[oldKey] ?? [];
      const archived = this.archivedByEmail()[oldKey] ?? [];
      const orders = this.ordersByEmail()[oldKey] ?? [];
      this.itemsByEmail.set({ ...this.itemsByEmail(), [newKey]: items });
      this.archivedByEmail.set({ ...this.archivedByEmail(), [newKey]: archived });
      this.ordersByEmail.set({ ...this.ordersByEmail(), [newKey]: orders });
      const itemsMap = { ...this.itemsByEmail() }; delete itemsMap[oldKey]; this.itemsByEmail.set(itemsMap);
      const archMap = { ...this.archivedByEmail() }; delete archMap[oldKey]; this.archivedByEmail.set(archMap);
      const ordersMap = { ...this.ordersByEmail() }; delete ordersMap[oldKey]; this.ordersByEmail.set(ordersMap);
      currentKey = newKey;
    }

    const updated = customers.map(c => c.email.toLowerCase() === currentKey ? { ...c, ...patch, email: currentKey } : c);
    this.customers.set(updated);
    this.persist();
    return { ok: true, newEmail: currentKey !== oldKey ? currentKey : undefined };
  }

  ordersFor(email: string): Order[] {
    const key = email.trim().toLowerCase();
    return this.ordersByEmail()[key] ?? [];
  }

  createOrder(email: string, input: Omit<Order, 'id' | 'createdAt' | 'itemName'> & { itemName?: string }): { ok: boolean; error?: string } {
    const key = email.trim().toLowerCase();
    const items = this.itemsByEmail()[key] ?? [];
    const idx = items.findIndex(i => i.id === input.itemId);
    if (idx === -1) return { ok: false, error: 'Item not found' };
    const item = items[idx];
    const qty = Math.max(0, Math.floor(Number(input.quantity)));
    if (qty <= 0) return { ok: false, error: 'Quantity must be > 0' };
    if ((item.quantity || 0) < qty) return { ok: false, error: 'Insufficient quantity in storage' };
    // Decrement stock
    const updatedItem = { ...item, quantity: (Number(item.quantity) || 0) - qty } as Item;
    const newItems = [...items];
    newItems[idx] = updatedItem;
    this.itemsByEmail.set({ ...this.itemsByEmail(), [key]: newItems });

    const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)) as string;
    const order: Order = {
      id,
      itemId: input.itemId,
      itemName: input.itemName ?? item.name,
      quantity: qty,
      date: input.date,
      materialCostPerFulfillment: Number(input.materialCostPerFulfillment) || 0,
      status: input.status as OrderStatus,
      trackingNumber: input.trackingNumber,
      emailSubject: input.emailSubject,
      emailBody: input.emailBody,
      createdAt: new Date().toISOString(),
    };
    const orders = this.ordersByEmail()[key] ?? [];
    this.ordersByEmail.set({ ...this.ordersByEmail(), [key]: [...orders, order] });
    this.persist();
    return { ok: true };
  }

  updateOrder(email: string, orderId: string, patch: Partial<Order>): void {
    const key = email.trim().toLowerCase();
    const orders = this.ordersByEmail()[key] ?? [];
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return;
    const updated = { ...orders[idx], ...patch } as Order;
    const copy = [...orders];
    copy[idx] = updated;
    this.ordersByEmail.set({ ...this.ordersByEmail(), [key]: copy });
    this.persist();
  }

  cancelOrder(email: string, orderId: string): void {
    const key = email.trim().toLowerCase();
    const orders = this.ordersByEmail()[key] ?? [];
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return;
    const order = orders[idx];
    if (order.status === 'Cancelled') return; // already cancelled
    // Restock
    const items = this.itemsByEmail()[key] ?? [];
    const i = items.findIndex(it => it.id === order.itemId);
    if (i !== -1) {
      const updatedItem = { ...items[i], quantity: (Number(items[i].quantity) || 0) + order.quantity } as Item;
      const newItems = [...items];
      newItems[i] = updatedItem;
      this.itemsByEmail.set({ ...this.itemsByEmail(), [key]: newItems });
    }
    // Update order status
    const updated = { ...order, status: 'Cancelled' as OrderStatus };
    const newOrders = [...orders];
    newOrders[idx] = updated;
    this.ordersByEmail.set({ ...this.ordersByEmail(), [key]: newOrders });
    this.persist();
  }
}
