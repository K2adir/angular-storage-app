import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { CustomersComponent } from './features/customers/customers.component';
import { CustomerDetailComponent } from './features/customer-detail/customer-detail.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', pathMatch: 'full', redirectTo: 'customers' },
  { path: 'customers', canActivate: [authGuard], component: CustomersComponent },
  { path: 'customers/:email', canActivate: [authGuard], component: CustomerDetailComponent },
  { path: '**', redirectTo: 'customers' },
];
