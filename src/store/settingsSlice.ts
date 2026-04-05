import type { PdfSize } from "../types";
import { edenApi } from "./api/edenApi";
import type { RootState } from "./rootReducer";

const selectSettingsResult = edenApi.endpoints.getSettings.select(undefined);

export const selectSettings = (state: RootState) =>
  selectSettingsResult(state).data ?? null;

export const selectSettingsLoading = (state: RootState) =>
  selectSettingsResult(state).isLoading;

export const fetchSettings = () =>
  edenApi.endpoints.getSettings.initiate(undefined, { forceRefetch: true });

export const updateSettings = (patch: {
  defaultPdfSize?: PdfSize;
  defaultSenderId?: string;
  lowStockThreshold?: number;
}) => edenApi.endpoints.updateSettings.initiate(patch);
