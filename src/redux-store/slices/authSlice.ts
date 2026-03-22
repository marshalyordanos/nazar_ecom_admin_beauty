import { createSlice } from '@reduxjs/toolkit'

export const authSlice = createSlice({
  name: 'shop',
  initialState: {
    accessToken: "",
    refreshToken:"",
    user:null
  },
  reducers: {
    setCredential: (state, action) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken

    },
  },
})

export const { setCredential } = authSlice.actions
export default authSlice.reducer