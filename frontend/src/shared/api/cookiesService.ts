class CookiesService {
  get(key: string): string | undefined {
    const name = key + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return undefined;
  }

  set(key: string, value: string, expirySeconds: number): void {
    const expiryDate = new Date(expirySeconds * 1000); // Convert seconds to milliseconds
    const expires = "expires=" + expiryDate.toUTCString();
    document.cookie = key + "=" + value + ";" + expires + ";path=/";
  }

  remove(key: string): void {
    document.cookie = key + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }
}

export default new CookiesService();
