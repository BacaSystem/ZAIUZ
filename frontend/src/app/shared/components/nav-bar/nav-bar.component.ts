import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { ThemeService } from "../../../services/theme.service";

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
  private themeService = inject(ThemeService);
  private router = inject(Router);

  isDarkTheme$ = this.themeService.isDarkTheme$;

  onThemeToggle(): void {
    this.themeService.toggleTheme();
  }

  onNavigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  onNavigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  onLogout(): void {
    // Placeholder for logout functionality
    console.log('Logout clicked - to be implemented with JWT');
  }
}