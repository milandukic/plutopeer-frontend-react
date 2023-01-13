import { createSlice } from "@reduxjs/toolkit";
export const counterSlice = createSlice({
  name: "tokenPrices",
  initialState: {
    tokenPrices: [],
  },
  reducers: {
    updateTokenPrices: (state, value) => {
      console.log("React-Redux: updateTokenPrices", state.tokenPrices, value);
      state.tokenPrices = value;
    }
  },
});

// Action creators are generated for each case reducer function
export const { updateTokenPrices} = counterSlice.actions;
export default counterSlice.reducer;
