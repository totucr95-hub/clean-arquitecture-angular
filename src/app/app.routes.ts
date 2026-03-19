import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'funds',
  },
  {
    path: 'funds',
    loadComponent: () =>
      import('./presentation/features/funds/funds-page.component').then(
        (m) => m.FundsPageComponent,
      ),
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./presentation/features/transactions/transactions-page.component').then(
        (m) => m.TransactionsPageComponent,
      ),
  },
];
