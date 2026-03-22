import { createSlice } from '@reduxjs/toolkit'

export const shopSlice = createSlice({
  name: 'shop',
  initialState: {
    shops: [],
  },
  reducers: {
    setShops: (state, action) => {
      state.shops = action.payload
    },
  },
})

export const { setShops } = shopSlice.actions
export default shopSlice.reducer