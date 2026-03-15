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
  joinedDate: string;
  isActive: boolean;
  avatar?: string;
  /** Payout per order (e.g. 30) */
  payoutPerOrder: number;
  /** Bonuses: e.g. [{ orders: 10, bonus: 50 }, ...] */
  bonusMilestones: { orders: number; bonus: number }[];
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
}

export interface StaffWithStats extends Staff {
  todayOrders: number;
  totalEarnings: number;
  undeliveredCount: number;
  weeklyEarnings: number;
}
