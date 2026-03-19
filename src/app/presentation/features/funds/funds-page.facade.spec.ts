import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CancelFundSubscriptionUseCase } from '../../../application/use-cases/funds/cancel-fund-subscription.use-case';
import { GetFundsUseCase } from '../../../application/use-cases/funds/get-funds.use-case';
import { GetSubscriptionsUseCase } from '../../../application/use-cases/funds/get-subscriptions.use-case';
import { SubscribeToFundUseCase } from '../../../application/use-cases/funds/subscribe-to-fund.use-case';
import { GetCurrentUserUseCase } from '../../../application/use-cases/users/get-current-user.use-case';
import { FundsPageFacade } from './funds-page.facade';

describe('FundsPageFacade', () => {
  const getFundsUseCaseMock = { execute: jest.fn() };
  const subscribeUseCaseMock = { execute: jest.fn() };
  const cancelUseCaseMock = { execute: jest.fn() };
  const getSubscriptionsUseCaseMock = { execute: jest.fn() };
  const getCurrentUserUseCaseMock = { execute: jest.fn() };

  let facade: FundsPageFacade;

  beforeEach(() => {
    jest.clearAllMocks();

    getFundsUseCaseMock.execute.mockReturnValue(of([{ id: 2, name: 'Fondo Test', min: 75000 }]));
    getSubscriptionsUseCaseMock.execute.mockReturnValue(of({}));
    getCurrentUserUseCaseMock.execute.mockReturnValue(of({ id: 1, balance: 1000000 }));
    subscribeUseCaseMock.execute.mockReturnValue(
      of({ success: true, message: 'ok', user: { id: 1, balance: 900000 } }),
    );
    cancelUseCaseMock.execute.mockReturnValue(
      of({ success: true, message: 'cancelado', user: { id: 1, balance: 1000000 } }),
    );

    TestBed.configureTestingModule({
      providers: [
        FundsPageFacade,
        { provide: GetFundsUseCase, useValue: getFundsUseCaseMock },
        { provide: SubscribeToFundUseCase, useValue: subscribeUseCaseMock },
        { provide: CancelFundSubscriptionUseCase, useValue: cancelUseCaseMock },
        { provide: GetSubscriptionsUseCase, useValue: getSubscriptionsUseCaseMock },
        { provide: GetCurrentUserUseCase, useValue: getCurrentUserUseCaseMock },
      ],
    });

    facade = TestBed.inject(FundsPageFacade);
  });

  it('loads initial data', () => {
    facade.loadInitialData();

    expect(getFundsUseCaseMock.execute).toHaveBeenCalledTimes(1);
    expect(getCurrentUserUseCaseMock.execute).toHaveBeenCalledTimes(1);
    expect(getSubscriptionsUseCaseMock.execute).toHaveBeenCalledTimes(1);
  });

  it('handles amount and notification changes', () => {
    facade.onAmountChange(2, { target: { value: '123000' } } as unknown as Event);
    facade.onNotificationMethodChange(2, { target: { value: 'SMS' } } as unknown as Event);

    expect(facade.getAmountForFund(2, 75000)).toBe(123000);
    expect(facade.getNotificationForFund(2)).toBe('SMS');
  });

  it('returns fallback values when not set', () => {
    expect(facade.getAmountForFund(999, 75000)).toBe(75000);
    expect(facade.getNotificationForFund(999)).toBe('EMAIL');
  });

  it('stores 0 when amount is not finite', () => {
    facade.onAmountChange(2, { target: { value: 'nope' } } as unknown as Event);

    expect(facade.getAmountForFund(2, 75000)).toBe(0);
  });

  it('maps unknown notification to EMAIL', () => {
    facade.onNotificationMethodChange(2, { target: { value: 'OTHER' } } as unknown as Event);

    expect(facade.getNotificationForFund(2)).toBe('EMAIL');
  });

  it('toggles subscription form', () => {
    expect(facade.isSubscriptionFormOpen(2)).toBe(false);
    facade.toggleSubscriptionForm(2);
    expect(facade.isSubscriptionFormOpen(2)).toBe(true);
  });

  it('reports subscription status and amount', () => {
    facade.subscriptions.set({
      2: { amount: 88000, notificationMethod: 'SMS' },
    });

    expect(facade.isSubscribed(2)).toBe(true);
    expect(facade.isSubscribed(3)).toBe(false);
    expect(facade.getSubscriptionAmount(2)).toBe(88000);
    expect(facade.getSubscriptionAmount(3)).toBe(0);
  });

  it('subscribes successfully and closes form', () => {
    facade.toggleSubscriptionForm(2);

    facade.subscribeToFund({ id: 2, name: 'Fondo Test', min: 75000 });

    expect(subscribeUseCaseMock.execute).toHaveBeenCalled();
    expect(facade.actionType()).toBe('success');
    expect(facade.actionMessage()).toBe('ok');
    expect(facade.isSubscriptionFormOpen(2)).toBe(false);
  });

  it('keeps form open when subscribe fails', () => {
    subscribeUseCaseMock.execute.mockReturnValueOnce(
      of({ success: false, message: 'fallo', user: { id: 1, balance: 1000000 } }),
    );
    facade.toggleSubscriptionForm(2);

    facade.subscribeToFund({ id: 2, name: 'Fondo Test', min: 75000 });

    expect(facade.actionType()).toBe('error');
    expect(facade.actionMessage()).toBe('fallo');
    expect(facade.isSubscriptionFormOpen(2)).toBe(true);
  });

  it('cancels subscription and stores success message', () => {
    facade.cancelSubscription(2);

    expect(cancelUseCaseMock.execute).toHaveBeenCalledWith(2);
    expect(facade.actionType()).toBe('success');
    expect(facade.actionMessage()).toBe('cancelado');
  });

  it('stores error type when cancel fails', () => {
    cancelUseCaseMock.execute.mockReturnValueOnce(
      of({ success: false, message: 'no cancelado', user: { id: 1, balance: 1000000 } }),
    );

    facade.cancelSubscription(2);

    expect(facade.actionType()).toBe('error');
    expect(facade.actionMessage()).toBe('no cancelado');
  });

  it('keeps existing defaults when already initialized', () => {
    facade.amountsByFund.set({ 2: 99999 });
    facade.notificationByFund.set({ 2: 'SMS' });

    facade.initializeDefaultsForFunds([{ id: 2, name: 'Fondo Test', min: 75000 }]);

    expect(facade.getAmountForFund(2, 75000)).toBe(99999);
    expect(facade.getNotificationForFund(2)).toBe('SMS');
  });

  it('sets error when funds load fails', () => {
    getFundsUseCaseMock.execute.mockReturnValueOnce(throwError(() => new Error('network')));

    facade.loadInitialData();

    expect(facade.error()).toBe('No fue posible cargar los fondos.');
    expect(facade.loading()).toBe(false);
  });
});
