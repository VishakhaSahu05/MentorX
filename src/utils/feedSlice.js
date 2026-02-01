import { createSlice } from "@reduxjs/toolkit";

const feedSlice = createSlice({
  name: "feed",
  initialState: [], 
  reducers: {
    // page 1 load
    addFeed: (state, action) => {
      return action.payload;
    },

    // page 2,3,4...
    appendFeed: (state, action) => {
      state.push(...action.payload);
    },

    // when component unmounts / logout
    resetFeed: () => {
      return [];
    },
  },
});

export const { addFeed, appendFeed, resetFeed } = feedSlice.actions;
export default feedSlice.reducer;
