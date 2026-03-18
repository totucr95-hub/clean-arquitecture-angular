import { Observable } from 'rxjs';
import { Transaction, NotificationMethod } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';

export interface PortfolioSubscription {
  amount: number;
  notificationMethod: NotificationMethod;
}

export interface PortfolioActionResult {
  success: boolean;
  message: string;
  user: User;
}

export interface SubscribeCommand {
  fundId: number;
  amount: number;
  notificationMethod: NotificationMethod;
}

export interface PortfolioRepository {
  getUser(): Observable<User>;
  getSubscriptions(): Observable<Record<number, PortfolioSubscription>>;
  getTransactions(): Observable<Transaction[]>;
  subscribe(command: SubscribeCommand): Observable<PortfolioActionResult>;
  cancel(fundId: number): Observable<PortfolioActionResult>;
}
