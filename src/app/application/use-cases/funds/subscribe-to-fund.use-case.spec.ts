import { TestBed } from '@angular/core/testing';
import { of, firstValueFrom } from 'rxjs';
import { PORTFOLIO_REPOSITORY } from '../../../core/tokens/portfolio-repository.token';
import { PortfolioRepository } from '../../../dominio/repositories/portfolio.repository';
import { SubscribeToFundUseCase } from './subscribe-to-fund.use-case';
import { Fund } from '../../../dominio/entities/fund.entity';

describe('SubscribeToFundUseCase', () => {
  const fund: Fund = { id: 1, name: 'FPV_EL CLIENTE_RECAUDADORA', min: 75000 };

  const mockRepository: jest.Mocked<PortfolioRepository> = {
    getUser: jest.fn(),
    getSubscriptions: jest.fn(),
    getTransactions: jest.fn(),
    subscribe: jest.fn(),
    cancel: jest.fn(),
  };

  let useCase: SubscribeToFundUseCase;

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        SubscribeToFundUseCase,
        {
          provide: PORTFOLIO_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    });

    useCase = TestBed.inject(SubscribeToFundUseCase);
  });

  it('returns a validation error when amount is below fund minimum', async () => {
    mockRepository.getUser.mockReturnValue(of({ id: 1, balance: 100000 }));

    const result = await firstValueFrom(
      useCase.execute({
        fund,
        amount: 10000,
        notificationMethod: 'EMAIL',
      }),
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain('monto minimo');
    expect(mockRepository.getUser).toHaveBeenCalledTimes(1);
    expect(mockRepository.getSubscriptions).not.toHaveBeenCalled();
    expect(mockRepository.subscribe).not.toHaveBeenCalled();
  });

  it('returns an error when the user is already subscribed to the fund', async () => {
    mockRepository.getSubscriptions.mockReturnValue(
      of({
        [fund.id]: { amount: 80000, notificationMethod: 'SMS' },
      }),
    );
    mockRepository.getUser.mockReturnValue(of({ id: 1, balance: 100000 }));

    const result = await firstValueFrom(
      useCase.execute({
        fund,
        amount: 80000,
        notificationMethod: 'EMAIL',
      }),
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe('Ya estas suscrito a este fondo.');
    expect(mockRepository.subscribe).not.toHaveBeenCalled();
  });

  it('delegates to repository subscribe when input is valid', async () => {
    mockRepository.getSubscriptions.mockReturnValue(of({}));
    mockRepository.subscribe.mockReturnValue(
      of({
        success: true,
        message: 'Suscripcion realizada con exito.',
        user: { id: 1, balance: 20000 },
      }),
    );

    const result = await firstValueFrom(
      useCase.execute({
        fund,
        amount: 80000,
        notificationMethod: 'SMS',
      }),
    );

    expect(mockRepository.subscribe).toHaveBeenCalledWith({
      fundId: fund.id,
      amount: 80000,
      notificationMethod: 'SMS',
    });
    expect(result.success).toBe(true);
  });
});
