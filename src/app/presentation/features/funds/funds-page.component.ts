import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { GetFundsUseCase } from '../../../application/use-cases/funds/get-funds.use-case';
import { Fund } from '../../../dominio/entities/fund.entity';

@Component({
  selector: 'app-funds-page',
  imports: [CurrencyPipe],
  template: `
    <section class="funds-page">
      <h1>Fondos disponibles</h1>

      @if (loading()) {
        <p>Cargando fondos...</p>
      }

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }

      @if (!loading() && !error()) {
        <ul class="fund-list">
          @for (fund of funds(); track fund.id) {
            <li class="fund-item">
              <h2>{{ fund.name }}</h2>
              <p>Monto minimo: {{ fund.min | currency: 'COP' : 'symbol' : '1.0-0' }}</p>
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: [
    `
      .funds-page {
        max-width: 48rem;
        margin: 2rem auto;
        padding: 1rem;
      }

      .fund-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
        gap: 1rem;
        list-style: none;
        padding: 0;
      }

      .fund-item {
        border: 1px solid #d9d9d9;
        border-radius: 0.75rem;
        padding: 1rem;
      }

      .error {
        color: #b42318;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FundsPageComponent {
  private readonly getFundsUseCase = inject(GetFundsUseCase);

  protected readonly funds = signal<Fund[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.loadFunds();
  }

  private loadFunds(): void {
    this.loading.set(true);
    this.error.set(null);

    this.getFundsUseCase.execute().subscribe({
      next: (funds) => {
        this.funds.set(funds);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No fue posible cargar los fondos.');
        this.loading.set(false);
      },
    });
  }
}
