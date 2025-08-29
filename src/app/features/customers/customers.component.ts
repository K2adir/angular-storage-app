import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditCustomerDialogComponent } from './edit-customer-dialog.component';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../core/storage.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatTableModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatDialogModule, RouterLink],
  template: `
    <div class="grid">
      <mat-card appearance="outlined" class="add">
        <h3>Add Customer</h3>
        <form [formGroup]="form" (ngSubmit)="onAdd()">
          <div class="row">
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
              <input matInput formControlName="email" type="email" required autocomplete="off" />
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
          </div>
          <button mat-flat-button color="primary" [disabled]="form.invalid">Add</button>
          <div class="error" *ngIf="error">{{ error }}</div>
        </form>
      </mat-card>

      <mat-card appearance="outlined" class="list">
        <h3>Customers</h3>
        <table mat-table [dataSource]="customers()" class="mat-elevation-z1">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let c">{{ c.name }}</td>
          </ng-container>
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let c">{{ c.email }}</td>
          </ng-container>
          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef>Phone</th>
            <td mat-cell *matCellDef="let c">{{ c.phone || '-' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let c">
              <button mat-icon-button color="primary" (click)="onEdit(c)" aria-label="Edit customer"><mat-icon>edit</mat-icon></button>
              <a mat-button color="primary" [routerLink]="['/customers', c.email]">Open</a>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
        <div *ngIf="customers().length === 0" class="empty">No customers yet.</div>
      </mat-card>
    </div>
  `,
  styles: [
    `.grid { display:grid; grid-template-columns: 1fr; gap:16px; }
     .row { display:grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
     .fullspan { grid-column: 1 / -1; }
     .full { width: 100%; }
     h3 { margin: 0 0 8px; }
     table { width: 100%; }
     .empty { padding: 12px; color: rgba(0,0,0,0.6); }
     @media (min-width: 768px) {
        .grid { grid-template-columns: 1fr 2fr; }
        .row { grid-template-columns: repeat(3, 1fr); }
     }`
  ]
})
export class CustomersComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(StorageService);
  private readonly dialog = inject(MatDialog);

  readonly customers = computed(() => this.store.customers());
  error: string | null = null;

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

  columns = ['name', 'email', 'phone', 'actions'];

  onAdd() {
    this.error = null;
    const v = this.form.getRawValue();
    const displayName = `${v.firstName} ${v.lastName}`.trim();
    const result = this.store.addCustomer({
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
    if (!result.ok) {
      this.error = result.error ?? 'Failed to add customer';
      return;
    }
    this.form.reset();
  }

  onEdit(c: any) {
    const ref = this.dialog.open(EditCustomerDialogComponent, {
      data: { customer: c },
      width: '700px'
    });
    ref.afterClosed().subscribe((patch) => {
      if (patch) {
        this.store.updateCustomer(c.email, patch);
      }
    });
  }
}
