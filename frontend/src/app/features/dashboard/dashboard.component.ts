import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FilterBarComponent } from './components/filter-bar/filter-bar.component';
import { ChartComponent } from './components/chart/chart.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { AdminDrawerComponent } from './components/admin-drawer/admin-drawer.component';
import { NavbarComponent } from '../../shared/components/nav-bar/nav-bar.component';
import { FilterOptions, Series, Measurement } from '../../shared/models/interfaces';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    FilterBarComponent,
    ChartComponent,
    DataTableComponent,
    AdminDrawerComponent,
    NavbarComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  
  isAdminMode = signal(false);
  isDrawerOpen = signal(false);
  selectedMeasurement = signal<Measurement | null>(null);
  currentFilters = signal<FilterOptions>({
    seriesIds: [],
    dateFrom: null,
    dateTo: null,
    quickRange: '7d'
  });

  ngOnInit(): void {
    // Check if this is admin route
    this.isAdminMode.set(!!this.route.snapshot.data['isAdmin']);
  }

  onFiltersChanged(filters: FilterOptions): void {
    this.currentFilters.set(filters);
  }

  onMeasurementSelected(measurement: Measurement): void {
    this.selectedMeasurement.set(measurement);
  }

  onChartPointSelected(measurement: Measurement): void {
    this.selectedMeasurement.set(measurement);
  }

  toggleAdminDrawer(): void {
    this.isDrawerOpen.update(open => !open);
  }

  onPrintRequested(): void {
    window.print();
  }
}