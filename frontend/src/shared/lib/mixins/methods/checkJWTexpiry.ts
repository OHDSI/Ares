import { jwtDecode } from "jwt-decode";

export function checkExpiryDate(token) {
  if (token) {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  }
}
