import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PORTFOLIO_REPOSITORY } from '../../../core/tokens/portfolio-repository.token';
import {
  PortfolioRepository,
  PortfolioSubscription,
} from '../../../dominio/repositories/portfolio.repository';

@Injectable({
  providedIn: 'root',
})
export class GetSubscriptionsUseCase {
  private readonly portfolioRepository = inject<PortfolioRepository>(
    PORTFOLIO_REPOSITORY,
  );

  execute(): Observable<Record<number, PortfolioSubscription>> {
    return this.portfolioRepository.getSubscriptions();
  }
}
