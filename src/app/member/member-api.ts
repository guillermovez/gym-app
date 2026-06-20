import { Injectable, signal } from '@angular/core';

export type MemberStatus = 'active' | 'expiring' | 'expired';
export type MemberPlan = 'Mensual' | 'Trimestral' | 'Anual';

export interface MemberRecord {
  id: number;
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

// ── Avatar colour palette ────────────────────────────────────────────────────
const AVATAR_COLORS: { bg: string; text: string }[] = [
  { bg: 'avatar-blue', text: 'avatar-blue-text' },
  { bg: 'avatar-amber', text: 'avatar-amber-text' },
  { bg: 'avatar-green', text: 'avatar-green-text' },
  { bg: 'avatar-red', text: 'avatar-red-text' },
  { bg: 'avatar-purple', text: 'avatar-purple-text' },
  { bg: 'avatar-teal', text: 'avatar-teal-text' },
];

// ── Seed data ────────────────────────────────────────────────────────────────
const SEED_MEMBERS: MemberRecord[] = [
  {
    id: 1,
    initials: 'AM',
    name: 'Ana',
    lastName: 'Martínez',
    dni: '45123890',
    email: 'ana.martinez@gmail.com',
    phone: '+51 987 654 321',
    plan: 'Mensual',
    expiresAt: '10 jun 2026',
    status: 'active',
    avatarBg: 'avatar-blue',
    avatarText: 'avatar-blue-text',
  },
  {
    id: 2,
    initials: 'CR',
    name: 'Carlos',
    lastName: 'Ríos',
    dni: '32456712',
    email: 'carlos.rios@outlook.com',
    phone: '+51 912 345 678',
    plan: 'Trimestral',
    expiresAt: '02 jun 2026',
    status: 'expiring',
    avatarBg: 'avatar-amber',
    avatarText: 'avatar-amber-text',
  },
  {
    id: 3,
    initials: 'LV',
    name: 'Lucía',
    lastName: 'Vargas',
    dni: '71234567',
    email: 'lucia.vargas@gmail.com',
    phone: '+51 956 789 012',
    plan: 'Anual',
    expiresAt: '28 may 2026',
    status: 'expired',
    avatarBg: 'avatar-red',
    avatarText: 'avatar-red-text',
  },
  {
    id: 4,
    initials: 'RP',
    name: 'Rodrigo',
    lastName: 'Paredes',
    dni: '60987654',
    email: 'r.paredes@hotmail.com',
    phone: '+51 934 567 890',
    plan: 'Mensual',
    expiresAt: '15 jun 2026',
    status: 'active',
    avatarBg: 'avatar-green',
    avatarText: 'avatar-green-text',
  },
  {
    id: 5,
    initials: 'MF',
    name: 'María',
    lastName: 'Flores',
    dni: '48765432',
    email: 'm.flores@gmail.com',
    phone: '+51 978 123 456',
    plan: 'Trimestral',
    expiresAt: '30 jul 2026',
    status: 'active',
    avatarBg: 'avatar-purple',
    avatarText: 'avatar-purple-text',
  },
];

@Injectable({
  providedIn: 'root',
})
export class MemberApi {
  private _members = signal<MemberRecord[]>(structuredClone(SEED_MEMBERS));
  private _nextId = signal(SEED_MEMBERS.length + 1);

  /** Read-only snapshot of all members. */
  readonly members = this._members.asReadonly();

  // ── Helpers ──────────────────────────────────────────────────────────────

  private getInitials(name: string, lastName: string): string {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  private pickColor(id: number): { bg: string; text: string } {
    return AVATAR_COLORS[id % AVATAR_COLORS.length];
  }

  private formatExpiry(plan: MemberPlan): string {
    const date = new Date();
    const months = plan === 'Mensual' ? 1 : plan === 'Trimestral' ? 3 : 12;
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // ── CRUD API (mock — synchronous for now, easy to swap for HTTP later) ───

  create(dto: CreateMemberDto): MemberRecord {
    const id = this._nextId();
    const color = this.pickColor(id);

    const record: MemberRecord = {
      id,
      initials: this.getInitials(dto.name, dto.lastName),
      name: dto.name,
      lastName: dto.lastName,
      dni: dto.dni,
      email: dto.email,
      phone: dto.phone,
      plan: dto.plan,
      expiresAt: this.formatExpiry(dto.plan),
      status: 'active',
      avatarBg: color.bg,
      avatarText: color.text,
    };

    this._members.update((list) => [record, ...list]);
    this._nextId.update((n) => n + 1);
    return record;
  }

  update(id: number, dto: UpdateMemberDto): void {
    this._members.update((list) =>
      list.map((m) =>
        m.id === id
          ? {
              ...m,
              initials: this.getInitials(dto.name, dto.lastName),
              name: dto.name,
              lastName: dto.lastName,
              dni: dto.dni,
              email: dto.email,
              phone: dto.phone,
              plan: dto.plan,
              expiresAt: this.formatExpiry(dto.plan),
            }
          : m,
      ),
    );
  }

  delete(id: number): void {
    this._members.update((list) => list.filter((m) => m.id !== id));
  }
}
