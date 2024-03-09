import { configureStore } from '@reduxjs/toolkit'
import resSlice from './results'
import userSlice from './user'

export const store = configureStore({
  reducer: {
    user: userSlice,
    result: resSlice
  },
})