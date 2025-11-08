import { Component, Input, Output, EventEmitter, ViewChild, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { Measurement, Series } from '../../../../shared/models/interfaces';
import { AdminService } from '../../../../services/admin.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { format } from 'date-fns';

@Component({
  selector: 'app-measurement-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './measurement-table.component.html',
  styleUrls: ['./measurement-table.component.scss']
})
export class MeasurementTableComponent {
  private adminService = inject(AdminService);
  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @Input() measurements: Measurement[] = [];
  @Input() availableSeries: Series[] = [];
  @Input() isLoading = false;
  @Input() totalElements = 0;
  @Input() pageSize = 10;
  @Input() pageNumber = 0;

  @Output() editMeasurement = new EventEmitter<Measurement>();
  @Output() deleteMeasurement = new EventEmitter<string>();
  @Output() refreshData = new EventEmitter<void>();
  @Output() pageChanged = new EventEmitter<PageEvent>();

  displayedColumns: string[] = ['series', 'value', 'timestamp', 'actions'];

  trackByMeasurement(index: number, measurement: Measurement): string {
    return measurement.id;
  }

  onEdit(measurement: Measurement): void {
    this.editMeasurement.emit(measurement);
  }

  onDelete(measurement: Measurement): void {
    const series = this.getSeriesById(measurement.seriesId);
    const seriesName = series ? series.name : 'Unknown Series';
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Measurement',
        message: `Are you sure you want to delete this measurement from "${seriesName}"?`,
        details: [
          `Value: ${measurement.value}`,
          `Date: ${this.formatTimestamp(measurement.timestamp)}`
        ],
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deleteMeasurement(measurement.id).subscribe({
          next: () => {
            this.deleteMeasurement.emit(measurement.id);
          },
          error: (error) => {
            console.error('Error deleting measurement:', error);
          }
        });
      }
    });
  }

  onRefresh(): void {
    this.refreshData.emit();
  }

  onPageChange(event: PageEvent): void {
    this.pageChanged.emit(event);
  }

  getSeriesById(seriesId: string): Series | undefined {
    return this.availableSeries.find(s => s.id === seriesId);
  }

  getSeriesName(measurement: Measurement): string {
    if (measurement.series && measurement.series.name) {
      return measurement.series.name;
    }
    if (measurement.seriesId) {
      const series = this.getSeriesById(measurement.seriesId);
      return series?.name || 'Unknown Series';
    }
    return 'Unknown Series';
  }

  getSeriesColor(measurement: Measurement): string {
    if (measurement.series && measurement.series.color) {
      return measurement.series.color;
    }
    if (measurement.seriesId) {
      const series = this.getSeriesById(measurement.seriesId);
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

  isValueInRange(measurement: Measurement): boolean {
    const series = this.getSeriesById(measurement.seriesId);
    if (!series) return true;
    
    return measurement.value >= series.minValue && measurement.value <= series.maxValue;
  }

  getValueStatus(measurement: Measurement): 'normal' | 'warning' | 'error' {
    const series = this.getSeriesById(measurement.seriesId);
    if (!series) return 'normal';
    
    if (measurement.value < series.minValue || measurement.value > series.maxValue) {
      return 'error';
    }
    
    const range = series.maxValue - series.minValue;
    const warningMargin = range * 0.1;
    
    if (measurement.value <= series.minValue + warningMargin || 
        measurement.value >= series.maxValue - warningMargin) {
      return 'warning';
    }
    
    return 'normal';
  }
}
