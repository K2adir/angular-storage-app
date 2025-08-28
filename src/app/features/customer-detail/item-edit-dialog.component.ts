import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { Item } from '../../models/item';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

export interface ItemEditData {
  item: Item;
  ratePerM3: number;
}

@Component({
  selector: 'app-item-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>Edit Item</h2>
    <form [formGroup]="form" (ngSubmit)="save()" class="content">
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
      </mat-form-field>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Length (cm)</mat-label>
        <input matInput type="number" min="0" step="0.01" formControlName="lengthCm" required />
      </mat-form-field>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Height (cm)</mat-label>
        <input matInput type="number" min="0" step="0.01" formControlName="heightCm" required />
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
          <span class="price-hint">Auto: {{ computedCost() | currency:'USD' }}</span>
        </ng-container>
        <ng-template #manualPrice>
          <mat-form-field appearance="outline">
            <mat-label>Monthly Cost</mat-label>
            <input matInput type="number" min="0" step="0.01" formControlName="manualMonthlyCost" />
          </mat-form-field>
        </ng-template>
      </div>

      <div class="actions">
        <button mat-button type="button" (click)="close()">Cancel</button>
        <button mat-flat-button color="primary" [disabled]="form.invalid">Save</button>
      </div>
    </form>
  `,
  styles: [
    `.content { display:grid; grid-template-columns: 1fr; gap: 12px; padding: 8px 0; }
     .full { width: 100%; }
     .actions { display:flex; justify-content:flex-end; gap: 8px; margin-top: 8px; }
     .price-row { display:flex; align-items:center; gap: 12px; }
    `
  ]
})
export class ItemEditDialogComponent {
  private readonly ref = inject(MatDialogRef<ItemEditDialogComponent, Item | undefined>);
  private readonly data = inject<ItemEditData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    name: [this.data.item.name, Validators.required],
    quantity: [this.data.item.quantity, [Validators.required, Validators.min(1)]],
    barcode: [this.data.item.barcode ?? ''],
    widthCm: [this.data.item.widthCm, Validators.required],
    lengthCm: [this.data.item.lengthCm, Validators.required],
    heightCm: [this.data.item.heightCm, Validators.required],
    location: [this.data.item.location, Validators.required],
    dateAdded: [new Date(this.data.item.dateAdded), Validators.required],
    autoPricing: [this.data.item.pricingMode !== 'manual'],
    manualMonthlyCost: [this.data.item.manualMonthlyCost ?? 0],
  });

  close() {
    this.ref.close(undefined);
  }

  save() {
    const raw = this.form.getRawValue();
    const updated: Item = {
      ...this.data.item,
      name: raw.name,
      quantity: Number(raw.quantity),
      barcode: raw.barcode || undefined,
      widthCm: Number(raw.widthCm),
      lengthCm: Number(raw.lengthCm),
      heightCm: Number(raw.heightCm),
      pricingMode: raw.autoPricing ? 'auto' : 'manual',
      manualMonthlyCost: raw.autoPricing ? undefined : Number(raw.manualMonthlyCost || 0),
      location: raw.location,
      dateAdded: raw.dateAdded instanceof Date ? raw.dateAdded.toISOString() : String(raw.dateAdded),
    };
    this.ref.close(updated);
  }

  private volumeM3(): number {
    const raw = this.form.getRawValue();
    const cm3 = (Number(raw.widthCm) || 0) * (Number(raw.lengthCm) || 0) * (Number(raw.heightCm) || 0) * (Number(raw.quantity) || 0);
    return cm3 / 1_000_000;
  }

  computedCost(): number {
    const units = Math.max(1, Math.ceil(this.volumeM3()));
    return units * this.data.ratePerM3;
  }
}
