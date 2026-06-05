import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LoginResponse } from './login-response';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/auth/login';

  login(email: string, password: string): Observable<LoginResponse> {
    const payload = { usuario: email, clave: password };

    return this.http.post<LoginResponse>(this.apiUrl, payload).pipe(
      tap((response) => {
        if (response && response.token) {
          localStorage.setItem('boxcontroll_token', response.token);
        }
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('boxcontroll_token');
  }

  getToken(): string | null {
    return localStorage.getItem('boxcontroll_token');
  }
}
