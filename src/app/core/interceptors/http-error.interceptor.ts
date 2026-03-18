import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => new Error('Unexpected network error.'));
      }

      if (error.status === 0) {
        return throwError(() => new Error('Network error. Check your connection.'));
      }

      if (error.status >= 500) {
        return throwError(() => new Error('Server error. Try again later.'));
      }

      return throwError(() => error);
    }),
  );
};
