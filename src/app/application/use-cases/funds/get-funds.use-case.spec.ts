import { TestBed } from '@angular/core/testing';
import { of, firstValueFrom } from 'rxjs';
import { FUND_REPOSITORY } from '../../../core/tokens/fund-repository.token';
import { FundRepository } from '../../../dominio/repositories/fund.repository';
import { GetFundsUseCase } from './get-funds.use-case';

describe('GetFundsUseCase', () => {
  const mockRepository: jest.Mocked<FundRepository> = {
    getFunds: jest.fn(),
  };

  let useCase: GetFundsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        GetFundsUseCase,
        {
          provide: FUND_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    });

    useCase = TestBed.inject(GetFundsUseCase);
  });

  it('returns funds from repository', async () => {
    mockRepository.getFunds.mockReturnValue(
      of([{ id: 1, name: 'Fondo A', min: 50000 }]),
    );

    const funds = await firstValueFrom(useCase.execute());

    expect(funds).toEqual([{ id: 1, name: 'Fondo A', min: 50000 }]);
    expect(mockRepository.getFunds).toHaveBeenCalledTimes(1);
  });
});
