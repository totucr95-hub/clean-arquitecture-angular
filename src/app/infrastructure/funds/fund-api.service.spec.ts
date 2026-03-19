import { TestBed } from '@angular/core/testing';
import { of, firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { FundApiService } from './fund-api.service';

describe('FundApiService', () => {
  const apiServiceMock = {
    get: jest.fn(),
  };

  let service: FundApiService;

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [FundApiService, { provide: ApiService, useValue: apiServiceMock }],
    });

    service = TestBed.inject(FundApiService);
  });

  it('returns mapped fund entities from /fondos endpoint', async () => {
    apiServiceMock.get.mockReturnValue(
      of([{ id: 1, nombre: 'FPV_BTG PACTUAL RECAUDADORA', valor: 75000 }]),
    );

    const funds = await firstValueFrom(service.getFunds());

    expect(apiServiceMock.get).toHaveBeenCalledWith('/fondos');
    expect(funds).toEqual([{ id: 1, name: 'FPV_BTG PACTUAL RECAUDADORA', min: 75000 }]);
  });
});
