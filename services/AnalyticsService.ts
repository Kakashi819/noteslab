// Analytics Service for Production Monitoring
// This service handles user analytics, performance monitoring, and crash reporting

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  error: Error;
  stack?: string;
  context?: Record<string, any>;
  timestamp: number;
  userId?: string;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorReport[] = [];
  private isEnabled: boolean = true;
  private batchSize: number = 50;
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer?: ReturnType<typeof setInterval>;

  private constructor() {
    this.startPeriodicFlush();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Event Tracking
  trackEvent(name: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(event);
    this.checkBatchSize();
  }

  // Performance Monitoring
  trackPerformance(name: string, value: number, unit: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);
    this.checkBatchSize();
  }

  // Error Tracking
  trackError(error: Error, context?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const errorReport: ErrorReport = {
      error,
      stack: error.stack,
      context,
      timestamp: Date.now(),
    };

    this.errors.push(errorReport);
    this.checkBatchSize();
  }

  // User Identification
  identifyUser(userId: string): void {
    // In a real implementation, this would set the user ID for all subsequent events
    console.log('User identified:', userId);
  }

  // Screen Tracking
  trackScreen(screenName: string, properties?: Record<string, any>): void {
    this.trackEvent('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  // Feature Usage Tracking
  trackFeatureUsage(featureName: string, action: string, properties?: Record<string, any>): void {
    this.trackEvent('feature_usage', {
      feature: featureName,
      action,
      ...properties,
    });
  }

  // Note-specific Analytics
  trackNoteCreated(template: string): void {
    this.trackEvent('note_created', { template });
  }

  trackNoteEdited(noteId: string, hasDrawings: boolean, hasContent: boolean): void {
    this.trackEvent('note_edited', {
      note_id: noteId,
      has_drawings: hasDrawings,
      has_content: hasContent,
    });
  }

  trackNoteDeleted(noteId: string): void {
    this.trackEvent('note_deleted', { note_id: noteId });
  }

  trackDrawingAction(action: string, strokeCount?: number): void {
    this.trackEvent('drawing_action', {
      action,
      stroke_count: strokeCount,
    });
  }

  trackSearchQuery(query: string, resultCount: number): void {
    this.trackEvent('search_performed', {
      query_length: query.length,
      result_count: resultCount,
    });
  }

  // Performance Monitoring
  trackAppStartTime(startTime: number): void {
    const loadTime = Date.now() - startTime;
    this.trackPerformance('app_start_time', loadTime, 'ms');
  }

  trackNoteLoadTime(noteId: string, loadTime: number): void {
    this.trackPerformance('note_load_time', loadTime, 'ms', { note_id: noteId });
  }

  trackCanvasRenderTime(renderTime: number): void {
    this.trackPerformance('canvas_render_time', renderTime, 'ms');
  }

  trackMemoryUsage(memoryUsage: number): void {
    this.trackPerformance('memory_usage', memoryUsage, 'MB');
  }

  // Batch Processing
  private checkBatchSize(): void {
    const totalItems = this.events.length + this.metrics.length + this.errors.length;
    
    if (totalItems >= this.batchSize) {
      this.flush();
    }
  }

  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private async flush(): Promise<void> {
    if (this.events.length === 0 && this.metrics.length === 0 && this.errors.length === 0) {
      return;
    }

    const batch = {
      events: [...this.events],
      metrics: [...this.metrics],
      errors: [...this.errors],
      timestamp: Date.now(),
    };

    // Clear the arrays
    this.events = [];
    this.metrics = [];
    this.errors = [];

    try {
      await this.sendToAnalytics(batch);
    } catch (error) {
      console.error('Failed to send analytics batch:', error);
      // In production, you might want to retry or store failed batches
    }
  }

  private async sendToAnalytics(batch: any): Promise<void> {
    // In a real implementation, this would send data to your analytics service
    // Examples: Firebase Analytics, Mixpanel, Amplitude, etc.
    
    // For now, we'll just log the batch
    console.log('Analytics batch sent:', {
      eventCount: batch.events.length,
      metricCount: batch.metrics.length,
      errorCount: batch.errors.length,
      timestamp: new Date(batch.timestamp).toISOString(),
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Configuration
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  setBatchSize(size: number): void {
    this.batchSize = size;
  }

  setFlushInterval(interval: number): void {
    this.flushInterval = interval;
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.startPeriodicFlush();
    }
  }

  // Cleanup
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }

  // Debug methods
  getStats(): { events: number; metrics: number; errors: number } {
    return {
      events: this.events.length,
      metrics: this.metrics.length,
      errors: this.errors.length,
    };
  }

  clearData(): void {
    this.events = [];
    this.metrics = [];
    this.errors = [];
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance();

// Convenience functions for common tracking
export const trackScreen = (screenName: string, properties?: Record<string, any>) => {
  analytics.trackScreen(screenName, properties);
};

export const trackFeature = (featureName: string, action: string, properties?: Record<string, any>) => {
  analytics.trackFeatureUsage(featureName, action, properties);
};

export const trackError = (error: Error, context?: Record<string, any>) => {
  analytics.trackError(error, context);
};

export const trackPerformance = (name: string, value: number, unit: string, metadata?: Record<string, any>) => {
  analytics.trackPerformance(name, value, unit, metadata);
}; 