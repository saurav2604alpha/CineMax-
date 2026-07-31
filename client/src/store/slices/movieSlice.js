import { createSlice } from "@reduxjs/toolkit";

const movieSlice = createSlice({
  name: "movie",
  initialState: { movies: [] },
  reducers: {
    fetchAllMovies: (s, a) => { s.movies = a.payload; },
    toAddMovie:     (s, a) => { s.movies.push(a.payload); },
    toEditMovie:    (s, a) => { const i = s.movies.findIndex(m => m._id === a.payload.movieId); if (i !== -1) s.movies[i] = a.payload.updatedData; },
    toDeleteMovie:  (s, a) => { s.movies = s.movies.filter(m => m._id !== a.payload); },
  },
});
export const { fetchAllMovies, toAddMovie, toEditMovie, toDeleteMovie } = movieSlice.actions;
export default movieSlice.reducer;
