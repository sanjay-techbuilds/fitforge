import { createSlice } from "@reduxjs/toolkit";
import { updateCart } from "../../../Utils/cartUtils";
import { setCredentials, logout } from "../auth/authSlice";

/**
 * getInitialCart:
 * - Reads userInfo from localStorage (if present) and sets userId in initial state.
 * - Loads the appropriate cart key (cart_<userId> or guest 'cart').
 */
const getInitialCart = () => {
  const localUser = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null;

  const userId = localUser ? localUser._id : null;
  const storageKey = userId ? `cart_${userId}` : "cart";
  const storedCart = localStorage.getItem(storageKey);

  // Base structure always includes userId field (may be null)
  const base = {
    userId: userId,
    cartItems: [],
    shippingAddress: {},
    paymentMethod: "PayPal",
    itemsPrice: 0,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: 0,
  };

  if (storedCart) {
    try {
      const parsed = JSON.parse(storedCart);
      return {
        ...base,
        cartItems: parsed.cartItems || [],
        shippingAddress: parsed.shippingAddress || {},
        paymentMethod: parsed.paymentMethod || "PayPal",
        itemsPrice: parsed.itemsPrice || 0,
        shippingPrice: parsed.shippingPrice || 0,
        taxPrice: parsed.taxPrice || 0,
        totalPrice: parsed.totalPrice || 0,
      };
    } catch (err) {
      console.warn("Failed to parse stored cart:", err);
      return base;
    }
  }

  return base;
};

const initialState = getInitialCart();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      // action.payload is product object
      const { user, rating, numReviews, reviews, ...item } = action.payload;

      const existItem = state.cartItems.find((x) => x._id === item._id);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x._id === existItem._id ? item : x
        );
      } else {
        state.cartItems.push(item);
      }

      // Persist (updateCart uses state.userId preferentially)
      return updateCart(state);
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
      return updateCart(state);
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      return updateCart(state);
    },

    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      return updateCart(state);
    },

    clearCartItems: (state) => {
      state.cartItems = [];
      return updateCart(state);
    },

    resetCart: (state) => {
      state.userId = null;
      state.cartItems = [];
      state.shippingAddress = {};
      state.paymentMethod = "PayPal";
      state.itemsPrice = 0;
      state.shippingPrice = 0;
      state.taxPrice = 0;
      state.totalPrice = 0;
      return updateCart(state);
    },
  },

  extraReducers: (builder) => {
    /**
     * When the app dispatches setCredentials (user logged in),
     * - set state.userId so updateCart writes to user-specific key thereafter
     * - migrate guest cart -> user cart if guest cart has items
     */
    builder.addCase(setCredentials, (state, action) => {
      const user = action.payload;
      if (!user || !user._id) {
        // defensive: if payload doesn't have id, keep state unchanged
        return state;
      }

      const userKey = `cart_${user._id}`;

      // set the userId in cart state immediately
      state.userId = user._id;

      // See if there's already a user cart
      let storedUserCart = localStorage.getItem(userKey);

      // If no user cart, try to migrate guest cart if it has items
      if (!storedUserCart) {
        const guestCart = localStorage.getItem("cart");
        if (guestCart) {
          try {
            const parsedGuest = JSON.parse(guestCart);
            if (parsedGuest && parsedGuest.cartItems && parsedGuest.cartItems.length > 0) {
              // Save guest cart under user key
              localStorage.setItem(userKey, guestCart);
              storedUserCart = guestCart;
            }
          } catch (err) {
            console.warn("Failed to parse guest cart during migration:", err);
          }
        }
      }

      // Load storedUserCart if exists, else defaults (we already set userId above)
      if (storedUserCart) {
        try {
          const parsed = JSON.parse(storedUserCart);
          state.cartItems = parsed.cartItems || [];
          state.shippingAddress = parsed.shippingAddress || {};
          state.paymentMethod = parsed.paymentMethod || "PayPal";
          state.itemsPrice = parsed.itemsPrice || 0;
          state.shippingPrice = parsed.shippingPrice || 0;
          state.taxPrice = parsed.taxPrice || 0;
          state.totalPrice = parsed.totalPrice || 0;
        } catch (err) {
          console.warn("Failed to parse user cart on login:", err);
          // Keep empty defaults (but with state.userId set)
          state.cartItems = [];
          state.shippingAddress = {};
          state.paymentMethod = "PayPal";
        }
      } else {
        // fresh user — ensure basic defaults are present (userId already set)
        state.cartItems = state.cartItems || [];
        state.shippingAddress = state.shippingAddress || {};
        state.paymentMethod = state.paymentMethod || "PayPal";
      }

      // persist the in-memory state under the user key
      return updateCart(state);
    });

    /**
     * Logout: clear cart slice in redux but do NOT overwrite or delete cart_<userId>
     * We DO remove the guest 'cart' key to avoid stale duplicates.
     */
    builder.addCase(logout, (state) => {
      state.userId = null;
      state.cartItems = [];
      state.shippingAddress = {};
      state.paymentMethod = "PayPal";
      state.itemsPrice = 0;
      state.shippingPrice = 0;
      state.taxPrice = 0;
      state.totalPrice = 0;

      // Don't remove cart_<userId> — that belongs to the user.
      // It's safe to remove guest cart key.
      localStorage.removeItem("cart");

      // Persist the (guest) empty state to 'cart' so UI remains consistent.
      // NOTE: updateCart will store to 'cart' because state.userId is null.
      return updateCart(state);
    });
  },
});

export const {
  addToCart,
  removeFromCart,
  savePaymentMethod,
  saveShippingAddress,
  clearCartItems,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;
