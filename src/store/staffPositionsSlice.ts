import { edenApi } from "./api/edenApi";
import type { RootState } from "./rootReducer";

const selectStaffPositionsResult =
  edenApi.endpoints.getStaffPositions.select(undefined);

export const selectStaffPositions = (state: RootState) =>
  selectStaffPositionsResult(state).data ?? [];

export const fetchStaffPositions = () =>
  edenApi.endpoints.getStaffPositions.initiate(undefined, {
    forceRefetch: true,
  });

export const createStaffPosition = (payload: { name: string }) =>
  edenApi.endpoints.createStaffPosition.initiate(payload);

export const updateStaffPosition = (arg: { id: string; name: string }) =>
  edenApi.endpoints.updateStaffPosition.initiate(arg);

export const deleteStaffPosition = (id: string) =>
  edenApi.endpoints.deleteStaffPosition.initiate(id);
