import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Layout } from './layout/layout';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './auth/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: Login,
    title: 'Inicio de sesión'
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
      }
    ]
  }
];
