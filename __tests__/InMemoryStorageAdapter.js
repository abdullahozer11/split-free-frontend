// InMemoryStorageAdapter.js
class InMemoryStorageAdapter {
  constructor() {
    this.store = {};
  }

  async getItem(key) {
    return this.store[key] || null;
  }

  async setItem(key, value) {
    this.store[key] = value;
  }

  async removeItem(key) {
    delete this.store[key];
  }
}

module.exports = InMemoryStorageAdapter;
