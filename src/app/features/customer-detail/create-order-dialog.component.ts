import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

export interface CreateOrderData {
  itemId: string;
  itemName: string;
  maxQty: number;
  customerEmail: string;
}

export interface CreateOrderResult {
  itemId: string;
  quantity: number;
  date: string; // ISO
  materialCostPerFulfillment: number;
  status: 'Preparing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingNumber?: string;
  emailSubject?: string;
  emailBody?: string;
}

@Component({
  selector: 'app-create-order-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>Create Order</h2>
    <div mat-dialog-content>
      <p>Item: <strong>{{ data.itemName }}</strong></p>
      <form [formGroup]="form" class="content">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Quantity</mat-label>
          <input matInput type="number" min="1" [max]="data.maxQty" formControlName="quantity" required />
          <div class="hint">Available: {{ data.maxQty }}</div>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="date" required />
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Material cost per fulfillment</mat-label>
          <input matInput type="number" min="0" step="0.01" formControlName="materialCostPerFulfillment" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="Preparing">Preparing</mat-option>
            <mat-option value="Shipped">Shipped</mat-option>
            <mat-option value="Delivered">Delivered</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Tracking number</mat-label>
          <input matInput formControlName="trackingNumber" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Email subject</mat-label>
          <input matInput formControlName="emailSubject" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Email note/body</mat-label>
          <textarea matInput rows="4" formControlName="emailBody"></textarea>
        </mat-form-field>

        <a [href]="mailtoHref()" target="_blank" rel="noopener" class="mailto">Open email client</a>
      </form>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="invalid()" (click)="save()">Create</button>
    </div>
  `,
  styles: [
    `.content { display:grid; grid-template-columns: 1fr; gap: 12px; margin-top: 8px; }
     .full { width: 100%; }
     .hint { font-size: 12px; opacity: .7; }
     .mailto { font-size: 12px; text-decoration: underline; }
    `
  ]
})
export class CreateOrderDialogComponent {
  readonly data = inject<CreateOrderData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<CreateOrderDialogComponent, CreateOrderResult | undefined>);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    quantity: [1, [Validators.required, Validators.min(1)]],
    date: [new Date(), Validators.required],
    materialCostPerFulfillment: [0],
    status: ['Preparing' as const, Validators.required],
    trackingNumber: [''],
    emailSubject: [''],
    emailBody: [''],
  });

  invalid() {
    const q = Number(this.form.controls.quantity.value || 0);
    return this.form.invalid || q < 1 || q > this.data.maxQty;
  }

  mailtoHref(): string {
    const subject = encodeURIComponent(this.form.controls.emailSubject.value || '');
    const body = encodeURIComponent(this.form.controls.emailBody.value || '');
    return `mailto:${encodeURIComponent(this.data.customerEmail)}?subject=${subject}&body=${body}`;
  }

  close() { this.ref.close(undefined); }

  save() {
    const v = this.form.getRawValue();
    this.ref.close({
      itemId: this.data.itemId,
      quantity: Number(v.quantity) || 0,
      date: v.date instanceof Date ? v.date.toISOString() : String(v.date),
      materialCostPerFulfillment: Number(v.materialCostPerFulfillment) || 0,
      status: v.status,
      trackingNumber: v.trackingNumber || undefined,
      emailSubject: v.emailSubject || undefined,
      emailBody: v.emailBody || undefined,
    });
  }
}

