class LocalStorageService {
  get(key: string) {
    const data = window.localStorage.getItem(key);

    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }

  set(key: string, data: object) {
    window.localStorage.setItem(key, JSON.stringify(data));
  }

  remove(key: string) {
    window.localStorage.removeItem(key);
  }

  clear() {
    window.localStorage.clear();
  }
}

export default new LocalStorageService();
