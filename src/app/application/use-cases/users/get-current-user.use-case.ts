import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PORTFOLIO_REPOSITORY } from '../../../core/tokens/portfolio-repository.token';
import { PortfolioRepository } from '../../../dominio/repositories/portfolio.repository';
import { User } from '../../../dominio/entities/user.entity';

@Injectable({
  providedIn: 'root',
})
export class GetCurrentUserUseCase {
  private readonly portfolioRepository = inject<PortfolioRepository>(PORTFOLIO_REPOSITORY);

  execute(): Observable<User> {
    return this.portfolioRepository.getUser();
  }
}
