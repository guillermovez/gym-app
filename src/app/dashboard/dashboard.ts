import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

type MetricVariant = 'success' | 'primary' | 'warning';

type ClientStatus = 'active' | 'pending' | 'inactive';

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
  status: ClientStatus;
}

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  protected readonly userName = signal('Jorge');

  protected readonly currentDate = signal(new Date());

  protected readonly metrics = signal<DashboardMetric[]>([
    {
      label: 'Clientes Activos',
      value: '342',
      change: '+4.3% este mes',
      icon: 'ti-users',
      variant: 'success',
    },
    {
      label: 'Ingresos Mensuales',
      value: '$4,250',
      change: '+12.1% vs mes anterior',
      icon: 'ti-currency-dollar',
      variant: 'primary',
    },
    {
      label: 'Membresías por Vencer',
      value: '18',
      change: 'Requieren revisión',
      icon: 'ti-alert-circle',
      variant: 'warning',
    },
  ]);

  protected readonly recentClients = signal<RecentClient[]>([
    {
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@email.com',
      initials: 'CM',
      status: 'active',
    },
    {
      name: 'María Valeria',
      email: 'maria.valeria@email.com',
      initials: 'MV',
      status: 'pending',
    },
    {
      name: 'Ricardo Pérez',
      email: 'ricardo.perez@email.com',
      initials: 'RP',
      status: 'inactive',
    },
  ]);

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

  protected getStatusLabel(status: ClientStatus): string {
    switch (status) {
      case 'active':
        return 'Activo';

      case 'pending':
        return 'Pendiente';

      case 'inactive':
        return 'Inactivo';
    }
  }

  protected getStatusClass(status: ClientStatus): string {
    return `client-status--${status}`;
  }

  protected getAvatarClass(status: ClientStatus): string {
    return `client-avatar--${status}`;
  }
}
