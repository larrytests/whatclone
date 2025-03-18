import perf from '@react-native-firebase/perf';

export class PerformanceMonitor {
  static async trackOperation(name, operation) {
    const metric = await perf().newTrace(name);
    await metric.start();
    
    try {
      const result = await operation();
      await metric.stop();
      return result;
    } catch (error) {
      await metric.putAttribute('error', error.message);
      await metric.stop();
      throw error;
    }
  }
}