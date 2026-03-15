import { memo, useCallback, useMemo } from "react";
import { Link } from "react-router";
import { useStore } from "../context/StoreContext";
import { Card, CardHeader, Button, Table } from "../components/ui";
import { formatDate } from "../lib/orderUtils";

function StaffManagementPage() {
  const { staff, setStaffActive } = useStore();

  const toggleActive = useCallback(
    (staffId: string, current: boolean) => {
      setStaffActive(staffId, !current);
    },
    [setStaffActive]
  );

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Staff Name",
        render: (row: { id: string; name: string }) => (
          <Link to={`/admin/staff/${row.id}`} className="font-medium text-primary hover:underline">
            {row.name}
          </Link>
        ),
      },
      {
        key: "joinedDate",
        header: "Joined",
        render: (row: { joinedDate: string }) => formatDate(row.joinedDate),
      },
      { key: "username", header: "Username" },
      {
        key: "isActive",
        header: "Status",
        render: (row: { id: string; isActive: boolean }) => (
          <button
            type="button"
            onClick={() => toggleActive(row.id, row.isActive)}
            className={
              "rounded-[var(--radius-sm)] px-2 py-1 text-xs font-medium " +
              (row.isActive
                ? "bg-success-bg text-success"
                : "bg-error-bg text-error")
            }
          >
            {row.isActive ? "Active" : "Inactive"}
          </button>
        ),
      },
    ],
    [toggleActive]
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Staff Management"
          subtitle="Toggle status to allow or block login. Inactive staff cannot log in."
          action={
            <Button disabled title="Create staff (coming soon)">
              Add Staff
            </Button>
          }
        />
        <Table
          columns={columns}
          data={staff}
          keyExtractor={(row) => row.id}
          emptyMessage="No staff."
        />
      </Card>
    </div>
  );
}

export default memo(StaffManagementPage);
