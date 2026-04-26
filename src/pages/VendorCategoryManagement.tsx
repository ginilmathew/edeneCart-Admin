import { memo, useState, useCallback, useMemo } from "react";
import { 
  Card, 
  CardHeader, 
  Button, 
  Table, 
  Modal, 
  Input 
} from "../components/ui";
import { 
  useGetVendorPortalCategoriesQuery, 
  useCreateVendorPortalCategoryMutation 
} from "../store/api/edenApi";
import { toast } from "../lib/toast";
import type { Category } from "../types";

function VendorCategoryManagement() {
  const { data: categories = [], isLoading } = useGetVendorPortalCategoriesQuery();
  const [createCategory] = useCreateVendorPortalCategoryMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    setSubmitting(true);
    try {
      await createCategory({ name: name.trim(), description: description.trim() }).unwrap();
      toast.success("Category created and submitted for approval");
      setModalOpen(false);
      setName("");
      setDescription("");
    } catch (err) {
      toast.fromError(err, "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  }, [name, description, createCategory]);

  const columns = useMemo(() => [
    { key: "name", header: "Category Name" },
    { key: "description", header: "Description", render: (row: Category) => row.description || "—" },
    { key: "slug", header: "Slug", render: (row: Category) => row.slug || "—" },
    { key: "status", header: "Status", render: () => <span className="text-xs bg-success/10 text-success px-2 py-1 rounded">Active</span> },
  ], []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader 
          title="Product Categories" 
          subtitle="View existing categories or suggest a new one"
          action={<Button onClick={() => setModalOpen(true)}>Add Category</Button>} 
        />
        <Table
          isLoading={isLoading}
          columns={columns}
          data={categories}
          keyExtractor={(c) => c.id}
          emptyMessage="No categories found."
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Category"
      >
        <div className="space-y-4">
          <Input label="Category Name *" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Handmade Crafts" />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the category" />
          <div className="pt-2 flex gap-2">
            <Button onClick={handleSave} disabled={submitting}>{submitting ? "Creating..." : "Create Category"}</Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default memo(VendorCategoryManagement);
