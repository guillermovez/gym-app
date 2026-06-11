import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Layout } from './layout/layout';

export const routes: Routes = [
  {
    path: '',
    component: Login,
    title: 'Inicio de sesión'
  },
  {
    path: 'app',
    component: Layout
  }
];
