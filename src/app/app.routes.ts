import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Layout } from './layout/layout';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    component: Login,
    title: 'Inicio de sesión'
  },
  {
    path: 'app',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
        title: 'Dashboard',
      }
    ]
  }
];
