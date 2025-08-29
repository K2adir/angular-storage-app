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
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Item } from '../../models/item';
import { ItemEditDialogComponent } from './item-edit-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { ArchiveDialogComponent, ArchiveDialogResult } from './archive-dialog.component';
import { CreateOrderDialogComponent, CreateOrderResult } from './create-order-dialog.component';
import { Order } from '../../models/order';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
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
        <mat-form-field appearance="outline">
          <mat-label>Item Prep (per unit)</mat-label>
          <input matInput type="number" min="0" step="0.01" formControlName="prepCostPerUnit" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Fulfillment (per unit)</mat-label>
          <input matInput type="number" min="0" step="0.01" formControlName="fulfillmentCostPerUnit" />
        </mat-form-field>
        <button mat-stroked-button color="primary">Save</button>
        <mat-divider class="spacer-divider"></mat-divider>
        <mat-chip-set>
          <mat-chip color="primary" selected>Auto Items: {{ itemsAuto().length }}</mat-chip>
          <mat-chip color="primary" selected>Billed m³: {{ billedUnitsAuto() }}</mat-chip>
          <mat-chip color="accent" selected>Storage Monthly: {{ totalStorageCost() | currency:'USD':'symbol' }}</mat-chip>
          <mat-chip color="accent" selected>Prep: {{ totalPrepCost() | currency:'USD':'symbol' }}</mat-chip>
          <mat-chip color="accent" selected>Fulfillment: {{ totalFulfillmentCost() | currency:'USD':'symbol' }}</mat-chip>
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

            <div class="full price-row">
              <mat-slide-toggle formControlName="prepAuto">Item Prep (auto)</mat-slide-toggle>
              <ng-container *ngIf="form.controls.prepAuto.value; else manualPrep">
                <span class="price-hint">Auto: {{ (prepDefault() * (form.controls.quantity.value || 0)) | currency:'USD' }}</span>
              </ng-container>
              <ng-template #manualPrep>
                <mat-form-field appearance="outline">
                  <mat-label>Prep (per unit)</mat-label>
                  <input matInput type="number" min="0" step="0.01" formControlName="manualPrepCost" />
                </mat-form-field>
              </ng-template>
            </div>

            <div class="full price-row">
              <mat-slide-toggle formControlName="fulfillAuto">Fulfillment (auto)</mat-slide-toggle>
              <ng-container *ngIf="form.controls.fulfillAuto.value; else manualFulfill">
                <span class="price-hint">Auto: {{ (fulfillmentDefault() * (form.controls.quantity.value || 0)) | currency:'USD' }}</span>
              </ng-container>
              <ng-template #manualFulfill>
                <mat-form-field appearance="outline">
                  <mat-label>Fulfillment (per unit)</mat-label>
                  <input matInput type="number" min="0" step="0.01" formControlName="manualFulfillmentCost" />
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
            <div class="table-wrap">
            <table mat-table [dataSource]="items()" class="mat-elevation-z1 wide-table">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let i">{{ i.name }}</td>
            <td mat-footer-cell *matFooterCellDef>Total</td>
          </ng-container>
          <ng-container matColumnDef="barcode">
            <th mat-header-cell *matHeaderCellDef>Barcode</th>
            <td mat-cell *matCellDef="let i">{{ i.barcode || '-' }}</td>
            <td mat-footer-cell *matFooterCellDef></td>
          </ng-container>
          <ng-container matColumnDef="quantity">
            <th mat-header-cell *matHeaderCellDef>Qty</th>
            <td mat-cell *matCellDef="let i">{{ i.quantity }}</td>
            <td mat-footer-cell *matFooterCellDef>{{ totalQuantity() }}</td>
          </ng-container>
          <ng-container matColumnDef="dimensions">
            <th mat-header-cell *matHeaderCellDef>Dimensions (cm)</th>
            <td mat-cell *matCellDef="let i">{{ i.widthCm }}×{{ i.lengthCm }}×{{ i.heightCm }}</td>
            <td mat-footer-cell *matFooterCellDef></td>
          </ng-container>
          <ng-container matColumnDef="location">
            <th mat-header-cell *matHeaderCellDef>Location</th>
            <td mat-cell *matCellDef="let i">{{ i.location }}</td>
            <td mat-footer-cell *matFooterCellDef></td>
          </ng-container>
          <ng-container matColumnDef="dateAdded">
            <th mat-header-cell *matHeaderCellDef>Date Added</th>
            <td mat-cell *matCellDef="let i">{{ i.dateAdded | date: 'mediumDate' }}</td>
            <td mat-footer-cell *matFooterCellDef></td>
          </ng-container>
          <ng-container matColumnDef="volume">
            <th mat-header-cell *matHeaderCellDef>Volume (m³)</th>
            <td mat-cell *matCellDef="let i">{{ volumeM3(i) | number:'1.3-3' }}</td>
            <td mat-footer-cell *matFooterCellDef>{{ totalVolumeAllM3() | number:'1.3-3' }}</td>
          </ng-container>
          <ng-container matColumnDef="prepUnit">
            <th mat-header-cell *matHeaderCellDef>Prep/unit</th>
            <td mat-cell *matCellDef="let i">{{ prepUnitCost(i) | currency:'USD' }}</td>
            <td mat-footer-cell *matFooterCellDef>{{ totalPrepCost() | currency:'USD' }}</td>
          </ng-container>
          <ng-container matColumnDef="fulfillmentUnit">
            <th mat-header-cell *matHeaderCellDef>Fulfillment/unit</th>
            <td mat-cell *matCellDef="let i">{{ fulfillUnitCost(i) | currency:'USD' }}</td>
            <td mat-footer-cell *matFooterCellDef>{{ totalFulfillmentCost() | currency:'USD' }}</td>
          </ng-container>
          <ng-container matColumnDef="monthlyCost">
            <th mat-header-cell *matHeaderCellDef>Monthly Cost</th>
            <td mat-cell *matCellDef="let i">{{ storageCost(i) | currency:'USD' }}</td>
            <td mat-footer-cell *matFooterCellDef>{{ totalStorageCost() | currency:'USD' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let i">
                  <button mat-icon-button (click)="edit(i)" aria-label="Edit item">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="archive(i)" aria-label="Archive item">
                    <mat-icon>delete</mat-icon>
                  </button>
                  <button mat-icon-button color="primary" (click)="createOrder(i)" aria-label="Create order">
                    <mat-icon>shopping_cart_checkout</mat-icon>
                  </button>
            </td>
            <td mat-footer-cell *matFooterCellDef class="footer-summary">
              {{ totalMonthlyCost() | currency:'USD' }}
            </td>
          </ng-container>

              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns;"></tr>
              <tr mat-footer-row *matFooterRowDef="columns"></tr>
            </table>
            </div>
            <div *ngIf="items().length === 0" class="empty">No items yet.</div>
          </mat-tab>
          <mat-tab label="Archived">
            <div class="table-wrap">
            <table mat-table [dataSource]="archivedItems()" class="mat-elevation-z1 wide-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let r">{{ r.item.name }}</td>
              </ng-container>
              <ng-container matColumnDef="barcode">
                <th mat-header-cell *matHeaderCellDef>Barcode</th>
                <td mat-cell *matCellDef="let r">{{ r.item.barcode || '-' }}</td>
              </ng-container>
              <ng-container matColumnDef="dimensions">
                <th mat-header-cell *matHeaderCellDef>Dimensions (cm)</th>
                <td mat-cell *matCellDef="let r">{{ r.item.widthCm }}×{{ r.item.lengthCm }}×{{ r.item.heightCm }}</td>
              </ng-container>
              <ng-container matColumnDef="reason">
                <th mat-header-cell *matHeaderCellDef>Reason</th>
                <td mat-cell *matCellDef="let r">{{ r.reason }}</td>
              </ng-container>
              <ng-container matColumnDef="notes">
                <th mat-header-cell *matHeaderCellDef>Notes</th>
                <td mat-cell *matCellDef="let r">{{ r.notes || '-' }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let r">
                  <button mat-button color="primary" (click)="restore(r.item.id)">Restore</button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="archivedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: archivedColumns;"></tr>
            </table>
            </div>
            <div *ngIf="archivedItems().length === 0" class="empty">No archived items.</div>
          </mat-tab>
          <mat-tab label="Orders">
            <div class="table-wrap">
              <table mat-table [dataSource]="orders()" class="mat-elevation-z1 wide-table">
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let o">{{ o.date | date: 'mediumDate' }}</td>
                  <td mat-footer-cell *matFooterCellDef></td>
                </ng-container>
                <ng-container matColumnDef="item">
                  <th mat-header-cell *matHeaderCellDef>Item</th>
                  <td mat-cell *matCellDef="let o">{{ o.itemName }}</td>
                  <td mat-footer-cell *matFooterCellDef>Total</td>
                </ng-container>
                <ng-container matColumnDef="qty">
                  <th mat-header-cell *matHeaderCellDef>Qty</th>
                  <td mat-cell *matCellDef="let o">{{ o.quantity }}</td>
                  <td mat-footer-cell *matFooterCellDef>{{ totalOrderQuantity() }}</td>
                </ng-container>
                <ng-container matColumnDef="material">
                  <th mat-header-cell *matHeaderCellDef>Material/unit</th>
                  <td mat-cell *matCellDef="let o">{{ o.materialCostPerFulfillment | currency:'USD' }}</td>
                  <td mat-footer-cell *matFooterCellDef></td>
                </ng-container>
                <ng-container matColumnDef="materialTotal">
                  <th mat-header-cell *matHeaderCellDef>Material total</th>
                  <td mat-cell *matCellDef="let o">{{ orderMaterialTotal(o) | currency:'USD' }}</td>
                  <td mat-footer-cell *matFooterCellDef>{{ totalOrderMaterial() | currency:'USD' }}</td>
                </ng-container>
                <ng-container matColumnDef="prepUnit">
                  <th mat-header-cell *matHeaderCellDef>Prep/unit</th>
                  <td mat-cell *matCellDef="let o">{{ orderPrepUnit(o) | currency:'USD' }}</td>
                  <td mat-footer-cell *matFooterCellDef>{{ totalOrderPrep() | currency:'USD' }}</td>
                </ng-container>
                <ng-container matColumnDef="fulfillmentUnit">
                  <th mat-header-cell *matHeaderCellDef>Fulfillment/unit</th>
                  <td mat-cell *matCellDef="let o">{{ orderFulfillmentUnit(o) | currency:'USD' }}</td>
                  <td mat-footer-cell *matFooterCellDef>{{ totalOrderFulfillment() | currency:'USD' }}</td>
                </ng-container>
                <ng-container matColumnDef="orderTotal">
                  <th mat-header-cell *matHeaderCellDef>Order total</th>
                  <td mat-cell *matCellDef="let o">{{ orderGrandTotal(o) | currency:'USD' }}</td>
                  <td mat-footer-cell *matFooterCellDef>{{ totalOrdersGrand() | currency:'USD' }}</td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let o">
                    <mat-select [(ngModel)]="o.status" (selectionChange)="updateOrderStatus(o)">
                      <mat-option value="Preparing">Preparing</mat-option>
                      <mat-option value="Shipped">Shipped</mat-option>
                      <mat-option value="Delivered">Delivered</mat-option>
                      <mat-option value="Cancelled">Cancelled</mat-option>
                    </mat-select>
                  </td>
                  <td mat-footer-cell *matFooterCellDef></td>
                </ng-container>
                <ng-container matColumnDef="tracking">
                  <th mat-header-cell *matHeaderCellDef>Tracking</th>
                  <td mat-cell *matCellDef="let o">{{ o.trackingNumber || '-' }}</td>
                  <td mat-footer-cell *matFooterCellDef></td>
                </ng-container>
                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef>Email</th>
                  <td mat-cell *matCellDef="let o">
                    <a [href]="mailtoHref(o)" target="_blank" rel="noopener">Compose</a>
                  </td>
                  <td mat-footer-cell *matFooterCellDef></td>
                </ng-container>
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let o">
                    <button mat-button color="warn" (click)="cancelOrder(o)" [disabled]="o.status==='Cancelled'">Cancel</button>
                  </td>
                  <td mat-footer-cell *matFooterCellDef></td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="orderColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: orderColumns;"></tr>
                <tr mat-footer-row *matFooterRowDef="orderColumns"></tr>
              </table>
            </div>
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
     .wide-table { min-width: 1200px; }
     .table-wrap { width: 100%; overflow-x: auto; }
     .empty { padding: 12px; color: rgba(0,0,0,0.6); }
     .rate-row { display:flex; align-items:center; gap: 12px; margin-top: 8px; flex-wrap: wrap; }
     .totals { display:flex; gap: 16px; align-items:center; }
     .spacer-divider { margin-inline: 8px; height: 32px; align-self: center; }
     .price-row { display:flex; align-items:center; gap: 12px; }
     .footer-summary { font-weight: 600; white-space: nowrap; }
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
  readonly prepDefault = computed(() => this.customer()?.prepCostPerUnit ?? 0);
  readonly fulfillmentDefault = computed(() => this.customer()?.fulfillmentCostPerUnit ?? 0);

  columns = ['name', 'barcode', 'quantity', 'dimensions', 'location', 'dateAdded', 'volume', 'prepUnit', 'fulfillmentUnit', 'monthlyCost', 'actions'];
  archivedColumns = ['name', 'barcode', 'dimensions', 'reason', 'notes', 'actions'];
  orderColumns = ['date','item','qty','material','materialTotal','prepUnit','fulfillmentUnit','orderTotal','status','tracking','email','actions'];

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
    // Prep & Fulfillment controls
    prepAuto: [true],
    manualPrepCost: [0],
    fulfillAuto: [true],
    manualFulfillmentCost: [0],
  });

  readonly rateForm = this.fb.nonNullable.group({
    ratePerM3: [this.ratePerM3()],
    prepCostPerUnit: [this.prepDefault()],
    fulfillmentCostPerUnit: [this.fulfillmentDefault()],
  });

  volumeM3(i: Item): number {
    const one = (Number(i.widthCm) || 0) * (Number(i.lengthCm) || 0) * (Number(i.heightCm) || 0);
    const cm3 = one * (Number(i.quantity) || 0);
    return cm3 / 1_000_000;
  }

  // Extras helpers
  prepUnitCost(i: Item): number {
    return i.prepPricingMode === 'manual' ? (Number(i.manualPrepCost) || 0) : this.prepDefault();
  }
  fulfillUnitCost(i: Item): number {
    return i.fulfillmentPricingMode === 'manual' ? (Number(i.manualFulfillmentCost) || 0) : this.fulfillmentDefault();
  }
  prepCost(i: Item): number { return (Number(i.quantity) || 0) * this.prepUnitCost(i); }
  fulfillmentCost(i: Item): number { return (Number(i.quantity) || 0) * this.fulfillUnitCost(i); }

  storageCost(i: Item): number {
    const storage = (i.pricingMode === 'manual' && typeof i.manualMonthlyCost === 'number')
      ? Number(i.manualMonthlyCost)
      : this.itemBilledUnits(i) * this.ratePerM3();
    return storage;
  }

  // Auto-priced items aggregation (per-item minimum 1 m³, ceil per item)
  itemsAuto = computed(() => this.items().filter(i => i.pricingMode !== 'manual'));
  autoVolumeM3 = computed(() => this.itemsAuto().reduce((sum, it) => sum + this.volumeM3(it), 0));
  totalVolumeAllM3 = computed(() => this.items().reduce((sum, it) => sum + this.volumeM3(it), 0));
  itemBilledUnits(i: Item): number {
    const units = Math.ceil(this.volumeM3(i));
    return Math.max(1, units);
  }
  billedUnitsAuto = computed(() => this.itemsAuto().reduce((sum, it) => sum + this.itemBilledUnits(it), 0));
  totalAutoCost = computed(() => this.billedUnitsAuto() * this.ratePerM3());

  // Manual-priced items sum (storage-only, unused in final total)
  totalManualCost = computed(() => this.items().filter(i => i.pricingMode === 'manual').reduce((sum, it) => sum + (Number(it.manualMonthlyCost) || 0), 0));

  // Storage-only total (what shows under "Monthly Cost")
  totalStorageCost = computed(() => this.items().reduce((sum, it) => sum + ((it.pricingMode === 'manual' && typeof it.manualMonthlyCost === 'number') ? Number(it.manualMonthlyCost) : this.itemBilledUnits(it) * this.ratePerM3()), 0));
  // Extras totals
  totalPrepCost = computed(() => this.items().reduce((sum, it) => sum + this.prepCost(it), 0));
  totalFulfillmentCost = computed(() => this.items().reduce((sum, it) => sum + this.fulfillmentCost(it), 0));
  // Grand total if needed elsewhere
  totalMonthlyCost = computed(() => this.totalStorageCost() + this.totalPrepCost() + this.totalFulfillmentCost());
  totalQuantity = computed(() => this.items().reduce((sum, it) => sum + (Number(it.quantity) || 0), 0));

  estimatedNewItemCost() {
    const raw = this.form.getRawValue();
    if (!raw.autoPricing) return Number(raw.manualMonthlyCost || 0);
    const addedVol = ((Number(raw.widthCm) || 0) * (Number(raw.lengthCm) || 0) * (Number(raw.heightCm) || 0) * (Number(raw.quantity) || 0)) / 1_000_000;
    const units = Math.max(1, Math.ceil(addedVol));
    const storage = units * this.ratePerM3();
    const prep = (raw.prepAuto ? this.prepDefault() : Number(raw.manualPrepCost || 0)) * Number(raw.quantity || 0);
    const fulfill = (raw.fulfillAuto ? this.fulfillmentDefault() : Number(raw.manualFulfillmentCost || 0)) * Number(raw.quantity || 0);
    return storage + prep + fulfill;
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
      prepPricingMode: raw.prepAuto ? 'auto' : 'manual',
      manualPrepCost: raw.prepAuto ? undefined : Number(raw.manualPrepCost || 0),
      fulfillmentPricingMode: raw.fulfillAuto ? 'auto' : 'manual',
      manualFulfillmentCost: raw.fulfillAuto ? undefined : Number(raw.manualFulfillmentCost || 0),
      location: raw.location,
      dateAdded: date,
    });
    this.form.reset({ name: '', quantity: 1, barcode: '', widthCm: 0, lengthCm: 0, heightCm: 0, location: '', dateAdded: new Date(), autoPricing: true, manualMonthlyCost: 0, prepAuto: true, manualPrepCost: 0, fulfillAuto: true, manualFulfillmentCost: 0 });
    this.snack.open('Item added', 'OK', { duration: 2000 });
  }

  // Orders
  orders = computed(() => this.store.ordersFor(this.email() ?? ''));

  // Order helpers and totals (computed from items' per-unit settings or customer defaults)
  totalOrderQuantity = () => this.orders().reduce((s, o) => s + (Number(o.quantity) || 0), 0);
  orderMaterialTotal = (o: Order) => (Number(o.quantity) || 0) * (Number(o.materialCostPerFulfillment) || 0);
  orderPrepUnit = (o: Order) => this.lookupItemPrepUnit(o);
  orderFulfillmentUnit = (o: Order) => this.lookupItemFulfillmentUnit(o);
  private lookupItemPrepUnit(o: Order): number {
    const it = this.items().find(i => i.id === o.itemId);
    if (!it) return this.prepDefault();
    return it.prepPricingMode === 'manual' ? (Number(it.manualPrepCost) || 0) : this.prepDefault();
  }
  private lookupItemFulfillmentUnit(o: Order): number {
    const it = this.items().find(i => i.id === o.itemId);
    if (!it) return this.fulfillmentDefault();
    return it.fulfillmentPricingMode === 'manual' ? (Number(it.manualFulfillmentCost) || 0) : this.fulfillmentDefault();
  }
  orderGrandTotal = (o: Order) => {
    const q = Number(o.quantity) || 0;
    return q * ((Number(o.materialCostPerFulfillment) || 0) + this.orderPrepUnit(o) + this.orderFulfillmentUnit(o));
  };
  totalOrderMaterial = () => this.orders().reduce((s, o) => s + this.orderMaterialTotal(o), 0);
  totalOrderPrep = () => this.orders().reduce((s, o) => s + ((Number(o.quantity)||0) * this.orderPrepUnit(o)), 0);
  totalOrderFulfillment = () => this.orders().reduce((s, o) => s + ((Number(o.quantity)||0) * this.orderFulfillmentUnit(o)), 0);
  totalOrdersGrand = () => this.orders().reduce((s, o) => s + this.orderGrandTotal(o), 0);

  createOrder(item: Item) {
    const ref = this.dialog.open(CreateOrderDialogComponent, {
      data: { itemId: item.id, itemName: item.name, maxQty: Number(item.quantity) || 0, customerEmail: this.customer()?.email ?? '' },
      width: '560px'
    });
    ref.afterClosed().subscribe((res?: CreateOrderResult) => {
      if (res) {
        const out = this.store.createOrder(this.email(), { ...res, itemName: item.name });
        if (!out.ok) {
          this.snack.open(out.error || 'Failed to create order', 'OK', { duration: 2500 });
        } else {
          this.snack.open('Order created', 'OK', { duration: 2000 });
        }
      }
    });
  }

  cancelOrder(o: Order) {
    this.store.cancelOrder(this.email(), o.id);
    this.snack.open('Order cancelled; stock restored', 'OK', { duration: 2000 });
  }

  updateOrderStatus(o: Order) {
    this.store.updateOrder(this.email(), o.id, { status: o.status });
    this.snack.open('Order updated', 'OK', { duration: 1500 });
  }

  mailtoHref(o: Order): string {
    const subject = encodeURIComponent(o.emailSubject || '');
    const body = encodeURIComponent(o.emailBody || '');
    return `mailto:${encodeURIComponent(this.customer()?.email ?? '')}?subject=${subject}&body=${body}`;
  }

  archive(item: Item) {
    const ref = this.dialog.open(ArchiveDialogComponent, { data: { name: item.name } });
    ref.afterClosed().subscribe((res?: ArchiveDialogResult) => {
      if (res) {
        this.store.archiveItem(this.email(), item.id, { reason: res.reason, notes: res.notes });
        this.snack.open('Item archived', 'OK', { duration: 2000 });
      }
    });
  }

  edit(item: Item) {
    const ref = this.dialog.open(ItemEditDialogComponent, {
      data: { item, ratePerM3: this.ratePerM3(), prepDefault: this.prepDefault(), fulfillmentDefault: this.fulfillmentDefault() },
      width: '560px',
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
    const rate = Number(this.rateForm.controls.ratePerM3.value);
    const prep = Number(this.rateForm.controls.prepCostPerUnit.value);
    const fulfillment = Number(this.rateForm.controls.fulfillmentCostPerUnit.value);
    const patch: any = {};
    if (!isNaN(rate)) patch.ratePerM3 = rate;
    if (!isNaN(prep)) patch.prepCostPerUnit = prep;
    if (!isNaN(fulfillment)) patch.fulfillmentCostPerUnit = fulfillment;
    this.store.updateCustomer(this.email(), patch);
    this.snack.open('Rates updated', 'OK', { duration: 2000 });
  }
}
