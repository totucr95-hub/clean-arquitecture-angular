import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GetFundsUseCase } from '../../../application/use-cases/funds/get-funds.use-case';
import { SubscribeToFundUseCase } from '../../../application/use-cases/funds/subscribe-to-fund.use-case';
import { CancelFundSubscriptionUseCase } from '../../../application/use-cases/funds/cancel-fund-subscription.use-case';
import { GetSubscriptionsUseCase } from '../../../application/use-cases/funds/get-subscriptions.use-case';
import { GetCurrentUserUseCase } from '../../../application/use-cases/users/get-current-user.use-case';
import { Fund } from '../../../dominio/entities/fund.entity';
import { User } from '../../../dominio/entities/user.entity';
import {
  NotificationMethod,
} from '../../../dominio/entities/transaction.entity';
import { PortfolioSubscription } from '../../../dominio/repositories/portfolio.repository';

@Component({
  selector: 'app-funds-page',
  imports: [CurrencyPipe, RouterLink],
  template: `
    <section class="funds-page">
      <header class="top-bar">
        <h1>Fondos disponibles</h1>
        <nav class="nav-links">
          <a routerLink="/funds">Fondos</a>
          <a routerLink="/transactions">Historial</a>
        </nav>
      </header>

      <p class="user-balance">
        Saldo disponible: {{ user().balance | currency: 'COP' : 'symbol' : '1.0-0' }}
      </p>

      @if (actionMessage()) {
        <p class="action-message" [class.error]="actionType() === 'error'">
          {{ actionMessage() }}
        </p>
      }

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

              @if (isSubscribed(fund.id)) {
                <p class="sub-status subscribed">
                  Estado: Suscrito
                  ({{ getSubscriptionAmount(fund.id) | currency: 'COP' : 'symbol' : '1.0-0' }})
                </p>
                <button type="button" class="danger" (click)="cancelSubscription(fund.id)">
                  Cancelar suscripcion
                </button>
              } @else {
                <p class="sub-status">Estado: No suscrito</p>

                @if (!isSubscriptionFormOpen(fund.id)) {
                  <button type="button" (click)="toggleSubscriptionForm(fund.id)">
                    Suscribirme
                  </button>
                }

                @if (isSubscriptionFormOpen(fund.id)) {
                  <label class="field-label" [for]="'amount-' + fund.id">Monto a suscribir</label>
                  <input
                    [id]="'amount-' + fund.id"
                    class="field-input"
                    type="number"
                    [value]="getAmountForFund(fund.id, fund.min)"
                    [min]="fund.min"
                    (input)="onAmountChange(fund.id, $event)"
                  />

                  <label class="field-label" [for]="'notif-' + fund.id">Metodo de notificacion</label>
                  <select
                    [id]="'notif-' + fund.id"
                    class="field-input"
                    [value]="getNotificationForFund(fund.id)"
                    (change)="onNotificationMethodChange(fund.id, $event)"
                  >
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                  </select>

                  <div class="action-row">
                    <button type="button" (click)="subscribeToFund(fund)">
                      Confirmar suscripcion
                    </button>
                    <button type="button" class="secondary" (click)="toggleSubscriptionForm(fund.id)">
                      Cerrar
                    </button>
                  </div>
                }
              }
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

      .fund-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
        gap: 1rem;
        list-style: none;
        padding: 0;
      }

      .user-balance {
        margin-top: 0.5rem;
        margin-bottom: 1.5rem;
        font-weight: 700;
      }

      .action-message {
        margin-bottom: 1rem;
        color: #1d6f42;
        font-weight: 600;
      }

      .action-message.error {
        color: #b42318;
      }

      .fund-item {
        border: 1px solid #d9d9d9;
        border-radius: 0.75rem;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .sub-status {
        font-weight: 600;
        margin: 0.25rem 0;
      }

      .sub-status.subscribed {
        color: #1d6f42;
      }

      .field-label {
        font-size: 0.875rem;
        font-weight: 600;
      }

      .field-input {
        border: 1px solid #c7c7c7;
        border-radius: 0.5rem;
        padding: 0.5rem;
      }

      button {
        border: 0;
        border-radius: 0.5rem;
        padding: 0.6rem 0.9rem;
        font-weight: 600;
        cursor: pointer;
      }

      button:not(.danger) {
        background: #0f62fe;
        color: #ffffff;
      }

      .secondary {
        background: #e8e8e8;
        color: #202020;
      }

      .action-row {
        display: flex;
        gap: 0.5rem;
      }

      .danger {
        background: #b42318;
        color: #ffffff;
      }

      .error {
        color: #b42318;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FundsPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly getFundsUseCase = inject(GetFundsUseCase);
  private readonly subscribeToFundUseCase = inject(SubscribeToFundUseCase);
  private readonly cancelFundSubscriptionUseCase = inject(
    CancelFundSubscriptionUseCase,
  );
  private readonly getSubscriptionsUseCase = inject(GetSubscriptionsUseCase);
  private readonly getCurrentUserUseCase = inject(GetCurrentUserUseCase);

  protected readonly user = signal<User>({
    id: 1,
    balance: 100_000_000,
  });
  protected readonly funds = signal<Fund[]>([]);
  protected readonly subscriptions = signal<Record<number, PortfolioSubscription>>({});
  protected readonly amountsByFund = signal<Record<number, number>>({});
  protected readonly notificationByFund = signal<Record<number, NotificationMethod>>({});
  protected readonly openSubscriptionFormByFund = signal<Record<number, boolean>>({});
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly actionMessage = signal<string | null>(null);
  protected readonly actionType = signal<'success' | 'error'>('success');

  constructor() {
    this.loadFunds();
    this.loadUser();
    this.loadSubscriptions();
  }

  private loadFunds(): void {
    this.loading.set(true);
    this.error.set(null);

    this.getFundsUseCase.execute().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (funds) => {
        this.funds.set(funds);
        this.initializeDefaultsForFunds(funds);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No fue posible cargar los fondos.');
        this.loading.set(false);
      },
    });
  }

  private loadUser(): void {
    this.getCurrentUserUseCase
      .execute()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => this.user.set(user));
  }

  private loadSubscriptions(): void {
    this.getSubscriptionsUseCase
      .execute()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((subscriptions) => this.subscriptions.set(subscriptions));
  }

  private initializeDefaultsForFunds(funds: Fund[]): void {
    this.amountsByFund.update((current) => {
      const next = { ...current };
      for (const fund of funds) {
        if (!next[fund.id]) {
          next[fund.id] = fund.min;
        }
      }
      return next;
    });

    this.notificationByFund.update((current) => {
      const next = { ...current };
      for (const fund of funds) {
        if (!next[fund.id]) {
          next[fund.id] = 'EMAIL';
        }
      }
      return next;
    });
  }

  protected isSubscribed(fundId: number): boolean {
    return !!this.subscriptions()[fundId];
  }

  protected getSubscriptionAmount(fundId: number): number {
    return this.subscriptions()[fundId]?.amount ?? 0;
  }

  protected getAmountForFund(fundId: number, fallback: number): number {
    return this.amountsByFund()[fundId] ?? fallback;
  }

  protected getNotificationForFund(fundId: number): NotificationMethod {
    return this.notificationByFund()[fundId] ?? 'EMAIL';
  }

  protected onAmountChange(fundId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    this.amountsByFund.update((current) => ({
      ...current,
      [fundId]: Number.isFinite(value) ? value : 0,
    }));
  }

  protected onNotificationMethodChange(fundId: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value === 'SMS' ? 'SMS' : 'EMAIL';
    this.notificationByFund.update((current) => ({
      ...current,
      [fundId]: value,
    }));
  }

  protected isSubscriptionFormOpen(fundId: number): boolean {
    return !!this.openSubscriptionFormByFund()[fundId];
  }

  protected toggleSubscriptionForm(fundId: number): void {
    this.openSubscriptionFormByFund.update((current) => ({
      ...current,
      [fundId]: !current[fundId],
    }));
  }

  protected subscribeToFund(fund: Fund): void {
    const amount = this.getAmountForFund(fund.id, fund.min);
    const notificationMethod = this.getNotificationForFund(fund.id);

    this.subscribeToFundUseCase
      .execute({ fund, amount, notificationMethod })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.actionType.set(result.success ? 'success' : 'error');
        this.actionMessage.set(result.message);
        if (result.success) {
          this.openSubscriptionFormByFund.update((current) => ({
            ...current,
            [fund.id]: false,
          }));
        }
        this.loadUser();
        this.loadSubscriptions();
      });
  }

  protected cancelSubscription(fundId: number): void {
    this.cancelFundSubscriptionUseCase
      .execute(fundId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.actionType.set(result.success ? 'success' : 'error');
        this.actionMessage.set(result.message);
        this.loadUser();
        this.loadSubscriptions();
      });
  }
}
