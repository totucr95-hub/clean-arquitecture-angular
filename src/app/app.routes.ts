import { Routes } from '@angular/router';
import { FundsPageComponent } from './presentation/features/funds/funds-page.component';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'funds',
	},
	{
		path: 'funds',
		component: FundsPageComponent,
	},
];
