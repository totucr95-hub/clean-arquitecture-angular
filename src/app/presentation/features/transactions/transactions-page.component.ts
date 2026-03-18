import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TransactionsPageFacade } from './transactions-page.facade';

@Component({
  selector: 'app-transactions-page',
  imports: [CurrencyPipe, DatePipe, RouterLink, RouterLinkActive],
  providers: [TransactionsPageFacade],
  templateUrl: './transactions-page.component.html',
  styleUrl: './transactions-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsPageComponent {
  private readonly facade = inject(TransactionsPageFacade);

  protected readonly transactions = this.facade.transactions;
  protected readonly fundNameById = this.facade.fundNameById;

  constructor() {
    this.facade.loadInitialData();
  }

  protected getFundName(fundId: number): string {
    return this.facade.getFundName(fundId);
  }
}
