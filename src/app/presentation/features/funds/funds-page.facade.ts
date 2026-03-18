import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CancelFundSubscriptionUseCase } from '../../../application/use-cases/funds/cancel-fund-subscription.use-case';
import { GetFundsUseCase } from '../../../application/use-cases/funds/get-funds.use-case';
import { GetSubscriptionsUseCase } from '../../../application/use-cases/funds/get-subscriptions.use-case';
import { SubscribeToFundUseCase } from '../../../application/use-cases/funds/subscribe-to-fund.use-case';
import { GetCurrentUserUseCase } from '../../../application/use-cases/users/get-current-user.use-case';
import { Fund } from '../../../dominio/entities/fund.entity';
import { NotificationMethod } from '../../../dominio/entities/transaction.entity';
import { User } from '../../../dominio/entities/user.entity';
import { PortfolioSubscription } from '../../../dominio/repositories/portfolio.repository';

@Injectable()
export class FundsPageFacade {
  private readonly destroyRef = inject(DestroyRef);
  private readonly getFundsUseCase = inject(GetFundsUseCase);
  private readonly subscribeToFundUseCase = inject(SubscribeToFundUseCase);
  private readonly cancelFundSubscriptionUseCase = inject(
    CancelFundSubscriptionUseCase,
  );
  private readonly getSubscriptionsUseCase = inject(GetSubscriptionsUseCase);
  private readonly getCurrentUserUseCase = inject(GetCurrentUserUseCase);

  readonly user = signal<User>({
    id: 1,
    balance: 100_000_000,
  });
  readonly funds = signal<Fund[]>([]);
  readonly subscriptions = signal<Record<number, PortfolioSubscription>>({});
  readonly amountsByFund = signal<Record<number, number>>({});
  readonly notificationByFund = signal<Record<number, NotificationMethod>>({});
  readonly openSubscriptionFormByFund = signal<Record<number, boolean>>({});
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly actionMessage = signal<string | null>(null);
  readonly actionType = signal<'success' | 'error'>('success');

  loadInitialData(): void {
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

  initializeDefaultsForFunds(funds: Fund[]): void {
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

  isSubscribed(fundId: number): boolean {
    return !!this.subscriptions()[fundId];
  }

  getSubscriptionAmount(fundId: number): number {
    return this.subscriptions()[fundId]?.amount ?? 0;
  }

  getAmountForFund(fundId: number, fallback: number): number {
    return this.amountsByFund()[fundId] ?? fallback;
  }

  getNotificationForFund(fundId: number): NotificationMethod {
    return this.notificationByFund()[fundId] ?? 'EMAIL';
  }

  onAmountChange(fundId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    this.amountsByFund.update((current) => ({
      ...current,
      [fundId]: Number.isFinite(value) ? value : 0,
    }));
  }

  onNotificationMethodChange(fundId: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value === 'SMS' ? 'SMS' : 'EMAIL';
    this.notificationByFund.update((current) => ({
      ...current,
      [fundId]: value,
    }));
  }

  isSubscriptionFormOpen(fundId: number): boolean {
    return !!this.openSubscriptionFormByFund()[fundId];
  }

  toggleSubscriptionForm(fundId: number): void {
    this.openSubscriptionFormByFund.update((current) => ({
      ...current,
      [fundId]: !current[fundId],
    }));
  }

  subscribeToFund(fund: Fund): void {
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

  cancelSubscription(fundId: number): void {
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
