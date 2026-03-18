import { NotificationMethod } from '../../../dominio/entities/transaction.entity';

export interface SubscriptionDbDto {
  id: number;
  userId: number;
  fundId: number;
  amount: number;
  notificationMethod: NotificationMethod;
}

export interface CreateSubscriptionDbDto {
  userId: number;
  fundId: number;
  amount: number;
  notificationMethod: NotificationMethod;
}
