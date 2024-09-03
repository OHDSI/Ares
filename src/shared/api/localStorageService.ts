class LocalStorageService {
  watch(key, callback) {
    window.addEventListener("storage", (event) => {
      if (event.key === key) {
        callback(event.newValue);
      }
    });
  }
  get(key: string) {
    const data = window.localStorage.getItem(key);

    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }

  set(key: string, data: any) {
    if (typeof data === "string") {
      window.localStorage.setItem(key, data);
    } else {
      window.localStorage.setItem(key, JSON.stringify(data));
    }
  }

  remove(key: string) {
    window.localStorage.removeItem(key);
  }

  clear() {
    window.localStorage.clear();
  }
}

export default new LocalStorageService();
