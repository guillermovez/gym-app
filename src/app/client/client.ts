import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

export type ClientStatus = 'active' | 'expiring' | 'expired';

export interface ClientRecord {
  id: number;
  initials: string;
  name: string;
  lastName: string;
  dni: string;
  email: string;
  phone: string;
  plan: 'Mensual' | 'Trimestral' | 'Anual';
  expiresAt: string;
  status: ClientStatus;
  avatarBg: string;
  avatarText: string;
}

type ModalMode = 'create' | 'edit' | 'view' | 'delete' | null;

const AVATAR_COLORS: { bg: string; text: string }[] = [
  { bg: 'bg-blue-50',   text: 'text-blue-600'   },
  { bg: 'bg-amber-50',  text: 'text-amber-600'  },
  { bg: 'bg-green-50',  text: 'text-green-600'  },
  { bg: 'bg-red-50',    text: 'text-red-600'    },
  { bg: 'bg-purple-50', text: 'text-purple-600' },
  { bg: 'bg-teal-50',   text: 'text-teal-600'   },
];

@Component({
  selector: 'app-client',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client.html',
  styleUrl: './client.css',
})
export class Client {

  // ── Estado general ────────────────────────────────────────
  modalMode  = signal<ModalMode>(null);   // 'create' | 'edit' | 'view' | 'delete' | null
  isClosing  = signal(false);
  submitted  = signal(false);
  nextId     = signal(6);

  selectedClient = signal<ClientRecord | null>(null); // cliente activo para view/edit/delete

  filterText   = signal('');
  filterStatus = signal('');
  filterPlan   = signal('');

  currentPage = signal(1);
  pageSize    = 5;

  clients = signal<ClientRecord[]>([
    { id: 1, initials: 'AM', name: 'Ana',     lastName: 'Martínez', dni: '45123890', email: 'ana.martinez@gmail.com',  phone: '+51 987 654 321', plan: 'Mensual',    expiresAt: '10 jun 2026', status: 'active',   avatarBg: 'bg-blue-50',   avatarText: 'text-blue-600'   },
    { id: 2, initials: 'CR', name: 'Carlos',  lastName: 'Ríos',     dni: '32456712', email: 'carlos.rios@outlook.com', phone: '+51 912 345 678', plan: 'Trimestral', expiresAt: '02 jun 2026', status: 'expiring', avatarBg: 'bg-amber-50',  avatarText: 'text-amber-600'  },
    { id: 3, initials: 'LV', name: 'Lucía',   lastName: 'Vargas',   dni: '71234567', email: 'lucia.vargas@gmail.com',  phone: '+51 956 789 012', plan: 'Anual',       expiresAt: '28 may 2026', status: 'expired',  avatarBg: 'bg-red-50',    avatarText: 'text-red-600'    },
    { id: 4, initials: 'RP', name: 'Rodrigo', lastName: 'Paredes',  dni: '60987654', email: 'r.paredes@hotmail.com',   phone: '+51 934 567 890', plan: 'Mensual',    expiresAt: '15 jun 2026', status: 'active',   avatarBg: 'bg-green-50',  avatarText: 'text-green-600'  },
    { id: 5, initials: 'MF', name: 'María',   lastName: 'Flores',   dni: '48765432', email: 'm.flores@gmail.com',      phone: '+51 978 123 456', plan: 'Trimestral', expiresAt: '30 jul 2026', status: 'active',   avatarBg: 'bg-purple-50', avatarText: 'text-purple-600' },
  ]);

  // ── Formulario (compartido por create / edit) ─────────────
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name:     ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dni:      ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      email:    ['', [Validators.required, Validators.email]],
      phone:    ['', Validators.required],
      plan:     ['', Validators.required],
    });
  }

  // ── Computed ───────────────────────────────────────────────
  filtered = computed(() => {
    const text   = this.filterText().toLowerCase();
    const status = this.filterStatus();
    const plan   = this.filterPlan();

    return this.clients().filter(c => {
      const fullName    = `${c.name} ${c.lastName}`.toLowerCase();
      const matchText   = !text   || fullName.includes(text) || c.email.includes(text) || c.dni.includes(text);
      const matchStatus = !status || c.status === status;
      const matchPlan   = !plan   || c.plan === plan;
      return matchText && matchStatus && matchPlan;
    });
  });

  paginated = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.ceil(this.filtered().length / this.pageSize));

  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  // ── Labels / estilos de estado ────────────────────────────
  statusLabel: Record<ClientStatus, string> = {
    active:   'Activo',
    expiring: 'Por vencer',
    expired:  'Vencido',
  };

  statusClass: Record<ClientStatus, string> = {
    active:   'bg-green-50 text-green-700',
    expiring: 'bg-amber-50 text-amber-600',
    expired:  'bg-red-50 text-red-600',
  };

  fieldError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || this.submitted()));
  }

  private getInitials(name: string, lastName: string): string {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  private pickColor(id: number): { bg: string; text: string } {
    return AVATAR_COLORS[id % AVATAR_COLORS.length];
  }

  private formatExpiry(plan: string): string {
    const date   = new Date();
    const months = plan === 'Mensual' ? 1 : plan === 'Trimestral' ? 3 : 12;
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // ════════════════════════════════════════════════════════
  // ACCIONES — Crear
  // ════════════════════════════════════════════════════════
  openCreateModal(): void {
    this.form.reset();
    this.submitted.set(false);
    this.selectedClient.set(null);
    this.isClosing.set(false);
    this.modalMode.set('create');
  }

  // ════════════════════════════════════════════════════════
  // ACCIONES — Ver detalle
  // ════════════════════════════════════════════════════════
  openViewModal(client: ClientRecord): void {
    this.selectedClient.set(client);
    this.isClosing.set(false);
    this.modalMode.set('view');
  }

  // ════════════════════════════════════════════════════════
  // ACCIONES — Editar
  // ════════════════════════════════════════════════════════
  openEditModal(client: ClientRecord): void {
    this.selectedClient.set(client);
    this.submitted.set(false);
    this.form.setValue({
      name:     client.name,
      lastName: client.lastName,
      dni:      client.dni,
      email:    client.email,
      phone:    client.phone,
      plan:     client.plan,
    });
    this.isClosing.set(false);
    this.modalMode.set('edit');
  }

  // ════════════════════════════════════════════════════════
  // ACCIONES — Eliminar
  // ════════════════════════════════════════════════════════
  openDeleteModal(client: ClientRecord): void {
    this.selectedClient.set(client);
    this.isClosing.set(false);
    this.modalMode.set('delete');
  }

  confirmDelete(): void {
    const client = this.selectedClient();
    if (!client) return;
    this.clients.update(list => list.filter(c => c.id !== client.id));
    this.closeModal();
  }

  // ════════════════════════════════════════════════════════
  // Guardar (crear o actualizar según el modo)
  // ════════════════════════════════════════════════════════
  saveClient(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    const { name, lastName, dni, email, phone, plan } = this.form.value;

    if (this.modalMode() === 'edit' && this.selectedClient()) {
      // ── Actualizar cliente existente ──
      const id = this.selectedClient()!.id;
      this.clients.update(list =>
        list.map(c =>
          c.id === id
            ? {
                ...c,
                initials: this.getInitials(name, lastName),
                name, lastName, dni, email, phone, plan,
                expiresAt: this.formatExpiry(plan),
              }
            : c
        )
      );
    } else {
      // ── Crear cliente nuevo ──
      const id    = this.nextId();
      const color = this.pickColor(id);

      const newClient: ClientRecord = {
        id,
        initials:   this.getInitials(name, lastName),
        name,
        lastName,
        dni,
        email,
        phone,
        plan,
        expiresAt:  this.formatExpiry(plan),
        status:     'active',
        avatarBg:   color.bg,
        avatarText: color.text,
      };

      this.clients.update(list => [newClient, ...list]);
      this.nextId.update(n => n + 1);
      this.currentPage.set(1);
    }

    this.closeModal();
  }

  // ════════════════════════════════════════════════════════
  // Cerrar modal (con animación)
  // ════════════════════════════════════════════════════════
  closeModal(): void {
    this.isClosing.set(true);
    setTimeout(() => {
      this.modalMode.set(null);
      this.selectedClient.set(null);
      this.isClosing.set(false);
    }, 200);
  }

  // ── Paginación / Filtros ─────────────────────────────────
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  onFilterChange(type: 'text' | 'status' | 'plan', value: string): void {
    if (type === 'text')   this.filterText.set(value);
    if (type === 'status') this.filterStatus.set(value);
    if (type === 'plan')   this.filterPlan.set(value);
    this.currentPage.set(1);
  }
}