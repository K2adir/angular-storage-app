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

export interface ItemEditData {
  item: Item;
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
  ],
  template: `
    <h2 mat-dialog-title>Edit Item</h2>
    <form [formGroup]="form" (ngSubmit)="save()" class="content">
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

      <div class="actions">
        <button mat-button type="button" (click)="close()">Cancel</button>
        <button mat-flat-button color="primary" [disabled]="form.invalid">Save</button>
      </div>
    </form>
  `,
  styles: [
    `.content { display:grid; grid-template-columns: 1fr; gap: 12px; padding: 8px 0; }
     .full { width: 100%; }
     .actions { display:flex; justify-content:flex-end; gap: 8px; margin-top: 8px; }`
  ]
})
export class ItemEditDialogComponent {
  private readonly ref = inject(MatDialogRef<ItemEditDialogComponent, Item | undefined>);
  private readonly data = inject<ItemEditData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    name: [this.data.item.name, Validators.required],
    quantity: [this.data.item.quantity, [Validators.required, Validators.min(1)]],
    size: [this.data.item.size, Validators.required],
    location: [this.data.item.location, Validators.required],
    dateAdded: [new Date(this.data.item.dateAdded), Validators.required],
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
      size: raw.size,
      location: raw.location,
      dateAdded: raw.dateAdded instanceof Date ? raw.dateAdded.toISOString() : String(raw.dateAdded),
    };
    this.ref.close(updated);
  }
}

