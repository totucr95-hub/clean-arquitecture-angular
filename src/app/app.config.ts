import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { FUND_REPOSITORY } from './core/tokens/fund-repository.token';
import { FundApiService } from './infrastructure/funds/fund-api.service';
import { PortfolioApiService } from './infrastructure/portfolio/portfolio-api.service';
import { API_BASE_URL } from './core/tokens/api-base-url.token';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { PORTFOLIO_REPOSITORY } from './core/tokens/portfolio-repository.token';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpErrorInterceptor])),
    {
      provide: API_BASE_URL,
      useValue: environment.apiBaseUrl,
    },
    {
      provide: FUND_REPOSITORY,
      useExisting: FundApiService,
    },
    {
      provide: PORTFOLIO_REPOSITORY,
      useExisting: PortfolioApiService,
    },
  ],
};
