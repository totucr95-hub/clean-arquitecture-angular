import { InjectionToken } from '@angular/core';
import { FundRepository } from '../../dominio/repositories/fund.repository';

export const FUND_REPOSITORY = new InjectionToken<FundRepository>('FUND_REPOSITORY');
