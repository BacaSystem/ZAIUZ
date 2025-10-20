import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Measurement, PaginatedResponse, MeasurementQuery } from '../shared/models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class MeasurementService {
  private readonly apiUrl = `${environment.apiUrl}/api/measurement`;

  constructor(private http: HttpClient) { }

  queryMeasurements(query: MeasurementQuery): Observable<PaginatedResponse<Measurement>> {
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

    return this.http.get<PaginatedResponse<Measurement>>(this.apiUrl, { params });
  }

  getMeasurementById(id: string): Observable<Measurement> {
    return this.http.get<Measurement>(`${this.apiUrl}/${id}`);
  }

  createMeasurement(measurement: Omit<Measurement, 'id'>): Observable<Measurement> {
    return this.http.post<Measurement>(this.apiUrl, measurement);
  }

  updateMeasurement(id: string, measurement: Partial<Measurement>): Observable<Measurement> {
    return this.http.put<Measurement>(`${this.apiUrl}/${id}`, measurement);
  }

  deleteMeasurement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}