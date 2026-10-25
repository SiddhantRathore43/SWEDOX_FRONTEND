export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  userId: number;
  email: string;
  roles: string[];
}

// Credit Card Bill Payment (Phase 5) — a payment-facilitation flow for
// paying a bill on a credit card the customer already holds elsewhere, not
// card origination/issuance. The old ProductResponse/ApplyRequest/
// ApplicationResponse types for card origination were removed here along
// with the retired frontend pages that used them — see DECISIONS.md.
export interface BillerResponse {
  id: number;
  name: string;
  code: string;
}

export interface FetchBillRequest {
  billerId: number;
  maskedCardRef: string;
}

export interface FetchBillResponse {
  supported: boolean;
  dueAmount: number | null;
  currency: string | null;
  remarks: string | null;
}

export interface PayBillRequest {
  billerId: number;
  maskedCardRef: string;
  amount: number;
}

export type CreditCardBillPaymentStatus =
  | "INITIATED"
  | "BILL_FETCHED"
  | "PAYMENT_PENDING"
  | "SUCCESS"
  | "FAILED";

export interface PayBillResponse {
  paymentId: number;
  transactionId: number | null;
  status: CreditCardBillPaymentStatus;
  billAmount: number;
  currency: string;
  remarks: string | null;
  createdAt: string;
  /** Non-null only when a real gateway needs an interactive checkout to complete first. */
  checkoutOrderId: string | null;
  checkoutKeyId: string | null;
  /** The BBPS/issuer-forwarding provider's own reference. Null until forwarding has actually been attempted. */
  providerRefId: string | null;
}

export interface BillPaymentResponse {
  id: number;
  billerId: number;
  billerName: string;
  maskedCardRef: string;
  billAmount: number;
  currency: string;
  status: CreditCardBillPaymentStatus;
  createdAt: string;
  /** Populated only when fetched via GET /payments/{id} — null in the list endpoint. */
  transactionId: number | null;
  /** The BBPS/issuer-forwarding provider's own reference. Null until forwarding has actually been attempted. */
  providerRefId: string | null;
  /** The client-generated Idempotency-Key this payment was submitted with. */
  idempotencyKey: string;
  /** Set only once the payment reaches a truly terminal state (SUCCESS/FAILED). */
  completedAt: string | null;
}

export type InsuranceCategory = "MOTOR" | "HEALTH" | "LIFE" | "TRAVEL";

export interface QuoteRequest {
  category: InsuranceCategory;
  details: Record<string, string | number>;
}

export interface QuoteResponse {
  id: number;
  category: InsuranceCategory;
  status: "REQUESTED" | "QUOTED" | "EXPIRED";
  premiumAmount: number | null;
  currency: string;
  createdAt: string;
}

export interface PlanOptionResponse {
  planId: string;
  planName: string;
  premiumAmount: number;
  currency: string;
  coverageAmount: number;
  description: string;
  /** The actual underwriting insurer — distinct from VyonixPay's own integration/aggregator. */
  insurerName: string;
}

export interface ProposalResponse {
  id: number;
  quoteId: number;
  status: "DRAFT" | "SUBMITTED" | "AWAITING_PAYMENT" | "PAYMENT_CONFIRMED";
  planId: string;
  planName: string;
  insurerName: string;
  premiumAmount: number;
  currency: string;
  createdAt: string;
}

export interface PayProposalResponse {
  proposalId: number;
  transactionId: number;
  transactionStatus: "INITIATED" | "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  proposalStatus: string;
  amount: number;
  currency: string;
  policyId: number | null;
  policyNumber: string | null;
  createdAt: string;
  /** Non-null only when a real gateway needs an interactive checkout to complete first. */
  checkoutOrderId: string | null;
  checkoutKeyId: string | null;
}

export interface PolicyResponse {
  id: number;
  proposalId: number;
  policyNumber: string;
  provider: string;
  status: "ISSUING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  premiumPaid: number;
  issuedAt: string;
  expiresAt: string | null;
  documentRef: string | null;
}

export interface LoanProductResponse {
  id: number;
  name: string;
  description: string | null;
  minAmount: number;
  maxAmount: number;
  active: boolean;
  partnerId: number;
  /** The actual lending partner — VyonixPay never issues the loan itself. */
  partnerName: string;
  partnerCode: string;
}

export interface LoanApplyRequest {
  productId: number;
  requestedAmount: number;
  tenureMonths: number;
  purpose: string;
  fullName: string;
}

export type LoanApplicationStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "KFS_ACCEPTED"
  | "COOLING_OFF"
  | "DISBURSED"
  | "CANCELLED";

export interface LoanApplicationResponse {
  id: number;
  productId: number;
  productName: string;
  requestedAmount: number;
  tenureMonths: number;
  status: LoanApplicationStatus;
  provider: string;
  providerRefId: string | null;
  partnerName: string;
  partnerCode: string;
  submittedAt: string;
  decidedAt: string | null;
  kfsAcceptedAt: string | null;
  coolingOffExpiresAt: string | null;
  cancelledAt: string | null;
  disbursedAt: string | null;
}

export interface KeyFactStatementResponse {
  loanAmount: number;
  tenureMonths: number;
  annualPercentageRate: number;
  totalInterestPayable: number;
  processingFee: number;
  monthlyInstallmentAmount: number;
  currency: string;
  coolingOffPeriodSeconds: number;
}

export interface DisburseResponse {
  applicationId: number;
  transactionId: number;
  transactionStatus: "INITIATED" | "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  applicationStatus: string;
  disbursedAt: string | null;
}

export interface AdminApplicationSummary {
  serviceType: "LOAN" | "INSURANCE" | "CREDIT_CARD_BILL_PAYMENT" | "CREDIT_CARD";
  id: number;
  userId: number;
  userEmail: string;
  status: string;
  provider: string | null;
  providerRefId: string | null;
  amount: number | null;
  currency: string | null;
  submittedAt: string;
  decidedAt: string | null;
}

export interface AuditLogEntryResponse {
  id: number;
  actorId: number | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: string | null;
  createdAt: string;
}

export interface AdminApplicationDetail extends AdminApplicationSummary {
  rawSnapshot: string | null;
  auditTrail: AuditLogEntryResponse[];
}

export interface StatusOverrideRequest {
  newStatus: string;
  reason: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
  traceId: string | null;
  errors: { field: string; message: string }[] | null;
}

/** page is zero-indexed, matching the backend's Spring Data convention. */
export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface AdminTransactionSummary {
  id: number;
  userId: number;
  userEmail: string;
  serviceType: string;
  operation: string;
  amount: number;
  currency: string;
  status: string;
  provider: string | null;
  referenceId: string | null;
  idempotencyKey: string;
  correlationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RefundTransactionRequest {
  amount: number | null;
  reason: string;
}
