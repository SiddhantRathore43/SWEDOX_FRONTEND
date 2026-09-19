import { SwedoxBrand } from "@/components/swedox/brand";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { CreditCard, LayoutDashboard, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Shield, ShieldCheck, User, WalletCards, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const baseNavigation = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, end: true },
  { label: "Loans", to: "/dashboard/loans", icon: WalletCards, soon: true },
  { label: "Insurance", to: "/dashboard/insurance", icon: ShieldCheck, soon: true },
  { label: "Bill Payment", to: "/dashboard/bill-payment", icon: CreditCard },
  { label: "Profile", to: "/dashboard/profile", icon: User },
];

export function DashboardShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  // Mirrors AdminGuard's own gate: anyone holding ANY of the three
  // admin-panel roles gets the nav link — what they can actually see/do once
  // there is governed entirely by admin.tsx's per-section role checks and,
  // ultimately, the backend's own @PreAuthorize rules.
  const isOperations = user?.roles.includes("ROLE_OPERATIONS") ?? false;
  const isSupport = user?.roles.includes("ROLE_SUPPORT") ?? false;
  const canAccessAdmin = isAdmin || isOperations || isSupport;

  const navigation = canAccessAdmin
    ? [...baseNavigation, { label: "Admin", to: "/dashboard/admin", icon: Shield }]
    : baseNavigation;

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const sidebar = (
    <>
      <div className="flex h-20 items-center justify-between border-b px-4">
        <SwedoxBrand compact={collapsed} />
        <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X /></Button>
      </div>
      <nav className="space-y-1 p-3" aria-label="Dashboard navigation">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => cn(
              "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
              isActive && "bg-secondary text-primary",
              collapsed && "justify-center px-0"
            )}
          >
            <item.icon className="size-5 shrink-0" aria-hidden="true" />
            {!collapsed && (
              <span className="flex flex-1 items-center justify-between">
                {item.label}
                {item.soon && (
                  <span className="rounded-full border px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                    Soon
                  </span>
                )}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );

  // print:hidden below — dialogs (e.g. a printable receipt) portal to
  // document.body, outside this tree, so hiding the whole shell on print
  // leaves only the dialog's own content on the page/PDF, never the
  // sidebar/header/dashboard.
  return (
    <div className="flex min-h-screen w-full bg-secondary/40 print:hidden">
      <aside className={cn("hidden shrink-0 border-r bg-background transition-[width] lg:block", collapsed ? "w-16" : "w-64")}>{sidebar}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-foreground/20" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" />
          <aside className="relative h-full w-72 border-r bg-background">{sidebar}</aside>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <header className="flex h-20 items-center justify-between border-b bg-background px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu /></Button>
          <div className="ml-auto flex items-center gap-3 sm:gap-5">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}><LogOut />Logout</Button>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}