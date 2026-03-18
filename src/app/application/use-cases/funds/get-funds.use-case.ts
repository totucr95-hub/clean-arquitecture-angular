import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Fund } from '../../../dominio/fund.model';
import { FUND_REPOSITORY } from '../../../core/tokens/fund-repository.token';
import { FundRepository } from '../../../dominio/repositories/fund.repository';

@Injectable({
  providedIn: 'root',
})
export class GetFundsUseCase {
  private readonly fundRepository = inject<FundRepository>(FUND_REPOSITORY);

  execute(): Observable<Fund[]> {
    return this.fundRepository.getFunds();
  }
}
