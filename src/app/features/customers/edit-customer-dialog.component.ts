import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Customer } from '../../models/customer';

export interface EditCustomerData {
  customer: Customer;
}

@Component({
  selector: 'app-edit-customer-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Edit Customer</h2>
    <div mat-dialog-content>
      <form [formGroup]="form" class="content">
        <div class="grid">
          <mat-form-field appearance="outline" class="full">
            <mat-label>Display name</mat-label>
            <input matInput formControlName="name" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>First name</mat-label>
            <input matInput formControlName="firstName" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Last name</mat-label>
            <input matInput formControlName="lastName" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Email (ID)</mat-label>
            <input matInput [value]="data.customer.email" disabled />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Phone</mat-label>
            <input matInput formControlName="phone" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Company</mat-label>
            <input matInput formControlName="company" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Address line 1</mat-label>
            <input matInput formControlName="addressLine1" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Address line 2</mat-label>
            <input matInput formControlName="addressLine2" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>City</mat-label>
            <input matInput formControlName="city" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>County</mat-label>
            <input matInput formControlName="county" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>State/Province</mat-label>
            <input matInput formControlName="state" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Postal code</mat-label>
            <input matInput formControlName="postalCode" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Country</mat-label>
            <input matInput formControlName="country" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full fullspan">
            <mat-label>Notes</mat-label>
            <textarea matInput rows="3" formControlName="notes"></textarea>
          </mat-form-field>
        </div>
      </form>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()">Save</button>
    </div>
  `,
  styles: [
    `.content { margin-top: 8px; }
     .grid { display:grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
     .full { width: 100%; }
     .fullspan { grid-column: 1 / -1; }
     @media (min-width: 768px) { .grid { grid-template-columns: repeat(3, 1fr); } }
    `
  ]
})
export class EditCustomerDialogComponent {
  readonly data = inject<EditCustomerData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<EditCustomerDialogComponent, Partial<Customer> | undefined>);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    name: [this.data.customer.name || ''],
    firstName: [this.data.customer.firstName || ''],
    lastName: [this.data.customer.lastName || ''],
    phone: [this.data.customer.phone || ''],
    company: [this.data.customer.company || ''],
    addressLine1: [this.data.customer.addressLine1 || ''],
    addressLine2: [this.data.customer.addressLine2 || ''],
    city: [this.data.customer.city || ''],
    county: [this.data.customer.county || ''],
    state: [this.data.customer.state || ''],
    postalCode: [this.data.customer.postalCode || ''],
    country: [this.data.customer.country || ''],
    notes: [this.data.customer.notes || ''],
  });

  close() { this.ref.close(undefined); }

  save() {
    const v = this.form.getRawValue();
    const patch: Partial<Customer> = {
      name: v.name?.trim() || `${v.firstName || ''} ${v.lastName || ''}`.trim() || this.data.customer.name,
      firstName: v.firstName?.trim() || undefined,
      lastName: v.lastName?.trim() || undefined,
      phone: v.phone?.trim() || undefined,
      company: v.company?.trim() || undefined,
      addressLine1: v.addressLine1?.trim() || undefined,
      addressLine2: v.addressLine2?.trim() || undefined,
      city: v.city?.trim() || undefined,
      county: v.county?.trim() || undefined,
      state: v.state?.trim() || undefined,
      postalCode: v.postalCode?.trim() || undefined,
      country: v.country?.trim() || undefined,
      notes: v.notes?.trim() || undefined,
    };
    this.ref.close(patch);
  }
}

