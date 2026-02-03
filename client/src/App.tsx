import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Recharge from "@/pages/Recharge";
import BillPayment from "@/pages/BillPayment";
import Account from "@/pages/Account";
import Services from "@/pages/Services";
import History from "@/pages/History";
import Feedback from "@/pages/Feedback";
import AdminOverview from "@/pages/AdminOverview";
import AdminTransactions from "@/pages/AdminTransactions";
import AdminUsers from "@/pages/AdminUsers";
import AdminFeedback from "@/pages/AdminFeedback";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import CustomerCare from "@/pages/CustomerCare";
import SiteMap from "@/pages/SiteMap";
import { useAuth } from "@/hooks/use-auth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Switch>
      <Route path="/welcome" component={Landing} />
      <Route path="/" component={isAuthenticated ? Home : Landing} />
      <Route path="/recharge" component={Recharge} />
      <Route path="/bill-payment" component={BillPayment} />
      <Route path="/account" component={Account} />
      <Route path="/services" component={Services} />
      <Route path="/history" component={History} />
      <Route path="/feedback" component={Feedback} />
      <Route path="/admin" component={AdminOverview} />
      <Route path="/admin/transactions" component={AdminTransactions} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/feedback" component={AdminFeedback} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/customer-care" component={CustomerCare} />
      <Route path="/site-map" component={SiteMap} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
