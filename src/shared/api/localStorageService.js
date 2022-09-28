class LocalStorageService {
  constructor() {}

  get(key) {
    const data = window.localStorage.getItem(key);

    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }

  set(key, data) {
    window.localStorage.setItem(key, JSON.stringify(data));
  }

  remove(key) {
    window.localStorage.removeItem(key);
  }

  clear() {
    window.localStorage.clear();
  }
}

export default new LocalStorageService();
