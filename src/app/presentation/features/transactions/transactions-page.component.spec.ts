import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { GetFundsUseCase } from '../../../application/use-cases/funds/get-funds.use-case';
import { GetTransactionsUseCase } from '../../../application/use-cases/transactions/get-transactions.use-case';
import { TransactionsPageComponent } from './transactions-page.component';

describe('TransactionsPageComponent', () => {
  const getTransactionsUseCaseMock = { execute: jest.fn() };
  const getFundsUseCaseMock = { execute: jest.fn() };

  beforeEach(async () => {
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

    await TestBed.configureTestingModule({
      imports: [TransactionsPageComponent],
      providers: [
        provideRouter([]),
        { provide: GetTransactionsUseCase, useValue: getTransactionsUseCaseMock },
        { provide: GetFundsUseCase, useValue: getFundsUseCaseMock },
      ],
    }).compileComponents();
  });

  it('loads transactions and funds on init', () => {
    const fixture = TestBed.createComponent(TransactionsPageComponent);
    fixture.detectChanges();

    expect(getTransactionsUseCaseMock.execute).toHaveBeenCalledTimes(1);
    expect(getFundsUseCaseMock.execute).toHaveBeenCalledTimes(1);
  });

  it('returns fallback fund name when not found', () => {
    const fixture = TestBed.createComponent(TransactionsPageComponent);
    const component = fixture.componentInstance as any;

    expect(component.getFundName(999)).toBe('Fondo #999');
  });
});
