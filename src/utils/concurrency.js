export class ConcurrencyManager {
  #operations = new Map();

  async runExclusive(key, operation) {
    if (this.#operations.has(key)) {
      // Wait for existing operation to complete
      await this.#operations.get(key);
    }

    const promise = operation();
    this.#operations.set(key, promise);

    try {
      return await promise;
    } finally {
      this.#operations.delete(key);
    }
  }
}

export const concurrencyManager = new ConcurrencyManager();