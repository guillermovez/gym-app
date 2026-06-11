import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface SidebarItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface UserProfile {
  name: string;
  role: string;
  initials: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'sidebar-host',
  },
})
export class Sidebar {
  protected readonly user = signal<UserProfile>({
    name: 'Jorge López',
    role: 'Administrador',
    initials: 'JL',
  });

  protected readonly sections = signal<SidebarSection[]>([
    {
      title: 'Principal',
      items: [
        {
          label: 'Dashboard',
          icon: 'ti-layout-dashboard',
          route: '/app/dashboard',
        },
        {
          label: 'Clientes',
          icon: 'ti-users',
          route: '/app/clientes',
          badge: '+12',
        },
        {
          label: 'Membresías',
          icon: 'ti-id',
          route: '/app/membresias',
        },
      ],
    },
    {
      title: 'Sistema',
      items: [
        {
          label: 'Configuración',
          icon: 'ti-settings',
          route: '/app/configuracion',
        },
      ],
    },
  ]);

  protected logout(): void {
    console.log('Cerrar sesión');
  }
}
