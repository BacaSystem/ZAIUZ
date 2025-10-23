import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, AfterViewInit, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FilterOptions, Measurement, Series } from '../../../../shared/models/interfaces';
import { MeasurementService } from '../../../../services/measurement.service';
import { SeriesService } from '../../../../services/series.service';
import { format } from 'date-fns';

@Component({
  selector: 'app-data-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnChanges, AfterViewInit {
  @Input() filters: FilterOptions | null = null;
  @Input() selectedMeasurement: Measurement | null = null;
  @Output() measurementSelected = new EventEmitter<Measurement>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private measurementService = inject(MeasurementService);
  private seriesService = inject(SeriesService);

  displayedColumns: string[] = ['series', 'value', 'timestamp', 'actions'];
  dataSource = new MatTableDataSource<Measurement>([]);
  
  availableSeries = signal<Series[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  pageSize = 50;
  currentPage = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] && this.filters) {
      this.currentPage = 0;
      // Reset paginator to first page when filters change
      if (this.paginator) {
        this.paginator.pageIndex = 0;
      }
      this.loadData();
    }
    
    if (changes['selectedMeasurement']) {
      this.highlightSelectedRow();
    }
  }

  ngAfterViewInit(): void {
    // Don't assign paginator to dataSource as we're handling pagination manually
    // this.dataSource.sort = this.sort; // Remove this as we handle sorting via API
    
    // Setup pagination events
    this.paginator.page.subscribe((event) => {
      console.log('Paginator event:', event); // Debug log
      this.currentPage = event.pageIndex;
      this.pageSize = event.pageSize;
      this.loadData();
    });

    // Setup sort events
    if (this.sort) {
      this.sort.sortChange.subscribe(() => {
        console.log('Sort changed:', this.sort.active, this.sort.direction);
        this.currentPage = 0; // Reset to first page when sorting
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
        this.loadData();
      });
    }

    // Initial load if filters are already set
    if (this.filters) {
      this.loadData();
    }
  }

  private async loadData(): Promise<void> {
    if (!this.filters) return;

    // If no series are selected, show empty table
    if (!this.filters.seriesIds || this.filters.seriesIds.length === 0) {
      this.dataSource.data = [];
      this.totalElements.set(0);
      if (this.paginator) {
        this.paginator.length = 0;
      }
      return;
    }

    this.isLoading.set(true);
    
    try {
      // Load series data for display
      const series = await this.seriesService.getAllSeries().toPromise() || [];
      this.availableSeries.set(series);

      // Get current page size from paginator or use default
      const currentPageSize = this.paginator?.pageSize || this.pageSize;
      
      // Load measurements with pagination and sorting
      const query: any = {
        seriesIds: this.filters.seriesIds,
        from: this.filters.dateFrom?.toISOString(),
        to: this.filters.dateTo?.toISOString(),
        page: this.currentPage,
        size: currentPageSize
      };

      // Add sorting if available
      if (this.sort?.active && this.sort?.direction) {
        query.sort = `${this.sort.active},${this.sort.direction}`;
      }

      console.log('Loading data with query:', query); // Debug log

      const response = await this.measurementService.queryMeasurements(query).toPromise();
      
      if (response) {
        // Add series information to measurements
        const measurementsWithSeries = response.content.map(measurement => ({
          ...measurement,
          series: series.find(s => s.id === measurement.seriesId)
        }));

        this.dataSource.data = measurementsWithSeries;
        this.totalElements.set(response.totalElements);
        
        // Update paginator length but don't change pageIndex here to avoid infinite loop
        if (this.paginator) {
          this.paginator.length = response.totalElements;
          // Don't set pageIndex here as it might trigger another page event
        }
      }
      
    } catch (error) {
      console.error('Error loading table data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  onRowClick(measurement: Measurement): void {
    this.measurementSelected.emit(measurement);
  }

  isRowSelected(measurement: Measurement): boolean {
    return this.selectedMeasurement?.id === measurement.id;
  }

  private highlightSelectedRow(): void {
    // This will be handled by CSS classes based on isRowSelected
  }

  getSeriesName(seriesId: string): string {
    const series = this.availableSeries().find(s => s.id === seriesId);
    return series?.name || 'Unknown Series';
  }

  getSeriesColor(seriesId: string): string {
    const series = this.availableSeries().find(s => s.id === seriesId);
    return series?.color || '#4D96FF';
  }

  formatTimestamp(timestamp: string): string {
    return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
  }

  formatValue(value: number): string {
    return value.toFixed(2);
  }

  onRefresh(): void {
    this.loadData();
  }
}