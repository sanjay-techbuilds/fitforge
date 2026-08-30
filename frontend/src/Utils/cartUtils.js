export const addDecimals = (num) => {
  return (Math.round(num * 100) / 100).toFixed(2);
};

/**
 * updateCart(state)
 * - Uses state.userId (if present) to decide storage key.
 * - Falls back to localStorage userInfo only if state.userId is absent.
 * - Saves the entire cart slice state to the chosen key.
 */
export const updateCart = (state) => {
  // 1) Price calculations
  state.itemsPrice = addDecimals(
    state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  );
  state.shippingPrice = addDecimals(state.itemsPrice > 100 ? 0 : 10);
  state.taxPrice = addDecimals(Number((0.15 * state.itemsPrice).toFixed(2)));
  state.totalPrice = (
    Number(state.itemsPrice) +
    Number(state.shippingPrice) +
    Number(state.taxPrice)
  ).toFixed(2);

  // 2) Determine storage key — prefer state.userId (more reliable)
  const userIdFromState = state.userId || null;

  let storageKey;
  if (userIdFromState) {
    storageKey = `cart_${userIdFromState}`;
  } else {
    // fallback: try to read localStorage.userInfo (for legacy timing cases)
    const localUser = localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo"))
      : null;
    storageKey = localUser ? `cart_${localUser._id}` : "cart";
  }

  // 3) Persist
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (err) {
    console.warn("Failed to persist cart to localStorage:", err);
  }

  return state;
};
