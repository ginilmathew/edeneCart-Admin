import type { Staff } from "../types";

export function normalizeStaff(row: Staff): Staff {
  return {
    ...row,
    jobRole: row.jobRole ?? "sales",
    staffPositionId: row.staffPositionId ?? null,
    staffPositionName: row.staffPositionName ?? null,
    assignedNumberId: row.assignedNumberId ?? null,
    assignedNumber: row.assignedNumber ?? null,
    phone: row.phone ?? "",
    temporaryPassword:
      row.temporaryPassword === undefined || row.temporaryPassword === ""
        ? null
        : row.temporaryPassword,
    pendingPasswordResetRequest:
      row.pendingPasswordResetRequest === undefined
        ? null
        : row.pendingPasswordResetRequest,
    extraPermissionSlugs: Array.isArray(row.extraPermissionSlugs)
      ? row.extraPermissionSlugs
      : [],
    upiId: row.upiId?.trim() || null,
  };
}
