import { TestBed } from '@angular/core/testing';
import { of, firstValueFrom } from 'rxjs';
import { PORTFOLIO_REPOSITORY } from '../../../core/tokens/portfolio-repository.token';
import { PortfolioRepository } from '../../../dominio/repositories/portfolio.repository';
import { GetCurrentUserUseCase } from './get-current-user.use-case';

describe('GetCurrentUserUseCase', () => {
  const mockRepository: jest.Mocked<PortfolioRepository> = {
    getUser: jest.fn(),
    getSubscriptions: jest.fn(),
    getTransactions: jest.fn(),
    subscribe: jest.fn(),
    cancel: jest.fn(),
  };

  let useCase: GetCurrentUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        GetCurrentUserUseCase,
        {
          provide: PORTFOLIO_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    });

    useCase = TestBed.inject(GetCurrentUserUseCase);
  });

  it('returns user from repository', async () => {
    mockRepository.getUser.mockReturnValue(of({ id: 1, balance: 100000 }));

    const user = await firstValueFrom(useCase.execute());

    expect(user).toEqual({ id: 1, balance: 100000 });
    expect(mockRepository.getUser).toHaveBeenCalledTimes(1);
  });
});
