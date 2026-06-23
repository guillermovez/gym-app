import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AttendanceRecord {
  id: string;
  documentNumber: string;
  memberName: string;
  accessTime: string;
  allowed: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccessControlService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/access-control';

  // 🚦 Señal que guardará el historial de asistencias en memoria
  readonly history = signal<AttendanceRecord[]>([]);

  private getHeaders(): HttpHeaders {
    const tenantId = localStorage.getItem('tenant_id') || '';
    const token = localStorage.getItem('boxcontroll_token') || '';
    return new HttpHeaders({
      'X-Tenant-Id': tenantId,
      'Authorization': `Bearer ${token}`
    });
  }


  // 🔓 Cargar el historial inicial
  loadHistory(): void {
    this.http.get<AttendanceRecord[]>(`${this.apiUrl}/history`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => this.history.set(data),
        error: (err) => console.error('Error al cargar historial:', err)
      });
  }

  // 🔑 Procesar una nueva entrada
  checkIn(dni: string): Observable<AttendanceRecord> {
    const params = new HttpParams().set('dni', dni);
    
    return this.http.post<AttendanceRecord>(`${this.apiUrl}/check-in`, null, {
      headers: this.getHeaders(),
      params
    }).pipe(
      tap((newRecord) => {
        // Inyectamos el nuevo registro al inicio de la lista de forma reactiva
        this.history.update((list) => [newRecord, ...list]);
      })
    );
  }
}