import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { useTrial } from "@/hooks/useTrial";
import { TrialLockScreen } from "@/components/TrialLockScreen";

import Dashboard from "@/pages/Dashboard";
import PacketsList from "@/pages/PacketsList";
import NewPacket from "@/pages/NewPacket";
import NewPacketForm from "@/pages/NewPacketForm";
import PacketDetail from "@/pages/PacketDetail";
import Templates from "@/pages/Templates";
import Settings from "@/pages/Settings";
import Pricing from "@/pages/Pricing";
import VerifyPacket from "@/pages/VerifyPacket";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

// Routes always accessible even when trial is locked
const OPEN_ROUTES = ['/pricing', '/settings'];

function Router() {
  const { isLocked } = useTrial();
  const [location] = useLocation();

  const isOpenRoute = OPEN_ROUTES.some(r => location.startsWith(r));

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <Switch>
        {/* Always accessible */}
        <Route path="/pricing" component={Pricing} />
        <Route path="/settings" component={Settings} />

        {/* Lock screen shown for all other routes when trial expired */}
        {isLocked && !isOpenRoute ? (
          <Route component={TrialLockScreen} />
        ) : (
          <>
            <Route path="/" component={Dashboard} />
            <Route path="/packets" component={PacketsList} />
            <Route path="/packets/new" component={NewPacket} />
            <Route path="/packets/new/:type" component={NewPacketForm} />
            <Route path="/packets/:id" component={PacketDetail} />
            <Route path="/templates" component={Templates} />
            <Route path="/verify" component={VerifyPacket} />
            <Route component={NotFound} />
          </>
        )}
      </Switch>
      <Navigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
