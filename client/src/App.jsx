import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Layout           from "./components/layout/Layout";
import ProtectedRoute   from "./components/ui/ProtectedRoute";

import HomePage           from "./pages/HomePage";
import MoviesPage         from "./pages/MoviesPage";
import MovieDetails       from "./pages/MovieDetails";
import MovieShowtimesPage from "./pages/MovieShowtimesPage";
import SeatSelection      from "./pages/SeatSelection";
import AddOnPage          from "./pages/AddOnPage";
import CheckoutPage       from "./pages/CheckoutPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import TicketPage         from "./pages/TicketPage";
import TheatersPage       from "./pages/TheatersPage";
import ContactPage        from "./pages/ContactPage";
import LoginPage          from "./pages/LoginPage";
import SignUpPage         from "./pages/SignUpPage";
import UserProfilePage    from "./pages/UserProfilePage";
import AdminPage          from "./pages/AdminPage";
import NotFoundPage       from "./pages/NotFoundPage";

import { fetchAllMovies }    from "./store/slices/movieSlice";
import { toFetchShowtimes }  from "./store/slices/showtimeSlice";
import { toFetchTheaters }   from "./store/slices/theaterSlice";
import { toFetchScreens }    from "./store/slices/screenSlice";
import { toFetchConcessions} from "./store/slices/concessionSlice";
import { toFetchBookings }   from "./store/slices/bookingSlice";
import { toFetchUsers }      from "./store/slices/userSlice";

import {
  moviesAPI, showtimesAPI, theatersAPI, screensAPI,
  concessionAPI, bookingsAPI, usersAPI,
} from "./api";

/* ─────────────────────────────────────────────────────────────────────────────
   DataLoader: Fetches all public data once on app start, then user data when
   logged in. Retries are handled by the axios interceptor.
───────────────────────────────────────────────────────────────────────────── */
const DataLoader = () => {
  const dispatch = useDispatch();
  const userId   = useSelector(s => s.storage.userId);

  // Load public data once
  useEffect(() => {
    const load = async () => {
      try {
        const [mv, st, th, sc, cn] = await Promise.allSettled([
          moviesAPI.getAll(),
          showtimesAPI.getAll(),
          theatersAPI.getAll(),
          screensAPI.getAll(),
          concessionAPI.getAll(),
        ]);
        if (mv.status === "fulfilled") dispatch(fetchAllMovies(mv.value.data));
        if (st.status === "fulfilled") dispatch(toFetchShowtimes(st.value.data));
        if (th.status === "fulfilled") dispatch(toFetchTheaters(th.value.data));
        if (sc.status === "fulfilled") dispatch(toFetchScreens(sc.value.data));
        if (cn.status === "fulfilled") dispatch(toFetchConcessions(cn.value.data));
      } catch (err) {
        console.error("Public data load error:", err.message);
      }
    };
    load();
  }, []);

  // Load user-specific data when logged in
  useEffect(() => {
    if (!userId) return;
    const loadUser = async () => {
      try {
        const [bk, us] = await Promise.allSettled([
          bookingsAPI.getByUser(userId),
          usersAPI.getAll(),
        ]);
        if (bk.status === "fulfilled") dispatch(toFetchBookings(bk.value.data));
        if (us.status === "fulfilled") dispatch(toFetchUsers(us.value.data));
      } catch (err) {
        console.error("User data load error:", err.message);
      }
    };
    loadUser();
  }, [userId]);

  return null;
};

/* ─────────────────────────────────────────────────────────────────────────────
   App: Full router with all pages
───────────────────────────────────────────────────────────────────────────── */
const App = () => (
  <BrowserRouter>
    <DataLoader />
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
      theme="dark"
      toastStyle={{
        background: "#111827",
        border: "1px solid #374151",
        color: "#fff",
        borderRadius: "12px",
      }}
    />
    <Routes>
      <Route element={<Layout />}>
        {/* ── Public routes ── */}
        <Route path="/"                     element={<HomePage />} />
        <Route path="/movies"               element={<MoviesPage />} />
        <Route path="/movie/details/:id"    element={<MovieDetails />} />
        <Route path="/movie/select/:id"     element={<MovieShowtimesPage />} />
        <Route path="/theaters"             element={<TheatersPage />} />
        <Route path="/contact"              element={<ContactPage />} />
        <Route path="/login"                element={<LoginPage />} />
        <Route path="/signup"               element={<SignUpPage />} />

        {/* ── Protected user routes ── */}
        <Route path="/booking/seat/:id"
          element={<ProtectedRoute><SeatSelection /></ProtectedRoute>} />
        <Route path="/booking/add-on"
          element={<ProtectedRoute><AddOnPage /></ProtectedRoute>} />
        <Route path="/booking/checkout"
          element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/booking/success/:id"
          element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
        <Route path="/ticket/:id"
          element={<ProtectedRoute><TicketPage /></ProtectedRoute>} />
        <Route path="/profile"
          element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />

        {/* ── Admin routes ── */}
        <Route path="/admin"
          element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
