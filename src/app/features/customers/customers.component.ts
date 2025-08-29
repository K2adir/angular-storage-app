import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditCustomerDialogComponent } from './edit-customer-dialog.component';
import { CreateCustomerDialogComponent } from './create-customer-dialog.component';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../core/storage.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatTableModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatDialogModule, RouterLink],
  template: `
    <div class="grid">
      <mat-card appearance="outlined" class="list">
        <h3>Customers</h3>
        <div class="toolbar">
          <mat-form-field appearance="outline" class="search">
            <mat-label>Search customers</mat-label>
            <input matInput [formControl]="search" placeholder="Name, email, phone, company" />
          </mat-form-field>
        </div>
        <table mat-table [dataSource]="filtered()" class="mat-elevation-z1">
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
          <ng-container matColumnDef="company">
            <th mat-header-cell *matHeaderCellDef>Company</th>
            <td mat-cell *matCellDef="let c">{{ c.company || '-' }}</td>
          </ng-container>
          <ng-container matColumnDef="city">
            <th mat-header-cell *matHeaderCellDef>City</th>
            <td mat-cell *matCellDef="let c">{{ c.city || '-' }}</td>
          </ng-container>
          <ng-container matColumnDef="country">
            <th mat-header-cell *matHeaderCellDef>Country</th>
            <td mat-cell *matCellDef="let c">{{ c.country || '-' }}</td>
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
        <div *ngIf="filtered().length === 0" class="empty">No customers match your search.</div>
      </mat-card>
      <div class="actions-row">
        <button mat-flat-button color="primary" (click)="openCreate()">Create New Customer</button>
        <div class="error" *ngIf="error">{{ error }}</div>
      </div>
    </div>
  `,
  styles: [
    `.grid { display:grid; grid-template-columns: 1fr; gap:16px; }
     .toolbar { display:flex; gap:12px; align-items:center; margin-bottom: 8px; }
     .search { flex: 1 1 320px; }
     .full { width: 100%; }
     h3 { margin: 0 0 8px; }
     table { width: 100%; }
     .empty { padding: 12px; color: rgba(0,0,0,0.6); }
     .actions-row { display:flex; align-items:center; gap:12px; }
     `
  ]
})
export class CustomersComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(StorageService);
  private readonly dialog = inject(MatDialog);

  readonly customers = computed(() => this.store.customers());
  error: string | null = null;

  readonly search = new FormControl('', { nonNullable: true });
  private readonly searchTerm = toSignal(this.search.valueChanges.pipe(startWith(this.search.value)));

  columns = ['name', 'email', 'phone', 'company', 'city', 'country', 'actions'];

  filtered = computed(() => {
    const q = (this.searchTerm() || '').toLowerCase().trim();
    if (!q) return this.customers();
    return this.customers().filter(c =>
      [c.name, c.email, c.phone, c.company, c.city, c.country]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q))
    );
  });

  openCreate() {
    const ref = this.dialog.open(CreateCustomerDialogComponent, { width: '900px', maxWidth: '95vw' });
    ref.afterClosed().subscribe(() => {});
  }

  onEdit(c: any) {
    const ref = this.dialog.open(EditCustomerDialogComponent, {
      data: { customer: c },
      width: '700px'
    });
    ref.afterClosed().subscribe((patch) => {
      if (patch) {
        const res = this.store.updateCustomer(c.email, patch);
        if (!res.ok) {
          this.error = res.error || 'Failed to update customer';
        }
      }
    });
  }
}
