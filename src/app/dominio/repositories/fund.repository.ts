import { Observable } from 'rxjs';
import { Fund } from '../entities/fund.entity';

export interface FundRepository {
  getFunds(): Observable<Fund[]>;
}
