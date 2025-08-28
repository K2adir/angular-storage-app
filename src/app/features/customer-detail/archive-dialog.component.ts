import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface ArchiveDialogData {
  name: string;
}

export interface ArchiveDialogResult {
  reason: string;
  notes?: string;
}

@Component({
  selector: 'app-archive-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Archive Item</h2>
    <div mat-dialog-content>
      <p>Why are you archiving "{{ data.name }}"?</p>
      <form [formGroup]="form" class="content">
        <mat-radio-group formControlName="reason">
          <mat-radio-button value="Shipped">Shipped</mat-radio-button>
          <mat-radio-button value="Removed">Removed</mat-radio-button>
          <mat-radio-button value="Damaged">Damaged</mat-radio-button>
          <mat-radio-button value="Other">Other</mat-radio-button>
        </mat-radio-group>

        <mat-form-field appearance="outline" class="full" *ngIf="isOther()">
          <mat-label>Other reason</mat-label>
          <input matInput formControlName="otherReason" required />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Notes</mat-label>
          <textarea matInput rows="4" formControlName="notes" placeholder="Optional notes"></textarea>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="invalid()" (click)="save()">Archive</button>
    </div>
  `,
  styles: [
    `.content { display:grid; grid-template-columns: 1fr; gap: 12px; margin-top: 8px; }
     .full { width: 100%; }
     mat-radio-group { display:flex; flex-direction: column; gap: 4px; }
    `
  ]
})
export class ArchiveDialogComponent {
  private readonly ref = inject(MatDialogRef<ArchiveDialogComponent, ArchiveDialogResult | undefined>);
  readonly data = inject<ArchiveDialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    reason: ['Shipped', Validators.required],
    otherReason: [''],
    notes: [''],
  });

  isOther() {
    return this.form.controls.reason.value === 'Other';
  }

  invalid() {
    return this.form.invalid || (this.isOther() && !this.form.controls.otherReason.value?.trim());
  }

  close() { this.ref.close(undefined); }

  save() {
    const { reason, otherReason, notes } = this.form.getRawValue();
    const finalReason = reason === 'Other' ? (otherReason?.trim() || 'Other') : reason;
    this.ref.close({ reason: finalReason, notes: notes?.trim() || undefined });
  }
}

