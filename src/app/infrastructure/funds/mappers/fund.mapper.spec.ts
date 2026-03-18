import { toFundEntity } from './fund.mapper';

describe('fund.mapper', () => {
  it('maps FundDbDto to Fund entity', () => {
    const entity = toFundEntity({
      id: 10,
      nombre: 'FPV_BTG PACTUAL DINAMICA',
      valor: 100000,
    });

    expect(entity).toEqual({
      id: 10,
      name: 'FPV_BTG PACTUAL DINAMICA',
      min: 100000,
    });
  });
});
