import { Component, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-admin-drawer',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatToolbarModule
  ],
  templateUrl: './admin-drawer.component.html',
  styleUrls: ['./admin-drawer.component.scss']
})
export class AdminDrawerComponent {
  @Output() drawerClosed = new EventEmitter<void>();

  activeTab = signal(0);

  onClose(): void {
    this.drawerClosed.emit();
  }

  onTabChanged(index: number): void {
    this.activeTab.set(index);
  }
}