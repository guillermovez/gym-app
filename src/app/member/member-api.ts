import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export type MemberStatus = 'active' | 'expiring' | 'expired' | 'inactive';
export type MemberPlan = 'Mensual' | 'Trimestral' | 'Anual';

export interface MemberRecord {
  id: string; 
  initials: string;
  name: string;
  lastName: string;
  dni: string;
  email: string;
  phone: string;
  plan: MemberPlan;
  expiresAt: string;
  status: MemberStatus;
  avatarBg: string;
  avatarText: string;
}

export interface CreateMemberDto {
  name: string;
  lastName: string;
  dni: string;
  email: string;
  phone: string;
  plan: MemberPlan;
}

export type UpdateMemberDto = CreateMemberDto;

const AVATAR_COLORS = [
  { bg: 'avatar-blue', text: 'avatar-blue-text' },
  { bg: 'avatar-amber', text: 'avatar-amber-text' },
  { bg: 'avatar-green', text: 'avatar-green-text' },
  { bg: 'avatar-red', text: 'avatar-red-text' },
  { bg: 'avatar-purple', text: 'avatar-purple-text' },
];

// 🔄 Diccionario para normalizar los Enums de Java al Frontend
const PLAN_MAP: Record<string, MemberPlan> = {
  'MENSUAL': 'Mensual',
  'TRIMESTRAL': 'Trimestral',
  'ANUAL': 'Anual',
  'Mensual': 'Mensual',
  'Trimestral': 'Trimestral',
  'Anual': 'Anual'
};

@Injectable({
  providedIn: 'root',
})
export class MemberApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/members`; 

  private _members = signal<MemberRecord[]>([]);
  readonly members = this._members.asReadonly();

  private getHeaders(): HttpHeaders {
    const tenantId = localStorage.getItem('tenant_id') || '';
    const token = localStorage.getItem('boxcontroll_token') || '';
    return new HttpHeaders({
      'X-Tenant-Id': tenantId,
      'Authorization': `Bearer ${token}`
    });
  }

  private getInitials(name: string, lastName: string): string {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  private pickColor(id: string): { bg: string; text: string } {
    const charCodeSum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return AVATAR_COLORS[charCodeSum % AVATAR_COLORS.length];
  }

  /** Carga los miembros desde la base de datos y refresca la señal */
  loadMembers(): void {
    this.http.get<MemberRecord[]>(this.apiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          const enriched = data.map(m => {
            const color = this.pickColor(m.id); 
            return {
              ...m,
              plan: PLAN_MAP[m.plan] || 'Mensual', // 🔄 Normalización cosmética segura
              initials: this.getInitials(m.name, m.lastName),
              avatarBg: color.bg,     
              avatarText: color.text   
            };
          });
          this._members.set(enriched);
        },
        error: (err) => console.error('Error al traer miembros de Postgres:', err)
      });
  }

 create(dto: CreateMemberDto): Observable<MemberRecord> {
    return this.http.post<MemberRecord>(this.apiUrl, dto, { headers: this.getHeaders() }).pipe(
      tap((newMember) => {
        // 🕵️‍♂️ ¡LA TRAMPA! Corre el sistema, abre la consola (F12) y mira qué sale aquí:
        console.log('🔴 RESPUESTA REAL DEL BACKEND AL CREAR:', newMember);

        const processed: MemberRecord = {
          ...newMember,
          plan: PLAN_MAP[newMember.plan] || 'Mensual',
          initials: this.getInitials(newMember.name, newMember.lastName),
          avatarBg: this.pickColor(newMember.id).bg,
          avatarText: this.pickColor(newMember.id).text as any
        };
        this._members.update((list) => [processed, ...list]);
      })
    );
  }
  
// 🔄 OPTIMIZADO: Ahora recibe el Member actualizado desde Java en lugar de void
  update(id: string, dto: UpdateMemberDto): Observable<MemberRecord> {
    return this.http.put<MemberRecord>(`${this.apiUrl}/${id}`, dto, { headers: this.getHeaders() }).pipe(
      tap((updatedMember) => {
        // Sincronizamos los cambios REALES devueltos por el servidor (incluyendo el expiresAt calculado)
        this._members.update((list) =>
          list.map((m) => m.id === id ? { 
            ...m, 
            ...updatedMember, // 👈 Pisamos con lo que calculó Java
            plan: PLAN_MAP[updatedMember.plan] || 'Mensual', // Normalizamos formato texto
            initials: this.getInitials(updatedMember.name, updatedMember.lastName) 
          } : m)
        );
      })
    );
  }

  // 📁 En tu member-api.ts — Modifica el método delete

  delete(id: string): Observable<MemberRecord> {
    // 🔄 Cambiado a Observable<MemberRecord> para recibir la respuesta de Java
    return this.http.delete<MemberRecord>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap((updatedMember) => {
        // 🔥 Sincronizamos el cambio de estado en la señal sin eliminar al miembro del array visual
        this._members.update((list) =>
          list.map((m) => m.id === id ? { 
            ...m, 
            status: updatedMember.status // Actualiza a 'active' o 'inactive' según responda Java
          } : m)
        );
      })
    );
  }
}