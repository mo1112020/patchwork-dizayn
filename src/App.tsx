import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/context/LanguageContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Navbar } from "@/components/landing/Navbar";
import { Suspense, lazy } from "react";
import Index from "./pages/Index";
import { useTextures } from "@/hooks/useTextures";

// Lazy-load all heavy routes — they are code-split into separate chunks
const Admin = lazy(() => import("./pages/Admin"));
const Designer = lazy(() => import("./pages/Designer"));
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const About = lazy(() => import("./pages/About"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const ManufacturingStandards = lazy(() => import("./pages/ManufacturingStandards"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Contact = lazy(() => import("./pages/Contact"));
const Support = lazy(() => import("./pages/Support"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/** Invisible component that starts preloading rug texture images on app boot. */
function TexturePrefetcher() {
  useTextures(); // triggers fetch + preload pipeline immediately
  return null;
}

function AppRoutes() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <Suspense fallback={null}>
        <Routes>
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/" element={<Index />} />
          <Route path="/designer" element={<Designer />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/manufacturing-standards" element={<ManufacturingStandards />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/support" element={<Support />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <LanguageProvider>
        <TooltipProvider>
          <TexturePrefetcher />
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
