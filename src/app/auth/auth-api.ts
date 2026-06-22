import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LoginResponse } from './login/login-response';
import { catchError, Observable, of, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserResponse } from './user-response';

@Injectable({
  providedIn: 'root',
})
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly TOKEN_KEY = 'boxcontroll_token';
  private readonly USER_ID_KEY = 'boxcontroll_user_id';
  private readonly TENANT_ID_KEY = 'boxcontroll_tenant_id';

  login(email: string, password: string): Observable<LoginResponse> {
    const payload = { email: email, password: password };

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => {
        if (response && response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this .USER_ID_KEY, response.id);
          localStorage.setItem(this.TENANT_ID_KEY, response.tenant_id);
        }
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.TENANT_ID_KEY);
  }

  getLocalToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(
      `${this.apiUrl}/profile/${localStorage.getItem(this.USER_ID_KEY)}`,
      {
        headers: {
          Authorization: `Bearer ${this.getLocalToken()}`,
          'X-Tenant-Id': `${localStorage.getItem(this.TENANT_ID_KEY)}`,
        },
      },
    );
  }

  isLoggedIn(): Observable<boolean> {
    const token = this.getLocalToken();

    if (!token) {
      return of(false);
    }

    return this.http
      .get<UserResponse>(`${this.apiUrl}/profile/${localStorage.getItem(this.USER_ID_KEY)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Tenant-Id": `${localStorage.getItem(this.TENANT_ID_KEY)}`
        },
      })
      .pipe(
        map(() => true),
        catchError(() => {
          this.logout();
          return of(false);
        }),
      );
  }
}
