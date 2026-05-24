import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  globalLoadingCount: 0,
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    startGlobalLoading: (state) => {
      state.globalLoadingCount += 1;
    },
    stopGlobalLoading: (state) => {
      state.globalLoadingCount = Math.max(0, state.globalLoadingCount - 1);
    },
    openSidebar: (state) => {
      state.sidebarOpen = true;
    },
    closeSidebar: (state) => {
      state.sidebarOpen = false;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { startGlobalLoading, stopGlobalLoading, openSidebar, closeSidebar, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
