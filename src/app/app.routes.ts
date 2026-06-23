import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Layout } from './layout/layout';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './auth/auth-guard';
import { Member } from './member/member';
import { AccessControlComponent } from './member/access-control.component';

export const routes: Routes = [
  {
    path: '',
    component: Login,
    title: 'Inicio de sesión',
  },
  {
    path: 'app',
    component: Layout,
    canActivateChild: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
        title: 'Dashboard',
      },
      {
        path: 'members',
        component: Member,
        title: 'Miembros',
      },
      {
        path: 'memberships', // 👈 AGREGADO TEMPORAL: Así evitamos el error NG04002
        component: Member,   // Reutilizamos temporalmente el componente de miembros hasta que creen el suyo
        title: 'Membresías',
      },
      {
        path: 'configuration', // 👈 ¡NUEVO TEMPORAL!: Apunta a Dashboard para que no falle el Sidebar
        component: Dashboard,
        title: 'Configuración',
      },
      {
        path: 'access-control', 
        component: AccessControlComponent,
        title: 'Control de Accesos',
      },
    ],
  },
];
