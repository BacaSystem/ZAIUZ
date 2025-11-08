import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

function shouldAttachToken(url: string): boolean {
  const protectedEndpoints = ['/admin'];
  return protectedEndpoints.some(endpoint => url.includes(endpoint));
}

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken(); 

  if (token && shouldAttachToken(req.url)) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      }
    });
  }

  return next(req); 
};