import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthApi } from '../../auth/auth-api';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

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
  private readonly authApi = inject(AuthApi);
  router = inject(Router);

  protected readonly user = toSignal(
    this.authApi.getCurrentUser().pipe(
      map(
        (userData): UserProfile => ({
          name: `${userData.firstName} ${userData.lastName}`,
          role: 'Administrador',
          initials: userData.firstName.split(' ')
            .filter(w => w)
            .map(w => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2),
        }),
      ),
    ),
    {
      initialValue: {
        name: 'Jhon Doe',
        role: 'Administrador',
        initials: 'JD',
      },
    },
  );

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
          label: 'Miembros',
          icon: 'ti-users',
          route: '/app/members',
          badge: '+12',
        },
        {
          label: 'Membresías',
          icon: 'ti-id',
          route: '/app/memberships',
        },
      ],
    },
    {
      title: 'Sistema',
      items: [
        {
          label: 'Configuración',
          icon: 'ti-settings',
          route: '/app/configuration',
        },
      ],
    },
  ]);

  protected logout(): void {
    this.authApi.logout();
    this.router.navigate(['/']);
  }
}
