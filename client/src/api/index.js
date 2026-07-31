import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

// ── Axios instance ─────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, err => Promise.reject(err));

// Auto-refresh token on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry && localStorage.getItem("refreshToken")) {
      original._retry = true;
      try {
        const { data } = await axios.post(`${BASE}/api/refreshToken`, {
          refreshToken: localStorage.getItem("refreshToken"),
        });
        localStorage.setItem("accessToken", data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth ───────────────────────────────────────────────────────────────────
export const authAPI = {
  login:   d => api.post("/api/auth/login", d),
  signUp:  d => api.post("/api/auth/signup", d),
  refresh: t => api.post("/api/refreshToken", { refreshToken: t }),
};

// ── Movies ─────────────────────────────────────────────────────────────────
export const moviesAPI = {
  getAll:  ()      => api.get("/api/movie"),
  getById: id      => api.get(`/api/movie/${id}`),
  create:  d       => api.post("/api/movie", d),
  update:  (id, d) => api.put(`/api/movie/${id}`, d),
  delete:  id      => api.delete(`/api/movie/${id}`),
};

// ── Theaters ───────────────────────────────────────────────────────────────
export const theatersAPI = {
  getAll:  ()      => api.get("/api/theater"),
  create:  d       => api.post("/api/theater", d),
  update:  (id, d) => api.put(`/api/theater/${id}`, d),
  delete:  id      => api.delete(`/api/theater/${id}`),
};

// ── Screens ────────────────────────────────────────────────────────────────
export const screensAPI = {
  getAll:  ()      => api.get("/api/screen"),
  create:  d       => api.post("/api/screen", d),
  update:  (id, d) => api.put(`/api/screen/${id}`, d),
  delete:  id      => api.delete(`/api/screen/${id}`),
};

// ── Showtimes ──────────────────────────────────────────────────────────────
export const showtimesAPI = {
  getAll:  ()  => api.get("/api/showtime"),
  create:  d   => api.post("/api/showtime", d),
};

// ── Concessions ────────────────────────────────────────────────────────────
export const concessionAPI = {
  getAll:  ()      => api.get("/api/concession"),
  create:  d       => api.post("/api/concession", d),
  update:  (id, d) => api.put(`/api/concession/${id}`, d),
  delete:  id      => api.delete(`/api/concession/${id}`),
};

// ── Bookings ───────────────────────────────────────────────────────────────
export const bookingsAPI = {
  getAll:    ()        => api.get("/api/booking"),
  getByUser: uid       => api.get(`/api/booking/user/${uid}`),
  create:    (uid, d)  => api.post(`/api/booking/${uid}`, d),
  refund:    (uid, d)  => api.post(`/api/booking-refund/${uid}`, d),
  rate:      (uid, d)  => api.put(`/api/booking/${uid}`, d),
};

// ── Users ──────────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll:  () => api.get("/api/user"),
  getById: id => api.get(`/api/user/${id}`),
};

// ── Contact ────────────────────────────────────────────────────────────────
export const contactAPI = {
  submit:   d  => api.post("/api/contact", d),
  getAll:   () => api.get("/api/contact"),
  markRead: id => api.put(`/api/contact/${id}/read`),
  delete:   id => api.delete(`/api/contact/${id}`),
};

// ── Dummy Payment ──────────────────────────────────────────────────────────
export const paymentAPI = {
  process: d => api.post("/api/payment/process", d),
};

export default api;
