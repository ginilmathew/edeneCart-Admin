import { memo, useState, useCallback, useMemo } from "react";
import {
  Card,
  CardHeader,
  Button,
  Table,
  Modal,
  Input,
  Select
} from "../components/ui";
import {
  useGetVendorPortalCategoriesQuery,
  useCreateVendorPortalSubcategoryMutation
} from "../store/api/edenApi";
import { toast } from "../lib/toast";
import type { Category, Subcategory } from "../types";

function VendorSubcategoryManagement() {
  const { data: categories = [], isLoading } = useGetVendorPortalCategoriesQuery();
  const [createSubcategory] = useCreateVendorPortalSubcategoryMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const subcategories = useMemo(() => {
    return (categories as (Category & { subcategories?: Subcategory[] })[])
      .flatMap(c => (c.subcategories || []).map(s => ({ ...s, categoryName: c.name })));
  }, [categories]);

  const handleSave = useCallback(async () => {
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (!name.trim()) {
      toast.error("Subcategory name is required");
      return;
    }
    setSubmitting(true);
    try {
      await createSubcategory({
        categoryId,
        name: name.trim(),
        description: description.trim()
      }).unwrap();
      toast.success("Subcategory created");
      setModalOpen(false);
      setName("");
      setDescription("");
    } catch (err) {
      toast.fromError(err, "Failed to create subcategory");
    } finally {
      setSubmitting(false);
    }
  }, [categoryId, name, description, createSubcategory]);

  const columns = useMemo(() => [
    { key: "name", header: "Subcategory Name" },
    { key: "category", header: "Parent Category", render: (row: any) => row.categoryName },
    { key: "description", header: "Description", render: (row: Subcategory) => row.description || "—" },
    { key: "status", header: "Status", render: () => <span className="text-xs bg-success/10 text-success px-2 py-1 rounded">Active</span> },
  ], []);

  const categoryOptions = useMemo(() => [
    { value: "", label: "Select parent category..." },
    ...categories.map(c => ({ value: c.id, label: c.name }))
  ], [categories]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Product Subcategories"
          subtitle="Manage specific sub-types for your products"
          action={<Button onClick={() => setModalOpen(true)}>Add Subcategory</Button>}
        />
        <Table
          isLoading={isLoading}
          columns={columns}
          data={subcategories}
          keyExtractor={(s) => s.id}
          emptyMessage="No subcategories found."
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Subcategory"
      >
        <div className="space-y-4">
          <Select
            label="Parent Category *"
            options={categoryOptions}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          />
          <Input
            label="Subcategory Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Leather Wallets"
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details"
          />
          <div className="pt-2 flex gap-2">
            <Button onClick={handleSave} disabled={submitting}>{submitting ? "Creating..." : "Create Subcategory"}</Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default memo(VendorSubcategoryManagement);
