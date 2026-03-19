import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import {
  PortfolioActionResult,
  PortfolioRepository,
  PortfolioSubscription,
  SubscribeCommand,
} from '../../dominio/repositories/portfolio.repository';
import { Transaction, TransactionTypeEnum } from '../../dominio/entities/transaction.entity';
import { User } from '../../dominio/entities/user.entity';
import { CreateSubscriptionDbDto, SubscriptionDbDto } from './dtos/subscription-db.dto';
import { CreateTransactionDbDto, TransactionDbDto } from './dtos/transaction-db.dto';
import { UserDbDto } from './dtos/user-db.dto';
import {
  toSubscriptionRecord,
  toTransactionEntity,
  toUserEntity,
} from './mappers/portfolio.mapper';

const CURRENT_USER_ID = 1;

@Injectable({
  providedIn: 'root',
})
export class PortfolioApiService implements PortfolioRepository {
  private readonly apiService = inject(ApiService);

  getUser(): Observable<User> {
    return this.getUserDto().pipe(map(toUserEntity));
  }

  getSubscriptions(): Observable<Record<number, PortfolioSubscription>> {
    return this.getSubscriptionsList().pipe(map(toSubscriptionRecord));
  }

  getTransactions(): Observable<Transaction[]> {
    return this.apiService
      .get<TransactionDbDto[]>(`/transactions?userId=${CURRENT_USER_ID}&_sort=id&_order=desc`)
      .pipe(map((transactions) => transactions.map(toTransactionEntity)));
  }

  subscribe(command: SubscribeCommand): Observable<PortfolioActionResult> {
    return forkJoin({
      user: this.getUserDto(),
      existingSubscriptions: this.apiService.get<SubscriptionDbDto[]>(
        `/subscriptions?userId=${CURRENT_USER_ID}&fundId=${command.fundId}`,
      ),
    }).pipe(
      switchMap(({ user, existingSubscriptions }) => {
        if (existingSubscriptions.length > 0) {
          return of(this.errorActionResult(user, 'Ya estas suscrito a este fondo.'));
        }

        if (user.balance < command.amount) {
          return of(
            this.errorActionResult(
              user,
              'No tienes saldo suficiente para suscribirte a este fondo.',
            ),
          );
        }

        const updatedBalance = user.balance - command.amount;
        return forkJoin({
          updatedUser: this.apiService.patch<UserDbDto, Partial<UserDbDto>>(
            `/users/${CURRENT_USER_ID}`,
            { balance: updatedBalance },
          ),
          subscription: this.apiService.post<SubscriptionDbDto, CreateSubscriptionDbDto>(
            '/subscriptions',
            {
              userId: CURRENT_USER_ID,
              fundId: command.fundId,
              amount: command.amount,
              notificationMethod: command.notificationMethod,
            },
          ),
          transaction: this.apiService.post<TransactionDbDto, CreateTransactionDbDto>(
            '/transactions',
            {
              userId: CURRENT_USER_ID,
              fundId: command.fundId,
              amount: command.amount,
              type: TransactionTypeEnum.SUBSCRIBE,
              date: new Date().toISOString(),
              notificationMethod: command.notificationMethod,
            },
          ),
        }).pipe(
          map(({ updatedUser }) => ({
            success: true,
            message: 'Suscripcion realizada con exito.',
            user: toUserEntity(updatedUser),
          })),
        );
      }),
    );
  }

  cancel(fundId: number): Observable<PortfolioActionResult> {
    return forkJoin({
      user: this.getUserDto(),
      subscriptionList: this.apiService.get<SubscriptionDbDto[]>(
        `/subscriptions?userId=${CURRENT_USER_ID}&fundId=${fundId}`,
      ),
    }).pipe(
      switchMap(({ user, subscriptionList }) => {
        const currentSubscription = subscriptionList[0];

        if (!currentSubscription) {
          return of(
            this.errorActionResult(user, 'No tienes una suscripcion activa en este fondo.'),
          );
        }

        const updatedBalance = user.balance + currentSubscription.amount;

        return forkJoin({
          updatedUser: this.apiService.patch<UserDbDto, Partial<UserDbDto>>(
            `/users/${CURRENT_USER_ID}`,
            { balance: updatedBalance },
          ),
          deletedSubscription: this.apiService.delete<unknown>(
            `/subscriptions/${currentSubscription.id}`,
          ),
          transaction: this.apiService.post<TransactionDbDto, CreateTransactionDbDto>(
            '/transactions',
            {
              userId: CURRENT_USER_ID,
              fundId,
              amount: currentSubscription.amount,
              type: TransactionTypeEnum.CANCEL,
              date: new Date().toISOString(),
              notificationMethod: currentSubscription.notificationMethod,
            },
          ),
        }).pipe(
          map(({ updatedUser }) => ({
            success: true,
            message: 'Suscripcion cancelada y saldo actualizado.',
            user: toUserEntity(updatedUser),
          })),
        );
      }),
    );
  }

  private getUserDto(): Observable<UserDbDto> {
    return this.apiService.get<UserDbDto>(`/users/${CURRENT_USER_ID}`);
  }

  private getSubscriptionsList(): Observable<SubscriptionDbDto[]> {
    return this.apiService.get<SubscriptionDbDto[]>(`/subscriptions?userId=${CURRENT_USER_ID}`);
  }

  private errorActionResult(user: UserDbDto, message: string): PortfolioActionResult {
    return {
      success: false,
      message,
      user: toUserEntity(user),
    };
  }
}
