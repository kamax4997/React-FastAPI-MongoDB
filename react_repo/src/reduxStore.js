import { configureStore } from '@reduxjs/toolkit'
import linkOptionsReducer from "./components/MainPage/linkOptions/linkOptionsSlice"

export default configureStore({
  reducer:{
    linkOptions: linkOptionsReducer,
  }
})