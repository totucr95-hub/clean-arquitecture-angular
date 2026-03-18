import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { API_BASE_URL } from '../tokens/api-base-url.token';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: API_BASE_URL, useValue: 'http://localhost:3000' }],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('builds URL for get when endpoint has no leading slash', () => {
    service.get('fondos').subscribe();

    const req = httpMock.expectOne('http://localhost:3000/fondos');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('keeps URL when endpoint already has leading slash', () => {
    service.get('/users/1').subscribe();

    const req = httpMock.expectOne('http://localhost:3000/users/1');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('calls post with body', () => {
    service.post('/subscriptions', { fundId: 1, amount: 1000 }).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/subscriptions');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ fundId: 1, amount: 1000 });
    req.flush({});
  });

  it('calls put', () => {
    service.put('/users/1', { balance: 999 }).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/users/1');
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('calls patch', () => {
    service.patch('/users/1', { balance: 500 }).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/users/1');
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });

  it('calls delete', () => {
    service.delete('/subscriptions/7').subscribe();

    const req = httpMock.expectOne('http://localhost:3000/subscriptions/7');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
