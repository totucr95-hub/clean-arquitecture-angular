import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GetFundsUseCase } from '../../../application/use-cases/funds/get-funds.use-case';
import { GetTransactionsUseCase } from '../../../application/use-cases/transactions/get-transactions.use-case';
import { Fund } from '../../../dominio/entities/fund.entity';
import { Transaction } from '../../../dominio/entities/transaction.entity';

@Injectable()
export class TransactionsPageFacade {
  private readonly destroyRef = inject(DestroyRef);
  private readonly getTransactionsUseCase = inject(GetTransactionsUseCase);
  private readonly getFundsUseCase = inject(GetFundsUseCase);

  readonly transactions = signal<Transaction[]>([]);
  private readonly funds = signal<Fund[]>([]);

  readonly fundNameById = computed<Record<number, string>>(() => {
    return this.funds().reduce<Record<number, string>>((acc, fund) => {
      acc[fund.id] = fund.name;
      return acc;
    }, {});
  });

  loadInitialData(): void {
    this.getTransactionsUseCase
      .execute()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((transactions) => this.transactions.set([...transactions].reverse()));

    this.getFundsUseCase
      .execute()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((funds) => this.funds.set(funds));
  }

  getFundName(fundId: number): string {
    return this.fundNameById()[fundId] || `Fondo #${fundId}`;
  }
}
