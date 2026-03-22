export type UserRole = "super_admin" | "staff";

export type OrderType = "cod" | "prepaid";

export type OrderStatus = "pending" | "delivered" | "cancelled";

export interface Product {
  id: string;
  name: string;
  sku?: string;
}

export interface Staff {
  id: string;
  name: string;
  username: string;
  phone: string;
  joinedDate: string;
  isActive: boolean;
  avatar?: string;
  /** Payout per order (e.g. 30) */
  payoutPerOrder: number;
  /** Bonuses: e.g. [{ orders: 10, bonus: 50 }, ...] */
  bonusMilestones: { orders: number; bonus: number }[];
  /**
   * Initial login password (plain) until the staff member changes password; then null.
   * Admin UI shows "Staff changed" when null.
   */
  temporaryPassword: string | null;
}

export interface Order {
  id: string;
  orderId: string; // display ID e.g. ORD-001
  staffId: string;
  customerName: string;
  deliveryAddress: string;
  phone: string;
  pincode: string;
  postOffice: string;
  email: string;
  state: string;
  district: string;
  orderType: OrderType;
  productId: string;
  quantity: number;
  sellingAmount: number;
  notes?: string;
  status: OrderStatus;
  createdAt: string; // ISO date
  updatedAt?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  staffId?: string; // when role is staff
  avatar?: string;
  /** When true, UI should prompt to change password (set after admin-created staff login). */
  mustChangePassword?: boolean;
}

export interface StaffWithStats extends Staff {
  todayOrders: number;
  totalEarnings: number;
  undeliveredCount: number;
  weeklyEarnings: number;
}
