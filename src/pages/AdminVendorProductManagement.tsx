import { useMemo } from "react";
import { 
  Squares2X2Icon, 
  TrashIcon
} from "@heroicons/react/24/outline";
import {
  Card,
  CardHeader,
  Table,
  Tooltip,
  ToggleSwitch,
} from "../components/ui";
import {
  useGetAdminVendorProductsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "../store/api/edenApi";
import { toast } from "../lib/toast";
import type { Product } from "../types";

export default function AdminVendorProductManagement() {
  const { data: products = [], isLoading } = useGetAdminVendorProductsQuery();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const handleToggleActive = async (id: string, nextValue: boolean) => {
    try {
      await updateProduct({ id, patch: { isActive: nextValue } }).unwrap();
      toast.success(`Product ${nextValue ? "activated" : "deactivated"}`);
    } catch (err) {
      toast.fromError(err, "Failed to update product status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this vendor product? This action cannot be undone.")) return;
    try {
      await deleteProduct(id).unwrap();
      toast.success("Product deleted successfully");
    } catch (err) {
      toast.fromError(err, "Failed to delete product");
    }
  };

  const columns = useMemo(() => [
    { 
      key: "productCode", 
      header: "ID", 
      render: (row: Product) => (
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
          {row.productCode || "—"}
        </span>
      )
    },
    { 
      key: "image", 
      header: "Product", 
      render: (row: Product) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-surface-muted overflow-hidden flex items-center justify-center border border-border shadow-sm shrink-0">
            {row.imageUrl ? (
              <img src={row.imageUrl} alt={row.name} className="h-full w-full object-cover" />
            ) : (
              <Squares2X2Icon className="h-5 w-5 text-text-muted/20" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-text-heading truncate">{row.name}</span>
            <span className="text-[10px] font-bold text-text-muted/60 uppercase tracking-tight">
              {row.categoryName || "Uncategorized"}
            </span>
          </div>
        </div>
      )
    },
    { 
      key: "price", 
      header: "Selling", 
      render: (row: Product) => (
        <span className="text-sm font-black text-primary">₹{row.price}</span>
      )
    },
    { 
      key: "stock", 
      header: "Stock", 
      render: (row: Product) => (
        <span className={`text-xs font-bold ${row.stockQuantity > 0 ? "text-text-muted" : "text-error"}`}>
          {row.stockQuantity} Qty
        </span>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (row: Product) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
          row.isActive 
            ? "bg-success/10 text-success border-success/20" 
            : "bg-surface-muted text-text-muted/40 border-border"
        }`}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
      )
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Product) => (
        <div className="flex items-center gap-2">
          <Tooltip content={row.isActive ? "Deactivate" : "Activate"}>
            <ToggleSwitch 
              checked={!!row.isActive} 
              onChange={(newVal) => handleToggleActive(row.id, newVal)}
              aria-label={`Toggle status for ${row.name}`}
            />
          </Tooltip>
          <Tooltip content="Delete Product">
            <button 
              onClick={() => handleDelete(row.id)}
              className="p-2 text-text-muted hover:text-error transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      )
    }
  ], [handleToggleActive, handleDelete]);

  return (
    <div className="space-y-6">
      <Card padding="none">
        <div className="p-4 md:p-6 border-b border-border/60">
          <CardHeader 
            title="Vendor Products" 
            subtitle="View all products created by marketplace vendors"
            icon={<Squares2X2Icon className="h-6 w-6 text-primary" />} 
          />
        </div>

        <div className="p-1">
          {isLoading ? (
            <div className="py-24 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Loading Marketplace Catalog...</p>
            </div>
          ) : (
            <Table 
              columns={columns} 
              data={products} 
              keyExtractor={(p) => p.id} 
              emptyMessage="No vendor products found." 
              mobileCards={true}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
