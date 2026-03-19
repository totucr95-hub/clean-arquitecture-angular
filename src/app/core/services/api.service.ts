import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/api-base-url.token';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  get<T>(endpoint: string, options?: HttpRequestOptions): Observable<T> {
    return this.http.get<T>(this.buildUrl(endpoint), options);
  }

  post<TResponse, TBody>(
    endpoint: string,
    body: TBody,
    options?: HttpRequestOptions,
  ): Observable<TResponse> {
    return this.http.post<TResponse>(this.buildUrl(endpoint), body, options);
  }

  put<TResponse, TBody>(
    endpoint: string,
    body: TBody,
    options?: HttpRequestOptions,
  ): Observable<TResponse> {
    return this.http.put<TResponse>(this.buildUrl(endpoint), body, options);
  }

  patch<TResponse, TBody>(
    endpoint: string,
    body: TBody,
    options?: HttpRequestOptions,
  ): Observable<TResponse> {
    return this.http.patch<TResponse>(this.buildUrl(endpoint), body, options);
  }

  delete<T>(endpoint: string, options?: HttpRequestOptions): Observable<T> {
    return this.http.delete<T>(this.buildUrl(endpoint), options);
  }

  private buildUrl(endpoint: string): string {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    return `${this.apiBaseUrl}${normalizedEndpoint}`;
  }
}

interface HttpRequestOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?:
    | HttpParams
    | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
  withCredentials?: boolean;
}
