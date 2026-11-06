import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created and initial state unauthenticated', () => {
    expect(service).toBeTruthy();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('should authenticate user and store token on login', () => {
    const mockResponse = {
      token: 'jwt.token.test',
      type: 'Bearer',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Julian de Oliveira',
      email: 'julian@inkcraft.com',
      role: 'ROLE_CLIENT' as const
    };

    service.login({ email: 'julian@inkcraft.com', password: 'password123' }).subscribe(res => {
      expect(res.token).toBe('jwt.token.test');
      expect(service.isAuthenticated()).toBe(true);
      expect(service.isClient()).toBe(true);
      expect(service.isArtist()).toBe(false);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should clear token and user on logout', () => {
    service.logout(false);
    expect(service.token()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });
});
