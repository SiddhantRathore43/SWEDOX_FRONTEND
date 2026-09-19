import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // The admin dashboard's own sections (see dashboard/admin.tsx) already gate
  // what each role can see and do: Applications/Transactions are readable by
  // ADMIN/OPERATIONS/SUPPORT, the Reconciliation Queue by ADMIN/OPERATIONS
  // only, and every write action (refund, status override) by OPERATIONS
  // only — matching the backend's own @PreAuthorize rules on every endpoint
  // exactly. This route guard's only job is admitting anyone who holds ANY
  // of those three admin-panel roles; it is not itself a substitute for that
  // per-action backend authorization, which remains the real enforcement
  // boundary regardless of what this guard does.
  const isOperations = user.roles.includes("ROLE_OPERATIONS");
  const isSupport = user.roles.includes("ROLE_SUPPORT");

  if (!isAdmin && !isOperations && !isSupport) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
