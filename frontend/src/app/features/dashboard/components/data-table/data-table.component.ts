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
      this.loadData();
    }
    
    if (changes['selectedMeasurement']) {
      this.highlightSelectedRow();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Setup pagination events
    this.paginator.page.subscribe(() => {
      this.currentPage = this.paginator.pageIndex;
      this.loadData();
    });
  }

  private async loadData(): Promise<void> {
    if (!this.filters) return;

    this.isLoading.set(true);
    
    try {
      // Load series data for display
      const series = await this.seriesService.getAllSeries().toPromise() || [];
      this.availableSeries.set(series);

      // Load measurements with pagination
      const query = {
        seriesIds: this.filters.seriesIds,
        from: this.filters.dateFrom?.toISOString(),
        to: this.filters.dateTo?.toISOString(),
        page: this.currentPage,
        size: this.pageSize
      };

      const response = await this.measurementService.queryMeasurements(query).toPromise();
      
      if (response) {
        // Add series information to measurements
        const measurementsWithSeries = response.content.map(measurement => ({
          ...measurement,
          series: series.find(s => s.id === measurement.seriesId)
        }));

        this.dataSource.data = measurementsWithSeries;
        this.totalElements.set(response.totalElements);
        
        // Update paginator
        if (this.paginator) {
          this.paginator.length = response.totalElements;
          this.paginator.pageIndex = this.currentPage;
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