import { configureStore } from "@reduxjs/toolkit";
import itemSlice from "./cartSlice";
import authSlice from "./authSlice";
import logoSlice from "./logoSlice";
import menuAdminSlice from "./menuSlice";

export const store = configureStore({
  reducer: {
    cart: itemSlice,
    auth: authSlice,
    logo: logoSlice,
    menuAdmin: menuAdminSlice,
  },
});
