import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PortfolioService } from './portfolio.service';
import { environment } from '../../../../environments/environment';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PortfolioService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(PortfolioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET /portfolio with correct query parameters', () => {
    service.findAll('artist-123', 'Blackwork').subscribe(items => {
      expect(items.length).toBe(0);
    });

    const req = httpMock.expectOne(r =>
      r.url === `${environment.apiUrl}/portfolio` &&
      r.params.get('artistId') === 'artist-123' &&
      r.params.get('styleTag') === 'Blackwork'
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
