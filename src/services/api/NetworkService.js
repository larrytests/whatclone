export class NetworkService {
  static MAX_RETRIES = 3;
  static RETRY_DELAY = 1000; // ms

  async executeWithRetry(operation, retries = this.MAX_RETRIES) {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        return this.executeWithRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  isRetryableError(error) {
    return error.code === 'network-error' || 
           error.code === 'timeout' ||
           (error.code >= 500 && error.code < 600);
  }
}