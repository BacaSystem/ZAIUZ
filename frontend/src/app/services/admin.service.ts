import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Measurement, PaginatedResponse, MeasurementQuery, Series, User, CreateUpdateMeasurementDto, CreateUpdateSeriesDto } from '../shared/models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/admin`;

  // === MEASUREMENT ADMIN OPERATIONS ===

  getAllMeasurements(query: MeasurementQuery): Observable<PaginatedResponse<Measurement>> {
    let params = new HttpParams();
    
    if (query.seriesIds && query.seriesIds.length > 0) {
      query.seriesIds.forEach(id => {
        params = params.append('seriesIds', id);
      });
    }
    
    if (query.from) {
      params = params.set('from', query.from);
    }
    
    if (query.to) {
      params = params.set('to', query.to);
    }
    
    if (query.page !== undefined) {
      params = params.set('page', query.page.toString());
    }
    
    if (query.size !== undefined) {
      params = params.set('size', query.size.toString());
    }

    return this.http.get<PaginatedResponse<Measurement>>(`${this.apiUrl}/measurements`, { params });
  }

  createMeasurement(measurement: CreateUpdateMeasurementDto): Observable<Measurement> {
    return this.http.post<Measurement>(`${this.apiUrl}/measurements`, measurement);
  }

  updateMeasurement(id: string, measurement: CreateUpdateMeasurementDto): Observable<Measurement> {
    return this.http.put<Measurement>(`${this.apiUrl}/measurements/${id}`, measurement);
  }

  deleteMeasurement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/measurements/${id}`);
  }

  // === SERIES ADMIN OPERATIONS ===

  createSeries(series: CreateUpdateSeriesDto): Observable<Series> {
    return this.http.post<Series>(`${this.apiUrl}/series`, series);
  }

  updateSeries(id: string, series: CreateUpdateSeriesDto): Observable<Series> {
    return this.http.put<Series>(`${this.apiUrl}/series/${id}`, series);
  }

  deleteSeries(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/series/${id}`);
  }

  // === USER ADMIN OPERATIONS ===

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user);
  }

  updateUser(id: string, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }
}