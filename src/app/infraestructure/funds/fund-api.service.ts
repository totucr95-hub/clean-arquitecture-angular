import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Fund } from '../../dominio/entities/fund.entity';
import { ApiService } from '../../core/services/api.service';
import { FundRepository } from '../../dominio/repositories/fund.repository';
import { FundDbDto } from './dtos/fund-db.dto';
import { toFundEntity } from './mappers/fund.mapper';

@Injectable({
  providedIn: 'root',
})
export class FundApiService implements FundRepository {
  private readonly apiService = inject(ApiService);

  getFunds(): Observable<Fund[]> {
    return this.apiService.get<FundDbDto[]>('/fondos').pipe(
      map((funds) => funds.map(toFundEntity)),
    );
  }
}
