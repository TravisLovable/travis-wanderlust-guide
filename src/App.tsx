import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TravelProvider } from "@/contexts/TravelContext";
import Index from "./pages/Index";
import SearchResults from "./pages/SearchResults";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import { RequireOnboarding } from "@/onboarding/RequireOnboarding";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <AuthProvider>
        <TravelProvider>
          <Routes>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route
              path="/"
              element={
                <RequireOnboarding>
                  <Index />
                </RequireOnboarding>
              }
            />
            <Route
              path="/search"
              element={
                <RequireOnboarding>
                  <SearchResults />
                </RequireOnboarding>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TravelProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
