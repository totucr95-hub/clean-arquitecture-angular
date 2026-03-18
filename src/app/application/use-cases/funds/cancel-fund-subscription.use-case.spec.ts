import { TestBed } from '@angular/core/testing';
import { of, firstValueFrom } from 'rxjs';
import { PORTFOLIO_REPOSITORY } from '../../../core/tokens/portfolio-repository.token';
import { PortfolioRepository } from '../../../dominio/repositories/portfolio.repository';
import { CancelFundSubscriptionUseCase } from './cancel-fund-subscription.use-case';

describe('CancelFundSubscriptionUseCase', () => {
  const mockRepository: jest.Mocked<PortfolioRepository> = {
    getUser: jest.fn(),
    getSubscriptions: jest.fn(),
    getTransactions: jest.fn(),
    subscribe: jest.fn(),
    cancel: jest.fn(),
  };

  let useCase: CancelFundSubscriptionUseCase;

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        CancelFundSubscriptionUseCase,
        {
          provide: PORTFOLIO_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    });

    useCase = TestBed.inject(CancelFundSubscriptionUseCase);
  });

  it('delegates cancellation to repository', async () => {
    mockRepository.cancel.mockReturnValue(
      of({
        success: true,
        message: 'Suscripcion cancelada y saldo actualizado.',
        user: { id: 1, balance: 200000 },
      }),
    );

    const result = await firstValueFrom(useCase.execute(2));

    expect(mockRepository.cancel).toHaveBeenCalledWith(2);
    expect(result.success).toBe(true);
  });
});
