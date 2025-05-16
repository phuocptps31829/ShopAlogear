import { createSlice } from "@reduxjs/toolkit";

const logoSlice = createSlice({
  name: "logo",
  initialState: {
    logoMain: null,
    loading: true,
  },
  reducers: {
    setlogoMain: (state, action) => {
      state.logoMain = action.payload;
      state.loading = false;
    },
  },
});

export const {
    setlogoMain,
} = logoSlice.actions;
export default logoSlice.reducer;
