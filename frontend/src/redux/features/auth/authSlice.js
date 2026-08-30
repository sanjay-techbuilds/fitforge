import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));

      // Set expiration for 30 days
      const expirationTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000; 
      localStorage.setItem("expirationTime", expirationTime);
    },

    logout: (state) => {
      state.userInfo = null;
      
      // ⚠️ FIXED: We only remove auth data, NOT the saved carts!
      localStorage.removeItem("userInfo");
      localStorage.removeItem("expirationTime");
      
      // Note: We do NOT run localStorage.clear() here anymore.
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;