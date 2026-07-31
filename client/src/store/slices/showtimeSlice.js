import { createSlice } from "@reduxjs/toolkit";

const showtimeSlice = createSlice({
  name: "showtime",
  initialState: { showtimes: [] },
  reducers: {
    toFetchShowtimes:  (s, a) => { s.showtimes = a.payload; },
    toAddShowtime:     (s, a) => { s.showtimes.push(a.payload); },
    // BUG FIX: String comparison for ObjectId vs plain string
    toEditShowtime: (s, a) => {
      const i = s.showtimes.findIndex(x => String(x._id) === String(a.payload.showtimeId));
      if (i !== -1) s.showtimes[i] = { ...s.showtimes[i], ...a.payload.updatedData };
    },
    toDeleteShowtime: (s, a) => {
      s.showtimes = s.showtimes.filter(x => String(x._id) !== String(a.payload));
    },
  },
});

export const { toFetchShowtimes, toAddShowtime, toEditShowtime, toDeleteShowtime } = showtimeSlice.actions;
export default showtimeSlice.reducer;
