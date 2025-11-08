import { Component, signal, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PageEvent } from '@angular/material/paginator';
import { SeriesFormComponent } from './components/series-form/series-form.component';
import { SeriesTableComponent } from './components/series-table/series-table.component';
import { MeasurementFormComponent } from './components/measurement-form/measurement-form.component';
import { MeasurementTableComponent } from './components/measurement-table/measurement-table.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { UserTableComponent } from './components/user-table/user-table.component';
import { Series, Measurement, User } from '../../shared/models/interfaces';
import { SeriesService } from '../../services/series.service';
import { MeasurementService } from '../../services/measurement.service';

@Component({
  selector: 'app-admin',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatToolbarModule,
    SeriesFormComponent,
    SeriesTableComponent,
    MeasurementFormComponent,
    MeasurementTableComponent,
    UserFormComponent,
    UserTableComponent
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  @ViewChild('userTable') userTable!: UserTableComponent;

  private seriesService = inject(SeriesService);
  private measurementService = inject(MeasurementService);

  activeTab = signal(0);
  allSeries = signal<Series[]>([]);
  isLoadingSeries = signal(false);
  showSeriesForm = signal(false);
  editingSeries = signal<Series | null>(null);
  allMeasurements = signal<Measurement[]>([]);
  isLoadingMeasurements = signal(false);
  showMeasurementForm = signal(false);
  editingMeasurement = signal<Measurement | null>(null);
  measurementTotalCount = signal(0);
  measurementPageSize = signal(10);
  measurementCurrentPage = signal(0);
  showUserForm = signal(false);
  editingUser = signal<User | null>(null);

  ngOnInit(): void {
    this.loadSeries();
  }

  onTabChanged(index: number): void {
    this.activeTab.set(index);
    
    if (index === 0) {
      this.loadSeries();
    }
    else if (index === 1) {
      this.loadMeasurements();
    }
    else if (index === 2) {
      if (this.userTable) {
        this.userTable.refreshUsers();
      }
    }
  }

  private loadSeries(): void {
    this.isLoadingSeries.set(true);
    
    this.seriesService.getAllSeries().subscribe({
      next: (series) => {
        this.allSeries.set(series);
        this.isLoadingSeries.set(false);
      },
      error: (error) => {
        console.error('Error loading series:', error);
        this.isLoadingSeries.set(false);
      }
    });
  }

  onAddSeriesClick(): void {
    this.editingSeries.set(null);
    this.showSeriesForm.set(true);
  }

  onEditSeries(series: Series): void {
    this.editingSeries.set(series);
    this.showSeriesForm.set(true);
  }

  onSeriesCreated(newSeries: Series): void {
    const currentSeries = this.allSeries();
    this.allSeries.set([...currentSeries, newSeries]);
    this.showSeriesForm.set(false);
  }

  onSeriesUpdated(updatedSeries: Series): void {
    const currentSeries = this.allSeries();
    const index = currentSeries.findIndex(s => s.id === updatedSeries.id);
    if (index !== -1) {
      const newSeries = [...currentSeries];
      newSeries[index] = updatedSeries;
      this.allSeries.set(newSeries);
    }
    this.showSeriesForm.set(false);
    this.editingSeries.set(null);
  }

  onSeriesFormClosed(): void {
    this.showSeriesForm.set(false);
    this.editingSeries.set(null);
  }

  onDeleteSeries(seriesId: string): void {
    const currentSeries = this.allSeries();
    this.allSeries.set(currentSeries.filter(s => s.id !== seriesId));
  }

  onRefreshSeries(): void {
    this.loadSeries();
  }

  private loadMeasurements(): void {
    this.isLoadingMeasurements.set(true);
    
    const query = {
      page: this.measurementCurrentPage(),
      size: this.measurementPageSize()
    };
    
    this.measurementService.queryMeasurements(query).subscribe({
      next: (response) => {
        this.allMeasurements.set(response.content);
        this.measurementTotalCount.set(response.totalElements);
        this.isLoadingMeasurements.set(false);
      },
      error: (error) => {
        console.error('Error loading measurements:', error);
        this.isLoadingMeasurements.set(false);
      }
    });
  }

  onAddMeasurementClick(): void {
    this.editingMeasurement.set(null);
    this.showMeasurementForm.set(true);
  }

  onEditMeasurement(measurement: Measurement): void {
    this.editingMeasurement.set(measurement);
    this.showMeasurementForm.set(true);
  }

  onMeasurementCreated(newMeasurement: Measurement): void {
    this.loadMeasurements();
    this.showMeasurementForm.set(false);
  }

  onMeasurementUpdated(updatedMeasurement: Measurement): void {
    this.loadMeasurements();
    this.showMeasurementForm.set(false);
    this.editingMeasurement.set(null);
  }

  onMeasurementFormClosed(): void {
    this.showMeasurementForm.set(false);
    this.editingMeasurement.set(null);
  }

  onDeleteMeasurement(measurementId: string): void {
    this.loadMeasurements();
  }

  onMeasurementPageChanged(event: PageEvent): void {
    this.measurementCurrentPage.set(event.pageIndex);
    this.measurementPageSize.set(event.pageSize);
    this.loadMeasurements();
  }

  onRefreshMeasurements(): void {
    this.loadMeasurements();
  }

  onAddUserClick(): void {
    this.editingUser.set(null);
    this.showUserForm.set(true);
  }

  onEditUser(user: User): void {
    this.editingUser.set(user);
    this.showUserForm.set(true);
  }

  onUserCreated(newUser: User): void {
    if (this.userTable) {
      this.userTable.addUser(newUser);
    }
    this.showUserForm.set(false);
  }

  onUserUpdated(updatedUser: User): void {
    if (this.userTable) {
      this.userTable.updateUser(updatedUser);
    }
    this.showUserForm.set(false);
    this.editingUser.set(null);
  }

  onUserFormClosed(): void {
    this.showUserForm.set(false);
    this.editingUser.set(null);
  }
}