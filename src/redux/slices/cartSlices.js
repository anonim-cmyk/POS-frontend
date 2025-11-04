import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItems: (state, action) => {
      const dish = action.payload;
      const existing = state.find((item) => item._id === dish._id);
      if (existing) {
        existing.quantity += dish.quantity; // jumlah tambahan
        existing.price = existing.quantity * existing.pricePerQuantity;
      } else {
        state.push({
          _id: dish._id, // dari DB
          name: dish.name,
          pricePerQuantity: dish.pricePerQuantity, // harga 1 porsi
          quantity: dish.quantity,
          price: dish.price, // total = pricePerQuantity * quantity
        });
      }
    },
    removeItem: (state, action) => {
      return state.filter((item) => item._id !== action.payload);
    },
    removeAllItems: () => [],
  },
});

export const getTotalPrice = (state) =>
  state.cart.reduce((total, item) => total + item.price, 0);

export const { addItems, removeItem, removeAllItems } = cartSlice.actions;
export default cartSlice.reducer;
