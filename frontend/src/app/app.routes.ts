import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'admin', 
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AuthGuard], 
    data: { role: 'Admin' }
  },
  {
    path: 'change-password',
    loadComponent: () => import('./features/change-password/change-password.component').then(m => m.ChangePasswordComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'login',
    redirectTo: '/auth/login'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
