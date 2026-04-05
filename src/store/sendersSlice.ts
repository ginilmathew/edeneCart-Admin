import type { Sender } from "../types";
import { edenApi } from "./api/edenApi";
import type { RootState } from "./rootReducer";

type SenderPayload = Omit<Sender, "id" | "createdAt" | "updatedAt">;

const selectSendersResult = edenApi.endpoints.getSenders.select(undefined);

export const selectSenders = (state: RootState) =>
  selectSendersResult(state).data ?? [];

export const fetchSenders = () =>
  edenApi.endpoints.getSenders.initiate(undefined, { forceRefetch: true });

export const createSender = (payload: SenderPayload) =>
  edenApi.endpoints.createSender.initiate(payload);

export const updateSender = (arg: {
  id: string;
  patch: Partial<SenderPayload>;
}) => edenApi.endpoints.updateSender.initiate(arg);

export const setDefaultSender = (id: string) =>
  edenApi.endpoints.setDefaultSender.initiate(id);

export const deleteSender = (id: string) =>
  edenApi.endpoints.deleteSender.initiate(id);
