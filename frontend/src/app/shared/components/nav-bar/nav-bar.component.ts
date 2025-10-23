import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { AdminDrawerService } from "../../../services/admin-drawer.service";

@Component({
  selector: 'app-navbar',
  imports: [
    RouterModule, 
    CommonModule, 
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule,
    MatSlideToggleModule
  ],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavbarComponent {
  private router = inject(Router);
  private adminDrawerService = inject(AdminDrawerService);

  onNavigateToAdmin(): void {
    // Toggle admin drawer using service
    this.adminDrawerService.toggle();
  }

  onNavigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  onLogout(): void {
    // Placeholder for logout functionality
    console.log('Logout clicked - to be implemented with JWT');
  }
}