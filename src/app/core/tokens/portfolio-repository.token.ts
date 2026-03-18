import { InjectionToken } from '@angular/core';
import { PortfolioRepository } from '../../dominio/repositories/portfolio.repository';

export const PORTFOLIO_REPOSITORY = new InjectionToken<PortfolioRepository>(
  'PORTFOLIO_REPOSITORY',
);
