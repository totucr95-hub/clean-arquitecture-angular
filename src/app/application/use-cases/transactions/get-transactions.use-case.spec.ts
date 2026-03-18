import { TestBed } from '@angular/core/testing';
import { of, firstValueFrom } from 'rxjs';
import { PORTFOLIO_REPOSITORY } from '../../../core/tokens/portfolio-repository.token';
import { PortfolioRepository } from '../../../dominio/repositories/portfolio.repository';
import { GetTransactionsUseCase } from './get-transactions.use-case';

describe('GetTransactionsUseCase', () => {
  const mockRepository: jest.Mocked<PortfolioRepository> = {
    getUser: jest.fn(),
    getSubscriptions: jest.fn(),
    getTransactions: jest.fn(),
    subscribe: jest.fn(),
    cancel: jest.fn(),
  };

  let useCase: GetTransactionsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        GetTransactionsUseCase,
        {
          provide: PORTFOLIO_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    });

    useCase = TestBed.inject(GetTransactionsUseCase);
  });

  it('returns transactions from repository', async () => {
    mockRepository.getTransactions.mockReturnValue(
      of([
        {
          id: 10,
          fundId: 2,
          amount: 80000,
          type: 'SUBSCRIBE',
          date: '2026-03-18T10:00:00.000Z',
          notificationMethod: 'EMAIL',
        },
      ]),
    );

    const transactions = await firstValueFrom(useCase.execute());

    expect(transactions).toHaveLength(1);
    expect(mockRepository.getTransactions).toHaveBeenCalledTimes(1);
  });
});
