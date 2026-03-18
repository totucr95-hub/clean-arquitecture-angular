import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Fund } from '../../../dominio/entities/fund.entity';
import {
  NotificationMethod,
} from '../../../dominio/entities/transaction.entity';
import { FundsPageFacade } from './funds-page.facade';

@Component({
  selector: 'app-funds-page',
  imports: [CurrencyPipe, RouterLink],
  providers: [FundsPageFacade],
  templateUrl: './funds-page.component.html',
  styleUrl: './funds-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FundsPageComponent {
  private readonly facade = inject(FundsPageFacade);

  protected readonly user = this.facade.user;
  protected readonly funds = this.facade.funds;
  protected readonly subscriptions = this.facade.subscriptions;
  protected readonly amountsByFund = this.facade.amountsByFund;
  protected readonly notificationByFund = this.facade.notificationByFund;
  protected readonly openSubscriptionFormByFund = this.facade.openSubscriptionFormByFund;
  protected readonly loading = this.facade.loading;
  protected readonly error = this.facade.error;
  protected readonly actionMessage = this.facade.actionMessage;
  protected readonly actionType = this.facade.actionType;

  constructor() {
    this.facade.loadInitialData();
  }

  private initializeDefaultsForFunds(funds: Fund[]): void {
    this.facade.initializeDefaultsForFunds(funds);
  }

  protected isSubscribed(fundId: number): boolean {
    return this.facade.isSubscribed(fundId);
  }

  protected getSubscriptionAmount(fundId: number): number {
    return this.facade.getSubscriptionAmount(fundId);
  }

  protected getAmountForFund(fundId: number, fallback: number): number {
    return this.facade.getAmountForFund(fundId, fallback);
  }

  protected getNotificationForFund(fundId: number): NotificationMethod {
    return this.facade.getNotificationForFund(fundId);
  }

  protected onAmountChange(fundId: number, event: Event): void {
    this.facade.onAmountChange(fundId, event);
  }

  protected onNotificationMethodChange(fundId: number, event: Event): void {
    this.facade.onNotificationMethodChange(fundId, event);
  }

  protected isSubscriptionFormOpen(fundId: number): boolean {
    return this.facade.isSubscriptionFormOpen(fundId);
  }

  protected toggleSubscriptionForm(fundId: number): void {
    this.facade.toggleSubscriptionForm(fundId);
  }

  protected subscribeToFund(fund: Fund): void {
    this.facade.subscribeToFund(fund);
  }

  protected cancelSubscription(fundId: number): void {
    this.facade.cancelSubscription(fundId);
  }
}
