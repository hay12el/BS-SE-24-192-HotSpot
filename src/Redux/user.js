import { createSlice } from "@reduxjs/toolkit";
import { useEffect } from "react";

const initialState = {
  token: localStorage.getItem("token") || undefined,
  userName: localStorage.getItem("userName") || undefined,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    LOGIN: (state, action) => {
      state.token = action.payload.token;
      state.userName = action.payload.userName;
      state.isAuth = true;
    },
    LOGOUT: (state) => {
      state.token = null;
      state.userName = undefined;
      state.isAuth = false;
      localStorage.clear();
    },
  },
});

// Action creators are generated for each case reducer function
export const { LOGIN, LOGOUT } = userSlice.actions;
export default userSlice.reducer;
