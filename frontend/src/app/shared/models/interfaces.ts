export interface Series {
  id: string;
  name: string;
  minValue: number;
  maxValue: number;
  color: string;
}

export interface Measurement {
  id: string;
  seriesId: string;
  series: Series;
  value: number;
  timestamp: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: string;
}

export interface CreateUpdateMeasurementDto {
  seriesId: string;
  value: number;
  timestamp: string;
}

export interface CreateUpdateSeriesDto {
  name: string;
  color: string;
  minValue: number;
  maxValue: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface MeasurementQuery {
  seriesIds?: string[];
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface ChartDataPoint {
  x: string | Date;
  y: number;
  seriesId: string;
  measurementId: string;
}

export interface FilterOptions {
  seriesIds: string[];
  dateFrom: Date | null;
  dateTo: Date | null;
  quickRange: '7d' | '30d' | 'custom' | null;
}