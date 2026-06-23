import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AuthApi } from '../auth/auth-api';
import { MemberApi } from '../member/member-api';
import { BillingApiService } from '../billing/billing-api.service';

type MetricVariant = 'success' | 'primary' | 'warning';
type ExtendedStatus = 'active' | 'pending' | 'inactive' | 'expiring' | 'expired';

interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  icon: string;
  variant: MetricVariant;
}

interface RecentClient {
  name: string;
  email: string;
  initials: string;
  status: ExtendedStatus;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  // ── Inyección de Microservicios ───────────────────────────────────────────
  private readonly authApi = inject(AuthApi);
  private readonly memberApi = inject(MemberApi);
  private readonly billingService = inject(BillingApiService);

  protected readonly currentDate = signal(new Date());

  // 📬 1. Captura el nombre real del Administrador conectado vía Gateway
  protected readonly userName = toSignal(
    this.authApi.getCurrentUser().pipe(map((userData) => userData.firstName)),
    { initialValue: 'Administrador' }
  );

  ngOnInit(): void {
    // Disparamos la carga de datos en paralelo al pisar el Home
    this.memberApi.loadMembers();
    this.billingService.loadCashHistory();
    this.billingService.loadOverdueInvoices();
  }

  // 🧠 2. SEÑAL COMPUTADA: Cálculos matemáticos financieros y demográficos en vivo
  protected readonly metrics = computed<DashboardMetric[]>(() => {
    const members = this.memberApi.members();
    const payments = this.billingService.cashHistory();

    // A. Contar Clientes Activos
    const activeCount = members.filter(m => m.status === 'active').length;

    // B. Sumar Ingresos de Caja Totales
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // C. Contar alertas de membresías por vencer o morosas
    const warningCount = members.filter(m => m.status === 'expiring' || m.status === 'expired').length;

    return [
      {
        label: 'Clientes Activos',
        value: activeCount.toString(),
        change: 'Sincronizado en tiempo real',
        icon: 'ti-users',
        variant: 'success',
      },
      {
        label: 'Ingresos Recaudados',
        value: `S/ ${totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: 'Flujo de caja total en Soles',
        icon: 'ti-currency-dollar',
        variant: 'primary',
      },
      {
        label: 'Alertas de Membresía',
        value: warningCount.toString(),
        change: 'Requieren revisión en Caja',
        icon: 'ti-alert-circle',
        variant: 'warning',
      },
    ];
  });

  // 🧠 3. SEÑAL COMPUTADA: Mapea los últimos 3 miembros creados en el gimnasio
  protected readonly recentClients = computed<RecentClient[]>(() => {
    const rawMembers = this.memberApi.members();
    
    // Tomamos los 3 primeros registros (los más recientes del array)
    return rawMembers.slice(0, 3).map(m => ({
      name: `${m.name} ${m.lastName}`,
      email: m.email,
      initials: m.initials,
      status: m.status as ExtendedStatus
    }));
  });

  // ── Helpers de Formateo y Estilos Cosméticos ──────────────────────────────
  protected readonly formattedDate = computed(() => {
    return new Intl.DateTimeFormat('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(this.currentDate());
  });

  protected getMetricCardClass(variant: MetricVariant): string {
    return `metric-card__icon--${variant}`;
  }

  protected getStatusLabel(status: ExtendedStatus): string {
    switch (status) {
      case 'active': return 'Activo';
      case 'expiring': return 'Por Vencer';
      case 'expired': return 'Vencido';
      case 'inactive': return 'Inactivo';
      default: return 'Pendiente';
    }
  }

  protected getStatusClass(status: ExtendedStatus): string {
    // Normaliza el color de las alertas por si tu CSS solo maneja active/pending/inactive
    if (status === 'expiring') return 'client-status--pending';
    if (status === 'expired') return 'client-status--inactive';
    return `client-status--${status}`;
  }

  protected getAvatarClass(status: ExtendedStatus): string {
    if (status === 'expiring') return 'client-avatar--pending';
    if (status === 'expired') return 'client-avatar--inactive';
    return `client-avatar--${status}`;
  }
}