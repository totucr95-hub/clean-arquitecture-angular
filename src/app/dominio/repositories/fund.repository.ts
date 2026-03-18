import { Observable } from 'rxjs';
import { Fund } from '../fund.model';

export interface FundRepository {
  getFunds(): Observable<Fund[]>;
}
