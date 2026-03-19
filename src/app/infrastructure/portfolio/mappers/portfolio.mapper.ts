import { Transaction } from '../../../dominio/entities/transaction.entity';
import { User } from '../../../dominio/entities/user.entity';
import { PortfolioSubscription } from '../../../dominio/repositories/portfolio.repository';
import { SubscriptionDbDto } from '../dtos/subscription-db.dto';
import { TransactionDbDto } from '../dtos/transaction-db.dto';
import { UserDbDto } from '../dtos/user-db.dto';

export function toUserEntity(dto: UserDbDto): User {
  return {
    id: dto.id,
    balance: dto.balance,
  };
}

export function toTransactionEntity(dto: TransactionDbDto): Transaction {
  return {
    id: dto.id,
    fundId: dto.fundId,
    amount: dto.amount,
    type: dto.type,
    date: dto.date,
    notificationMethod: dto.notificationMethod,
  };
}

export function toSubscriptionRecord(
  subscriptions: SubscriptionDbDto[],
): Record<number, PortfolioSubscription> {
  return subscriptions.reduce<Record<number, PortfolioSubscription>>((acc, current) => {
    acc[current.fundId] = {
      amount: current.amount,
      notificationMethod: current.notificationMethod,
    };
    return acc;
  }, {});
}
