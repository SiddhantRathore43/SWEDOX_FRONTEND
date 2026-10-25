import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { apiClient, extractErrorMessage } from "@/lib/apiClient";
import type { AdminApplicationDetail, AdminApplicationSummary, AdminTransactionSummary } from "@/types/api";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  SUCCESS: "default",
  DISBURSED: "default",
  ACTIVE: "default",
  APPROVED: "secondary",
  PENDING: "secondary",
  INITIATED: "outline",
  REJECTED: "destructive",
  FAILED: "destructive",
  CANCELLED: "destructive",
  REFUNDED: "outline",
};

const serviceTypes = ["ALL", "LOAN", "INSURANCE", "CREDIT_CARD_BILL_PAYMENT"] as const;
const transactionStatuses = ["ALL", "INITIATED", "PENDING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"] as const;

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

// Same local-day-to-UTC-instant conversion used by the customer Payment
// History filters (Feature 5) — a bare <input type="date"> is the viewer's
// own local calendar date, so the boundary is built from local components,
// not parsed as UTC, before being sent to the backend as a plain instant.
function startOfDayIso(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).toISOString();
}
function endOfDayIso(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
}

function ageLabel(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

type Section = "applications" | "transactions" | "reconciliation";

export default function AdminPage() {
  const { user } = useAuth();
  const isOperations = user?.roles.includes("ROLE_OPERATIONS") ?? false;
  const isAdminRole = user?.roles.includes("ROLE_ADMIN") ?? false;
  // Reconciliation queue is backend-restricted to ADMIN/OPERATIONS only
  // (SUPPORT is deliberately excluded — see AdminTransactionController) —
  // hidden here purely to avoid a guaranteed-403 tab for a SUPPORT-only
  // viewer; the real enforcement is the backend's own @PreAuthorize either way.
  const canViewReconciliation = isAdminRole || isOperations;

  const [section, setSection] = useState<Section>("applications");

  // ===================== Applications (unchanged from before) =====================
  const [serviceType, setServiceType] = useState<(typeof serviceTypes)[number]>("ALL");
  const [applications, setApplications] = useState<AdminApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [detail, setDetail] = useState<AdminApplicationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");
  const [overriding, setOverriding] = useState(false);

  const loadApplications = async (type: (typeof serviceTypes)[number]) => {
    setLoading(true);
    try {
      const res = await apiClient.get<AdminApplicationSummary[]>("/api/v1/admin/applications", {
        params: type === "ALL" ? {} : { serviceType: type },
      });
      setApplications(res.data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (section === "applications") loadApplications(serviceType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceType, section]);

  const openDetail = async (app: AdminApplicationSummary) => {
    setDetailLoading(true);
    setNewStatus("");
    setReason("");
    try {
      const res = await apiClient.get<AdminApplicationDetail>(
        `/api/v1/admin/applications/${app.serviceType}/${app.id}`
      );
      setDetail(res.data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setDetailLoading(false);
    }
  };

  const submitOverride = async () => {
    if (!detail || !newStatus.trim() || !reason.trim()) {
      toast.error("Enter a new status and a reason");
      return;
    }
    setOverriding(true);
    try {
      await apiClient.patch(
        `/api/v1/admin/applications/${detail.serviceType}/${detail.id}/status`,
        { newStatus: newStatus.trim().toUpperCase(), reason: reason.trim() }
      );
      toast.success("Status overridden");
      setDetail(null);
      await loadApplications(serviceType);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setOverriding(false);
    }
  };

  // ===================== Transactions (Feature 6) =====================
  const [txServiceType, setTxServiceType] = useState<(typeof serviceTypes)[number]>("ALL");
  const [txStatus, setTxStatus] = useState<(typeof transactionStatuses)[number]>("ALL");
  const [txFrom, setTxFrom] = useState("");
  const [txTo, setTxTo] = useState("");
  const [transactions, setTransactions] = useState<AdminTransactionSummary[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  const loadTransactions = async () => {
    setLoadingTx(true);
    setTxError(null);
    try {
      const params: Record<string, string> = {};
      if (txServiceType !== "ALL") params.serviceType = txServiceType;
      if (txStatus !== "ALL") params.status = txStatus;
      if (txFrom) params.from = startOfDayIso(txFrom);
      if (txTo) params.to = endOfDayIso(txTo);
      const res = await apiClient.get<AdminTransactionSummary[]>("/api/v1/admin/transactions", { params });
      setTransactions(res.data);
    } catch (error) {
      const message = extractErrorMessage(error);
      setTxError(message);
      toast.error(message);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    if (section === "transactions") loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // ===================== Reconciliation Queue (Feature 6) =====================
  const [reconciliationItems, setReconciliationItems] = useState<AdminTransactionSummary[]>([]);
  const [loadingReconciliation, setLoadingReconciliation] = useState(false);
  const [reconciliationError, setReconciliationError] = useState<string | null>(null);

  const loadReconciliationQueue = async () => {
    setLoadingReconciliation(true);
    setReconciliationError(null);
    try {
      // Already returned oldest-first by the backend (findByStatusAndCreatedAtBeforeOrderByCreatedAtAsc).
      const res = await apiClient.get<AdminTransactionSummary[]>("/api/v1/admin/reconciliation-queue");
      setReconciliationItems(res.data);
    } catch (error) {
      const message = extractErrorMessage(error);
      setReconciliationError(message);
      toast.error(message);
    } finally {
      setLoadingReconciliation(false);
    }
  };

  useEffect(() => {
    if (section === "reconciliation" && canViewReconciliation) loadReconciliationQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // ===================== Shared transaction detail dialog (Transactions + Reconciliation Queue) =====================
  const [txDetail, setTxDetail] = useState<AdminTransactionSummary | null>(null);
  const [txDialogView, setTxDialogView] = useState<"detail" | "refund-confirm">("detail");

  const [txNewStatus, setTxNewStatus] = useState("");
  const [txOverrideReason, setTxOverrideReason] = useState("");
  const [txOverriding, setTxOverriding] = useState(false);

  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refunding, setRefunding] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);
  // Synchronous lock — see the identical pattern (and the reason a `paying`
  // state alone isn't sufficient against a fast double-click) in
  // dashboard/bill-payment.tsx's submittingRef.
  const refundSubmittingRef = useRef(false);

  const openTxDetail = (row: AdminTransactionSummary) => {
    setTxDetail(row);
    setTxDialogView("detail");
    setTxNewStatus("");
    setTxOverrideReason("");
    setRefundAmount("");
    setRefundReason("");
    setRefundError(null);
  };

  const closeTxDetail = () => setTxDetail(null);

  const refreshCurrentTxSection = async () => {
    if (section === "reconciliation") await loadReconciliationQueue();
    else await loadTransactions();
  };

  const submitTxOverride = async () => {
    if (!txDetail || !txNewStatus.trim() || !txOverrideReason.trim()) {
      toast.error("Enter a new status and a reason");
      return;
    }
    setTxOverriding(true);
    try {
      await apiClient.patch(`/api/v1/admin/transactions/${txDetail.id}/status`, {
        newStatus: txNewStatus.trim().toUpperCase(),
        reason: txOverrideReason.trim(),
      });
      toast.success("Transaction status overridden");
      closeTxDetail();
      await refreshCurrentTxSection();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setTxOverriding(false);
    }
  };

  const submitRefund = async () => {
    if (refundSubmittingRef.current) return; // synchronous duplicate-submission guard
    if (!txDetail || !refundReason.trim()) {
      toast.error("A refund reason is required");
      return;
    }
    refundSubmittingRef.current = true;
    setRefunding(true);
    setRefundError(null);
    try {
      await apiClient.post(`/api/v1/admin/transactions/${txDetail.id}/refund`, {
        amount: refundAmount.trim() ? Number(refundAmount) : null,
        reason: refundReason.trim(),
      });
      toast.success(`Refund processed for transaction ${txDetail.id}`);
      closeTxDetail();
      await refreshCurrentTxSection();
    } catch (error) {
      const message = extractErrorMessage(error);
      setRefundError(message);
      toast.error(message);
    } finally {
      refundSubmittingRef.current = false;
      setRefunding(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl">
      <p className="text-sm font-bold uppercase text-primary">VyonixPay account</p>
      <h1 className="mt-2 text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Unified view across every application and transaction.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={section === "applications" ? "primary" : "outline"}
          onClick={() => setSection("applications")}
        >
          Applications
        </Button>
        <Button
          type="button"
          size="sm"
          variant={section === "transactions" ? "primary" : "outline"}
          onClick={() => setSection("transactions")}
        >
          Transactions
        </Button>
        {canViewReconciliation && (
          <Button
            type="button"
            size="sm"
            variant={section === "reconciliation" ? "primary" : "outline"}
            onClick={() => setSection("reconciliation")}
          >
            Reconciliation Queue
          </Button>
        )}
      </div>

      {section === "applications" && (
        <div className="mt-6 rounded-md border bg-background p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-bold">Applications</h2>
            <Select value={serviceType} onValueChange={(v) => setServiceType(v as typeof serviceType)}>
              <SelectTrigger className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-5">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : applications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No applications found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-3 pr-4 font-medium">Type</th>
                      <th className="py-3 pr-4 font-medium">User</th>
                      <th className="py-3 pr-4 font-medium">Amount</th>
                      <th className="py-3 pr-4 font-medium">Status</th>
                      <th className="py-3 pr-4 font-medium">Submitted</th>
                      <th className="py-3 pr-4 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={`${app.serviceType}-${app.id}`} className="border-b border-dashed">
                        <td className="whitespace-nowrap py-3 pr-4">{app.serviceType.replace(/_/g, " ")}</td>
                        <td className="whitespace-nowrap py-3 pr-4">{app.userEmail}</td>
                        <td className="whitespace-nowrap py-3 pr-4">
                          {app.amount != null ? `${app.currency ?? ""} ${app.amount.toLocaleString()}` : "—"}
                        </td>
                        <td className="whitespace-nowrap py-3 pr-4">
                          <Badge variant={statusVariant[app.status] ?? "outline"}>{app.status}</Badge>
                        </td>
                        <td className="whitespace-nowrap py-3 pr-4 text-muted-foreground">
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap py-3 pr-4">
                          <Button size="sm" variant="outline" onClick={() => openDetail(app)}>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {section === "transactions" && (
        <div className="mt-6 rounded-md border bg-background p-6">
          <h2 className="font-bold">Transactions</h2>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Service Type</Label>
              <Select value={txServiceType} onValueChange={(v) => setTxServiceType(v as typeof txServiceType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={txStatus} onValueChange={(v) => setTxStatus(v as typeof txStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {transactionStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">From</Label>
              <Input type="date" value={txFrom} onChange={(e) => setTxFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input type="date" value={txTo} onChange={(e) => setTxTo(e.target.value)} />
            </div>
          </div>

          <Button type="button" size="sm" className="mt-3" onClick={loadTransactions} disabled={loadingTx}>
            Apply Filters
          </Button>

          <div className="mt-5">
            {loadingTx ? (
              <div className="flex justify-center py-10">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : txError ? (
              <div className="flex flex-col items-center gap-3 rounded-md border border-dashed py-10 text-center">
                <p className="text-sm text-destructive">{txError}</p>
                <Button type="button" size="sm" variant="outline" onClick={loadTransactions}>
                  <RefreshCw className="size-4" />
                  Retry
                </Button>
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transactions found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-3 pr-4 font-medium">ID</th>
                      <th className="py-3 pr-4 font-medium">Type</th>
                      <th className="py-3 pr-4 font-medium">User</th>
                      <th className="py-3 pr-4 font-medium">Amount</th>
                      <th className="py-3 pr-4 font-medium">Status</th>
                      <th className="py-3 pr-4 font-medium">Created</th>
                      <th className="py-3 pr-4 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id} className="border-b border-dashed">
                        <td className="whitespace-nowrap py-3 pr-4">{t.id}</td>
                        <td className="whitespace-nowrap py-3 pr-4">{t.serviceType.replace(/_/g, " ")}</td>
                        <td className="whitespace-nowrap py-3 pr-4">{t.userEmail}</td>
                        <td className="whitespace-nowrap py-3 pr-4">
                          {t.currency} {t.amount.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap py-3 pr-4">
                          <Badge variant={statusVariant[t.status] ?? "outline"}>{t.status}</Badge>
                        </td>
                        <td className="whitespace-nowrap py-3 pr-4 text-muted-foreground">
                          {formatDateTime(t.createdAt)}
                        </td>
                        <td className="whitespace-nowrap py-3 pr-4">
                          <Button size="sm" variant="outline" onClick={() => openTxDetail(t)}>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {section === "reconciliation" && canViewReconciliation && (
        <div className="mt-6 rounded-md border bg-background p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-bold">Reconciliation Queue</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Transactions stuck at PENDING beyond the configured threshold, oldest first.
              </p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={loadReconciliationQueue} disabled={loadingReconciliation}>
              <RefreshCw className={`size-4 ${loadingReconciliation ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="mt-5">
            {loadingReconciliation ? (
              <div className="flex justify-center py-10">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : reconciliationError ? (
              <div className="flex flex-col items-center gap-3 rounded-md border border-dashed py-10 text-center">
                <p className="text-sm text-destructive">{reconciliationError}</p>
                <Button type="button" size="sm" variant="outline" onClick={loadReconciliationQueue}>
                  <RefreshCw className="size-4" />
                  Retry
                </Button>
              </div>
            ) : reconciliationItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing stuck in reconciliation right now.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-3 pr-4 font-medium">ID</th>
                      <th className="py-3 pr-4 font-medium">Type</th>
                      <th className="py-3 pr-4 font-medium">User</th>
                      <th className="py-3 pr-4 font-medium">Amount</th>
                      <th className="py-3 pr-4 font-medium">Pending For</th>
                      <th className="py-3 pr-4 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {reconciliationItems.map((t) => (
                      <tr key={t.id} className="border-b border-dashed">
                        <td className="whitespace-nowrap py-3 pr-4">{t.id}</td>
                        <td className="whitespace-nowrap py-3 pr-4">{t.serviceType.replace(/_/g, " ")}</td>
                        <td className="whitespace-nowrap py-3 pr-4">{t.userEmail}</td>
                        <td className="whitespace-nowrap py-3 pr-4">
                          {t.currency} {t.amount.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap py-3 pr-4">
                          <span className="inline-flex items-center gap-1.5 text-amber-500">
                            <AlertTriangle className="size-3.5" />
                            {ageLabel(t.createdAt)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap py-3 pr-4">
                          <Button size="sm" variant="outline" onClick={() => openTxDetail(t)}>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== Applications detail dialog (unchanged) ===================== */}
      <Dialog open={!!detail || detailLoading} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Application Detail</DialogTitle>
          </DialogHeader>
          {detailLoading || !detail ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1 text-sm">
              <div className="grid grid-cols-2 gap-y-2">
                <span className="text-muted-foreground">Type</span><span>{detail.serviceType}</span>
                <span className="text-muted-foreground">User</span><span>{detail.userEmail}</span>
                <span className="text-muted-foreground">Status</span><span>{detail.status}</span>
                <span className="text-muted-foreground">Provider</span><span>{detail.provider ?? "—"}</span>
                <span className="text-muted-foreground">Amount</span>
                <span>{detail.amount != null ? `${detail.currency ?? ""} ${detail.amount.toLocaleString()}` : "—"}</span>
              </div>

              {detail.auditTrail.length > 0 && (
                <div>
                  <p className="mb-2 font-bold">Audit Trail</p>
                  <div className="space-y-2">
                    {detail.auditTrail.map((entry) => (
                      <div key={entry.id} className="rounded-md border p-3">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{entry.action}</span>
                          <span>{new Date(entry.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isOperations && (
                <div className="space-y-3 border-t pt-4">
                  <p className="font-bold">Override Status (Operations only)</p>
                  <div className="space-y-2">
                    <Label>New Status</Label>
                    <Input value={newStatus} onChange={(e) => setNewStatus(e.target.value)} placeholder="e.g. APPROVED" />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Required — explain why" />
                  </div>
                </div>
              )}
            </div>
          )}
          {isOperations && detail && (
            <DialogFooter>
              <Button className="w-full" disabled={overriding} onClick={submitOverride}>
                {overriding ? "Applying..." : "Apply Override"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* ===================== Transaction detail dialog (Feature 6 — shared by Transactions + Reconciliation Queue) ===================== */}
      <Dialog open={!!txDetail} onOpenChange={(open) => !open && closeTxDetail()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{txDialogView === "refund-confirm" ? "Confirm Refund" : "Transaction Detail"}</DialogTitle>
          </DialogHeader>

          {txDetail && txDialogView === "detail" && (
            <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1 text-sm">
              <div className="grid grid-cols-2 gap-y-2">
                <span className="text-muted-foreground">Transaction ID</span><span>{txDetail.id}</span>
                <span className="text-muted-foreground">Service Type</span><span>{txDetail.serviceType.replace(/_/g, " ")}</span>
                <span className="text-muted-foreground">Operation</span><span>{txDetail.operation}</span>
                <span className="text-muted-foreground">User</span><span>{txDetail.userEmail}</span>
                <span className="text-muted-foreground">Status</span>
                <span><Badge variant={statusVariant[txDetail.status] ?? "outline"}>{txDetail.status}</Badge></span>
                <span className="text-muted-foreground">Amount</span>
                <span>{txDetail.currency} {txDetail.amount.toLocaleString()}</span>
                <span className="text-muted-foreground">Provider</span><span>{txDetail.provider ?? "—"}</span>
                <span className="text-muted-foreground">Reference ID</span><span>{txDetail.referenceId ?? "—"}</span>
                <span className="text-muted-foreground">Idempotency Key</span><span className="break-all">{txDetail.idempotencyKey}</span>
                <span className="text-muted-foreground">Correlation ID</span><span className="break-all">{txDetail.correlationId ?? "—"}</span>
                <span className="text-muted-foreground">Created</span><span>{formatDateTime(txDetail.createdAt)}</span>
                <span className="text-muted-foreground">Updated</span><span>{formatDateTime(txDetail.updatedAt)}</span>
              </div>

              {isOperations && txDetail.status === "SUCCESS" && (
                <Button type="button" className="w-full" onClick={() => setTxDialogView("refund-confirm")}>
                  Refund This Transaction
                </Button>
              )}

              {isOperations && (
                <div className="space-y-3 border-t pt-4">
                  <p className="font-bold">Override Status (Operations only)</p>
                  <p className="text-xs text-muted-foreground">Allowed values: PENDING, FAILED, CANCELLED.</p>
                  <div className="space-y-2">
                    <Label>New Status</Label>
                    <Input value={txNewStatus} onChange={(e) => setTxNewStatus(e.target.value)} placeholder="e.g. FAILED" />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <Input
                      value={txOverrideReason}
                      onChange={(e) => setTxOverrideReason(e.target.value)}
                      placeholder="Required — explain why"
                    />
                  </div>
                  <Button type="button" variant="outline" className="w-full" disabled={txOverriding} onClick={submitTxOverride}>
                    {txOverriding ? "Applying..." : "Apply Status Override"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {txDetail && txDialogView === "refund-confirm" && (
            <div className="space-y-4 text-sm">
              <div className="rounded-md border border-dashed p-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Transaction</span>
                  <span className="font-medium">#{txDetail.id}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Original Amount</span>
                  <span className="font-medium">{txDetail.currency} {txDetail.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Refund Amount (optional — leave blank for full amount)</Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder={`Full amount: ${txDetail.amount}`}
                />
              </div>
              <div className="space-y-2">
                <Label>Reason (required)</Label>
                <Input
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Explain why this refund is being issued"
                />
              </div>

              {refundError && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  <span>{refundError}</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setTxDialogView("detail")}
                  disabled={refunding}
                >
                  Cancel
                </Button>
                <Button type="button" className="flex-1" onClick={submitRefund} disabled={refunding || !refundReason.trim()}>
                  {refunding ? "Processing..." : "Confirm Refund"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
