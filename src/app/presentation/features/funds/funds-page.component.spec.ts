import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CancelFundSubscriptionUseCase } from '../../../application/use-cases/funds/cancel-fund-subscription.use-case';
import { GetFundsUseCase } from '../../../application/use-cases/funds/get-funds.use-case';
import { GetSubscriptionsUseCase } from '../../../application/use-cases/funds/get-subscriptions.use-case';
import { SubscribeToFundUseCase } from '../../../application/use-cases/funds/subscribe-to-fund.use-case';
import { GetCurrentUserUseCase } from '../../../application/use-cases/users/get-current-user.use-case';
import { FundsPageComponent } from './funds-page.component';

describe('FundsPageComponent', () => {
  const getFundsUseCaseMock = { execute: jest.fn() };
  const subscribeUseCaseMock = { execute: jest.fn() };
  const cancelUseCaseMock = { execute: jest.fn() };
  const getSubscriptionsUseCaseMock = { execute: jest.fn() };
  const getCurrentUserUseCaseMock = { execute: jest.fn() };

  beforeEach(async () => {
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

    await TestBed.configureTestingModule({
      imports: [FundsPageComponent],
      providers: [
        provideRouter([]),
        { provide: GetFundsUseCase, useValue: getFundsUseCaseMock },
        { provide: SubscribeToFundUseCase, useValue: subscribeUseCaseMock },
        { provide: CancelFundSubscriptionUseCase, useValue: cancelUseCaseMock },
        { provide: GetSubscriptionsUseCase, useValue: getSubscriptionsUseCaseMock },
        { provide: GetCurrentUserUseCase, useValue: getCurrentUserUseCaseMock },
      ],
    }).compileComponents();
  });

  it('loads funds and user on init', () => {
    const fixture = TestBed.createComponent(FundsPageComponent);
    fixture.detectChanges();

    expect(getFundsUseCaseMock.execute).toHaveBeenCalledTimes(1);
    expect(getCurrentUserUseCaseMock.execute).toHaveBeenCalledTimes(1);
    expect(getSubscriptionsUseCaseMock.execute).toHaveBeenCalledTimes(1);
  });

  it('subscribes to a fund and stores action message', () => {
    const fixture = TestBed.createComponent(FundsPageComponent);
    const component = fixture.componentInstance as any;

    component.subscribeToFund({ id: 2, name: 'Fondo Test', min: 75000 });

    expect(subscribeUseCaseMock.execute).toHaveBeenCalled();
    expect(component.actionMessage()).toBe('ok');
    expect(component.actionType()).toBe('success');
  });

  it('cancels subscription and stores action message', () => {
    const fixture = TestBed.createComponent(FundsPageComponent);
    const component = fixture.componentInstance as any;

    component.cancelSubscription(2);

    expect(cancelUseCaseMock.execute).toHaveBeenCalledWith(2);
    expect(component.actionMessage()).toBe('cancelado');
  });

  it('handles amount and notification changes', () => {
    const fixture = TestBed.createComponent(FundsPageComponent);
    const component = fixture.componentInstance as any;

    component.onAmountChange(2, { target: { value: '123000' } } as unknown as Event);
    component.onNotificationMethodChange(2, { target: { value: 'SMS' } } as unknown as Event);

    expect(component.getAmountForFund(2, 75000)).toBe(123000);
    expect(component.getNotificationForFund(2)).toBe('SMS');
  });

  it('toggles subscription form state', () => {
    const fixture = TestBed.createComponent(FundsPageComponent);
    const component = fixture.componentInstance as any;

    expect(component.isSubscriptionFormOpen(2)).toBe(false);
    component.toggleSubscriptionForm(2);
    expect(component.isSubscriptionFormOpen(2)).toBe(true);
    component.toggleSubscriptionForm(2);
    expect(component.isSubscriptionFormOpen(2)).toBe(false);
  });

  it('reports load error when funds request fails', () => {
    getFundsUseCaseMock.execute.mockReturnValueOnce(throwError(() => new Error('network')));

    const fixture = TestBed.createComponent(FundsPageComponent);
    const component = fixture.componentInstance as any;
    fixture.detectChanges();

    expect(component.error()).toBe('No fue posible cargar los fondos.');
    expect(component.loading()).toBe(false);
  });

  it('uses fallback values when amount/notification are not set', () => {
    const fixture = TestBed.createComponent(FundsPageComponent);
    const component = fixture.componentInstance as any;

    expect(component.getAmountForFund(999, 75000)).toBe(75000);
    expect(component.getNotificationForFund(999)).toBe('EMAIL');
  });

  it('stores 0 when amount value is not finite', () => {
    const fixture = TestBed.createComponent(FundsPageComponent);
    const component = fixture.componentInstance as any;

    component.onAmountChange(2, { target: { value: 'not-a-number' } } as unknown as Event);

    expect(component.getAmountForFund(2, 75000)).toBe(0);
  });

  it('maps unknown notification option to EMAIL', () => {
    const fixture = TestBed.createComponent(FundsPageComponent);
    const component = fixture.componentInstance as any;

    component.onNotificationMethodChange(2, { target: { value: 'PIGEON' } } as unknown as Event);

    expect(component.getNotificationForFund(2)).toBe('EMAIL');
  });

  it('returns subscription status and amount from state', () => {
    const fixture = TestBed.createComponent(FundsPageComponent);
    const component = fixture.componentInstance as any;

    component.subscriptions.set({
      2: { amount: 88000, notificationMethod: 'SMS' },
    });

    expect(component.isSubscribed(2)).toBe(true);
    expect(component.isSubscribed(3)).toBe(false);
    expect(component.getSubscriptionAmount(2)).toBe(88000);
    expect(component.getSubscriptionAmount(3)).toBe(0);
  });

  it('keeps subscription form open when subscribe result is error', () => {
    subscribeUseCaseMock.execute.mockReturnValueOnce(
      of({ success: false, message: 'fallo', user: { id: 1, balance: 1000000 } }),
    );

    const fixture = TestBed.createComponent(FundsPageComponent);
    const component = fixture.componentInstance as any;
    component.toggleSubscriptionForm(2);

    component.subscribeToFund({ id: 2, name: 'Fondo Test', min: 75000 });

    expect(component.actionType()).toBe('error');
    expect(component.actionMessage()).toBe('fallo');
    expect(component.isSubscriptionFormOpen(2)).toBe(true);
  });

  it('does not overwrite existing default values when already initialized', () => {
    const fixture = TestBed.createComponent(FundsPageComponent);
    const component = fixture.componentInstance as any;

    component.amountsByFund.set({ 2: 99999 });
    component.notificationByFund.set({ 2: 'SMS' });

    component.initializeDefaultsForFunds([{ id: 2, name: 'Fondo Test', min: 75000 }]);

    expect(component.getAmountForFund(2, 75000)).toBe(99999);
    expect(component.getNotificationForFund(2)).toBe('SMS');
  });

  it('stores error type when cancel result is not successful', () => {
    cancelUseCaseMock.execute.mockReturnValueOnce(
      of({ success: false, message: 'no cancelado', user: { id: 1, balance: 1000000 } }),
    );

    const fixture = TestBed.createComponent(FundsPageComponent);
    const component = fixture.componentInstance as any;

    component.cancelSubscription(2);

    expect(component.actionType()).toBe('error');
    expect(component.actionMessage()).toBe('no cancelado');
  });
});
