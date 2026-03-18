import {
  toSubscriptionRecord,
  toTransactionEntity,
  toUserEntity,
} from './portfolio.mapper';

describe('portfolio.mapper', () => {
  it('maps UserDbDto to User entity', () => {
    const user = toUserEntity({ id: 1, balance: 120000 });

    expect(user).toEqual({ id: 1, balance: 120000 });
  });

  it('maps TransactionDbDto to Transaction entity', () => {
    const transaction = toTransactionEntity({
      id: 20,
      userId: 1,
      fundId: 2,
      amount: 75000,
      type: 'SUBSCRIBE',
      date: '2026-03-18T12:00:00.000Z',
      notificationMethod: 'EMAIL',
    });

    expect(transaction).toEqual({
      id: 20,
      fundId: 2,
      amount: 75000,
      type: 'SUBSCRIBE',
      date: '2026-03-18T12:00:00.000Z',
      notificationMethod: 'EMAIL',
    });
  });

  it('maps subscription list to fundId-keyed record', () => {
    const record = toSubscriptionRecord([
      {
        id: 1,
        userId: 1,
        fundId: 2,
        amount: 90000,
        notificationMethod: 'SMS',
      },
      {
        id: 2,
        userId: 1,
        fundId: 3,
        amount: 120000,
        notificationMethod: 'EMAIL',
      },
    ]);

    expect(record).toEqual({
      2: { amount: 90000, notificationMethod: 'SMS' },
      3: { amount: 120000, notificationMethod: 'EMAIL' },
    });
  });
});
