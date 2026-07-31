import { createSlice } from "@reduxjs/toolkit";

const round = n => Math.round((n + Number.EPSILON) * 100) / 100;

const bookingSlice = createSlice({
  name: "booking",
  initialState: {
    bookings:          [],
    selectedSeats:     [],
    selectedShowtimeId: null,
    addOns:            { items: [], subTotal: 0 },
    favorites:         JSON.parse(localStorage.getItem("favorites") || "[]"),
  },
  reducers: {
    toFetchBookings: (s, a) => { s.bookings = a.payload; },
    toAddBooking:    (s, a) => { s.bookings.unshift(a.payload); },
    // BUG FIX: String comparison
    toEditBooking: (s, a) => {
      const i = s.bookings.findIndex(b => String(b._id) === String(a.payload.bookingId));
      if (i !== -1) s.bookings[i] = a.payload.updatedData;
    },
    setSeats: (s, a) => { s.selectedSeats = a.payload; },
    setId:    (s, a) => { s.selectedShowtimeId = a.payload; },

    addItemToCart: (s, a) => {
      const item = a.payload;
      const ex   = s.addOns.items.find(i => i.id === item.id);
      s.addOns.subTotal = round(s.addOns.subTotal + item.price);
      if (!ex) {
        s.addOns.items.push({ id: item.id, name: item.name, totalPrice: item.price, price: item.price, quantity: 1 });
      } else {
        ex.quantity++;
        ex.totalPrice = round(ex.totalPrice + item.price);
      }
    },
    removeItemToCart: (s, a) => {
      const ex = s.addOns.items.find(i => i.id === a.payload);
      if (!ex) return;
      s.addOns.subTotal = round(s.addOns.subTotal - ex.price);
      if (ex.quantity === 1) {
        s.addOns.items = s.addOns.items.filter(i => i.id !== a.payload);
      } else {
        ex.quantity--;
        ex.totalPrice = round(ex.totalPrice - ex.price);
      }
    },

    resetBooking: s => {
      s.selectedSeats     = [];
      s.selectedShowtimeId = null;
      s.addOns            = { items: [], subTotal: 0 };
    },
    resetCart: s => { s.addOns = { items: [], subTotal: 0 }; },

    toggleFavorite: (s, a) => {
      const id = String(a.payload);
      const i  = s.favorites.indexOf(id);
      if (i === -1) s.favorites.push(id); else s.favorites.splice(i, 1);
      localStorage.setItem("favorites", JSON.stringify(s.favorites));
    },
  },
});

export const {
  toFetchBookings, toAddBooking, toEditBooking,
  setSeats, setId,
  addItemToCart, removeItemToCart,
  resetBooking, resetCart,
  toggleFavorite,
} = bookingSlice.actions;

export default bookingSlice.reducer;
