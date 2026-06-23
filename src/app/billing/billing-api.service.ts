import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { 
  InvoiceResponseDTO, 
  InvoiceRequestDTO, 
  PaymentRequestDTO, 
  PaymentResponseDTO 
} from './billing.models';

@Injectable({
  providedIn: 'root'
})
export class BillingApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/billing';

  // 🚦 Señal para almacenar las cuotas morosas globales en memoria
  readonly overdueInvoices = signal<InvoiceResponseDTO[]>([]);
  readonly cashHistory = signal<PaymentResponseDTO[]>([]);

  private getHeaders(): HttpHeaders {
    const tenantId = localStorage.getItem('tenant_id') || '';
    const token = localStorage.getItem('boxcontroll_token') || '';
    return new HttpHeaders({
      'X-Tenant-Id': tenantId,
      'Authorization': `Bearer ${token}`
    });
  }

  // 1. Obtener lista de cuotas morosas (Soporte operativo para el Dashboard o Caja)
  loadOverdueInvoices(): void {
    this.http.get<InvoiceResponseDTO[]>(`${this.apiUrl}/invoices/overdue`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => this.overdueInvoices.set(data || []), // Si es 204 (vacío), setea array limpio
        error: (err) => console.error('Error al cargar morosos:', err)
      });
  }

  // 2. Obtener el historial de cuentas de un miembro específico
  getHistoryByMember(memberId: string): Observable<InvoiceResponseDTO[]> {
    return this.http.get<InvoiceResponseDTO[]>(`${this.apiUrl}/invoices/member/${memberId}`, {
      headers: this.getHeaders()
    });
  }

  // Agrega este método al final de tu servicio:
  loadCashHistory(): void {
    this.http.get<PaymentResponseDTO[]>(`${this.apiUrl}/payments`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => this.cashHistory.set(data || []),
        error: (err) => console.error('Error al cargar historial de caja:', err)
      });
  }

  // 3. Registrar un pago físico (Mata una cuota o registra directo)
  registrarPago(payment: PaymentRequestDTO): Observable<PaymentResponseDTO> {
    return this.http.post<PaymentResponseDTO>(`${this.apiUrl}/payments`, payment, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => {
        // 🔄 Si registramos un pago, refrescamos la lista de morosos de forma reactiva
        this.loadOverdueInvoices();
        this.loadCashHistory();
      })
    );
  }

  // 4. Crear una cuota inmediata/adicional manualmente
  crearCuota(invoice: InvoiceRequestDTO): Observable<InvoiceResponseDTO> {
    return this.http.post<InvoiceResponseDTO>(`${this.apiUrl}/invoices`, invoice, {
      headers: this.getHeaders()
    });
  }
}