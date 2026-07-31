import { createSlice } from "@reduxjs/toolkit";

const storageSlice = createSlice({
  name: "storage",
  initialState: {
    userId:       localStorage.getItem("userId") || "",
    refreshToken: localStorage.getItem("refreshToken") || "",
    accessToken:  localStorage.getItem("accessToken") || "",
  },
  reducers: {
    authLogin: (state, { payload }) => {
      state.userId = payload.userId;
      state.refreshToken = payload.refreshToken;
      state.accessToken = payload.accessToken;
      localStorage.setItem("userId",       payload.userId);
      localStorage.setItem("refreshToken", payload.refreshToken);
      localStorage.setItem("accessToken",  payload.accessToken);
      if (payload.isAdmin !== undefined) localStorage.setItem("isAdmin", payload.isAdmin ? "true" : "false");
    },
    authLogout: (state) => {
      state.userId = ""; state.refreshToken = ""; state.accessToken = "";
      ["userId","refreshToken","accessToken","isAdmin","favorites"].forEach(k => localStorage.removeItem(k));
    },
  },
});

export const { authLogin, authLogout } = storageSlice.actions;
export default storageSlice.reducer;
