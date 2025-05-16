import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userProfile: null,
  },
  reducers: {
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
    },
    logoutAction: (state) => {
      state.userProfile = null;
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
    },
  },
});

export const {
  setUserProfile,
  logoutAction,
} = authSlice.actions;
export default authSlice.reducer;
