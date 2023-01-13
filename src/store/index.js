import { configureStore } from "@reduxjs/toolkit";
import socketslice from "./socketslice";
import apislice from "./apislice";

export default configureStore({
  reducer: {
    socket: socketslice,
    api: apislice,
  },
});
