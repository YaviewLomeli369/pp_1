import React, { Suspense, lazy, useEffect, useRef, startTransition } from "react";
import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { InlineEditor } from "@/components/inline-editor/InlineEditor";
import { useTheme } from "@/hooks/use-theme";
import { ModuleRoute } from "@/components/module-route";
import { LoadingPage } from "@/components/loading-page";
import type { SiteConfig } from "@shared/schema";
import ReloadOnStore from "@/components/ReloadOnStore";
import ErrorBoundary from "@/components/ErrorBoundary";

// Admin pages
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

// Lazy load components with proper error boundaries
const createLazyComponent = (importFn: () => Promise<any>) => {
  return lazy(() => {
    return new Promise((resolve) => {
      startTransition(() => {
        importFn().then(resolve).catch((error) => {
          console.error('Error loading lazy component:', error);
          resolve({ default: () => <LoadingPage /> });
        });
      });
    });
  });
};

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
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        document.body.classList.remove('modal-open', 'overflow-hidden');
        document.body.style.overflow = '';
      }
    };
    const handleBeforeUnload = () => {
      document.body.style.overflow = '';
      sessionStorage.removeItem('navigationState');
    };
    const handleTouchStart = () => {
      document.body.style.touchAction = 'auto';
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

          {/* Module-based routes */}
          <ModuleRoute path="/servicios" component={Servicios} moduleName="services" />
          <ModuleRoute path="/conocenos" component={Conocenos} moduleName="about" />
          <ModuleRoute path="/tienda" component={Store} moduleName="store" />
          <ModuleRoute path="/store" component={Store} moduleName="store" />
          <ModuleRoute path="/blog" component={Blog} moduleName="blog" />
          <ModuleRoute path="/blog/:slug" component={BlogPost} moduleName="blog" />
          <ModuleRoute path="/contacto" component={Contact} moduleName="contact" />
          <ModuleRoute path="/testimonios" component={Testimonials} moduleName="testimonials" />
          <ModuleRoute path="/preguntas-frecuentes" component={Faqs} moduleName="faqs" />
          <ModuleRoute path="/faqs" component={Faqs} moduleName="faqs" />
          <ModuleRoute path="/reservaciones" component={Reservations} moduleName="reservations" />

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
              <Route path="/login" component={createLazyComponent(() => import("./pages/auth/login"))} />
              <Route path="/register" component={createLazyComponent(() => import("./pages/auth/register"))} />
            </>
          )}

          {/* Admin Routes */}
          <Route path="/setup" component={createLazyComponent(() => import("./pages/setup"))} />
          <Route path="/admin/login" component={createLazyComponent(() => import("./pages/auth/login"))} />
          <Route path="/admin/create-admin" component={createLazyComponent(() => import("./pages/auth/create-admin"))} />
          <Route path="/admin/dashboard" component={createLazyComponent(() => import("./pages/admin/dashboard"))} />
          <Route path="/admin/modules" component={createLazyComponent(() => import("./pages/admin/modules"))} />
          <Route path="/admin/appearance" component={createLazyComponent(() => import("./pages/admin/appearance"))} />
          <Route path="/admin/themes" component={createLazyComponent(() => import("./pages/admin/themes"))} />
          <Route path="/admin/users" component={createLazyComponent(() => import("./pages/admin/users"))} />
          <Route path="/admin/sections" component={createLazyComponent(() => import("./pages/admin/sections"))} />
          <Route path="/admin/servicios-sections" component={createLazyComponent(() => import("./pages/admin/servicios-sections"))} />
          <Route path="/admin/pages-content" component={createLazyComponent(() => import("./pages/admin/pages-content"))} />
          <Route path="/admin/testimonials" component={createLazyComponent(() => import("./pages/admin/testimonials"))} />
          <Route path="/admin/faqs" component={createLazyComponent(() => import("./pages/admin/faqs"))} />
          <Route path="/admin/blog" component={createLazyComponent(() => import("./pages/admin/blog"))} />
          <Route path="/admin/contact" component={createLazyComponent(() => import("./pages/admin/contact"))} />
          <Route path="/admin/contact-info" component={createLazyComponent(() => import("./pages/admin/contact-info"))} />
          <Route path="/admin/store" component={createLazyComponent(() => import("./pages/admin/store"))} />
          <Route path="/admin/inventory" component={createLazyComponent(() => import("./pages/admin/inventory"))} />
          <Route path="/admin/orders" component={createLazyComponent(() => import("./pages/admin/orders"))} />
          <Route path="/admin/payments" component={createLazyComponent(() => import("./pages/admin/payments"))} />
          <Route path="/admin/reservations" component={createLazyComponent(() => import("./pages/admin/reservations"))} />
          <Route path="/admin/reservation-settings" component={createLazyComponent(() => import("./pages/admin/reservation-settings"))} />
          <Route path="/admin/whatsapp-config" component={createLazyComponent(() => import("./pages/admin/whatsapp-config"))} />
          <Route path="/admin/navbar-config" component={createLazyComponent(() => import("./pages/admin/navbar-config"))} />
          <Route path="/admin/sidebar-config" component={createLazyComponent(() => import("./pages/admin/sidebar-config"))} />
          <Route path="/admin/email-config" component={createLazyComponent(() => import("./pages/admin/email-config"))} />

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
        <ErrorBoundary>
          <Router />
          <InlineEditor value="" onSave={async () => {}} />
          <WhatsAppWidget />
          <Toaster />
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;