import { combineReducers } from "@reduxjs/toolkit";
import { edenApi } from "./api/edenApi";

export const rootReducer = combineReducers({
  [edenApi.reducerPath]: edenApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
