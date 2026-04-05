import {
  edenApi,
  type CreateStaffPayload,
  type UpdateStaffPayload,
} from "./api/edenApi";
import type { RootState } from "./rootReducer";

export type { CreateStaffPayload, UpdateStaffPayload };

const selectStaffResult = edenApi.endpoints.getStaff.select(undefined);
const selectStaffMeResult = edenApi.endpoints.getStaffMe.select(undefined);

export const selectStaff = (state: RootState) =>
  selectStaffResult(state).data ?? [];

export const selectStaffMe = (state: RootState) =>
  selectStaffMeResult(state).data ?? null;

export const selectStaffMeLoading = (state: RootState) =>
  selectStaffMeResult(state).isLoading;

export const selectStaffById = (state: RootState, id: string) =>
  (selectStaffResult(state).data ?? []).find((s) => s.id === id);

export const fetchStaff = () =>
  edenApi.endpoints.getStaff.initiate(undefined, { forceRefetch: true });

export const fetchStaffMe = () =>
  edenApi.endpoints.getStaffMe.initiate(undefined, { forceRefetch: true });

export const createStaff = (payload: CreateStaffPayload) =>
  edenApi.endpoints.createStaff.initiate(payload);

export const updateStaff = (arg: { id: string; patch: UpdateStaffPayload }) =>
  edenApi.endpoints.updateStaff.initiate(arg);

export const deleteStaff = (id: string) =>
  edenApi.endpoints.deleteStaff.initiate(id);

export const resetStaffPassword = (id: string) =>
  edenApi.endpoints.resetStaffPassword.initiate(id);

export const requestMyPasswordReset = () =>
  edenApi.endpoints.requestMyPasswordReset.initiate();

export const fulfillPasswordResetRequest = (requestId: string) =>
  edenApi.endpoints.fulfillPasswordResetRequest.initiate(requestId);
