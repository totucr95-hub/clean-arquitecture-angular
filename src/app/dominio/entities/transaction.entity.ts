export type TransactionType = 'SUBSCRIBE' | 'CANCEL';
export type NotificationMethod = 'EMAIL' | 'SMS';

export enum TransactionTypeEnum {
  SUBSCRIBE = 'SUBSCRIBE',
  CANCEL = 'CANCEL',
}

export interface Transaction {
  id: number;
  fundId: number;
  amount: number;
  type: TransactionType;
  date: string; // ISO string
  notificationMethod: NotificationMethod;
}
