import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { User } from '../../../../shared/models/interfaces';
import { AdminService } from '../../../../services/admin.service';

@Component({
  selector: 'app-user-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit, OnChanges {
  @Input() user: User | null = null;
  @Input() isVisible: boolean = false;
  @Output() userCreated = new EventEmitter<User>();
  @Output() userUpdated = new EventEmitter<User>();
  @Output() formClosed = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);

  userForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  hidePassword = true;

  roleOptions = [
    { value: 'User', label: 'User' },
    { value: 'Admin', label: 'Administrator' }
  ];

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.userForm) {
      if (this.user) {
        this.populateForm();
      } else {
        this.resetForm();
      }
    }
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      password: ['', this.isEditing ? [] : [Validators.required, Validators.minLength(6)]],
      role: ['User', [Validators.required]]
    });

    if (this.user) {
      this.populateForm();
    }
  }

  private populateForm(): void {
    if (this.user && this.userForm) {
      
      this.userForm.patchValue({
        username: this.user.username,
        password: '',
        role: this.user.role
      });

      if (this.isEditing) {
        this.userForm.get('password')?.setValidators([Validators.minLength(6)]);
        this.userForm.get('password')?.updateValueAndValidity();
      }
    }
  }

  get isEditing(): boolean {
    return this.user !== null;
  }

  get formTitle(): string {
    return this.isEditing ? 'Edit User' : 'Add New User';
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const formValue = this.userForm.value;
      
      if (this.isEditing && this.user) {
        const updateData: User = {
          id: this.user.id,
          username: formValue.username,
          password: formValue.password && formValue.password.trim() ? formValue.password : '********',
          role: formValue.role,
        };

        this.adminService.updateUser(this.user.id, updateData).subscribe({
          next: (updatedUser) => {
            this.isLoading.set(false);
            this.userUpdated.emit(updatedUser);
            this.resetForm();
          },
          error: (error) => {
            this.isLoading.set(false);
            if (error.status === 409) {
              this.errorMessage.set('Username already exists');
            } else {
              this.errorMessage.set('Failed to update user. Please try again.');
            }
            console.error('Error updating user:', error);
          }
        });
      } else {
        const userData: User = {
          id: '',
          username: formValue.username,
          password: formValue.password,
          role: formValue.role
        };

        this.adminService.createUser(userData).subscribe({
          next: (newUser) => {
            this.isLoading.set(false);
            this.userCreated.emit(newUser);
            this.resetForm();
          },
          error: (error) => {
            this.isLoading.set(false);
            if (error.status === 409) {
              this.errorMessage.set('Username already exists');
            } else {
              this.errorMessage.set('Failed to create user. Please try again.');
            }
            console.error('Error creating user:', error);
          }
        });
      }
    } else {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.resetForm();
    this.formClosed.emit();
  }

  private resetForm(): void {
    this.userForm.reset({
      username: '',
      password: '',
      role: 'User'
    });
    this.errorMessage.set(null);
    
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${fieldName} must be no more than ${field.errors['maxlength'].requiredLength} characters`;
    }
    return '';
  }
}