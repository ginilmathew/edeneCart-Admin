import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectStaff,
  createStaff,
  updateStaff,
  fetchStaff,
  resetStaffPassword,
} from "../store/staffSlice";
import { Card, CardHeader, Button, Table, Modal, Input } from "../components/ui";
import { formatDate } from "../lib/orderUtils";
import { toast } from "../lib/toast";
import type { Staff } from "../types";

const DEFAULT_BONUS_MILESTONES = [
  { orders: 10, bonus: 50 },
  { orders: 15, bonus: 100 },
  { orders: 20, bonus: 150 },
];

const PHONE_RE = /^[\d+\s().-]{7,25}$/;

function StaffManagementPage() {
  const dispatch = useAppDispatch();
  const staff = useAppSelector(selectStaff);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [joinedDate, setJoinedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tempPasswordModal, setTempPasswordModal] = useState<{
    username: string;
    password: string;
  } | null>(null);
  const [resetConfirmStaff, setResetConfirmStaff] = useState<Staff | null>(null);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  useEffect(() => {
    void dispatch(fetchStaff());
  }, [dispatch]);

  const openAdd = useCallback(() => {
    setName("");
    setUsername("");
    setPhone("");
    setJoinedDate(new Date().toISOString().slice(0, 10));
    setError("");
    setModalOpen(true);
  }, []);

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      const nameTrim = name.trim();
      const usernameTrim = username.trim().toLowerCase();
      const phoneTrim = phone.trim();
      if (!nameTrim) {
        setError("Name is required");
        return;
      }
      if (!usernameTrim) {
        setError("Username is required");
        return;
      }
      if (!phoneTrim) {
        setError("Phone number is required");
        return;
      }
      if (!PHONE_RE.test(phoneTrim)) {
        setError("Enter a valid phone number (7–25 characters)");
        return;
      }
      if (staff.some((s) => s.username.toLowerCase() === usernameTrim)) {
        setError("Username already exists");
        return;
      }
      setSubmitting(true);
      try {
        const created = await dispatch(
          createStaff({
            name: nameTrim,
            username: usernameTrim,
            phone: phoneTrim,
            joinedDate: joinedDate || new Date().toISOString().slice(0, 10),
            isActive: true,
            payoutPerOrder: 30,
            bonusMilestones: DEFAULT_BONUS_MILESTONES,
          })
        ).unwrap();
        toast.success("Staff created");
        setModalOpen(false);
        if (created.temporaryPassword) {
          setTempPasswordModal({
            username: created.username,
            password: created.temporaryPassword,
          });
        }
      } catch {
        setError("Failed to create staff");
        toast.error("Failed to create staff");
      } finally {
        setSubmitting(false);
      }
    },
    [name, username, phone, joinedDate, staff, dispatch]
  );

  const toggleActive = useCallback(
    async (staffId: string, current: boolean) => {
      try {
        await dispatch(updateStaff({ id: staffId, patch: { isActive: !current } })).unwrap();
        toast.success(current ? "Staff set to inactive" : "Staff set to active");
      } catch {
        toast.error("Failed to update status");
      }
    },
    [dispatch]
  );

  const handleConfirmResetPassword = useCallback(async () => {
    if (!resetConfirmStaff) return;
    setResetSubmitting(true);
    try {
      const updated = await dispatch(
        resetStaffPassword(resetConfirmStaff.id)
      ).unwrap();
      setResetConfirmStaff(null);
      toast.success("Password reset");
      if (updated.temporaryPassword) {
        setTempPasswordModal({
          username: updated.username,
          password: updated.temporaryPassword,
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setResetSubmitting(false);
    }
  }, [dispatch, resetConfirmStaff]);

  const copyPassword = useCallback((pwd: string) => {
    void navigator.clipboard.writeText(pwd);
    toast.success("Password copied");
  }, []);

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Staff Name",
        render: (row: Staff) => (
          <Link to={`/admin/staff/${row.id}`} className="font-medium text-primary hover:underline">
            {row.name}
          </Link>
        ),
      },
      {
        key: "joinedDate",
        header: "Joined",
        render: (row: Staff) => formatDate(row.joinedDate),
      },
      { key: "username", header: "Username" },
      { key: "phone", header: "Phone" },
      {
        key: "tempPassword",
        header: "Initial password",
        render: (row: Staff) =>
          row.temporaryPassword ? (
            <div className="flex max-w-[200px] items-center gap-2">
              <code className="truncate rounded bg-surface-alt px-1.5 py-0.5 text-xs">
                {row.temporaryPassword}
              </code>
              <button
                type="button"
                onClick={() => copyPassword(row.temporaryPassword!)}
                className="shrink-0 rounded p-1 text-primary hover:bg-primary-muted"
                title="Copy password"
                aria-label={`Copy password for ${row.username}`}
              >
                <ClipboardDocumentIcon className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <span className="text-sm text-text-muted">Staff changed</span>
          ),
      },
      {
        key: "resetPassword",
        header: "Reset password",
        render: (row: Staff) => {
          const canReset = row.temporaryPassword === null;
          return (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!canReset}
              title={
                canReset
                  ? "Generate a new temporary password"
                  : "Available only after this staff member has changed their initial password"
              }
              onClick={() => setResetConfirmStaff(row)}
            >
              Reset
            </Button>
          );
        },
      },
      {
        key: "isActive",
        header: "Active",
        render: (row: Staff) => (
          <button
            type="button"
            role="switch"
            aria-checked={row.isActive}
            aria-label={`${row.isActive ? "Active" : "Inactive"} — click to toggle`}
            onClick={() => toggleActive(row.id, row.isActive)}
            className={
              "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 " +
              (row.isActive ? "bg-success" : "bg-border")
            }
          >
            <span
              className={
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow transition " +
                (row.isActive ? "translate-x-6" : "translate-x-1")
              }
            />
          </button>
        ),
      },
    ],
    [toggleActive, copyPassword]
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Staff Management"
          subtitle="Toggle Active on/off. Reset password is enabled only after “Staff changed” (they updated from the initial password). Confirm in the modal before resetting."
          action={
            <Button onClick={openAdd}>Add Staff</Button>
          }
        />
        <Table
          columns={columns}
          data={staff}
          keyExtractor={(row) => row.id}
          emptyMessage="No staff."
        />
      </Card>

      <Modal
        isOpen={!!resetConfirmStaff}
        onClose={() => {
          if (!resetSubmitting) setResetConfirmStaff(null);
        }}
        title="Reset password?"
        size="md"
      >
        {resetConfirmStaff && (
          <div className="space-y-4 text-sm text-text-heading">
            <p>
              Generate a new temporary password for{" "}
              <span className="font-semibold">{resetConfirmStaff.name}</span> (
              {resetConfirmStaff.username})? Their current password will stop working.
              They must sign in with the new temporary password and will be asked to set
              their own password again.
            </p>
            <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="secondary"
                disabled={resetSubmitting}
                onClick={() => setResetConfirmStaff(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                loading={resetSubmitting}
                onClick={() => void handleConfirmResetPassword()}
              >
                Confirm reset
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!tempPasswordModal}
        onClose={() => setTempPasswordModal(null)}
        title="Temporary password"
        size="md"
      >
        {tempPasswordModal && (
          <div className="space-y-3 text-sm text-text-heading">
            <p>
              Share this password with{" "}
              <span className="font-medium">{tempPasswordModal.username}</span>.
              It also appears in the table until they set a new password.
            </p>
            <div className="rounded-[var(--radius-md)] border border-border bg-surface-alt p-3 font-mono text-base">
              {tempPasswordModal.password}
            </div>
            <Button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(tempPasswordModal.password);
                toast.success("Copied to clipboard");
              }}
            >
              Copy password
            </Button>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Staff"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Sharma"
          />
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. priya.s (used for login)"
          />
          <Input
            label="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9876543210 or +91 9876543210"
            autoComplete="tel"
          />
          <Input
            label="Joined Date"
            type="date"
            value={joinedDate}
            onChange={(e) => setJoinedDate(e.target.value)}
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" loading={submitting}>
              Create Staff
            </Button>
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default memo(StaffManagementPage);
