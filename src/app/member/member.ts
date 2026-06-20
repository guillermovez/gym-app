import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MemberApi, MemberRecord, MemberStatus } from './member-api';

type ModalMode = 'create' | 'edit' | 'view' | 'delete' | null;

@Component({
  selector: 'app-member',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './member.html',
  styleUrl: './member.scss',
  host: { class: 'member-host' },
})
export class Member {
  // ── Dependencies ─────────────────────────────────────────────────────────
  private readonly api = inject(MemberApi);
  private readonly fb = inject(FormBuilder);

  // ── UI state ─────────────────────────────────────────────────────────────
  readonly modalMode = signal<ModalMode>(null);
  readonly isClosing = signal(false);
  readonly submitted = signal(false);
  readonly selectedMember = signal<MemberRecord | null>(null);

  // ── Filter / pagination state ────────────────────────────────────────────
  readonly filterText = signal('');
  readonly filterStatus = signal('');
  readonly filterPlan = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 5;

  // ── Derived state ─────────────────────────────────────────────────────────
  readonly filtered = computed(() => {
    const text = this.filterText().toLowerCase();
    const status = this.filterStatus();
    const plan = this.filterPlan();

    return this.api.members().filter((m) => {
      const fullName = `${m.name} ${m.lastName}`.toLowerCase();
      const matchText =
        !text || fullName.includes(text) || m.email.includes(text) || m.dni.includes(text);
      const matchStatus = !status || m.status === status;
      const matchPlan = !plan || m.plan === plan;
      return matchText && matchStatus && matchPlan;
    });
  });

  readonly paginated = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
  );

  readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  // ── Labels / class maps ───────────────────────────────────────────────────
  readonly statusLabel: Record<MemberStatus, string> = {
    active: 'Activo',
    expiring: 'Por vencer',
    expired: 'Vencido',
  };

  readonly statusClass: Record<MemberStatus, string> = {
    active: 'badge badge--active',
    expiring: 'badge badge--expiring',
    expired: 'badge badge--expired',
  };

  // ── Form ─────────────────────────────────────────────────────────────────
  readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    plan: ['', Validators.required],
  });

  fieldError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || this.submitted()));
  }

  // ── Modal actions ─────────────────────────────────────────────────────────
  openCreateModal(): void {
    this.form.reset();
    this.submitted.set(false);
    this.selectedMember.set(null);
    this._openModal('create');
  }

  openViewModal(member: MemberRecord): void {
    this.selectedMember.set(member);
    this._openModal('view');
  }

  openEditModal(member: MemberRecord): void {
    this.selectedMember.set(member);
    this.submitted.set(false);
    this.form.setValue({
      name: member.name,
      lastName: member.lastName,
      dni: member.dni,
      email: member.email,
      phone: member.phone,
      plan: member.plan,
    });
    this._openModal('edit');
  }

  openDeleteModal(member: MemberRecord): void {
    this.selectedMember.set(member);
    this._openModal('delete');
  }

  confirmDelete(): void {
    const member = this.selectedMember();
    if (!member) return;
    this.api.delete(member.id);
    this.closeModal();
  }

  saveMember(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    const { name, lastName, dni, email, phone, plan } = this.form.value;

    if (this.modalMode() === 'edit' && this.selectedMember()) {
      this.api.update(this.selectedMember()!.id, { name, lastName, dni, email, phone, plan });
    } else {
      this.api.create({ name, lastName, dni, email, phone, plan });
      this.currentPage.set(1);
    }

    this.closeModal();
  }

  closeModal(): void {
    this.isClosing.set(true);
    setTimeout(() => {
      this.modalMode.set(null);
      this.selectedMember.set(null);
      this.isClosing.set(false);
    }, 200);
  }

  // ── Pagination / filters ──────────────────────────────────────────────────
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  onFilterChange(type: 'text' | 'status' | 'plan', value: string): void {
    if (type === 'text') this.filterText.set(value);
    if (type === 'status') this.filterStatus.set(value);
    if (type === 'plan') this.filterPlan.set(value);
    this.currentPage.set(1);
  }

  // ── Private helpers ───────────────────────────────────────────────────────
  private _openModal(mode: NonNullable<ModalMode>): void {
    this.isClosing.set(false);
    this.modalMode.set(mode);
  }
}
