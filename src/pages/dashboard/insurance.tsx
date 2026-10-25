import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  InsuranceCategory,
  PayProposalResponse,
  PlanOptionResponse,
  PolicyResponse,
  ProposalResponse,
  QuoteResponse,
} from "@/types/api";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const categories: { value: InsuranceCategory; label: string }[] = [
  { value: "MOTOR", label: "Motor" },
  { value: "HEALTH", label: "Health" },
  { value: "LIFE", label: "Life" },
  { value: "TRAVEL", label: "Travel" },
];

const policyStatusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ISSUING: "outline",
  ACTIVE: "default",
  EXPIRED: "secondary",
  CANCELLED: "destructive",
};

export default function InsurancePage() {
  const [category, setCategory] = useState<InsuranceCategory | "">("");
  const [notes, setNotes] = useState("");
  const [quoting, setQuoting] = useState(false);

  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [plans, setPlans] = useState<PlanOptionResponse[]>([]);
  const [selectingPlanId, setSelectingPlanId] = useState<string | null>(null);

  const [proposal, setProposal] = useState<ProposalResponse | null>(null);
  const [paying, setPaying] = useState(false);
  const [payResult, setPayResult] = useState<PayProposalResponse | null>(null);

  const [policies, setPolicies] = useState<PolicyResponse[]>([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);

  const loadPolicies = async () => {
    setLoadingPolicies(true);
    try {
      const res = await apiClient.get<PolicyResponse[]>("/api/v1/insurance/policies");
      setPolicies(res.data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoadingPolicies(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const resetFlow = () => {
    setQuote(null);
    setPlans([]);
    setProposal(null);
    setPayResult(null);
  };

  const requestQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    setQuoting(true);
    resetFlow();
    try {
      const quoteRes = await apiClient.post<QuoteResponse>("/api/v1/insurance/quotes", {
        category,
        details: { notes: notes || "Standard cover" },
      });
      setQuote(quoteRes.data);

      const plansRes = await apiClient.get<PlanOptionResponse[]>(
        `/api/v1/insurance/quotes/${quoteRes.data.id}/plans`
      );
      setPlans(plansRes.data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setQuoting(false);
    }
  };

  const selectPlan = async (planId: string) => {
    if (!quote) return;
    setSelectingPlanId(planId);
    try {
      const res = await apiClient.post<ProposalResponse>(
        `/api/v1/insurance/quotes/${quote.id}/proposals`,
        { planId }
      );
      setProposal(res.data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSelectingPlanId(null);
    }
  };

  const payProposal = async () => {
    if (!proposal) return;
    setPaying(true);
    try {
      const res = await apiClient.post<PayProposalResponse>(
        `/api/v1/insurance/proposals/${proposal.id}/pay`,
        {},
        { headers: { "Idempotency-Key": crypto.randomUUID() } }
      );
      setPayResult(res.data);
      if (typeof window !== "undefined" && window.history?.replaceState) {
        window.history.replaceState({ step: "result" }, "", window.location.pathname);
      }
      if (res.data.policyId) {
        setProposal(null);
        toast.success(`Policy issued: ${res.data.policyNumber}`);
        await loadPolicies();
      } else {
        toast.success("Payment submitted");
      }
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setPaying(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl">
      <p className="text-sm font-bold uppercase text-primary">VyonixPay account</p>
      <h1 className="mt-2 text-3xl font-bold">Insurance</h1>
      <p className="mt-2 text-muted-foreground">Get a quote, choose a plan, and manage your policies.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-md border bg-background p-6">
            <h2 className="font-bold">Get a Quote</h2>
            <form className="mt-5 space-y-4" onSubmit={requestQuote}>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as InsuranceCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Additional Details (optional)</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Age, vehicle, destination"
                />
              </div>

              <Button type="submit" className="w-full" disabled={quoting}>
                {quoting ? "Fetching plans..." : "Get Quote"}
              </Button>
            </form>
          </div>

          <div className="rounded-md border bg-background p-6">
            <h2 className="font-bold">My Policies</h2>
            <div className="mt-4 space-y-3">
              {loadingPolicies ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="size-5 animate-spin text-primary" />
                </div>
              ) : policies.length === 0 ? (
                <p className="text-sm text-muted-foreground">No policies yet.</p>
              ) : (
                policies.map((policy) => (
                  <div key={policy.id} className="rounded-md border border-dashed p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{policy.policyNumber}</span>
                      <Badge variant={policyStatusVariant[policy.status] ?? "outline"}>{policy.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {policy.provider} · Premium Paid ₹{policy.premiumPaid.toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-md border bg-background p-6 lg:col-span-3">
          <h2 className="font-bold">Compare Plans</h2>
          <div className="mt-5 space-y-4">
            {!quote && !quoting && (
              <p className="text-sm text-muted-foreground">Request a quote to see plan options.</p>
            )}

            {plans.length > 0 && !proposal && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {plans.map((plan) => (
                  <div key={plan.planId} className="flex flex-col space-y-3 rounded-md border p-5">
                    <div>
                      <p className="font-bold">{plan.planName}</p>
                      <p className="text-xs text-muted-foreground">{plan.insurerName}</p>
                    </div>
                    <p className="text-2xl font-bold">
                      ₹{plan.premiumAmount.toLocaleString()}
                      <span className="text-xs font-normal text-muted-foreground">/yr</span>
                    </p>
                    <p className="flex-1 text-xs text-muted-foreground">
                      Coverage up to ₹{plan.coverageAmount.toLocaleString()}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={selectingPlanId === plan.planId}
                      onClick={() => selectPlan(plan.planId)}
                    >
                      {selectingPlanId === plan.planId ? "Selecting..." : "Select Plan"}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {proposal && !payResult && (
              <div className="rounded-md border p-6 space-y-4">
                <div>
                  <p className="font-bold">{proposal.planName}</p>
                  <p className="text-sm text-muted-foreground">{proposal.insurerName}</p>
                </div>
                <p className="text-2xl font-bold">
                  ₹{proposal.premiumAmount.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{proposal.currency}</span>
                </p>
                <Button className="w-full" disabled={paying} onClick={payProposal}>
                  {paying ? "Processing payment..." : "Pay & Issue Policy"}
                </Button>
              </div>
            )}

            {payResult && (
              <div className="rounded-md border p-6 space-y-2">
                <p className="font-bold">Payment {payResult.transactionStatus}</p>
                {payResult.policyNumber && (
                  <p className="text-sm text-muted-foreground">
                    Policy issued: <span className="font-bold text-foreground">{payResult.policyNumber}</span>
                  </p>
                )}
                <Button variant="outline" size="sm" onClick={resetFlow}>
                  Get Another Quote
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
