import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Series } from '../shared/models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class SeriesService {
  private readonly apiUrl = `${environment.apiUrl}/api/series`;

  constructor(private http: HttpClient) { }

  getAllSeries(): Observable<Series[]> {
    return this.http.get<Series[]>(this.apiUrl);
  }

  getSeriesById(id: string): Observable<Series> {
    return this.http.get<Series>(`${this.apiUrl}/${id}`);
  }

  createSeries(series: Omit<Series, 'id'>): Observable<Series> {
    return this.http.post<Series>(this.apiUrl, series);
  }

  updateSeries(id: string, series: Partial<Series>): Observable<Series> {
    return this.http.put<Series>(`${this.apiUrl}/${id}`, series);
  }

  deleteSeries(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}