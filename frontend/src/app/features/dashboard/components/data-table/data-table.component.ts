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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] && this.filters) {
      if (this.paginator) {
        this.paginator.pageIndex = 0;
      }
      this.loadData();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    this.dataSource.sortingDataAccessor = (data: Measurement, sortHeaderId: string) => {
      switch (sortHeaderId) {
        case 'seriesId':
          return this.getSeriesName(data).toLowerCase();
        case 'value':
          return data.value;
        case 'timestamp':
          return new Date(data.timestamp).getTime();
        default:
          return (data as any)[sortHeaderId];
      }
    };

    if (this.filters) {
      this.loadData();
    }
  }

  private async loadData(): Promise<void> {
    if (!this.filters) return;

    if (!this.filters.seriesIds || this.filters.seriesIds.length === 0) {
      this.dataSource.data = [];
      this.totalElements.set(0);
      return;
    }

    this.isLoading.set(true);
    
    try {
      const series = await this.seriesService.getAllSeries().toPromise() || [];
      this.availableSeries.set(series);

      const query = {
        seriesIds: this.filters.seriesIds,
        from: this.filters.dateFrom?.toISOString(),
        to: this.filters.dateTo?.toISOString(),
        page: 0,
        size: 10000
      };

      const response = await this.measurementService.queryMeasurements(query).toPromise();
      
      if (response) {
        const measurementsWithSeries = response.content.map(measurement => ({
          ...measurement,
        }));

        this.dataSource.data = measurementsWithSeries;
        this.totalElements.set(measurementsWithSeries.length);
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

  getSeriesName(measurement: Measurement): string {
    if (measurement.series && measurement.series.name) {
      return measurement.series.name;
    }
    if (measurement.seriesId) {
      const series = this.availableSeries().find(s => s.id === measurement.seriesId);
      return series?.name || 'Unknown Series';
    }
    return 'Unknown Series';
  }

  getSeriesColor(measurement: Measurement): string {
    if (measurement.series && measurement.series.color) {
      return measurement.series.color;
    }
    if (measurement.seriesId) {
      const series = this.availableSeries().find(s => s.id === measurement.seriesId);
      return series?.color || '#4D96FF';
    }
    return '#4D96FF';
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