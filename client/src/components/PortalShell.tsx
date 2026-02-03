import { PropsWithChildren, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Shield, LayoutDashboard, Smartphone, Receipt, MessageSquareText, User2, Settings2, LifeBuoy, Info, Map, Phone, LogOut, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  testId: string;
};

function initials(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "U";
  const parts = n.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

export default function PortalShell({
  children,
  adminVisible,
}: PropsWithChildren<{ adminVisible?: boolean }>) {
  const [loc] = useLocation();
  const { user, isAuthenticated, isLoading, logout, isLoggingOut } = useAuth();

  const displayName = useMemo(() => {
    const full = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
    return full || user?.email || "Account";
  }, [user?.firstName, user?.lastName, user?.email]);

  const primary: NavItem[] = [
    { href: "/recharge", label: "Online Recharge", icon: Smartphone, testId: "nav-recharge" },
    { href: "/bill-payment", label: "Post Bill Payment", icon: Receipt, testId: "nav-bill" },
    { href: "/feedback", label: "Feedback", icon: MessageSquareText, testId: "nav-feedback" },
  ];

  const account: NavItem[] = [
    { href: "/account", label: "My Account", icon: User2, testId: "nav-account" },
    { href: "/services", label: "Services", icon: Settings2, testId: "nav-services" },
    { href: "/history", label: "History", icon: LayoutDashboard, testId: "nav-history" },
  ];

  const info: NavItem[] = [
    { href: "/site-map", label: "Site Map", icon: Map, testId: "nav-sitemap" },
    { href: "/about", label: "About Us", icon: Info, testId: "nav-about" },
    { href: "/contact", label: "Contact Us", icon: Phone, testId: "nav-contact" },
    { href: "/customer-care", label: "Customer Care", icon: LifeBuoy, testId: "nav-care" },
  ];

  const admin: NavItem[] = [
    { href: "/admin", label: "Admin Overview", icon: Shield, testId: "nav-admin-overview" },
    { href: "/admin/transactions", label: "Transactions", icon: Receipt, testId: "nav-admin-transactions" },
    { href: "/admin/users", label: "Users", icon: User2, testId: "nav-admin-users" },
    { href: "/admin/feedback", label: "Feedback", icon: MessageSquareText, testId: "nav-admin-feedback" },
  ];

  const Section = ({ label, items }: { label: string; items: NavItem[] }) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs tracking-wide text-muted-foreground/90">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = loc === item.href || (item.href !== "/" && loc.startsWith(item.href));
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={active}>
                  <Link
                    href={item.href}
                    data-testid={item.testId}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      "hover:bg-sidebar-accent hover:shadow-sm",
                      active && "bg-sidebar-accent shadow-sm ring-1 ring-sidebar-border"
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-9 w-9 place-items-center rounded-xl border border-sidebar-border bg-card shadow-[0_1px_0_0_rgba(0,0,0,0.03)] transition-all",
                        "group-hover:-translate-y-0.5 group-hover:shadow-md",
                        active && "border-primary/30 bg-primary/10"
                      )}
                    >
                      <Icon className={cn("h-4.5 w-4.5 text-foreground/80", active && "text-primary")} />
                    </span>
                    <span className="truncate">{item.label}</span>
                    <span
                      className={cn(
                        "pointer-events-none absolute inset-0 rounded-xl ring-0 ring-primary/0 transition-all duration-200",
                        "group-focus-visible:ring-4 group-focus-visible:ring-primary/10"
                      )}
                    />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-dvh w-full bg-mesh">
        <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="absolute inset-0 -z-10 overflow-hidden rounded-[28px]">
            <div className="absolute inset-0 bg-gradient-to-b from-white/55 to-white/25 dark:from-white/5 dark:to-white/0" />
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-border/70 bg-card/40 shadow-[0_30px_120px_-70px_rgba(2,6,23,0.45)] backdrop-blur-xl">
            <div className="absolute inset-0 grain -z-10" />

            <Sidebar
              variant="inset"
              className="border-r border-sidebar-border bg-sidebar/70"
              data-testid="portal-sidebar"
            >
              <SidebarHeader className="px-3 pt-3 pb-2">
                <div className="glass relative overflow-hidden rounded-2xl p-4">
                  <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/15 blur-2xl" />
                  <div className="absolute -left-10 -bottom-12 h-28 w-28 rounded-full bg-accent/15 blur-2xl" />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold tracking-wide text-muted-foreground">
                        Online Mobile Recharge System
                      </div>
                      <div className="mt-1 text-lg font-bold leading-tight">
                        Recharge Portal
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Fast recharges, bill payments, and account tools.
                      </div>
                    </div>
                    <div className="animate-floaty grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary/18 to-accent/14 ring-1 ring-border">
                      <Smartphone className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
              </SidebarHeader>

              <SidebarContent className="px-2 pb-2">
                <Section label="Quick actions" items={primary} />
                <Section label="Account" items={account} />
                {adminVisible ? <Section label="Admin" items={admin} /> : null}
                <Section label="Information" items={info} />
              </SidebarContent>

              <SidebarFooter className="px-3 pb-3">
                <div className="rounded-2xl border border-sidebar-border bg-card/55 p-3 shadow-sm">
                  {!isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <KeyRound className="h-4 w-4 text-primary" />
                        Sign in for full access
                      </div>
                      <div className="text-xs text-muted-foreground">
                        View history, manage services, and update profile.
                      </div>
                      <Button
                        type="button"
                        className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/85 shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
                        onClick={() => (window.location.href = "/api/login")}
                        data-testid="sidebar-login"
                      >
                        Login
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-1 ring-border">
                        <AvatarImage src={user?.profileImageUrl ?? undefined} alt={displayName} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {initials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{displayName}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {isLoading ? "Loading…" : "Signed in"}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-10 w-10 rounded-xl p-0 transition-all hover:-translate-y-0.5"
                        onClick={() => logout()}
                        disabled={isLoggingOut}
                        data-testid="sidebar-logout"
                        aria-label="Logout"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </SidebarFooter>
            </Sidebar>

            <SidebarInset className="min-h-[70dvh]">
              <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-card/35 px-4 py-3 backdrop-blur xl:px-6">
                <div className="flex items-center gap-2">
                  <SidebarTrigger
                    className="rounded-xl border border-border bg-card/70 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    data-testid="sidebar-trigger"
                  />
                  <div className="hidden sm:block">
                    <div className="text-sm font-semibold">Utility Portal</div>
                    <div className="text-xs text-muted-foreground">
                      Secure transactions with clear receipts.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/"
                    className={cn(
                      "hidden md:inline-flex items-center gap-2 rounded-xl border border-border bg-card/70 px-3 py-2 text-sm font-semibold shadow-sm",
                      "transition-all hover:-translate-y-0.5 hover:shadow-md"
                    )}
                    data-testid="header-home"
                  >
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    Home
                  </Link>

                  {!isAuthenticated ? (
                    <Button
                      type="button"
                      onClick={() => (window.location.href = "/api/login")}
                      className="rounded-xl bg-gradient-to-r from-primary to-primary/85 shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
                      data-testid="header-login"
                    >
                      Login
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => logout()}
                      disabled={isLoggingOut}
                      className="rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                      data-testid="header-logout"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  )}
                </div>
              </div>

              <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-7" data-testid="portal-content">
                {children}
              </main>
            </SidebarInset>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
