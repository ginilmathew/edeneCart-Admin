import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Order, Product, Staff } from "../types";
import {
  MOCK_ORDERS,
  MOCK_PRODUCTS,
  MOCK_STAFF,
} from "../data/mockData";

interface StoreContextValue {
  orders: Order[];
  products: Product[];
  staff: Staff[];
  addOrder: (order: Omit<Order, "id" | "orderId" | "createdAt">) => Order;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  addProduct: (product: Omit<Product, "id">) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setStaffActive: (staffId: string, isActive: boolean) => void;
  getProductById: (id: string) => Product | undefined;
  getStaffById: (id: string) => Staff | undefined;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function generateOrderId(orders: Order[]): string {
  const max = orders.reduce((acc, o) => {
    const num = parseInt(o.orderId.replace(/\D/g, ""), 10);
    return isNaN(num) ? acc : Math.max(acc, num);
  }, 1000);
  return `ORD-${max + 1}`;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [staff, setStaffList] = useState<Staff[]>(MOCK_STAFF);

  const addOrder = useCallback(
    (order: Omit<Order, "id" | "orderId" | "createdAt">): Order => {
      const orderId = generateOrderId(orders);
      const newOrder: Order = {
        ...order,
        id: `o-${Date.now()}`,
        orderId,
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [...prev, newOrder]);
      return newOrder;
    },
    [orders]
  );

  const updateOrder = useCallback((id: string, patch: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o))
    );
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const addProduct = useCallback((product: Omit<Product, "id">): Product => {
    const newProduct: Product = {
      ...product,
      id: `p-${Date.now()}`,
    };
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  }, []);

  const updateProduct = useCallback((id: string, patch: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const setStaffActive = useCallback((staffId: string, isActive: boolean) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, isActive } : s))
    );
  }, []);

  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const getStaffById = useCallback(
    (id: string) => staff.find((s) => s.id === id),
    [staff]
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      orders,
      products,
      staff,
      addOrder,
      updateOrder,
      deleteOrder,
      addProduct,
      updateProduct,
      deleteProduct,
      setStaffActive,
      getProductById,
      getStaffById,
    }),
    [
      orders,
      products,
      staff,
      addOrder,
      updateOrder,
      deleteOrder,
      addProduct,
      updateProduct,
      deleteProduct,
      setStaffActive,
      getProductById,
      getStaffById,
    ]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
