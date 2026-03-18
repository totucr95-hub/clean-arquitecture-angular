import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GetTransactionsUseCase } from '../../../application/use-cases/transactions/get-transactions.use-case';
import { GetFundsUseCase } from '../../../application/use-cases/funds/get-funds.use-case';
import { Transaction } from '../../../dominio/entities/transaction.entity';
import { Fund } from '../../../dominio/entities/fund.entity';

@Component({
  selector: 'app-transactions-page',
  imports: [CurrencyPipe, DatePipe, RouterLink, RouterLinkActive],
  templateUrl: './transactions-page.component.html',
  styleUrl: './transactions-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly getTransactionsUseCase = inject(GetTransactionsUseCase);
  private readonly getFundsUseCase = inject(GetFundsUseCase);

  protected readonly transactions = signal<Transaction[]>([]);
  private readonly funds = signal<Fund[]>([]);

  protected readonly fundNameById = computed<Record<number, string>>(() => {
    return this.funds().reduce<Record<number, string>>((acc, fund) => {
      acc[fund.id] = fund.name;
      return acc;
    }, {});
  });

  constructor() {
    this.getTransactionsUseCase
      .execute()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((transactions) => this.transactions.set([...transactions].reverse()));

    this.getFundsUseCase
      .execute()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((funds) => this.funds.set(funds));
  }

  protected getFundName(fundId: number): string {
    return this.fundNameById()[fundId] || `Fondo #${fundId}`;
  }
}
