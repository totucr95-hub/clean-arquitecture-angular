import { TestBed } from '@angular/core/testing';
import { of, firstValueFrom } from 'rxjs';
import { PORTFOLIO_REPOSITORY } from '../../../core/tokens/portfolio-repository.token';
import { PortfolioRepository } from '../../../dominio/repositories/portfolio.repository';
import { GetSubscriptionsUseCase } from './get-subscriptions.use-case';

describe('GetSubscriptionsUseCase', () => {
  const mockRepository: jest.Mocked<PortfolioRepository> = {
    getUser: jest.fn(),
    getSubscriptions: jest.fn(),
    getTransactions: jest.fn(),
    subscribe: jest.fn(),
    cancel: jest.fn(),
  };

  let useCase: GetSubscriptionsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        GetSubscriptionsUseCase,
        {
          provide: PORTFOLIO_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    });

    useCase = TestBed.inject(GetSubscriptionsUseCase);
  });

  it('returns subscriptions from repository', async () => {
    mockRepository.getSubscriptions.mockReturnValue(
      of({ 1: { amount: 90000, notificationMethod: 'EMAIL' } }),
    );

    const result = await firstValueFrom(useCase.execute());

    expect(result).toEqual({ 1: { amount: 90000, notificationMethod: 'EMAIL' } });
    expect(mockRepository.getSubscriptions).toHaveBeenCalledTimes(1);
  });
});
