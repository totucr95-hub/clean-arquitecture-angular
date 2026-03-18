import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Fund } from '../../dominio/entities/fund.entity';
import { ApiService } from '../../core/services/api.service';
import { FundRepository } from '../../dominio/repositories/fund.repository';

interface FundDbDto {
  id: number;
  nombre: string;
  valor: number;
}

@Injectable({
  providedIn: 'root',
})
export class FundApiService implements FundRepository {
  private readonly apiService = inject(ApiService);

  getFunds(): Observable<Fund[]> {
    return this.apiService.get<FundDbDto[]>('/fondos').pipe(
      map((funds) => funds.map((fund) => this.toDomain(fund))),
    );
  }

  private toDomain(fund: FundDbDto): Fund {
    return {
      id: fund.id,
      name: fund.nombre,
      min: fund.valor,
    };
  }
}
