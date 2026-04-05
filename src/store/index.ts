import { configureStore } from "@reduxjs/toolkit";
import { edenApi } from "./api/edenApi";
import { rootReducer } from "./rootReducer";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          // RTK Query internal actions carry non-serializable payloads (AbortSignal, etc.)
          `${edenApi.reducerPath}/executeQuery/pending`,
          `${edenApi.reducerPath}/executeQuery/fulfilled`,
          `${edenApi.reducerPath}/executeQuery/rejected`,
          `${edenApi.reducerPath}/executeMutation/pending`,
          `${edenApi.reducerPath}/executeMutation/fulfilled`,
          `${edenApi.reducerPath}/executeMutation/rejected`,
        ],
      },
    }).concat(edenApi.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export { edenApi } from "./api/edenApi";
export {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  selectProducts,
  selectProductById,
} from "./productsSlice";
export type { NewProductPayload } from "./productsSlice";

export {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  selectCategories,
} from "./categoriesSlice";

export {
  fetchOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  selectOrders,
  selectOrdersListTotal,
} from "./ordersSlice";
export type { OrderListFilters, OrderListPayload } from "./ordersSlice";

export {
  fetchStaff,
  fetchStaffMe,
  createStaff,
  updateStaff,
  deleteStaff,
  resetStaffPassword,
  requestMyPasswordReset,
  fulfillPasswordResetRequest,
  selectStaff,
  selectStaffMe,
  selectStaffMeLoading,
  selectStaffById,
} from "./staffSlice";
export type { CreateStaffPayload, UpdateStaffPayload } from "./staffSlice";

export { fetchCustomers, selectCustomers } from "./customersSlice";

export {
  fetchSenders,
  createSender,
  updateSender,
  setDefaultSender,
  deleteSender,
  selectSenders,
} from "./sendersSlice";

export {
  fetchSettings,
  updateSettings,
  selectSettings,
  selectSettingsLoading,
} from "./settingsSlice";

export {
  fetchStaffPositions,
  createStaffPosition,
  updateStaffPosition,
  deleteStaffPosition,
  selectStaffPositions,
} from "./staffPositionsSlice";

export {
  fetchAssignedNumbers,
  createAssignedNumber,
  updateAssignedNumber,
  deleteAssignedNumber,
  selectAssignedNumbers,
} from "./assignedNumbersSlice";

export {
  fetchDeliveryMethods,
  createDeliveryMethod,
  updateDeliveryMethod,
  deleteDeliveryMethod,
  fetchProductDeliveryFees,
  createProductDeliveryFee,
  updateProductDeliveryFee,
  deleteProductDeliveryFee,
  selectDeliveryMethods,
  selectProductDeliveryFees,
} from "./deliveriesSlice";
