import { createSlice } from "@reduxjs/toolkit";

const itemSlice = createSlice({
  name: "cart",
  initialState: {
    cart: JSON.parse(localStorage.getItem("cart")) || [],
  },
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.cart.find(
        item =>
          item.id === action.payload.id &&
          item.colorName === action.payload.colorName
      );
    
      if (existingItem) {
        existingItem.checked = action.payload.checked ? action.payload.checked : false;
        existingItem.quantity += action.payload.quantity || 1 ;
      } else {
        state.cart.push({ ...action.payload, quantity: action.payload.quantity || 1 });
      }
    
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter(item =>
        !(item.id == action.payload.id && item.colorName == action.payload.colorName)
      );
    
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },

    clearCheckedItems: (state) => {
      state.cart = state.cart.filter((item) => !item.checked);
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    
    updateQuantity: (state, action) => {
      const { id, colorName, quantity } = action.payload;
      state.cart = state.cart.map(item =>
        item.id === id && item.colorName === colorName
        ? { ...item, quantity: Math.max(1, quantity) } 
        : item
      );
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    
    toggleChecked: (state, action) => {
      const { id, colorName } = action.payload;
      state.cart = state.cart.map(item =>
        item.id === id && item.colorName === colorName
        ? { ...item, checked: !item.checked } : item
      );
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    
    toggleAllChecked: (state, action) => {
      const { isChecked } = action.payload;
      state.cart = state.cart.map((item) => ({ ...item, checked: isChecked }));
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  clearCart,
  setCartItems,
  updateQuantity,
  toggleChecked,
  toggleAllChecked,
  clearCheckedItems
} = itemSlice.actions;
export default itemSlice.reducer;