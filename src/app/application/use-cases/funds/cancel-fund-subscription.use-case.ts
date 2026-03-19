import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PORTFOLIO_REPOSITORY } from '../../../core/tokens/portfolio-repository.token';
import {
  PortfolioActionResult,
  PortfolioRepository,
} from '../../../dominio/repositories/portfolio.repository';

@Injectable({
  providedIn: 'root',
})
export class CancelFundSubscriptionUseCase {
  private readonly portfolioRepository = inject<PortfolioRepository>(PORTFOLIO_REPOSITORY);

  execute(fundId: number): Observable<PortfolioActionResult> {
    return this.portfolioRepository.cancel(fundId);
  }
}
