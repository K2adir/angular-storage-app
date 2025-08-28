import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('angular-storage-app');
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected authenticated() {
    return this.auth.isAuthenticated();
  }

  protected logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
