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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Item } from '../../models/item';
import { ItemEditDialogComponent } from './item-edit-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

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
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatDividerModule,
  ],
  template: `
    <a mat-button color="primary" routerLink="/customers">← Back to customers</a>

    <mat-card appearance="outlined" *ngIf="customer() as c">
      <h2>{{ c.name }}</h2>
      <div>Email: {{ c.email }}</div>
      <form [formGroup]="rateForm" (ngSubmit)="saveRate()" class="rate-row">
        <mat-form-field appearance="outline">
          <mat-label>Monthly rate per m³</mat-label>
          <input matInput type="number" min="0" step="0.01" formControlName="ratePerM3" />
        </mat-form-field>
        <button mat-stroked-button color="primary">Save Rate</button>
        <mat-divider class="spacer-divider"></mat-divider>
        <mat-chip-set>
          <mat-chip color="primary" selected>Total Volume: {{ totalVolumeM3() | number:'1.3-3' }} m³</mat-chip>
          <mat-chip color="accent" selected>Total Monthly: {{ totalMonthlyCost() | currency:'USD':'symbol' }}</mat-chip>
        </mat-chip-set>
      </form>
    </mat-card>

    <div class="grid">
      <mat-card appearance="outlined">
        <h3>Add Item</h3>
        <form [formGroup]="form" (ngSubmit)="onAddItem()">
          <div class="row">
            <mat-form-field appearance="outline" class="full">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" required />
              <mat-error *ngIf="form.controls.name.hasError('required') && form.controls.name.touched">Name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Quantity</mat-label>
              <input matInput type="number" min="1" formControlName="quantity" required />
              <mat-error *ngIf="form.controls.quantity.hasError('required') && form.controls.quantity.touched">Quantity is required</mat-error>
              <mat-error *ngIf="form.controls.quantity.hasError('min') && form.controls.quantity.touched">Must be at least 1</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Barcode</mat-label>
              <input matInput formControlName="barcode" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Width (cm)</mat-label>
              <input matInput type="number" min="0" step="0.01" formControlName="widthCm" required />
              <mat-error *ngIf="form.controls.widthCm.hasError('required') && form.controls.widthCm.touched">Width is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Length (cm)</mat-label>
              <input matInput type="number" min="0" step="0.01" formControlName="lengthCm" required />
              <mat-error *ngIf="form.controls.lengthCm.hasError('required') && form.controls.lengthCm.touched">Length is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Height (cm)</mat-label>
              <input matInput type="number" min="0" step="0.01" formControlName="heightCm" required />
              <mat-error *ngIf="form.controls.heightCm.hasError('required') && form.controls.heightCm.touched">Height is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Location</mat-label>
              <input matInput formControlName="location" required />
              <mat-error *ngIf="form.controls.location.hasError('required') && form.controls.location.touched">Location is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Date added</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="dateAdded" required />
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="form.controls.dateAdded.hasError('required') && form.controls.dateAdded.touched">Date is required</mat-error>
            </mat-form-field>
            <div class="full price-row">
              <mat-slide-toggle formControlName="autoPricing">Price by m³ (auto)</mat-slide-toggle>
              <ng-container *ngIf="form.controls.autoPricing.value; else manualPrice">
                <span class="price-hint">Auto: {{ estimatedNewItemCost() | currency:'USD' }}</span>
              </ng-container>
              <ng-template #manualPrice>
                <mat-form-field appearance="outline">
                  <mat-label>Monthly Cost</mat-label>
                  <input matInput type="number" min="0" step="0.01" formControlName="manualMonthlyCost" />
                </mat-form-field>
              </ng-template>
            </div>
          </div>
          <button mat-flat-button color="primary" [disabled]="form.invalid">Add Item</button>
        </form>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-tab-group>
          <mat-tab label="Items">
            <table mat-table [dataSource]="items()" class="mat-elevation-z1">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let i">{{ i.name }}</td>
              </ng-container>
              <ng-container matColumnDef="barcode">
                <th mat-header-cell *matHeaderCellDef>Barcode</th>
                <td mat-cell *matCellDef="let i">{{ i.barcode || '-' }}</td>
              </ng-container>
              <ng-container matColumnDef="quantity">
                <th mat-header-cell *matHeaderCellDef>Qty</th>
                <td mat-cell *matCellDef="let i">{{ i.quantity }}</td>
              </ng-container>
              <ng-container matColumnDef="dimensions">
                <th mat-header-cell *matHeaderCellDef>Dimensions (cm)</th>
                <td mat-cell *matCellDef="let i">{{ i.widthCm }}×{{ i.lengthCm }}×{{ i.heightCm }}</td>
              </ng-container>
              <ng-container matColumnDef="location">
                <th mat-header-cell *matHeaderCellDef>Location</th>
                <td mat-cell *matCellDef="let i">{{ i.location }}</td>
              </ng-container>
              <ng-container matColumnDef="dateAdded">
                <th mat-header-cell *matHeaderCellDef>Date Added</th>
                <td mat-cell *matCellDef="let i">{{ i.dateAdded | date: 'mediumDate' }}</td>
              </ng-container>
              <ng-container matColumnDef="volume">
                <th mat-header-cell *matHeaderCellDef>Volume (m³)</th>
                <td mat-cell *matCellDef="let i">{{ volumeM3(i) | number:'1.3-3' }}</td>
              </ng-container>
              <ng-container matColumnDef="monthlyCost">
                <th mat-header-cell *matHeaderCellDef>Monthly Cost</th>
                <td mat-cell *matCellDef="let i">{{ itemMonthlyCost(i) | currency:'USD' }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let i">
                  <button mat-icon-button (click)="edit(i)" aria-label="Edit item">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="remove(i.id)" aria-label="Delete item">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns;"></tr>
            </table>
            <div *ngIf="items().length === 0" class="empty">No items yet.</div>
          </mat-tab>
          <mat-tab label="Archived">
            <table mat-table [dataSource]="archivedItems()" class="mat-elevation-z1">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let i">{{ i.name }}</td>
              </ng-container>
              <ng-container matColumnDef="barcode">
                <th mat-header-cell *matHeaderCellDef>Barcode</th>
                <td mat-cell *matCellDef="let i">{{ i.barcode || '-' }}</td>
              </ng-container>
              <ng-container matColumnDef="dimensions">
                <th mat-header-cell *matHeaderCellDef>Dimensions (cm)</th>
                <td mat-cell *matCellDef="let i">{{ i.widthCm }}×{{ i.lengthCm }}×{{ i.heightCm }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let i">
                  <button mat-button color="primary" (click)="restore(i.id)">Restore</button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="archivedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: archivedColumns;"></tr>
            </table>
            <div *ngIf="archivedItems().length === 0" class="empty">No archived items.</div>
          </mat-tab>
        </mat-tab-group>
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
     .rate-row { display:flex; align-items:center; gap: 12px; margin-top: 8px; flex-wrap: wrap; }
     .totals { display:flex; gap: 16px; align-items:center; }
     .spacer-divider { margin-inline: 8px; height: 32px; align-self: center; }
     .price-row { display:flex; align-items:center; gap: 12px; }
      @media (min-width: 900px) {
        .grid { grid-template-columns: 1fr; }
        .row { grid-template-columns: repeat(6, 1fr); }
      }`
  ]
})
export class CustomerDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(StorageService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly email = computed(() => String(this.route.snapshot.paramMap.get('email') ?? '').toLowerCase());
  readonly customer = computed(() => this.store.getCustomer(this.email() ?? ''));
  readonly items = computed(() => this.store.itemsFor(this.email() ?? ''));
  readonly archivedItems = computed(() => this.store.archivedItemsFor(this.email() ?? ''));
  readonly ratePerM3 = computed(() => this.customer()?.ratePerM3 ?? 10);

  columns = ['name', 'barcode', 'quantity', 'dimensions', 'location', 'dateAdded', 'volume', 'monthlyCost', 'actions'];
  archivedColumns = ['name', 'barcode', 'dimensions', 'actions'];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    barcode: [''],
    widthCm: [0, Validators.required],
    lengthCm: [0, Validators.required],
    heightCm: [0, Validators.required],
    location: ['', Validators.required],
    dateAdded: [new Date(), Validators.required],
    autoPricing: [true],
    manualMonthlyCost: [0],
  });

  readonly rateForm = this.fb.nonNullable.group({
    ratePerM3: [this.ratePerM3()],
  });

  volumeM3(i: Item): number {
    const one = (Number(i.widthCm) || 0) * (Number(i.lengthCm) || 0) * (Number(i.heightCm) || 0);
    const cm3 = one * (Number(i.quantity) || 0);
    return cm3 / 1_000_000;
  }

  itemMonthlyCost(i: Item): number {
    if (i.pricingMode === 'manual' && typeof i.manualMonthlyCost === 'number') {
      return i.manualMonthlyCost;
    }
    return this.volumeM3(i) * this.ratePerM3();
  }

  totalVolumeM3 = computed(() => this.items().reduce((sum, it) => sum + this.volumeM3(it), 0));
  totalMonthlyCost = computed(() => this.items().reduce((sum, it) => sum + this.itemMonthlyCost(it), 0));

  estimatedNewItemCost() {
    const raw = this.form.getRawValue();
    const volume = ((Number(raw.widthCm) || 0) * (Number(raw.lengthCm) || 0) * (Number(raw.heightCm) || 0) * (Number(raw.quantity) || 0)) / 1_000_000;
    return volume * this.ratePerM3();
  }

  onAddItem() {
    const raw = this.form.getRawValue();
    const date = raw.dateAdded instanceof Date ? raw.dateAdded.toISOString() : String(raw.dateAdded);
    this.store.addItem(this.email(), {
      name: raw.name,
      quantity: Number(raw.quantity),
      barcode: raw.barcode || undefined,
      widthCm: Number(raw.widthCm),
      lengthCm: Number(raw.lengthCm),
      heightCm: Number(raw.heightCm),
      pricingMode: raw.autoPricing ? 'auto' : 'manual',
      manualMonthlyCost: raw.autoPricing ? undefined : Number(raw.manualMonthlyCost || 0),
      location: raw.location,
      dateAdded: date,
    });
    this.form.reset({ name: '', quantity: 1, barcode: '', widthCm: 0, lengthCm: 0, heightCm: 0, location: '', dateAdded: new Date(), autoPricing: true, manualMonthlyCost: 0 });
    this.snack.open('Item added', 'OK', { duration: 2000 });
  }

  remove(id: string) {
    this.store.removeItem(this.email(), id);
    this.snack.open('Item deleted', 'OK', { duration: 2000 });
  }

  edit(item: Item) {
    const ref = this.dialog.open(ItemEditDialogComponent, {
      data: { item, ratePerM3: this.ratePerM3() },
      width: '520px',
    });
    ref.afterClosed().subscribe((updated?: Item) => {
      if (updated) {
        this.store.updateItem(this.email(), updated);
        this.snack.open('Item updated', 'OK', { duration: 2000 });
      }
    });
  }

  restore(id: string) {
    this.store.restoreItem(this.email(), id);
    this.snack.open('Item restored', 'OK', { duration: 2000 });
  }

  saveRate() {
    const val = Number(this.rateForm.controls.ratePerM3.value);
    if (!isNaN(val)) {
      this.store.updateCustomer(this.email(), { ratePerM3: val });
      this.snack.open('Rate updated', 'OK', { duration: 2000 });
    }
  }
}
