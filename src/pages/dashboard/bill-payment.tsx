import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { apiClient, extractErrorMessage } from "@/lib/apiClient";
import type {
  BillerResponse,
  BillPaymentResponse,
  FetchBillResponse,
  PagedResponse,
  PayBillResponse,
} from "@/types/api";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Landmark,
  LifeBuoy,
  Loader2,
  Printer,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// A native <input type="date"> gives a bare "YYYY-MM-DD" with no timezone —
// it's the VIEWER's own local calendar date, not a UTC one. Building the
// start/end-of-day boundary from that date's individual components (via the
// local Date constructor, not by parsing the string as UTC) and converting
// to ISO only at the end means "today" always means the viewer's actual
// today, regardless of what timezone they're in or what timezone the server
// happens to run in — the backend only ever sees plain, unambiguous UTC
// instants and compares them as such (see CreditCardBillPaymentService).
function startOfDayIso(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).toISOString();
}
function endOfDayIso(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
}

const PAGE_SIZE = 10;

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  INITIATED: "outline",
  BILL_FETCHED: "outline",
  PAYMENT_PENDING: "secondary",
  SUCCESS: "default",
  FAILED: "destructive",
};

type Step = "form" | "summary" | "result";

export default function BillPaymentPage() {
  const [billers, setBillers] = useState<BillerResponse[]>([]);
  const [billerId, setBillerId] = useState("");
  const [cardRef, setCardRef] = useState("");
  const [amount, setAmount] = useState("");

  const [fetchingBill, setFetchingBill] = useState(false);
  const [billInfo, setBillInfo] = useState<FetchBillResponse | null>(null);
  const [paying, setPaying] = useState(false);
  // A ref, not the `paying` state, is the actual duplicate-submission guard:
  // two synchronous clicks (a fast double-click, or two rapid taps before
  // React re-renders) both read the same stale `paying` value from their
  // closures, since a state update isn't visible until the next render. A
  // ref is mutated synchronously and immediately visible to the very next
  // call, in the same tick.
  const submittingRef = useRef(false);
  const [payResult, setPayResult] = useState<PayBillResponse | null>(null);
  const [refreshingStatus, setRefreshingStatus] = useState(false);

  const [step, setStep] = useState<Step>("form");
  const [consent, setConsent] = useState(false);
  const [confirmedBillerName, setConfirmedBillerName] = useState<string>("");

  const [payments, setPayments] = useState<BillPaymentResponse[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [fromDateInput, setFromDateInput] = useState("");
  const [toDateInput, setToDateInput] = useState("");
  const [referenceInput, setReferenceInput] = useState("");
  const hasActiveFilters =
    statusFilter !== "ALL" || fromDateInput !== "" || toDateInput !== "" || referenceInput.trim() !== "";

  const loadBillers = async () => {
    try {
      const res = await apiClient.get<BillerResponse[]>("/api/v1/credit-card-bill-payment/billers");
      setBillers(res.data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  // Takes every filter explicitly, rather than reading statusFilter/etc from
  // the surrounding closure, so a caller that JUST changed those values (see
  // clearFilters) can't be bitten by React's state updates not being visible
  // until the next render — there is no risk of fetching with stale filters.
  const fetchPayments = async (targetPage: number, status: string, from: string, to: string, reference: string) => {
    setLoadingPayments(true);
    setPaymentsError(null);
    try {
      const params: Record<string, string | number> = { page: targetPage, size: PAGE_SIZE };
      if (status !== "ALL") params.status = status;
      if (from) params.from = startOfDayIso(from);
      if (to) params.to = endOfDayIso(to);
      if (reference.trim()) params.reference = reference.trim();

      const res = await apiClient.get<PagedResponse<BillPaymentResponse>>(
        "/api/v1/credit-card-bill-payment/payments",
        { params }
      );
      setPayments(res.data.content);
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (error) {
      const message = extractErrorMessage(error);
      setPaymentsError(message);
      toast.error(message);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Reloads a given page under the CURRENTLY APPLIED filters — used for
  // pagination clicks and for refreshing after an action (paying, checking
  // status) where the applied filters themselves haven't changed, so reading
  // them from state here is safe (nothing just changed them this tick).
  const loadPayments = (targetPage: number) =>
    fetchPayments(targetPage, statusFilter, fromDateInput, toDateInput, referenceInput);

  const applyFilters = () => fetchPayments(0, statusFilter, fromDateInput, toDateInput, referenceInput);

  const clearFilters = () => {
    setStatusFilter("ALL");
    setFromDateInput("");
    setToDateInput("");
    setReferenceInput("");
    fetchPayments(0, "ALL", "", "", "");
  };

  useEffect(() => {
    loadBillers();
    fetchPayments(0, "ALL", "", "", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // History & Flow Guard: Prevent browser Back from replaying stale transaction or checkout states
  useEffect(() => {
    const handlePopState = () => {
      if (step === "result") {
        startNewPayment();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [step]);

  const isCardRefValid = /^\d{4}$/.test(cardRef);
  const selectedBiller = billers.find((b) => String(b.id) === billerId);

  const fetchBill = async () => {
    if (!billerId || !isCardRefValid) {
      toast.error("Select a biller and enter the last 4 digits of the card");
      return;
    }
    setFetchingBill(true);
    setBillInfo(null);
    setPayResult(null);
    try {
      const res = await apiClient.post<FetchBillResponse>("/api/v1/credit-card-bill-payment/fetch-bill", {
        billerId: Number(billerId),
        maskedCardRef: cardRef,
      });
      setBillInfo(res.data);
      if (res.data.supported && res.data.dueAmount != null) {
        setAmount(String(res.data.dueAmount));
      }
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setFetchingBill(false);
    }
  };

  const reviewPayment = () => {
    if (!billerId || !isCardRefValid || !amount || Number(amount) <= 0) {
      toast.error("Select a biller, enter the card's last 4 digits, and an amount");
      return;
    }
    setConsent(false);
    setStep("summary");
  };

  const confirmAndPay = async () => {
    if (submittingRef.current) return; // synchronous guard — see submittingRef comment above
    if (!consent) {
      toast.error("Please confirm the terms before proceeding");
      return;
    }
    submittingRef.current = true;
    setPaying(true);
    setConfirmedBillerName(selectedBiller?.name ?? "");
    try {
      const res = await apiClient.post<PayBillResponse>(
        "/api/v1/credit-card-bill-payment/pay",
        {
          billerId: Number(billerId),
          maskedCardRef: cardRef,
          amount: Number(amount),
        },
        { headers: { "Idempotency-Key": crypto.randomUUID() } }
      );
      setPayResult(res.data);
      setStep("result");
      setConsent(false);
      // History Guard: Replace current history entry so pressing Back does not navigate back to payment processing
      if (typeof window !== "undefined" && window.history?.replaceState) {
        window.history.replaceState({ step: "result" }, "", window.location.pathname);
      }
      if (res.data.status === "SUCCESS") {
        setBillerId("");
        setCardRef("");
        setAmount("");
        setBillInfo(null);
      }
      toast.success(`Payment ${res.data.status}`);
      await loadPayments(page);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      submittingRef.current = false;
      setPaying(false);
    }
  };

  const startNewPayment = () => {
    setBillerId("");
    setCardRef("");
    setAmount("");
    setBillInfo(null);
    setPayResult(null);
    setConsent(false);
    setConfirmedBillerName("");
    setStep("form");
    if (typeof window !== "undefined" && window.history?.replaceState) {
      window.history.replaceState({ step: "form" }, "", window.location.pathname);
    }
  };

  // Unlike startNewPayment, this keeps biller/card ref/amount filled in —
  // appropriate only after a FAILED payment, where no money was collected
  // and the customer most likely just wants to resubmit the same details.
  const retryPayment = () => {
    setPayResult(null);
    setConsent(false);
    setStep("form");
    if (typeof window !== "undefined" && window.history?.replaceState) {
      window.history.replaceState({ step: "form" }, "", window.location.pathname);
    }
  };

  const refreshStatus = async () => {
    if (!payResult) return;
    setRefreshingStatus(true);
    try {
      const res = await apiClient.get<BillPaymentResponse>(
        `/api/v1/credit-card-bill-payment/payments/${payResult.paymentId}`
      );
      setPayResult({ ...payResult, status: res.data.status });
      if (res.data.status !== payResult.status) {
        toast.success(`Status updated: ${res.data.status.replace(/_/g, " ")}`);
        await loadPayments(page);
      }
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setRefreshingStatus(false);
    }
  };

  // Transaction Details dialog — fetched fresh via GET /payments/{id} rather
  // than reused from the history list, so it always reflects live status and
  // carries the detail-only fields (transactionId, providerRefId, etc.) that
  // the list endpoint deliberately omits to avoid an N+1 query.
  const [detailPaymentId, setDetailPaymentId] = useState<number | null>(null);
  const [paymentDetail, setPaymentDetail] = useState<BillPaymentResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [refreshingDetail, setRefreshingDetail] = useState(false);
  const [copiedField, setCopiedField] = useState<"transaction" | "provider" | null>(null);
  // "receipt" is reachable only via the explicit "View Receipt" button, which
  // itself only renders when paymentDetail.status === "SUCCESS" (backend-
  // confirmed, freshly fetched) — never based on any client-side assumption.
  const [dialogView, setDialogView] = useState<"details" | "receipt">("details");

  const openPaymentDetail = async (paymentId: number) => {
    setDetailPaymentId(paymentId);
    setDialogView("details");
    setLoadingDetail(true);
    setPaymentDetail(null);
    try {
      const res = await apiClient.get<BillPaymentResponse>(`/api/v1/credit-card-bill-payment/payments/${paymentId}`);
      setPaymentDetail(res.data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
      setDetailPaymentId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const refreshDetailStatus = async () => {
    if (!paymentDetail) return;
    setRefreshingDetail(true);
    try {
      const res = await apiClient.get<BillPaymentResponse>(
        `/api/v1/credit-card-bill-payment/payments/${paymentDetail.id}`
      );
      setPaymentDetail(res.data);
      if (res.data.status !== paymentDetail.status) {
        toast.success(`Status updated: ${res.data.status.replace(/_/g, " ")}`);
        await loadPayments(page);
      }
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setRefreshingDetail(false);
    }
  };

  const copyToClipboard = async (text: string, field: "transaction" | "provider") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 1500);
    } catch {
      toast.error("Couldn't copy — your browser blocked clipboard access.");
    }
  };

  return (
    <section className="mx-auto max-w-6xl">
      <p className="text-sm font-bold uppercase text-primary">VyonixPay account</p>
      <h1 className="mt-2 text-3xl font-bold">Credit Card Bill Payment</h1>
      <p className="mt-2 text-muted-foreground">Pay your credit card bill in a few seconds.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="rounded-md border bg-background p-6 lg:col-span-2">
          {step === "form" && (
            <>
              <h2 className="font-bold">Pay a Bill</h2>
              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <Label>Biller</Label>
                  <Select value={billerId} onValueChange={setBillerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a biller" />
                    </SelectTrigger>
                    <SelectContent>
                      {billers.map((b) => (
                        <SelectItem key={b.id} value={String(b.id)}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Card Last 4 Digits</Label>
                  <Input
                    value={cardRef}
                    onChange={(e) => setCardRef(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="1234"
                    inputMode="numeric"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={fetchingBill || !billerId || !isCardRefValid}
                  onClick={fetchBill}
                >
                  {fetchingBill ? "Fetching..." : "Fetch Bill Amount"}
                </Button>

                {billInfo && (
                  <p className="text-sm text-muted-foreground">
                    {billInfo.supported
                      ? `Due: ${billInfo.currency} ${billInfo.dueAmount?.toLocaleString()}`
                      : billInfo.remarks ?? "This biller doesn't support fetching the due amount — enter it manually."}
                  </p>
                )}

                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 2500"
                  />
                </div>

                <Button type="button" className="w-full" onClick={reviewPayment}>
                  Review Payment
                </Button>
              </div>
            </>
          )}

          {step === "summary" && (
            <>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" onClick={() => setStep("form")} aria-label="Back">
                  <ArrowLeft className="size-4" />
                </Button>
                <h2 className="font-bold">Review Payment</h2>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-md border p-4 text-sm">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Biller</span>
                      <span className="font-medium">{selectedBiller?.name ?? "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Card Reference</span>
                      <span className="font-medium">•••• {cardRef}</span>
                    </div>
                    {billInfo?.supported && billInfo.dueAmount != null && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Bill Amount</span>
                        <span className="font-medium">
                          {billInfo.currency} {billInfo.dueAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Payment Amount</span>
                      <span className="font-medium">
                        {billInfo?.currency ?? "INR"} {Number(amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="my-2 h-px bg-border" />
                    <div className="flex items-center justify-between text-base">
                      <span className="font-bold">Total Payable</span>
                      <span className="font-bold">
                        {billInfo?.currency ?? "INR"} {Number(amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="consent"
                    checked={consent}
                    onCheckedChange={(checked) => setConsent(checked === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="consent" className="text-xs font-normal leading-relaxed text-muted-foreground">
                    I confirm the details above are correct and authorize VyonixPay to proceed with this payment on my behalf.
                  </Label>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep("form")} disabled={paying}>
                    Back / Edit
                  </Button>
                  <Button type="button" className="flex-1" onClick={confirmAndPay} disabled={paying || !consent}>
                    {paying ? "Processing..." : "Confirm & Pay"}
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === "result" && payResult && payResult.status === "SUCCESS" && (
            <>
              <div className="flex flex-col items-center text-center">
                <div className="grid size-12 place-items-center rounded-full bg-primary/15 text-primary">
                  <CheckCircle2 className="size-6" />
                </div>
                <h2 className="mt-4 font-bold">Payment Successful</h2>
                <p className="mt-1 text-sm text-muted-foreground">Your credit card bill has been paid.</p>
              </div>

              <div className="mt-5 space-y-2.5 rounded-md border p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-medium">
                    {payResult.currency} {payResult.billAmount.toLocaleString()}
                  </span>
                </div>
                {(confirmedBillerName || selectedBiller?.name) && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Biller</span>
                    <span className="font-medium">{confirmedBillerName || selectedBiller?.name}</span>
                  </div>
                )}
                {payResult.transactionId != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-medium">{payResult.transactionId}</span>
                  </div>
                )}
                {payResult.providerRefId && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Provider Reference</span>
                    <span className="font-medium">{payResult.providerRefId}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Date & Time</span>
                  <span className="font-medium">{formatDateTime(payResult.createdAt)}</span>
                </div>
              </div>

              <Button type="button" variant="outline" className="mt-4 w-full" onClick={startNewPayment}>
                Pay Another Bill
              </Button>
            </>
          )}

          {step === "result" && payResult && payResult.status === "PAYMENT_PENDING" && (
            <>
              <div className="flex flex-col items-center text-center">
                <div className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
                  <Clock className="size-6" />
                </div>
                <h2 className="mt-4 font-bold">Payment Processing</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  We've collected your payment and are confirming it with your card issuer. This can take a few minutes.
                </p>
              </div>

              <div className="mt-5 space-y-2.5 rounded-md border p-4 text-sm">
                {payResult.transactionId != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Transaction Reference</span>
                    <span className="font-medium">{payResult.transactionId}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">
                    {payResult.currency} {payResult.billAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Initiated At</span>
                  <span className="font-medium">{formatDateTime(payResult.createdAt)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                <span>Please don't submit another payment for this bill while this one is processing.</span>
              </div>

              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full"
                onClick={refreshStatus}
                disabled={refreshingStatus}
              >
                <RefreshCw className={`size-4 ${refreshingStatus ? "animate-spin" : ""}`} />
                {refreshingStatus ? "Checking..." : "Check Status"}
              </Button>
            </>
          )}

          {step === "result" && payResult && payResult.status === "FAILED" && (
            <>
              <div className="flex flex-col items-center text-center">
                <div className="grid size-12 place-items-center rounded-full bg-destructive/15 text-destructive">
                  <XCircle className="size-6" />
                </div>
                <h2 className="mt-4 font-bold">Payment Failed</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {payResult.remarks || "We couldn't complete this payment. No amount was charged."}
                </p>
              </div>

              {payResult.transactionId != null && (
                <div className="mt-5 rounded-md border p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Transaction Reference</span>
                    <span className="font-medium">{payResult.transactionId}</span>
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" asChild>
                  <Link to="/contact">
                    <LifeBuoy className="size-4" />
                    Contact Support
                  </Link>
                </Button>
                <Button type="button" className="flex-1" onClick={retryPayment}>
                  Try Again
                </Button>
              </div>
            </>
          )}

          {step === "result" && payResult && !["SUCCESS", "PAYMENT_PENDING", "FAILED"].includes(payResult.status) && (
            <>
              <h2 className="font-bold">Payment Status</h2>
              <div className="mt-5 space-y-2.5 rounded-md border p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={statusVariant[payResult.status] ?? "outline"}>{payResult.status}</Badge>
                </div>
                {payResult.transactionId != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Transaction Reference</span>
                    <span className="font-medium">{payResult.transactionId}</span>
                  </div>
                )}
                {payResult.remarks && <p className="text-xs text-muted-foreground">{payResult.remarks}</p>}
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full"
                onClick={refreshStatus}
                disabled={refreshingStatus}
              >
                <RefreshCw className={`size-4 ${refreshingStatus ? "animate-spin" : ""}`} />
                {refreshingStatus ? "Checking..." : "Check Status"}
              </Button>
            </>
          )}
        </div>

        <div className="rounded-md border bg-background p-6 lg:col-span-3">
          <h2 className="font-bold">Payment History</h2>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="PAYMENT_PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">From</Label>
              <Input type="date" value={fromDateInput} onChange={(e) => setFromDateInput(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input type="date" value={toDateInput} onChange={(e) => setToDateInput(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Search Reference</Label>
              <Input
                value={referenceInput}
                onChange={(e) => setReferenceInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                placeholder="Transaction, provider, or client ref"
              />
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <Button type="button" size="sm" onClick={applyFilters} disabled={loadingPayments}>
              Apply Filters
            </Button>
            {hasActiveFilters && (
              <Button type="button" size="sm" variant="outline" onClick={clearFilters} disabled={loadingPayments}>
                Clear
              </Button>
            )}
          </div>

          <div className="mt-5 space-y-3">
            {loadingPayments ? (
              <div className="flex justify-center py-10">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : paymentsError ? (
              <div className="flex flex-col items-center gap-3 rounded-md border border-dashed py-10 text-center">
                <p className="text-sm text-destructive">{paymentsError}</p>
                <Button type="button" size="sm" variant="outline" onClick={() => loadPayments(page)}>
                  <RefreshCw className="size-4" />
                  Retry
                </Button>
              </div>
            ) : payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters ? "No payments match your filters." : "No payments yet."}
              </p>
            ) : (
              payments.map((payment) => (
                <button
                  key={payment.id}
                  type="button"
                  onClick={() => openPaymentDetail(payment.id)}
                  className="flex w-full items-center justify-between rounded-md border border-dashed p-4 text-left transition-colors hover:bg-secondary/40"
                >
                  <div>
                    <p className="text-sm font-bold">{payment.billerName}</p>
                    <p className="text-xs text-muted-foreground">
                      •••• {payment.maskedCardRef} · {payment.currency} {payment.billAmount.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={statusVariant[payment.status] ?? "outline"}>{payment.status}</Badge>
                </button>
              ))
            )}
          </div>

          {!loadingPayments && !paymentsError && totalElements > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                Page {page + 1} of {totalPages} · {totalElements} total
              </span>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" disabled={page <= 0} onClick={() => loadPayments(page - 1)}>
                  Prev
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={page + 1 >= totalPages}
                  onClick={() => loadPayments(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={detailPaymentId != null} onOpenChange={(open) => !open && setDetailPaymentId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader className="print:hidden">
            <DialogTitle>{dialogView === "receipt" ? "Receipt" : "Transaction Details"}</DialogTitle>
          </DialogHeader>

          {loadingDetail || !paymentDetail ? (
            <div className="flex justify-center py-8 print:hidden">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : dialogView === "details" ? (
            <div className="space-y-4 text-sm print:hidden">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={statusVariant[paymentDetail.status] ?? "outline"}>{paymentDetail.status}</Badge>
              </div>

              <div className="space-y-2.5 rounded-md border p-4">
                {paymentDetail.transactionId != null && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{paymentDetail.transactionId}</span>
                      <button
                        type="button"
                        aria-label="Copy Transaction ID"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() => copyToClipboard(String(paymentDetail.transactionId), "transaction")}
                      >
                        {copiedField === "transaction" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Client Reference ID</span>
                  <span className="font-medium">{paymentDetail.idempotencyKey}</span>
                </div>

                {paymentDetail.providerRefId && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Provider Reference ID</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{paymentDetail.providerRefId}</span>
                      <button
                        type="button"
                        aria-label="Copy Provider Reference"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() => copyToClipboard(paymentDetail.providerRefId as string, "provider")}
                      >
                        {copiedField === "provider" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="my-1 h-px bg-border" />

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Biller</span>
                  <span className="font-medium">{paymentDetail.billerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Card Reference</span>
                  <span className="font-medium">•••• {paymentDetail.maskedCardRef}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Bill Amount</span>
                  <span className="font-medium">
                    {paymentDetail.currency} {paymentDetail.billAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold">Total Amount</span>
                  <span className="font-bold">
                    {paymentDetail.currency} {paymentDetail.billAmount.toLocaleString()}
                  </span>
                </div>

                <div className="my-1 h-px bg-border" />

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Initiated At</span>
                  <span className="font-medium">{formatDateTime(paymentDetail.createdAt)}</span>
                </div>
                {paymentDetail.completedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Completed At</span>
                    <span className="font-medium">{formatDateTime(paymentDetail.completedAt)}</span>
                  </div>
                )}
              </div>

              {paymentDetail.status === "SUCCESS" && (
                <Button type="button" className="w-full" onClick={() => setDialogView("receipt")}>
                  View Receipt
                </Button>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" asChild>
                  <Link to="/contact">
                    <LifeBuoy className="size-4" />
                    Contact Support
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={refreshDetailStatus}
                  disabled={refreshingDetail}
                >
                  <RefreshCw className={`size-4 ${refreshingDetail ? "animate-spin" : ""}`} />
                  {refreshingDetail ? "Checking..." : "Check Status"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Printable receipt — deliberately a light "paper" card regardless
                  of the app's dark theme, since a dark-background printout/PDF
                  is impractical. Only this block (and its own VyonixPay header) is
                  visible when printed; everything else in the dialog/app carries
                  print:hidden. */}
              <div className="rounded-md border bg-white p-6 text-black">
                <div className="flex items-center gap-2 border-b border-black/10 pb-4">
                  <span className="grid size-8 place-items-center rounded-md bg-black text-white">
                    <Landmark className="size-4" />
                  </span>
                  <span className="text-lg font-bold">VyonixPay</span>
                  <Badge variant="default" className="ml-auto">
                    {paymentDetail.status}
                  </Badge>
                </div>

                <div className="mt-4 space-y-2.5 text-sm">
                  {paymentDetail.transactionId != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-black/60">Transaction ID</span>
                      <span className="font-medium">{paymentDetail.transactionId}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-black/60">Client Reference ID</span>
                    <span className="font-medium">{paymentDetail.idempotencyKey}</span>
                  </div>
                  {paymentDetail.providerRefId && (
                    <div className="flex items-center justify-between">
                      <span className="text-black/60">Provider Reference ID</span>
                      <span className="font-medium">{paymentDetail.providerRefId}</span>
                    </div>
                  )}

                  <div className="my-2 h-px bg-black/10" />

                  <div className="flex items-center justify-between">
                    <span className="text-black/60">Biller</span>
                    <span className="font-medium">{paymentDetail.billerName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black/60">Card Reference</span>
                    <span className="font-medium">•••• {paymentDetail.maskedCardRef}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black/60">Bill Amount</span>
                    <span className="font-medium">
                      {paymentDetail.currency} {paymentDetail.billAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-base">
                    <span className="font-bold">Total Amount</span>
                    <span className="font-bold">
                      {paymentDetail.currency} {paymentDetail.billAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="my-2 h-px bg-black/10" />

                  <div className="flex items-center justify-between">
                    {/* Prefer completedAt (the actual moment this payment succeeded);
                        fall back to createdAt only if completedAt is somehow absent,
                        with an honest label so the fallback is never mistaken for
                        the completion time. */}
                    <span className="text-black/60">
                      {paymentDetail.completedAt ? "Payment Date & Time" : "Initiated At"}
                    </span>
                    <span className="font-medium">
                      {formatDateTime(paymentDetail.completedAt ?? paymentDetail.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 print:hidden">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogView("details")}>
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <Button type="button" className="flex-1" onClick={() => window.print()}>
                  <Printer className="size-4" />
                  Print / Save as PDF
                </Button>
              </div>

              <div className="flex gap-3 print:hidden">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => copyToClipboard(String(paymentDetail.transactionId ?? paymentDetail.id), "transaction")}
                >
                  {copiedField === "transaction" ? <Check className="size-4" /> : <Copy className="size-4" />}
                  Copy Transaction ID
                </Button>
                <Button type="button" variant="outline" className="flex-1" asChild>
                  <Link to="/contact">
                    <LifeBuoy className="size-4" />
                    Contact Support
                  </Link>
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="print:hidden">
            <Button type="button" variant="ghost" className="w-full" onClick={() => setDetailPaymentId(null)}>
              {dialogView === "receipt" ? "Return to Payment History" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
