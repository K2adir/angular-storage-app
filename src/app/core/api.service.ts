import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Customer } from '../models/customer';

const BASE = '/api';

type CustomerDTO = {
  id: number;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  county?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  notes?: string;
  rate_per_m3?: number;
  prep_cost_per_unit?: number;
  fulfillment_cost_per_unit?: number;
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  login(email: string, password: string): Observable<{ access: string; refresh: string }> {
    return this.http.post<{ access: string; refresh: string }>(`${BASE}/auth/token`, { username: email, password });
  }

  getCustomers(): Observable<(Customer & { backendId: number })[]> {
    return this.http.get<CustomerDTO[]>(`${BASE}/customers/`).pipe(map((arr) => arr.map(this.fromCustomerDTO)));
  }

  addCustomer(c: Customer): Observable<Customer & { backendId: number }> {
    const dto = this.toCustomerDTO(c);
    return this.http.post<CustomerDTO>(`${BASE}/customers/`, dto).pipe(map(this.fromCustomerDTO));
  }

  updateCustomer(backendId: number, patch: Partial<Customer>): Observable<Customer & { backendId: number }> {
    const dto: any = this.toCustomerDTO(patch as Customer);
    return this.http.patch<CustomerDTO>(`${BASE}/customers/${backendId}/`, dto).pipe(map(this.fromCustomerDTO));
  }

  private fromCustomerDTO = (d: CustomerDTO): Customer & { backendId: number } => ({
    name: d.name,
    email: d.email,
    firstName: d.first_name || undefined,
    lastName: d.last_name || undefined,
    phone: d.phone || undefined,
    company: d.company || undefined,
    addressLine1: d.address_line1 || undefined,
    addressLine2: d.address_line2 || undefined,
    city: d.city || undefined,
    county: d.county || undefined,
    state: d.state || undefined,
    postalCode: d.postal_code || undefined,
    country: d.country || undefined,
    notes: d.notes || undefined,
    ratePerM3: d.rate_per_m3,
    prepCostPerUnit: d.prep_cost_per_unit,
    fulfillmentCostPerUnit: d.fulfillment_cost_per_unit,
    backendId: d.id,
  });

  private toCustomerDTO = (c: Customer): any => ({
    email: c.email,
    name: c.name,
    first_name: (c as any).firstName,
    last_name: (c as any).lastName,
    phone: (c as any).phone,
    company: (c as any).company,
    address_line1: (c as any).addressLine1,
    address_line2: (c as any).addressLine2,
    city: (c as any).city,
    county: (c as any).county,
    state: (c as any).state,
    postal_code: (c as any).postalCode,
    country: (c as any).country,
    notes: (c as any).notes,
    rate_per_m3: (c as any).ratePerM3,
    prep_cost_per_unit: (c as any).prepCostPerUnit,
    fulfillment_cost_per_unit: (c as any).fulfillmentCostPerUnit,
  });
}

