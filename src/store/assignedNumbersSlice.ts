import { edenApi } from "./api/edenApi";
import type { RootState } from "./rootReducer";

const selectAssignedNumbersResult =
  edenApi.endpoints.getAssignedNumbers.select(undefined);

export const selectAssignedNumbers = (state: RootState) =>
  selectAssignedNumbersResult(state).data ?? [];

export const fetchAssignedNumbers = () =>
  edenApi.endpoints.getAssignedNumbers.initiate(undefined, {
    forceRefetch: true,
  });

export const createAssignedNumber = (payload: { number: string }) =>
  edenApi.endpoints.createAssignedNumber.initiate(payload);

export const updateAssignedNumber = (arg: { id: string; number: string }) =>
  edenApi.endpoints.updateAssignedNumber.initiate(arg);

export const deleteAssignedNumber = (id: string) =>
  edenApi.endpoints.deleteAssignedNumber.initiate(id);
