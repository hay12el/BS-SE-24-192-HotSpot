import { createSlice } from "@reduxjs/toolkit";

const initialState = {
   res: [],
};

export const resSlice = createSlice({
  name: "results",
  initialState,
  reducers: {
    SetRes: (state, action) => {
      state.res = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { SetRes } = resSlice.actions;
export default resSlice.reducer;
