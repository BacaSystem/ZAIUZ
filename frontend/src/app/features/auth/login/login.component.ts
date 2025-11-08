import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService, LoginRequest, RegisterRequest } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  authForm: FormGroup;
  isRegisterMode = false;
  hidePassword = true;
  isLoading = signal(false);
  errorMessage = signal('');

  constructor() {
    this.authForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.redirectAfterLogin();
    }
  }

  onSubmit(): void {
    if (this.authForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const formValue = this.authForm.value;

      if (this.isRegisterMode) {
        this.register(formValue);
      } else {
        this.login(formValue);
      }
    }
  }

  private login(credentials: LoginRequest): void {
    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.redirectAfterLogin();
      },
      error: (error) => {
        this.handleAuthError(error);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  private register(userData: RegisterRequest): void {
    this.authService.register(userData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.redirectAfterLogin();
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.handleAuthError(error);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  private handleAuthError(error: any): void {
    let message = 'An error occurred. Please try again.';
    
    if (error.error?.message) {
      message = error.error.message;
    } else if (error.status === 401) {
      message = 'Invalid username or password.';
    } else if (error.status === 409) {
      message = 'Username already exists.';
    } else if (error.status === 0) {
      message = 'Unable to connect to server. Please check your connection.';
    }
    
    this.errorMessage.set(message);
    this.isLoading.set(false);
  }

  private redirectAfterLogin(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.router.navigate([returnUrl]);
  }

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage.set('');
    this.authForm.reset();
  }

  onBackToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}