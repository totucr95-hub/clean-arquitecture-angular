import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { GetFundsUseCase } from '../../../application/use-cases/funds/get-funds.use-case';
import { GetTransactionsUseCase } from '../../../application/use-cases/transactions/get-transactions.use-case';
import { TransactionsPageFacade } from './transactions-page.facade';

describe('TransactionsPageFacade', () => {
  const getTransactionsUseCaseMock = { execute: jest.fn() };
  const getFundsUseCaseMock = { execute: jest.fn() };

  let facade: TransactionsPageFacade;

  beforeEach(() => {
    jest.clearAllMocks();

    getTransactionsUseCaseMock.execute.mockReturnValue(
      of([
        {
          id: 1,
          fundId: 2,
          amount: 100000,
          type: 'SUBSCRIBE',
          date: '2026-03-18T10:00:00.000Z',
          notificationMethod: 'EMAIL',
        },
      ]),
    );
    getFundsUseCaseMock.execute.mockReturnValue(of([{ id: 2, name: 'Fondo 2', min: 75000 }]));

    TestBed.configureTestingModule({
      providers: [
        TransactionsPageFacade,
        { provide: GetTransactionsUseCase, useValue: getTransactionsUseCaseMock },
        { provide: GetFundsUseCase, useValue: getFundsUseCaseMock },
      ],
    });

    facade = TestBed.inject(TransactionsPageFacade);
  });

  it('loads transactions and funds', () => {
    facade.loadInitialData();

    expect(getTransactionsUseCaseMock.execute).toHaveBeenCalledTimes(1);
    expect(getFundsUseCaseMock.execute).toHaveBeenCalledTimes(1);
    expect(facade.transactions()).toHaveLength(1);
  });

  it('returns mapped fund name', () => {
    facade.loadInitialData();

    expect(facade.getFundName(2)).toBe('Fondo 2');
  });

  it('returns fallback fund name when id does not exist', () => {
    facade.loadInitialData();

    expect(facade.getFundName(999)).toBe('Fondo #999');
  });
});
