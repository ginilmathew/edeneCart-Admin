import { memo, useEffect, useMemo, useState } from "react";
import { Card, CardHeader, Button } from "../components/ui";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchSenders, selectSenders } from "../store/sendersSlice";
import {
  fetchSettings,
  selectSettings,
  updateSettings,
} from "../store/settingsSlice";
import type { PdfSize } from "../types";
import { toast } from "../lib/toast";

function AdminSettingsPage() {
  const dispatch = useAppDispatch();
  const senders = useAppSelector(selectSenders);
  const settings = useAppSelector(selectSettings);
  const [pdfSize, setPdfSize] = useState<PdfSize>("thermal");
  const [senderId, setSenderId] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("0");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void dispatch(fetchSenders());
    void dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (!settings) return;
    setPdfSize(settings.defaultPdfSize);
    setSenderId(settings.defaultSenderId ?? "");
    setLowStockThreshold(String(settings.lowStockThreshold ?? 0));
  }, [settings]);

  const senderOptions = useMemo(
    () =>
      senders.map((s) => ({
        value: s.id,
        label: `${s.name}${s.isDefault ? " (default)" : ""}`,
      })),
    [senders]
  );

  const handleSave = async () => {
    if (!senderId) {
      toast.error("Select a default sender");
      return;
    }
    const threshold = parseInt(lowStockThreshold, 10);
    if (Number.isNaN(threshold) || threshold < 0) {
      toast.error("Low-stock threshold must be a non-negative whole number");
      return;
    }
    setSaving(true);
    try {
      await dispatch(
        updateSettings({
          defaultPdfSize: pdfSize,
          defaultSenderId: senderId,
          lowStockThreshold: threshold,
        })
      ).unwrap();
      await dispatch(fetchSenders()).unwrap();
      toast.success("Settings updated");
    } catch (err) {
      toast.fromError(err, "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Settings"
          subtitle="Sender, PDF defaults, and inventory alerts for admin and staff dashboards."
        />
        <div className="grid gap-4 sm:max-w-xl">
          <label className="grid gap-1 text-sm">
            <span className="text-text-muted">Default sender</span>
            <select
              value={senderId}
              onChange={(e) => setSenderId(e.target.value)}
              className="rounded-[var(--radius-md)] border border-border px-3 py-2"
            >
              <option value="">Select sender</option>
              {senderOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-text-muted">Default PDF size</span>
            <select
              value={pdfSize}
              onChange={(e) => setPdfSize(e.target.value as PdfSize)}
              className="rounded-[var(--radius-md)] border border-border px-3 py-2"
            >
              <option value="thermal">Thermal label</option>
              <option value="a4">A4 (2 labels per page)</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-text-muted">Low / out-of-stock threshold</span>
            <input
              type="number"
              min={0}
              step={1}
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              className="rounded-[var(--radius-md)] border border-border px-3 py-2"
            />
            <span className="text-xs text-text-muted leading-relaxed">
              Products with stock <strong>≤</strong> this number appear on admin and staff dashboards as
              low or out of stock. Use <strong>0</strong> to flag only products with zero stock; use{" "}
              <strong>5</strong> to flag anything at 5 or below.
            </span>
          </label>

          <Button onClick={() => void handleSave()} loading={saving}>
            Save settings
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default memo(AdminSettingsPage);
