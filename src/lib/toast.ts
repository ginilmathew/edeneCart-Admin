import { toast as toastify, type ToastOptions } from "react-toastify";
import { getApiErrorMessage } from "./api-error";

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

/** Works with `Error`, RTK Query `.unwrap()` rejections, and `fetch` API shapes. */
export function getErrorMessage(error: unknown, fallback = "Request failed"): string {
  return getApiErrorMessage(error, fallback);
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    toastify.success(message, { ...defaultOptions, ...options });
  },
  error: (message: string, options?: ToastOptions) => {
    toastify.error(message, { ...defaultOptions, ...options });
  },
  info: (message: string, options?: ToastOptions) => {
    toastify.info(message, { ...defaultOptions, ...options });
  },
  warning: (message: string, options?: ToastOptions) => {
    toastify.warning(message, { ...defaultOptions, ...options });
  },
  fromError: (
    error: unknown,
    fallback = "Request failed",
    options?: ToastOptions
  ) => {
    toastify.error(getErrorMessage(error, fallback), {
      ...defaultOptions,
      ...options,
    });
  },
};
