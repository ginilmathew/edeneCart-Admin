import type { DeliveryMethod } from "../types";
import { edenApi } from "./api/edenApi";
import type { RootState } from "./rootReducer";

const selectMethodsResult = edenApi.endpoints.getDeliveryMethods.select(
  undefined,
);
const selectFeesResult = edenApi.endpoints.getProductDeliveryFees.select(
  undefined,
);

export const selectDeliveryMethods = (state: RootState) =>
  selectMethodsResult(state).data ?? [];

export const selectProductDeliveryFees = (state: RootState) =>
  selectFeesResult(state).data ?? [];

export const fetchDeliveryMethods = () =>
  edenApi.endpoints.getDeliveryMethods.initiate(undefined, {
    forceRefetch: true,
  });

export const createDeliveryMethod = (payload: {
  name: string;
  description?: string;
  sortOrder?: number;
}) => edenApi.endpoints.createDeliveryMethod.initiate(payload);

export const updateDeliveryMethod = (arg: {
  id: string;
  patch: Partial<Pick<DeliveryMethod, "name" | "description" | "sortOrder">>;
}) => edenApi.endpoints.updateDeliveryMethod.initiate(arg);

export const deleteDeliveryMethod = (id: string) =>
  edenApi.endpoints.deleteDeliveryMethod.initiate(id);

export const fetchProductDeliveryFees = () =>
  edenApi.endpoints.getProductDeliveryFees.initiate(undefined, {
    forceRefetch: true,
  });

export const createProductDeliveryFee = (payload: {
  productId: string;
  deliveryMethodId: string;
  feePrepaid: number;
  feeCod: number;
}) => edenApi.endpoints.createProductDeliveryFee.initiate(payload);

export const updateProductDeliveryFee = (arg: {
  id: string;
  patch: Partial<{
    productId: string;
    deliveryMethodId: string;
    feePrepaid: number;
    feeCod: number;
  }>;
}) => edenApi.endpoints.updateProductDeliveryFee.initiate(arg);

export const deleteProductDeliveryFee = (id: string) =>
  edenApi.endpoints.deleteProductDeliveryFee.initiate(id);
