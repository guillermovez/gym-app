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
  private readonly apiUrl = `${environment.apiUrl}/api/auth`;

  private readonly TOKEN_KEY = 'boxcontroll_token';

  login(email: string, password: string): Observable<LoginResponse> {
    const payload = { email: email, password: password };

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => {
        if (response && response.accessToken) {
          localStorage.setItem(this.TOKEN_KEY, response.accessToken);
        }
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getLocalToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(token: string): UserResponse | null {
    return null;
  }

  isLoggedIn(): Observable<boolean> {
    const token = this.getLocalToken();

    if(!token) {
      return of(false);
    }

    return this.http.get<UserResponse>(`${this.apiUrl}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).pipe(
      map(() => true),
      catchError(() => {
        this.logout();
        return of(false)
      })
    );
  }
}
