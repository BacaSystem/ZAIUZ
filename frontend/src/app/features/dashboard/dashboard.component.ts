import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FilterBarComponent } from './components/filter-bar/filter-bar.component';
import { ChartComponent } from './components/chart/chart.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { FilterOptions, Measurement } from '../../shared/models/interfaces';

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
    DataTableComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  selectedMeasurement = signal<Measurement | null>(null);
  currentFilters = signal<FilterOptions>({
    seriesIds: [],
    dateFrom: null,
    dateTo: null,
    quickRange: '7d'
  });

  onFiltersChanged(filters: FilterOptions): void {
    this.currentFilters.set(filters);
  }

  onMeasurementSelected(measurement: Measurement): void {
    this.selectedMeasurement.set(measurement);
  }

  onChartPointSelected(measurement: Measurement): void {
    this.selectedMeasurement.set(measurement);
  }

  onPrintRequested(): void {
    window.print();
  }
}