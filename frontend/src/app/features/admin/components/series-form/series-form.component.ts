import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Series } from '../../../../shared/models/interfaces';
import { AdminService } from '../../../../services/admin.service';

@Component({
  selector: 'app-series-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './series-form.component.html',
  styleUrls: ['./series-form.component.scss']
})
export class SeriesFormComponent implements OnInit, OnChanges {
  @Input() series: Series | null = null;
  @Input() isVisible: boolean = false;
  @Output() seriesCreated = new EventEmitter<Series>();
  @Output() seriesUpdated = new EventEmitter<Series>();
  @Output() formClosed = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);

  seriesForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  colorOptions = [
    { name: 'Blue', value: '#2196F3' },
    { name: 'Red', value: '#F44336' },
    { name: 'Green', value: '#4CAF50' },
    { name: 'Purple', value: '#9C27B0' },
    { name: 'Orange', value: '#FF9800' },
    { name: 'Teal', value: '#009688' },
    { name: 'Pink', value: '#E91E63' },
    { name: 'Indigo', value: '#3F51B5' },
    { name: 'Amber', value: '#FFC107' },
    { name: 'Deep Orange', value: '#FF5722' }
  ];

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['series'] && this.seriesForm) {
      if (this.series) {
        this.populateForm();
      } else {
        this.resetForm();
      }
    }
  }

  private initializeForm(): void {
    this.seriesForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      minValue: [0, [Validators.required, Validators.pattern(/^-?\d*\.?\d+$/)]],
      maxValue: [100, [Validators.required, Validators.pattern(/^-?\d*\.?\d+$/)]],
      color: ['#2196F3', [Validators.required]]
    }, { validators: this.minMaxValidator });

    if (this.series) {
      this.populateForm();
    }
  }

  private populateForm(): void {
    if (this.series && this.seriesForm) {
      const colorExists = this.colorOptions.some(option => option.value === this.series!.color);
      
      if (!colorExists && this.series.color) {
        this.colorOptions.push({
          name: `Custom (${this.series.color})`,
          value: this.series.color
        });
      }
      
      this.seriesForm.patchValue({
        name: this.series.name,
        minValue: this.series.minValue,
        maxValue: this.series.maxValue,
        color: this.series.color
      });
      
      setTimeout(() => {
        console.log('Form color value after patch:', this.seriesForm.get('color')?.value);
      }, 0);
    }
  }

  private minMaxValidator(form: FormGroup) {
    const minValue = form.get('minValue')?.value;
    const maxValue = form.get('maxValue')?.value;
    
    if (minValue !== null && maxValue !== null && parseFloat(minValue) >= parseFloat(maxValue)) {
      return { minMaxInvalid: true };
    }
    return null;
  }

  get isEditing(): boolean {
    return this.series !== null;
  }

  get formTitle(): string {
    return this.isEditing ? 'Edit Series' : 'Add New Series';
  }

  onSubmit(): void {
    if (this.seriesForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const formValue = this.seriesForm.value;
      const seriesData = {
        name: formValue.name,
        minValue: parseFloat(formValue.minValue),
        maxValue: parseFloat(formValue.maxValue),
        color: formValue.color
      };

      if (this.isEditing && this.series) {
        this.adminService.updateSeries(this.series.id, seriesData).subscribe({
          next: (updatedSeries) => {
            this.isLoading.set(false);
            this.seriesUpdated.emit(updatedSeries);
            this.resetForm();
          },
          error: (error) => {
            this.isLoading.set(false);
            this.errorMessage.set('Failed to update series. Please try again.');
          }
        });
      } else {
        this.adminService.createSeries(seriesData).subscribe({
          next: (newSeries) => {
            this.isLoading.set(false);
            this.seriesCreated.emit(newSeries);
            this.resetForm();
          },
          error: (error) => {
            this.isLoading.set(false);
            this.errorMessage.set('Failed to create series. Please try again.');
          }
        });
      }
    } else {
      Object.keys(this.seriesForm.controls).forEach(key => {
        this.seriesForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.resetForm();
    this.formClosed.emit();
  }

  private resetForm(): void {
    this.seriesForm.reset({
      name: '',
      minValue: 0,
      maxValue: 100,
      color: '#2196F3'
    });
    this.errorMessage.set(null);
  }

  getFieldError(fieldName: string): string {
    const field = this.seriesForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${fieldName} must be no more than ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['pattern']) return `${fieldName} must be a valid number`;
    }
    
    if (this.seriesForm.errors?.['minMaxInvalid'] && (fieldName === 'minValue' || fieldName === 'maxValue')) {
      return 'Minimum value must be less than maximum value';
    }
    
    return '';
  }
}