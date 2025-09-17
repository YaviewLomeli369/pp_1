
import React, { Suspense, lazy, useEffect, useRef, startTransition } from "react";
import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { InlineEditor } from "@/components/inline-editor/InlineEditor";
import { useTheme } from "@/hooks/use-theme";
import { Theme2025Provider } from "@/components/theme-provider";
import { ModuleRoute } from "@/components/module-route";
import { LoadingPage } from "@/components/loading-page";
import type { SiteConfig } from "@shared/schema";
import ReloadOnStore from "@/components/ReloadOnStore";
import ErrorBoundary from "@/components/ErrorBoundary";

// Admin pages - Direct imports to avoid lazy loading issues in admin
import AdminDashboard from "@/pages/admin/dashboard";
import AdminModules from "@/pages/admin/modules";
import AdminTestimonials from "@/pages/admin/testimonials";
import AdminFaqs from "@/pages/admin/faqs";
import AdminContact from "@/pages/admin/contact";
import AdminStore from "@/pages/admin/store";
import AdminUsers from "@/pages/admin/users";
import AdminSections from "@/pages/admin/sections";
import AdminAppearance from "@/pages/admin/appearance";
import AdminReservations from "@/pages/admin/reservations";
import AdminReservationSettings from "@/pages/admin/reservation-settings";
import AdminPayments from "@/pages/admin/payments";
import AdminBlog from "@/pages/admin/blog";
import AdminOrders from "@/pages/admin/orders";
import AdminInventory from "@/pages/admin/inventory";
import AdminContactInfo from "@/pages/admin/contact-info";
import AdminServiciosSections from "@/pages/admin/servicios-sections";
import AdminPagesContent from "@/pages/admin/pages-content";
import AdminWhatsAppConfig from "@/pages/admin/whatsapp-config";
import AdminNavbarConfig from "@/pages/admin/navbar-config";
import AdminSidebarConfig from "@/pages/admin/sidebar-config";
import AdminEmailConfig from "@/pages/admin/email-config";
import AdminThemes from "@/pages/admin/themes";

// Lazy load components with enhanced error handling
const createLazyComponent = (importFn: () => Promise<any>) => {
  return lazy(() => {
    return importFn()
      .then((module) => ({ default: module.default }))
      .catch((error) => {
        console.error('Error loading lazy component:', error);
        return { default: () => <LoadingPage /> };
      });
  });
};

// Public pages - lazy loaded for performance
const Home = createLazyComponent(() => import("./pages/home"));
const Testimonials = createLazyComponent(() => import("./pages/testimonials"));
const Faqs = createLazyComponent(() => import("./pages/faqs"));
const Contact = createLazyComponent(() => import("./pages/contact"));
const Store = createLazyComponent(() => import("./pages/store"));
const Blog = createLazyComponent(() => import("./pages/blog"));
const BlogPost = createLazyComponent(() => import("./pages/blog-post"));
const Reservations = createLazyComponent(() => import("./pages/reservations"));
const Login = createLazyComponent(() => import("./pages/auth/login"));
const Register = createLazyComponent(() => import("./pages/auth/register"));
const CreateAdmin = createLazyComponent(() => import("./pages/auth/create-admin"));
const Setup = createLazyComponent(() => import("./pages/setup"));
const Profile = createLazyComponent(() => import("./pages/profile"));
const Checkout = createLazyComponent(() => import("./pages/checkout"));
const CheckoutSuccess = createLazyComponent(() => import("./pages/checkout-success"));
const ShippingInfo = createLazyComponent(() => import("./pages/shipping-info"));
const OrderTracking = createLazyComponent(() => import("./pages/order-tracking"));
const AvisoPrivacidad = createLazyComponent(() => import("./pages/aviso-privacidad"));
const Conocenos = createLazyComponent(() => import("./pages/Conocenos"));
const Servicios = createLazyComponent(() => import("./pages/Servicios"));
const NotFound = createLazyComponent(() => import("./pages/not-found"));

function Router() {
  useTheme();

  const { data: config, isLoading } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    suspense: false,
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        startTransition(() => {
          document.body.classList.remove('modal-open', 'overflow-hidden');
          document.body.style.overflow = '';
        });
      }
    };
    
    const handleBeforeUnload = () => {
      startTransition(() => {
        document.body.style.overflow = '';
        sessionStorage.removeItem('navigationState');
      });
    };
    
    const handleTouchStart = () => {
      startTransition(() => {
        document.body.style.touchAction = 'auto';
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div>
      <ReloadOnStore />
      <Suspense fallback={<LoadingPage />}>
        <Switch>
          {/* Public Routes */}
          <Route path="/" component={Home} />

          {/* Module-based routes - using exact module names from config */}
          <ModuleRoute path="/servicios" component={Servicios} moduleName="servicios" />
          <ModuleRoute path="/conocenos" component={Conocenos} moduleName="conocenos" />
          <ModuleRoute path="/tienda" component={Store} moduleName="tienda" />
          <ModuleRoute path="/store" component={Store} moduleName="tienda" />
          <ModuleRoute path="/blog" component={Blog} moduleName="blog" />
          <ModuleRoute path="/blog/:slug" component={BlogPost} moduleName="blog" />
          <Route path="/contacto" component={Contact} />
          <ModuleRoute path="/testimonios" component={Testimonials} moduleName="testimonios" />
          <ModuleRoute path="/testimonials" component={Testimonials} moduleName="testimonios" />
          <ModuleRoute path="/preguntas-frecuentes" component={Faqs} moduleName="faqs" />
          <ModuleRoute path="/faqs" component={Faqs} moduleName="faqs" />
          <ModuleRoute path="/reservaciones" component={Reservations} moduleName="reservas" />

          {/* Store & Checkout */}
          <Route path="/checkout" component={Checkout} />
          <Route path="/checkout-success" component={CheckoutSuccess} />
          <Route path="/shipping-info" component={ShippingInfo} />
          <Route path="/order-tracking" component={OrderTracking} />

          {/* User Profile */}
          <Route path="/profile" component={Profile} />

          {/* Legal */}
          <Route path="/aviso-privacidad" component={AvisoPrivacidad} />

          {/* Example */}
          <Route path="/example" component={createLazyComponent(() => import("./pages/example-alternating"))} />

          {/* Auth Routes - Only show if not enabled in modules */}
          {!config?.modules?.auth && (
            <>
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
            </>
          )}

          {/* Admin Routes - Direct components to avoid suspension issues */}
          <Route path="/setup" component={Setup} />
          <Route path="/admin/login" component={Login} />
          <Route path="/admin/create-admin" component={CreateAdmin} />
          <Route path="/admin" component={() => { window.location.href = "/admin/dashboard"; return null; }} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/modules" component={AdminModules} />
          <Route path="/admin/appearance" component={AdminAppearance} />
          <Route path="/admin/themes" component={AdminThemes} />
          <Route path="/admin/themes-2025" component={createLazyComponent(() => import("./pages/admin/themes-2025"))} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/sections" component={AdminSections} />
          <Route path="/admin/servicios-sections" component={AdminServiciosSections} />
          <Route path="/admin/pages-content" component={AdminPagesContent} />
          <Route path="/admin/testimonials" component={AdminTestimonials} />
          <Route path="/admin/faqs" component={AdminFaqs} />
          <Route path="/admin/blog" component={AdminBlog} />
          <Route path="/admin/contact" component={AdminContact} />
          <Route path="/admin/contact-info" component={AdminContactInfo} />
          <Route path="/admin/store" component={AdminStore} />
          <Route path="/admin/inventory" component={AdminInventory} />
          <Route path="/admin/orders" component={AdminOrders} />
          <Route path="/admin/payments" component={AdminPayments} />
          <Route path="/admin/reservations" component={AdminReservations} />
          <Route path="/admin/reservation-settings" component={AdminReservationSettings} />
          <Route path="/admin/whatsapp-config" component={AdminWhatsAppConfig} />
          <Route path="/admin/navbar-config" component={AdminNavbarConfig} />
          <Route path="/admin/sidebar-config" component={AdminSidebarConfig} />
          <Route path="/admin/email-config" component={AdminEmailConfig} />

          {/* 404 Route */}
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Theme2025Provider>
          <ErrorBoundary>
            <Router />
            <InlineEditor value="" onSave={async () => {}} />
            <WhatsAppWidget />
            <Toaster />
          </ErrorBoundary>
        </Theme2025Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
