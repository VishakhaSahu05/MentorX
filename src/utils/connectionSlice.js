import { createSlice } from "@reduxjs/toolkit";

const connectionSlice = createSlice({
  name: "connection",
  initialState: {
    connections: [],
  },
  reducers: {
    addConnections: (state, action) => {
      state.connections = action.payload;
    },
    removeConnections: (state) => {
      state.connections = [];
    },
  },
});

export const { addConnections, removeConnections } = connectionSlice.actions;
export default connectionSlice.reducer;
