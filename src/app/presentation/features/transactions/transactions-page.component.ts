import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GetTransactionsUseCase } from '../../../application/use-cases/transactions/get-transactions.use-case';
import { GetFundsUseCase } from '../../../application/use-cases/funds/get-funds.use-case';
import { Transaction } from '../../../dominio/entities/transaction.entity';
import { Fund } from '../../../dominio/entities/fund.entity';

@Component({
  selector: 'app-transactions-page',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  template: `
    <section class="transactions-page">
      <header class="top-bar">
        <h1>Historial de transacciones</h1>
        <nav class="nav-links">
          <a routerLink="/funds">Fondos</a>
          <a routerLink="/transactions">Historial</a>
        </nav>
      </header>

      @if (transactions().length === 0) {
        <p>Aun no hay transacciones registradas.</p>
      }

      @if (transactions().length > 0) {
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Fondo</th>
              <th>Monto</th>
              <th>Notificacion</th>
            </tr>
          </thead>
          <tbody>
            @for (transaction of transactions(); track transaction.id) {
              <tr>
                <td>{{ transaction.date | date: 'medium' }}</td>
                <td>{{ transaction.type }}</td>
                <td>{{ getFundName(transaction.fundId) }}</td>
                <td>{{ transaction.amount | currency: 'COP' : 'symbol' : '1.0-0' }}</td>
                <td>{{ transaction.notificationMethod }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </section>
  `,
  styles: [
    `
      .transactions-page {
        max-width: 64rem;
        margin: 2rem auto;
        padding: 1rem;
      }

      .top-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
      }

      .nav-links {
        display: flex;
        gap: 0.75rem;
      }

      .nav-links a {
        text-decoration: none;
        font-weight: 600;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
      }

      th,
      td {
        border-bottom: 1px solid #d9d9d9;
        text-align: left;
        padding: 0.75rem 0.5rem;
      }

      th {
        font-size: 0.875rem;
      }
    `,
  ],
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
