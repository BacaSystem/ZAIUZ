// Common interfaces for the application
export interface Series {
  id: string;
  name: string;
  minValue: number;
  maxValue: number;
  color: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Measurement {
  id: string;
  seriesId: string;
  value: number;
  timestamp: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  series?: Series;
}

export interface User {
  id: string;
  username: string;
  role: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
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