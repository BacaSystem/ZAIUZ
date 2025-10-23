import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, Point } from 'chart.js';
import { FilterOptions, Measurement, Series } from '../../../../shared/models/interfaces';
import { MeasurementService } from '../../../../services/measurement.service';
import { SeriesService } from '../../../../services/series.service';
import { format } from 'date-fns';

// Register Chart.js components
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface ChartPoint extends Point {
  x: number;
  y: number;
}

interface ExtendedDataset {
  label: string;
  data: ChartPoint[];
  borderColor: string;
  backgroundColor: string;
  fill: boolean;
  tension: number;
  pointRadius: number | number[];
  pointHoverRadius: number;
  pointBackgroundColor: string | string[];
  measurements: Measurement[];
}

@Component({
  selector: 'app-chart',
  imports: [CommonModule, BaseChartDirective, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnChanges {
  @Input() filters: FilterOptions | null = null;
  @Input() selectedMeasurement: Measurement | null = null;
  @Output() measurementSelected = new EventEmitter<Measurement>();

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private measurementService = inject(MeasurementService);
  private seriesService = inject(SeriesService);

  chartData = signal<ChartData<'line'>>({
    datasets: []
  });

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          displayFormats: {
            hour: 'MMM dd HH:mm',
            day: 'MMM dd',
            week: 'MMM dd',
            month: 'MMM yyyy'
          }
        },
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Value'
        },
        beginAtZero: false
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        onClick: () => {
          // Disable legend clicking
          return false;
        }
      },
      tooltip: {
        mode: 'nearest',
        intersect: false,
        callbacks: {
          title: (tooltipItems) => {
            const item = tooltipItems[0];
            if (item.parsed.x) {
              return format(new Date(item.parsed.x), 'MMM dd, yyyy HH:mm:ss');
            }
            return '';
          },
          label: (context) => {
            const dataset = context.dataset;
            const value = context.parsed.y;
            if (value !== null) {
              return `${dataset.label}: ${value.toFixed(2)}`;
            }
            return '';
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    onHover: (event, activeElements) => {
      // Disable hover cursor change since clicking is disabled
      const canvas = event.native?.target as HTMLCanvasElement;
      if (canvas) {
        canvas.style.cursor = 'default';
      }
    },
    onClick: (event, activeElements) => {
      // Disable chart point selection - only table should select measurements
      return;
    }
  };

  availableSeries = signal<Series[]>([]);
  measurements = signal<Measurement[]>([]);
  isLoading = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] && this.filters) {
      this.loadData();
    }
    
    if (changes['selectedMeasurement']) {
      this.highlightSelectedPoint();
    }
  }

  private async loadData(): Promise<void> {
    if (!this.filters) return;

    // If no series are selected, show empty chart
    if (!this.filters.seriesIds || this.filters.seriesIds.length === 0) {
      this.chartData.set({ datasets: [] });
      this.measurements.set([]);
      return;
    }

    this.isLoading.set(true);
    
    try {
      // Load series data
      const series = await this.seriesService.getAllSeries().toPromise() || [];
      this.availableSeries.set(series);

      // Load measurements
      const query = {
        seriesIds: this.filters.seriesIds,
        from: this.filters.dateFrom?.toISOString(),
        to: this.filters.dateTo?.toISOString(),
        size: 10000 // Load more data for chart
      };

      const response = await this.measurementService.queryMeasurements(query).toPromise();
      const measurements = response?.content || [];
      this.measurements.set(measurements);

      // Transform data for chart
      this.updateChartData(measurements, series);
      
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private updateChartData(measurements: Measurement[], series: Series[]): void {
    const seriesMap = new Map(series.map(s => [s.id, s]));
    const datasetMap = new Map<string, {
      data: ChartPoint[];
      measurements: Measurement[];
    }>();

    // Group measurements by series
    measurements.forEach(measurement => {
      const seriesInfo = seriesMap.get(measurement.seriesId);
      if (!seriesInfo) return;

      if (!datasetMap.has(measurement.seriesId)) {
        datasetMap.set(measurement.seriesId, {
          data: [],
          measurements: []
        });
      }

      const dataset = datasetMap.get(measurement.seriesId)!;
      const timestamp = new Date(measurement.timestamp).getTime();
      dataset.data.push({
        x: timestamp,
        y: measurement.value
      });
      dataset.measurements.push(measurement);
    });

    // Create chart datasets
    const datasets: ExtendedDataset[] = Array.from(datasetMap.entries()).map(([seriesId, dataset]) => {
      const seriesInfo = seriesMap.get(seriesId)!;
      
      // Sort both data and measurements together to maintain alignment
      const combined = dataset.data.map((point, index) => ({
        point,
        measurement: dataset.measurements[index]
      })).sort((a, b) => a.point.x - b.point.x);
      
      return {
        label: seriesInfo.name,
        data: combined.map(item => item.point),
        borderColor: seriesInfo.color,
        backgroundColor: seriesInfo.color + '20',
        fill: false,
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: seriesInfo.color,
        measurements: combined.map(item => item.measurement)
      };
    });

    this.chartData.set({ datasets: datasets as any });
    
    // Update Y-axis range after data load
    setTimeout(() => this.updateYAxisRange(), 100);
  }

  private updateYAxisRange(): void {
    if (!this.chart?.chart) return;

    const chart = this.chart.chart;
    const datasets = chart.data.datasets as ExtendedDataset[];
    const visibleDatasets = datasets.filter((_, index) => {
      const meta = chart.getDatasetMeta(index);
      return !meta.hidden;
    });

    if (visibleDatasets.length === 0) return;

    let minY = Infinity;
    let maxY = -Infinity;

    visibleDatasets.forEach(dataset => {
      dataset.data.forEach(point => {
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
      });
    });

    if (isFinite(minY) && isFinite(maxY)) {
      const padding = (maxY - minY) * 0.1;
      const yScale = chart.options.scales?.['y'];
      if (yScale) {
        yScale.min = minY - padding;
        yScale.max = maxY + padding;
        chart.update('none');
      }
    }
  }

  private highlightSelectedPoint(): void {
    if (!this.chart?.chart || !this.selectedMeasurement) return;

    const datasets = this.chartData().datasets as ExtendedDataset[];
    
    // Reset all point styles
    datasets.forEach(dataset => {
      dataset.pointRadius = 3;
      dataset.pointBackgroundColor = dataset.borderColor;
    });

    // Highlight selected point
    const selectedMeasurement = this.selectedMeasurement;
    datasets.forEach(dataset => {
      const measurements = dataset.measurements || [];
      const index = measurements.findIndex((m: Measurement) => m.id === selectedMeasurement.id);
      
      if (index !== -1) {
        const pointRadius = Array(dataset.data.length).fill(3);
        const pointBackgroundColor = Array(dataset.data.length).fill(dataset.borderColor);
        
        pointRadius[index] = 8;
        pointBackgroundColor[index] = '#FFD700'; // Gold color for highlight
        
        dataset.pointRadius = pointRadius;
        dataset.pointBackgroundColor = pointBackgroundColor;
      }
    });

    this.chart.chart.update('none');
  }
}