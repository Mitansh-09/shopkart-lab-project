import axios from "axios";

// withCredentials: true makes the browser attach and accept the HttpOnly
// "token" cookie the backend sets on login. Without this, the cookie is
// never sent back on later requests (like /customers/me), so the server
// would treat every request as logged out.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export default api;
