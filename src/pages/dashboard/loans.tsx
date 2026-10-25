import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  KeyFactStatementResponse,
  LoanApplicationResponse,
  LoanProductResponse,
} from "@/types/api";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  SUBMITTED: "outline",
  UNDER_REVIEW: "outline",
  APPROVED: "secondary",
  REJECTED: "destructive",
  KFS_ACCEPTED: "secondary",
  COOLING_OFF: "secondary",
  DISBURSED: "default",
  CANCELLED: "destructive",
};

export default function LoansPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<LoanProductResponse[]>([]);
  const [applications, setApplications] = useState<LoanApplicationResponse[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [productId, setProductId] = useState<string>("");
  const [requestedAmount, setRequestedAmount] = useState("");
  const [tenureMonths, setTenureMonths] = useState("");
  const [purpose, setPurpose] = useState("");
  const [fullName, setFullName] = useState(user?.email.split("@")[0] ?? "");

  const [kfsDialogApp, setKfsDialogApp] = useState<LoanApplicationResponse | null>(null);
  const [kfs, setKfs] = useState<KeyFactStatementResponse | null>(null);
  const [kfsLoading, setKfsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const loadData = async () => {
    setLoadingList(true);
    try {
      const [productsRes, applicationsRes] = await Promise.all([
        apiClient.get<LoanProductResponse[]>("/api/v1/loans/products"),
        apiClient.get<LoanApplicationResponse[]>("/api/v1/loans/applications"),
      ]);
      setProducts(productsRes.data);
      setApplications(applicationsRes.data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !requestedAmount || !tenureMonths || !purpose.trim() || !fullName.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post(
        "/api/v1/loans/applications",
        {
          productId: Number(productId),
          requestedAmount: Number(requestedAmount),
          tenureMonths: Number(tenureMonths),
          purpose,
          fullName,
        },
        { headers: { "Idempotency-Key": crypto.randomUUID() } }
      );
      toast.success("Loan application submitted");
      setRequestedAmount("");
      setTenureMonths("");
      setPurpose("");
      await loadData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const openKfs = async (application: LoanApplicationResponse) => {
    setKfsDialogApp(application);
    setKfsLoading(true);
    try {
      const res = await apiClient.get<KeyFactStatementResponse>(
        `/api/v1/loans/applications/${application.id}/kfs`
      );
      setKfs(res.data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
      setKfsDialogApp(null);
    } finally {
      setKfsLoading(false);
    }
  };

  const acceptKfs = async () => {
    if (!kfsDialogApp) return;
    setActionLoadingId(kfsDialogApp.id);
    try {
      await apiClient.post(`/api/v1/loans/applications/${kfsDialogApp.id}/accept-kfs`);
      toast.success("Key Fact Statement accepted — cooling-off period started");
      setKfsDialogApp(null);
      setKfs(null);
      await loadData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setActionLoadingId(null);
    }
  };

  const cancelApplication = async (id: number) => {
    setActionLoadingId(id);
    try {
      await apiClient.post(`/api/v1/loans/applications/${id}/cancel`);
      toast.success("Application cancelled");
      await loadData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setActionLoadingId(null);
    }
  };

  const disburse = async (id: number) => {
    setActionLoadingId(id);
    try {
      await apiClient.post(
        `/api/v1/loans/applications/${id}/disburse`,
        {},
        { headers: { "Idempotency-Key": crypto.randomUUID() } }
      );
      toast.success("Loan disbursed");
      await loadData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <section className="mx-auto max-w-6xl">
      <p className="text-sm font-bold uppercase text-primary">VyonixPay account</p>
      <h1 className="mt-2 text-3xl font-bold">Loans</h1>
      <p className="mt-2 text-muted-foreground">Apply for a loan and track your applications.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="rounded-md border bg-background p-6 lg:col-span-2">
          <h2 className="font-bold">Apply for a Loan</h2>
          <form className="mt-5 space-y-4" onSubmit={handleApply}>
            <div className="space-y-2">
              <Label>Loan Product</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} ({p.partnerName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Requested Amount</Label>
              <Input
                type="number"
                min="1"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                placeholder="e.g. 50000"
              />
            </div>

            <div className="space-y-2">
              <Label>Tenure (months)</Label>
              <Input
                type="number"
                min="1"
                max="360"
                value={tenureMonths}
                onChange={(e) => setTenureMonths(e.target.value)}
                placeholder="e.g. 12"
              />
            </div>

            <div className="space-y-2">
              <Label>Purpose</Label>
              <Input
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Home renovation"
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </div>

        <div className="rounded-md border bg-background p-6 lg:col-span-3">
          <h2 className="font-bold">My Applications</h2>
          <div className="mt-5 space-y-4">
            {loadingList ? (
              <div className="flex justify-center py-10">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : applications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No applications yet.</p>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="rounded-md border border-dashed p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold">{app.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{app.requestedAmount.toLocaleString()} · {app.tenureMonths} months
                      </p>
                    </div>
                    <Badge variant={statusVariant[app.status] ?? "outline"}>
                      {app.status.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {app.status === "APPROVED" && (
                      <Button size="sm" variant="outline" onClick={() => openKfs(app)}>
                        View Key Fact Statement
                      </Button>
                    )}
                    {app.status === "COOLING_OFF" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoadingId === app.id}
                          onClick={() => cancelApplication(app.id)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          disabled={actionLoadingId === app.id}
                          onClick={() => disburse(app.id)}
                        >
                          Disburse
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!kfsDialogApp} onOpenChange={(open) => !open && setKfsDialogApp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Key Fact Statement</DialogTitle>
            <DialogDescription>
              Review the terms before accepting. Accepting starts your cooling-off period.
            </DialogDescription>
          </DialogHeader>
          {kfsLoading || !kfs ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Loan Amount</span><span>{kfs.currency} {kfs.loanAmount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tenure</span><span>{kfs.tenureMonths} months</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">APR</span><span>{kfs.annualPercentageRate}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Interest</span><span>{kfs.currency} {kfs.totalInterestPayable.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Processing Fee</span><span>{kfs.currency} {kfs.processingFee.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Monthly Installment</span><span>{kfs.currency} {kfs.monthlyInstallmentAmount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Cooling-off Period</span><span>{Math.round(kfs.coolingOffPeriodSeconds / 60)} minutes</span></div>
            </div>
          )}
          <DialogFooter>
            <Button
              className="w-full"
              disabled={kfsLoading || !kfs || actionLoadingId === kfsDialogApp?.id}
              onClick={acceptKfs}
            >
              Accept & Start Cooling-off Period
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
