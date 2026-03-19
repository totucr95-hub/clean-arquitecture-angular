import { NotificationMethod, TransactionType } from '../../../dominio/entities/transaction.entity';

export interface TransactionDbDto {
  id: number;
  userId: number;
  fundId: number;
  amount: number;
  type: TransactionType;
  date: string;
  notificationMethod: NotificationMethod;
}

export interface CreateTransactionDbDto {
  userId: number;
  fundId: number;
  amount: number;
  type: TransactionType;
  date: string;
  notificationMethod: NotificationMethod;
}
