import { Component, Output, EventEmitter, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Series, FilterOptions } from '../../../../shared/models/interfaces';
import { SeriesService } from '../../../../services/series.service';
import { startOfDay, subDays, endOfDay } from 'date-fns';

@Component({
  selector: 'app-filter-bar',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatButtonToggleModule
  ],
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss']
})
export class FilterBarComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<FilterOptions>();
  @Output() printRequested = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private seriesService = inject(SeriesService);

  availableSeries = signal<Series[]>([]);
  filterForm: FormGroup;

  constructor() {
    this.filterForm = this.fb.group({
      selectedSeries: [[]],
      quickRange: ['7d'],
      dateFrom: [null],
      dateTo: [null]
    });
  }

  ngOnInit(): void {
    this.loadSeries();
    this.setupFormSubscriptions();
    this.initializeDefaultRange();
  }

  private loadSeries(): void {
    this.seriesService.getAllSeries().subscribe({
      next: (series) => {
        this.availableSeries.set(series);
        // Select all series by default - show all data initially
        this.filterForm.patchValue({
          selectedSeries: series.map(s => s.id)
        });
      },
      error: (error) => {
        console.error('Error loading series:', error);
      }
    });
  }

  private setupFormSubscriptions(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.emitFilters();
    });
  }

  private initializeDefaultRange(): void {
    const now = new Date();
    const sevenDaysAgo = startOfDay(subDays(now, 7));
    
    this.filterForm.patchValue({
      dateFrom: sevenDaysAgo,
      dateTo: endOfDay(now),
      quickRange: '7d'
    });
  }

  onQuickRangeChanged(range: '7d' | '30d' | 'custom'): void {
    const now = new Date();
    let from: Date;
    let to: Date = endOfDay(now);

    switch (range) {
      case '7d':
        from = startOfDay(subDays(now, 7));
        break;
      case '30d':
        from = startOfDay(subDays(now, 30));
        break;
      case 'custom':
        // Don't change dates for custom range
        return;
    }

    this.filterForm.patchValue({
      quickRange: range,
      dateFrom: from,
      dateTo: to
    });
  }

  onDateChanged(): void {
    // When dates are manually changed, switch to custom range
    this.filterForm.patchValue({
      quickRange: 'custom'
    }, { emitEvent: false });
    this.emitFilters();
  }

  private emitFilters(): void {
    const formValue = this.filterForm.value;
    const filters: FilterOptions = {
      seriesIds: formValue.selectedSeries || [],
      dateFrom: formValue.dateFrom,
      dateTo: formValue.dateTo,
      quickRange: formValue.quickRange
    };
    this.filtersChanged.emit(filters);
  }

  onRefresh(): void {
    this.emitFilters();
  }

  onPrint(): void {
    this.printRequested.emit();
  }

  toggleSeries(seriesId: string): void {
    const currentSelected = this.filterForm.get('selectedSeries')?.value || [];
    let updated: string[];
    
    if (currentSelected.includes(seriesId)) {
      // Remove if already selected
      updated = currentSelected.filter((id: string) => id !== seriesId);
    } else {
      // Add if not selected
      updated = [...currentSelected, seriesId];
    }
    
    this.filterForm.patchValue({ selectedSeries: updated });
  }

  isSeriesSelected(seriesId: string): boolean {
    const selectedSeries = this.filterForm.get('selectedSeries')?.value || [];
    return selectedSeries.includes(seriesId);
  }

  removeSeriesChip(seriesId: string): void {
    const currentSelected = this.filterForm.get('selectedSeries')?.value || [];
    const updated = currentSelected.filter((id: string) => id !== seriesId);
    this.filterForm.patchValue({ selectedSeries: updated });
  }

  getSeriesName(seriesId: string): string {
    const series = this.availableSeries().find(s => s.id === seriesId);
    return series?.name || seriesId;
  }

  getSeriesColor(seriesId: string): string {
    const series = this.availableSeries().find(s => s.id === seriesId);
    return series?.color || '#4D96FF';
  }
}