import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { firstValueFrom, of, throwError } from 'rxjs';
import { httpErrorInterceptor } from './http-error.interceptor';

describe('httpErrorInterceptor', () => {
  const req = new HttpRequest('GET', '/test');

  it('passes through successful responses', async () => {
    const result = await firstValueFrom(
      httpErrorInterceptor(req, () => of(new HttpResponse({ status: 200, body: { ok: true } }))),
    );

    expect(result).toBeInstanceOf(HttpResponse);
    expect((result as HttpResponse<unknown>).status).toBe(200);
  });

  it('maps status 0 to network message', async () => {
    await expect(
      firstValueFrom(
        httpErrorInterceptor(req, () => throwError(() => new HttpErrorResponse({ status: 0 }))),
      ),
    ).rejects.toThrow('Network error. Check your connection.');
  });

  it('maps server errors (>=500) to server message', async () => {
    await expect(
      firstValueFrom(
        httpErrorInterceptor(req, () => throwError(() => new HttpErrorResponse({ status: 500 }))),
      ),
    ).rejects.toThrow('Server error. Try again later.');
  });

  it('maps unknown errors to unexpected network error', async () => {
    await expect(
      firstValueFrom(httpErrorInterceptor(req, () => throwError(() => new Error('boom')))),
    ).rejects.toThrow('Unexpected network error.');
  });

  it('keeps 4xx HttpErrorResponse untouched', async () => {
    const original = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });

    await expect(
      firstValueFrom(httpErrorInterceptor(req, () => throwError(() => original))),
    ).rejects.toBe(original);
  });
});
