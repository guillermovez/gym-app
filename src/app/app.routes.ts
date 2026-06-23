import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Layout } from './layout/layout';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './auth/auth-guard';
import { Member } from './member/member';
import { BillingComponent } from './billing/billing.component';
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
        path: 'configuration',
        component: Dashboard,
        title: 'Configuración',
      },
      {
        path: 'access-control',
        component: AccessControlComponent,
        title: 'Control de Accesos',
      },
      {
        path: 'memberships', // 🎯 Única declaración limpia
        component: BillingComponent,
        title: 'Caja y Finanzas',
      },
    ],
  },
];