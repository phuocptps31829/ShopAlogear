import { createSlice } from "@reduxjs/toolkit";

const menuAdminSlice = createSlice({
  name: "menuAdmin",
  initialState: {
    active: false,
  },
  reducers: {
    setActive: (state, action) => {
      state.active = action.payload;
    },
  },
});

export const {
  setActive,
} = menuAdminSlice.actions;
export default menuAdminSlice.reducer;
