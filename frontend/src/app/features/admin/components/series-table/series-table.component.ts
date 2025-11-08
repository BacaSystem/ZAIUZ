import { Component, EventEmitter, Input, Output, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Series } from '../../../../shared/models/interfaces';
import { AdminService } from '../../../../services/admin.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-series-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './series-table.component.html',
  styleUrls: ['./series-table.component.scss']
})
export class SeriesTableComponent {
  @Input() series: Series[] = [];
  @Input() isLoading: boolean = false;
  @Output() editSeries = new EventEmitter<Series>();
  @Output() deleteSeries = new EventEmitter<string>();
  @Output() refreshData = new EventEmitter<void>();

  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private adminService = inject(AdminService);

  displayedColumns: string[] = ['color', 'name', 'minValue', 'maxValue', 'actions'];
  isDeleting = signal(false);

  onEditSeries(series: Series): void {
    this.editSeries.emit(series);
  }

  onDeleteSeries(series: Series): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Series',
        message: `Are you sure you want to delete "${series.name}"? This action cannot be undone and will also delete all measurements associated with this series.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performDelete(series);
      }
    });
  }

  private performDelete(series: Series): void {
    this.isDeleting.set(true);
    
    this.adminService.deleteSeries(series.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.snackBar.open(`Series "${series.name}" deleted successfully`, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.deleteSeries.emit(series.id);
        this.refreshData.emit();
      },
      error: (error) => {
        this.isDeleting.set(false);
        console.error('Error deleting series:', error);
        this.snackBar.open(`Failed to delete series "${series.name}". Please try again.`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onRefresh(): void {
    this.refreshData.emit();
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }

  getContrastColor(hexColor: string): string {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  trackBySeries(index: number, item: Series): string {
    return item.id;
  }
}