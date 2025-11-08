import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatDividerModule } from "@angular/material/divider";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: 'app-navbar',
  imports: [
    RouterModule, 
    CommonModule, 
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavbarComponent {
  private router = inject(Router);
  public authService = inject(AuthService);

  onNavigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  onNavigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  onChangePassword(): void {
    this.router.navigate(['/change-password']);
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      error: (error) => console.error('Logout error:', error)
    });
  }
}