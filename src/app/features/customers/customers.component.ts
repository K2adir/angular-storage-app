import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../core/storage.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatTableModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterLink],
  template: `
    <div class="grid">
      <mat-card appearance="outlined" class="add">
        <h3>Add Customer</h3>
        <form [formGroup]="form" (ngSubmit)="onAdd()">
          <div class="row">
            <mat-form-field appearance="outline" class="full">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" required />
              <mat-error *ngIf="form.controls.name.hasError('required') && form.controls.name.touched">Name is required</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" required autocomplete="off" />
              <mat-error *ngIf="form.controls.email.hasError('required') && form.controls.email.touched">Email is required</mat-error>
              <mat-error *ngIf="form.controls.email.hasError('email') && form.controls.email.touched">Enter a valid email</mat-error>
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
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let c">
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
     .row { display:grid; grid-template-columns: 1fr; gap: 12px; }
     .full { width: 100%; }
     h3 { margin: 0 0 8px; }
     table { width: 100%; }
     .empty { padding: 12px; color: rgba(0,0,0,0.6); }
     @media (min-width: 768px) {
        .grid { grid-template-columns: 1fr 2fr; }
        .row { grid-template-columns: 1fr 1fr; }
     }`
  ]
})
export class CustomersComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(StorageService);

  readonly customers = computed(() => this.store.customers());
  error: string | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  columns = ['name', 'email', 'actions'];

  onAdd() {
    this.error = null;
    const { name, email } = this.form.getRawValue();
    const result = this.store.addCustomer({ name, email });
    if (!result.ok) {
      this.error = result.error ?? 'Failed to add customer';
      return;
    }
    this.form.reset();
  }
}
