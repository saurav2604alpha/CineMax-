import { configureStore } from "@reduxjs/toolkit";
import movieReducer     from "./slices/movieSlice";
import theaterReducer   from "./slices/theaterSlice";
import screenReducer    from "./slices/screenSlice";
import storageReducer   from "./slices/storageSlice";
import showtimeReducer  from "./slices/showtimeSlice";
import bookingReducer   from "./slices/bookingSlice";
import concessionReducer from "./slices/concessionSlice";
import userReducer      from "./slices/userSlice";

export default configureStore({
  reducer: { movie: movieReducer, theater: theaterReducer, screen: screenReducer, storage: storageReducer, showtime: showtimeReducer, booking: bookingReducer, concession: concessionReducer, user: userReducer },
  middleware: (gDM) => gDM({ serializableCheck: false }),
});
