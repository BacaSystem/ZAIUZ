import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRole = route.data['role'];
    const userRole = this.authService.getRole();

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }

    if (!expectedRole) {
      return true;
    }

    if (userRole !== expectedRole) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
