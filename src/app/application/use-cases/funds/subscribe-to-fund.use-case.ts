import { inject, Injectable } from '@angular/core';
import { Observable, map, switchMap, take } from 'rxjs';
import { PORTFOLIO_REPOSITORY } from '../../../core/tokens/portfolio-repository.token';
import { Fund } from '../../../dominio/entities/fund.entity';
import { NotificationMethod } from '../../../dominio/entities/transaction.entity';
import {
  PortfolioActionResult,
  PortfolioRepository,
} from '../../../dominio/repositories/portfolio.repository';

interface SubscribeToFundInput {
  fund: Fund;
  amount: number;
  notificationMethod: NotificationMethod;
}

@Injectable({
  providedIn: 'root',
})
export class SubscribeToFundUseCase {
  private readonly portfolioRepository = inject<PortfolioRepository>(
    PORTFOLIO_REPOSITORY,
  );

  execute(input: SubscribeToFundInput): Observable<PortfolioActionResult> {
    if (input.amount < input.fund.min) {
      return this.portfolioRepository.getUser().pipe(
        take(1),
        map((user) => ({
          success: false,
          message: `El monto minimo para ${input.fund.name} es ${input.fund.min}.`,
          user,
        })),
      );
    }

    return this.portfolioRepository.getSubscriptions().pipe(
      take(1),
      switchMap((subscriptions) => {
        if (subscriptions[input.fund.id]) {
          return this.portfolioRepository.getUser().pipe(
            take(1),
            map((user) => ({
              success: false,
              message: 'Ya estas suscrito a este fondo.',
              user,
            })),
          );
        }

        return this.portfolioRepository.subscribe({
          fundId: input.fund.id,
          amount: input.amount,
          notificationMethod: input.notificationMethod,
        });
      }),
    );
  }
}
