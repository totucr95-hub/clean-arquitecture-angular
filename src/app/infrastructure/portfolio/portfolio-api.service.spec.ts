import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { PortfolioApiService } from './portfolio-api.service';

describe('PortfolioApiService', () => {
  const apiServiceMock = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  let service: PortfolioApiService;

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [PortfolioApiService, { provide: ApiService, useValue: apiServiceMock }],
    });

    service = TestBed.inject(PortfolioApiService);
  });

  it('gets and maps user', async () => {
    apiServiceMock.get.mockReturnValueOnce(of({ id: 1, balance: 500000 }));

    const user = await firstValueFrom(service.getUser());

    expect(apiServiceMock.get).toHaveBeenCalledWith('/users/1');
    expect(user).toEqual({ id: 1, balance: 500000 });
  });

  it('gets and maps subscriptions as record', async () => {
    apiServiceMock.get.mockReturnValueOnce(
      of([
        {
          id: 1,
          userId: 1,
          fundId: 2,
          amount: 70000,
          notificationMethod: 'EMAIL',
        },
      ]),
    );

    const subscriptions = await firstValueFrom(service.getSubscriptions());

    expect(apiServiceMock.get).toHaveBeenCalledWith('/subscriptions?userId=1');
    expect(subscriptions).toEqual({
      2: { amount: 70000, notificationMethod: 'EMAIL' },
    });
  });

  it('gets and maps transactions', async () => {
    apiServiceMock.get.mockReturnValueOnce(
      of([
        {
          id: 10,
          userId: 1,
          fundId: 2,
          amount: 70000,
          type: 'SUBSCRIBE',
          date: '2026-03-18T10:00:00.000Z',
          notificationMethod: 'SMS',
        },
      ]),
    );

    const transactions = await firstValueFrom(service.getTransactions());

    expect(apiServiceMock.get).toHaveBeenCalledWith('/transactions?userId=1&_sort=id&_order=desc');
    expect(transactions).toEqual([
      {
        id: 10,
        fundId: 2,
        amount: 70000,
        type: 'SUBSCRIBE',
        date: '2026-03-18T10:00:00.000Z',
        notificationMethod: 'SMS',
      },
    ]);
  });

  it('returns duplicate-subscription error when subscription already exists', async () => {
    apiServiceMock.get
      .mockReturnValueOnce(of({ id: 1, balance: 100000 }))
      .mockReturnValueOnce(
        of([{ id: 1, userId: 1, fundId: 2, amount: 50000, notificationMethod: 'EMAIL' }]),
      );

    const result = await firstValueFrom(
      service.subscribe({ fundId: 2, amount: 50000, notificationMethod: 'EMAIL' }),
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe('Ya estas suscrito a este fondo.');
    expect(apiServiceMock.patch).not.toHaveBeenCalled();
    expect(apiServiceMock.post).not.toHaveBeenCalled();
  });

  it('returns insufficient-balance error when amount exceeds user balance', async () => {
    apiServiceMock.get
      .mockReturnValueOnce(of({ id: 1, balance: 1000 }))
      .mockReturnValueOnce(of([]));

    const result = await firstValueFrom(
      service.subscribe({ fundId: 2, amount: 50000, notificationMethod: 'SMS' }),
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe('No tienes saldo suficiente para suscribirte a este fondo.');
    expect(apiServiceMock.patch).not.toHaveBeenCalled();
  });

  it('subscribes successfully and updates user balance', async () => {
    apiServiceMock.get
      .mockReturnValueOnce(of({ id: 1, balance: 100000 }))
      .mockReturnValueOnce(of([]));
    apiServiceMock.patch.mockReturnValueOnce(of({ id: 1, balance: 20000 }));
    apiServiceMock.post.mockReturnValueOnce(of({ id: 99 })).mockReturnValueOnce(of({ id: 100 }));

    const result = await firstValueFrom(
      service.subscribe({ fundId: 2, amount: 80000, notificationMethod: 'EMAIL' }),
    );

    expect(apiServiceMock.patch).toHaveBeenCalledWith('/users/1', { balance: 20000 });
    expect(apiServiceMock.post).toHaveBeenCalledWith('/subscriptions', {
      userId: 1,
      fundId: 2,
      amount: 80000,
      notificationMethod: 'EMAIL',
    });
    expect(apiServiceMock.post).toHaveBeenCalledWith(
      '/transactions',
      expect.objectContaining({
        userId: 1,
        fundId: 2,
        amount: 80000,
        type: 'SUBSCRIBE',
        notificationMethod: 'EMAIL',
      }),
    );
    expect(result.success).toBe(true);
  });

  it('returns error when trying to cancel a missing subscription', async () => {
    apiServiceMock.get
      .mockReturnValueOnce(of({ id: 1, balance: 100000 }))
      .mockReturnValueOnce(of([]));

    const result = await firstValueFrom(service.cancel(2));

    expect(result.success).toBe(false);
    expect(result.message).toBe('No tienes una suscripcion activa en este fondo.');
    expect(apiServiceMock.patch).not.toHaveBeenCalled();
  });

  it('cancels subscription and refunds user balance', async () => {
    apiServiceMock.get
      .mockReturnValueOnce(of({ id: 1, balance: 100000 }))
      .mockReturnValueOnce(
        of([{ id: 10, userId: 1, fundId: 2, amount: 50000, notificationMethod: 'SMS' }]),
      );
    apiServiceMock.patch.mockReturnValueOnce(of({ id: 1, balance: 150000 }));
    apiServiceMock.delete.mockReturnValueOnce(of({}));
    apiServiceMock.post.mockReturnValueOnce(of({ id: 101 }));

    const result = await firstValueFrom(service.cancel(2));

    expect(apiServiceMock.patch).toHaveBeenCalledWith('/users/1', { balance: 150000 });
    expect(apiServiceMock.delete).toHaveBeenCalledWith('/subscriptions/10');
    expect(apiServiceMock.post).toHaveBeenCalledWith(
      '/transactions',
      expect.objectContaining({
        userId: 1,
        fundId: 2,
        amount: 50000,
        type: 'CANCEL',
        notificationMethod: 'SMS',
      }),
    );
    expect(result.success).toBe(true);
  });
});
