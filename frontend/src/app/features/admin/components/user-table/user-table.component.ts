import { Component, OnInit, signal, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { User } from '../../../../shared/models/interfaces';
import { AdminService } from '../../../../services/admin.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-user-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss']
})
export class UserTableComponent implements OnInit {
  @Output() editUser = new EventEmitter<User>();

  private adminService = inject(AdminService);
  private dialog = inject(MatDialog);

  users = signal<User[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  displayedColumns: string[] = ['username', 'role', 'password', 'actions'];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load users. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading users:', error);
      }
    });
  }

  onEditUser(user: User): void {
    this.editUser.emit(user);
  }

  onDeleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete the user "${user.username}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteUser(user.id);
      }
    });
  }

  private deleteUser(userId: string): void {
    this.adminService.deleteUser(userId).subscribe({
      next: () => {
        const currentUsers = this.users();
        this.users.set(currentUsers.filter(user => user.id !== userId));
      },
      error: (error) => {
        if (error.status === 400) {
          this.errorMessage.set('Cannot delete user. User may have associated data.');
        } else {
          this.errorMessage.set('Failed to delete user. Please try again.');
        }
        console.error('Error deleting user:', error);
      }
    });
  }

  getRoleIcon(role: string): string {
    return role === 'Admin' ? 'admin_panel_settings' : 'person';
  }

  trackByUser(index: number, user: User): string {
    return user.id;
  }

  refreshUsers(): void {
    this.loadUsers();
  }

  addUser(user: User): void {
    const currentUsers = this.users();
    this.users.set([...currentUsers, user]);
  }

  updateUser(updatedUser: User): void {
    const currentUsers = this.users();
    const index = currentUsers.findIndex(user => user.id === updatedUser.id);
    if (index !== -1) {
      const newUsers = [...currentUsers];
      newUsers[index] = updatedUser;
      this.users.set(newUsers);
    }
  }
}