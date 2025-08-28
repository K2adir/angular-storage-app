import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StorageService } from '../../core/storage.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <a mat-button color="primary" routerLink="/customers">← Back to customers</a>

    <mat-card appearance="outlined" *ngIf="customer() as c">
      <h2>{{ c.name }}</h2>
      <div>Email: {{ c.email }}</div>
    </mat-card>

    <div class="grid">
      <mat-card appearance="outlined">
        <h3>Add Item</h3>
        <form [formGroup]="form" (ngSubmit)="onAddItem()">
          <div class="row">
            <mat-form-field appearance="outline" class="full">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" required />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Quantity</mat-label>
              <input matInput type="number" min="1" formControlName="quantity" required />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Size</mat-label>
              <mat-select formControlName="size" required>
                <mat-option value="Small">Small</mat-option>
                <mat-option value="Medium">Medium</mat-option>
                <mat-option value="Large">Large</mat-option>
                <mat-option value="Other">Other</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Location</mat-label>
              <input matInput formControlName="location" required />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Date added</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="dateAdded" required />
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
          </div>
          <button mat-flat-button color="primary" [disabled]="form.invalid">Add Item</button>
        </form>
      </mat-card>

      <mat-card appearance="outlined">
        <h3>Items</h3>
        <table mat-table [dataSource]="items()" class="mat-elevation-z1">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let i">{{ i.name }}</td>
          </ng-container>
          <ng-container matColumnDef="quantity">
            <th mat-header-cell *matHeaderCellDef>Qty</th>
            <td mat-cell *matCellDef="let i">{{ i.quantity }}</td>
          </ng-container>
          <ng-container matColumnDef="size">
            <th mat-header-cell *matHeaderCellDef>Size</th>
            <td mat-cell *matCellDef="let i">{{ i.size }}</td>
          </ng-container>
          <ng-container matColumnDef="location">
            <th mat-header-cell *matHeaderCellDef>Location</th>
            <td mat-cell *matCellDef="let i">{{ i.location }}</td>
          </ng-container>
          <ng-container matColumnDef="dateAdded">
            <th mat-header-cell *matHeaderCellDef>Date Added</th>
            <td mat-cell *matCellDef="let i">{{ i.dateAdded | date: 'mediumDate' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let i">
              <button mat-icon-button color="warn" (click)="remove(i.id)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
        <div *ngIf="items().length === 0" class="empty">No items yet.</div>
      </mat-card>
    </div>
  `,
  styles: [
    `.grid { display:grid; grid-template-columns: 1fr; gap:16px; margin-top: 16px; }
     .row { display:grid; grid-template-columns: 1fr; gap: 12px; }
     .full { width: 100%; }
     h2, h3 { margin: 0 0 8px; }
     table { width: 100%; }
     .empty { padding: 12px; color: rgba(0,0,0,0.6); }
     @media (min-width: 900px) {
        .grid { grid-template-columns: 1fr 2fr; }
        .row { grid-template-columns: repeat(5, 1fr); }
     }`
  ]
})
export class CustomerDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(StorageService);

  readonly email = computed(() => String(this.route.snapshot.paramMap.get('email') ?? '').toLowerCase());
  readonly customer = computed(() => this.store.getCustomer(this.email() ?? ''));
  readonly items = computed(() => this.store.itemsFor(this.email() ?? ''));

  columns = ['name', 'quantity', 'size', 'location', 'dateAdded', 'actions'];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    size: ['Medium', Validators.required],
    location: ['', Validators.required],
    dateAdded: [new Date(), Validators.required],
  });

  onAddItem() {
    const raw = this.form.getRawValue();
    const date = raw.dateAdded instanceof Date ? raw.dateAdded.toISOString() : String(raw.dateAdded);
    this.store.addItem(this.email(), {
      name: raw.name,
      quantity: Number(raw.quantity),
      size: raw.size,
      location: raw.location,
      dateAdded: date,
    });
    this.form.reset({ name: '', quantity: 1, size: 'Medium', location: '', dateAdded: new Date() });
  }

  remove(id: string) {
    this.store.removeItem(this.email(), id);
  }
}

