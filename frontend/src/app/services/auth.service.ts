import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

export interface User {
  userId: string;
  username: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: string;
  username: string;
  role: string;
  expiresIn: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  public isAuthenticated = signal<boolean>(this.hasValidToken());
  public currentUser = signal<User | null>(this.getUserFromStorage());
  public isAdmin = signal<boolean>(this.checkIsAdmin());

  constructor() {
    this.checkTokenValidity();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => {
          console.error('Login failed:', error);
          throw error;
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, userData)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => {
          console.error('Registration failed:', error);
          throw error;
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/logout`, {})
      .pipe(
        tap(() => this.handleLogout()),
        catchError(() => {
          this.handleLogout();
          return of({});
        })
      );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/auth/me`);
  }

  changePassword(changePasswordRequest: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/change-password`, changePasswordRequest, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((response: any) => {
      }),
      catchError((error) => {
        throw error;
      })
    );
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    
    const user: User = {
      userId: response.userId,
      username: response.username,
      role: response.role
    };
    
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    this.currentUserSubject.next(user);
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    this.isAdmin.set(user.role === 'Admin');
  }

  private handleLogout(): void {
    this.clearAuthState();
    this.router.navigate(['/auth/login']);
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  private checkIsAdmin(): boolean {
    const user = this.getUserFromStorage();
    return user?.role === 'Admin';
  }

  private checkTokenValidity(): void {
    if (!this.hasValidToken()) {
      this.clearAuthState();
    }
  }

  private clearAuthState(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    this.currentUserSubject.next(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.isAdmin.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRole(): string {
    const token = this.getToken();
    if (!token) return '';
    const decoded: any = jwtDecode(token);
    const roles = decoded.roles || []; 
    return roles.includes('Admin') ? 'Admin' : roles.includes('User') ? 'User' : '';
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  hasRole(role: string): boolean {
    return this.currentUser()?.role === role;
  }

  canAccessAdmin(): boolean {
    return this.isAdmin();
  }
}