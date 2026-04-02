import { memo, useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { api } from "../api/client";
import { endpoints } from "../api/endpoints";
import { Card, CardHeader, Button, Textarea } from "../components/ui";
import { toast } from "../lib/toast";
import { formatDateTime } from "../lib/orderUtils";
import type { StaffEnquiryDetail, StaffEnquiryReply } from "../types";

function StaffEnquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<StaffEnquiryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const d = await api.get<StaffEnquiryDetail>(endpoints.staffEnquiryMe(id));
      setDetail(d);
    } catch (e) {
      toast.fromError(e, "Could not load thread");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const sendReply = useCallback(async () => {
    if (!id || !detail) return;
    const t = replyText.trim();
    if (!t) return;
    setReplying(true);
    try {
      const updated = await api.post<StaffEnquiryDetail>(
        endpoints.staffEnquiryMeReply(id),
        { body: t },
      );
      setDetail(updated);
      setReplyText("");
      toast.success("Reply sent");
    } catch (e) {
      toast.fromError(e, "Could not send reply");
    } finally {
      setReplying(false);
    }
  }, [id, detail, replyText]);

  if (!id) {
    return <p className="text-text-muted">Missing thread.</p>;
  }

  if (loading) {
    return <p className="text-text-muted">Loading…</p>;
  }

  if (!detail) {
    return (
      <div className="space-y-4">
        <Link
          to="/enquiries"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </Link>
        <p className="text-text-muted">Thread not found.</p>
      </div>
    );
  }

  const thread: { key: string; body: string; authorName: string; at: string; isStaff: boolean }[] =
    [
      {
        key: "initial",
        body: detail.body,
        authorName: detail.initialAuthorName,
        at: detail.createdAt,
        isStaff: true,
      },
      ...detail.replies.map((r: StaffEnquiryReply) => ({
        key: r.id,
        body: r.body,
        authorName: r.authorName,
        at: r.createdAt,
        isStaff: r.isStaff,
      })),
    ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/enquiries"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        All messages
      </Link>

      <Card>
        <CardHeader
          title={detail.subject}
          subtitle={
            detail.status === "resolved"
              ? "Resolved — you can still reply to reopen the thread."
              : "Open — admin will reply here."
          }
          action={
            <span
              className={
                detail.status === "resolved"
                  ? "rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success"
                  : "rounded-full bg-primary-muted px-2.5 py-1 text-xs font-semibold text-primary"
              }
            >
              {detail.status === "resolved" ? "Resolved" : "Open"}
            </span>
          }
        />
        <div className="space-y-4 px-4 pb-6 md:px-6">
          <ul className="space-y-4">
            {thread.map((m) => (
              <li
                key={m.key}
                className={`flex ${m.isStaff ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={
                    m.isStaff
                      ? "max-w-[min(100%,36rem)] rounded-2xl rounded-br-md bg-primary-muted px-4 py-3 text-text-heading"
                      : "max-w-[min(100%,36rem)] rounded-2xl rounded-bl-md border border-border bg-surface-alt px-4 py-3 text-text-heading"
                  }
                >
                  <p className="text-xs font-semibold text-text-muted">
                    {m.authorName} · {formatDateTime(m.at)}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{m.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-border pt-4">
            <Textarea
              label="Your reply"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              placeholder="Add a follow-up…"
            />
            <Button
              type="button"
              className="mt-3"
              loading={replying}
              disabled={!replyText.trim()}
              onClick={() => void sendReply()}
            >
              Send reply
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default memo(StaffEnquiryDetailPage);
