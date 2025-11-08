import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { Series, Measurement } from '../../../../shared/models/interfaces';
import { AdminService } from '../../../../services/admin.service';

@Component({
  selector: 'app-measurement-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './measurement-form.component.html',
  styleUrls: ['./measurement-form.component.scss']
})
export class MeasurementFormComponent implements OnInit, OnDestroy, OnChanges {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private destroy$ = new Subject<void>();

  @Input() isVisible = false;
  @Input() availableSeries: Series[] = [];
  @Input() measurement: Measurement | null = null;

  @Output() measurementCreated = new EventEmitter<Measurement>();
  @Output() measurementUpdated = new EventEmitter<Measurement>();
  @Output() formClosed = new EventEmitter<void>();

  measurementForm: FormGroup;
  isSubmitting = signal(false);
  errorMessage = signal('');
  
  selectedSeries = computed(() => {
    const seriesId = this.measurementForm?.get('seriesId')?.value;
    return this.availableSeries.find(s => s.id === seriesId) || null;
  });

  constructor() {
    this.measurementForm = this.fb.group({
      seriesId: ['', [Validators.required]],
      value: ['', [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]],
      timestamp: [new Date(), [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.setupFormSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['measurement']) {
      if (this.measurement) {
        this.populateForm();
      } else {
        this.resetForm();
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFormSubscriptions(): void {
    this.measurementForm.get('seriesId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.measurementForm.get('value')?.updateValueAndValidity();
      });

    this.measurementForm.get('value')?.addValidators((control) => {
      const value = parseFloat(control.value);
      const series = this.selectedSeries();
      
      if (!series || isNaN(value)) {
        return null;
      }

      if (value < series.minValue || value > series.maxValue) {
        return { 
          outOfRange: { 
            value: value, 
            min: series.minValue, 
            max: series.maxValue,
            seriesName: series.name
          } 
        };
      }

      return null;
    });
  }

  private populateForm(): void {
    if (this.measurement) {
      this.measurementForm.patchValue({
        seriesId: this.measurement.series?.id || this.measurement.seriesId,
        value: this.measurement.value,
        timestamp: new Date(this.measurement.timestamp)
      });
    }
  }

  onSubmit(): void {
    if (this.measurementForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      
      const formValue = this.measurementForm.value;
      const measurementData = {
        seriesId: formValue.seriesId,
        value: parseFloat(formValue.value),
        timestamp: formValue.timestamp.toISOString()
      };

      if (this.measurement) {
        this.adminService.updateMeasurement(this.measurement.id, measurementData)
          .subscribe({
            next: (updatedMeasurement) => {
              this.measurementUpdated.emit(updatedMeasurement);
              this.resetForm();
              this.isSubmitting.set(false);
            },
            error: (error) => {
              console.error('Error updating measurement:', error);
              this.errorMessage.set('Failed to update measurement. Please try again.');
              this.isSubmitting.set(false);
            }
          });
      } else {
        this.adminService.createMeasurement(measurementData)
          .subscribe({
            next: (newMeasurement) => {
              this.measurementCreated.emit(newMeasurement);
              this.resetForm();
              this.isSubmitting.set(false);
            },
            error: (error) => {
              console.error('Error creating measurement:', error);
              this.errorMessage.set('Failed to create measurement. Please try again.');
              this.isSubmitting.set(false);
            }
          });
      }
    }
  }

  onCancel(): void {
    this.resetForm();
    this.formClosed.emit();
  }

  private resetForm(): void {
    this.measurementForm.reset({
      seriesId: '',
      value: '',
      timestamp: new Date()
    });
    this.errorMessage.set('');
  }

  getValueStatus(): 'normal' | 'warning' | 'error' {
    const valueControl = this.measurementForm.get('value');
    const series = this.selectedSeries();
    
    if (!valueControl?.value || !series) {
      return 'normal';
    }

    const value = parseFloat(valueControl.value);
    if (isNaN(value)) {
      return 'normal';
    }

    if (value < series.minValue || value > series.maxValue) {
      return 'error';
    }

    const range = series.maxValue - series.minValue;
    const warningMargin = range * 0.1;
    
    if (value <= series.minValue + warningMargin || 
        value >= series.maxValue - warningMargin) {
      return 'warning';
    }

    return 'normal';
  }

  getValueErrorMessage(): string {
    const valueControl = this.measurementForm.get('value');
    
    if (valueControl?.hasError('required')) {
      return 'Value is required';
    }
    
    if (valueControl?.hasError('outOfRange')) {
      const error = valueControl.getError('outOfRange');
      return `Value must be between ${error.min} and ${error.max} for ${error.seriesName}`;
    }
    
    return '';
  }

  get isEditMode(): boolean {
    return !!this.measurement;
  }

  get formTitle(): string {
    return this.isEditMode ? 'Edit Measurement' : 'Add New Measurement';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Update Measurement' : 'Create Measurement';
  }
}