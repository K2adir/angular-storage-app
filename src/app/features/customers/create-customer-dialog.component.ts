import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { StorageService } from '../../core/storage.service';

@Component({
  selector: 'app-create-customer-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Create Customer</h2>
    <div mat-dialog-content>
      <form [formGroup]="form" class="grid">
        <mat-form-field appearance="outline" class="full">
          <mat-label>First name</mat-label>
          <input matInput formControlName="firstName" required />
          <mat-error *ngIf="form.controls.firstName.hasError('required') && form.controls.firstName.touched">First name is required</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Last name</mat-label>
          <input matInput formControlName="lastName" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" required />
          <mat-error *ngIf="form.controls.email.hasError('required') && form.controls.email.touched">Email is required</mat-error>
          <mat-error *ngIf="form.controls.email.hasError('email') && form.controls.email.touched">Enter a valid email</mat-error>
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
        <div class="error" *ngIf="error()">{{ error() }}</div>
      </form>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">Create</button>
    </div>
  `,
  styles: [
    `.grid { display:grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 8px; }
     .full { width: 100%; }
     .fullspan { grid-column: 1 / -1; }
     .error { color: var(--mat-sys-error); }
     @media (min-width: 768px) { .grid { grid-template-columns: repeat(3, 1fr); } }
    `
  ]
})
export class CreateCustomerDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(StorageService);
  private readonly ref = inject(MatDialogRef<CreateCustomerDialogComponent, string | undefined>);

  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    company: [''],
    addressLine1: [''],
    addressLine2: [''],
    city: [''],
    county: [''],
    state: [''],
    postalCode: [''],
    country: [''],
    notes: [''],
  });

  close() { this.ref.close(undefined); }

  save() {
    this.error.set(null);
    const v = this.form.getRawValue();
    const displayName = `${v.firstName} ${v.lastName}`.trim();
    const res = this.store.addCustomer({
      name: displayName || v.firstName || v.lastName || v.email,
      firstName: v.firstName || undefined,
      lastName: v.lastName || undefined,
      email: v.email,
      phone: v.phone || undefined,
      company: v.company || undefined,
      addressLine1: v.addressLine1 || undefined,
      addressLine2: v.addressLine2 || undefined,
      city: v.city || undefined,
      county: v.county || undefined,
      state: v.state || undefined,
      postalCode: v.postalCode || undefined,
      country: v.country || undefined,
      notes: v.notes || undefined,
    });
    if (!res.ok) {
      this.error.set(res.error || 'Failed to create customer');
      return;
    }
    this.ref.close(v.email);
  }
}

