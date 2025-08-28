import { Injectable, computed, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly key = 'storageApp.auth';
  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = sessionStorage.getItem(this.key);
      if (saved === 'true') {
        this._isAuthenticated.set(true);
      }
    }
  }

  readonly isAuthenticated = computed(() => this._isAuthenticated());

  login(email: string, password: string): boolean {
    // Prototype-only: fixed admin credentials
    const ok = email.trim().toLowerCase() === 'admin@storage.local' && password === 'admin';
    this._isAuthenticated.set(ok);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(this.key, String(ok));
    }
    return ok;
  }

  logout(): void {
    this._isAuthenticated.set(false);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.key);
    }
  }
}
