import { Fund } from '../../../dominio/entities/fund.entity';
import { FundDbDto } from '../dtos/fund-db.dto';

export function toFundEntity(dto: FundDbDto): Fund {
  return {
    id: dto.id,
    name: dto.nombre,
    min: dto.valor,
  };
}
