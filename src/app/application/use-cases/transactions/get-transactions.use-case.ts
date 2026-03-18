import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PORTFOLIO_REPOSITORY } from '../../../core/tokens/portfolio-repository.token';
import { PortfolioRepository } from '../../../dominio/repositories/portfolio.repository';
import { Transaction } from '../../../dominio/entities/transaction.entity';

@Injectable({
  providedIn: 'root',
})
export class GetTransactionsUseCase {
  private readonly portfolioRepository = inject<PortfolioRepository>(
    PORTFOLIO_REPOSITORY,
  );

  execute(): Observable<Transaction[]> {
    return this.portfolioRepository.getTransactions();
  }
}
