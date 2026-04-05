import { edenApi } from "./api/edenApi";
import type { RootState } from "./rootReducer";

const selectCustomersResult = edenApi.endpoints.getCustomers.select(undefined);

export const selectCustomers = (state: RootState) =>
  selectCustomersResult(state).data ?? [];

export const fetchCustomers = () =>
  edenApi.endpoints.getCustomers.initiate(undefined, { forceRefetch: true });
