import { createSlice } from "@reduxjs/toolkit";
export const counterSlice = createSlice({
  name: "ticketData",
  initialState: {
    ticketData: false,
  },
  reducers: {
    updateTicketFlag: (state) => {
      console.log("React-Redux: updateTicketFlag", state.ticketData);
      state.ticketData = state.ticketData ? false : true;
    },

    setTicketData: (state, action) => {
      state.ticketData = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateTicketFlag, setTicketData } = counterSlice.actions;
export default counterSlice.reducer;
