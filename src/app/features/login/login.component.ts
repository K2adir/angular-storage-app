import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="login-wrapper">
      <mat-card appearance="outlined">
        <h2>Admin Login</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" required autocomplete="username" />
            <mat-error *ngIf="form.controls.email.hasError('required') && form.controls.email.touched">Email is required</mat-error>
            <mat-error *ngIf="form.controls.email.hasError('email') && form.controls.email.touched">Enter a valid email</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password" type="password" required autocomplete="current-password" />
            <mat-error *ngIf="form.controls.password.hasError('required') && form.controls.password.touched">Password is required</mat-error>
          </mat-form-field>
          <button mat-flat-button color="primary" class="full" [disabled]="form.invalid">Login</button>
          <div class="hint">Use admin@storage.local / admin</div>
          <div class="error" *ngIf="error()">{{ error() }}</div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [
    `.login-wrapper { display:flex; justify-content:center; margin-top: 48px; }
     mat-card { width: 360px; padding: 16px; }
     .full { width: 100%; }
     h2 { margin: 0 0 8px; }
     .hint { margin-top: 8px; color: rgba(0,0,0,0.6); }
     .error { margin-top: 8px; color: var(--mat-sys-error); }`
  ]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit() {
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    if (this.auth.login(email, password)) {
      this.router.navigateByUrl('/customers');
    } else {
      this.error.set('Invalid credentials');
    }
  }
}
