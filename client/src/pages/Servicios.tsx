import React, { useMemo, startTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SEOHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loader";
import { Link } from "wouter";
import { Rocket, Users, Target, Check, Star } from "lucide-react";
import type { SiteConfig } from "@shared/schema";
import AnimatedSection from "@/components/AnimatedSection";

interface ServiceSection {
  id: string;
  type: 'service' | 'plan';
  title: string;
  description: string;
  price?: string;
  features: string[];
  highlight?: boolean;
  icon?: string;
  order: number;
  isActive: boolean;
}

// Iconos por defecto para servicios
const getServiceIcon = (title: string) => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('desarrollo') || titleLower.includes('web')) {
    return <Rocket className="h-8 w-8 text-blue-600" />;
  }
  if (titleLower.includes('marketing') || titleLower.includes('digital')) {
    return <Target className="h-8 w-8 text-green-600" />;
  }
  if (titleLower.includes('consultoría') || titleLower.includes('tecnológica')) {
    return <Users className="h-8 w-8 text-purple-600" />;
  }
  return <Rocket className="h-8 w-8 text-blue-600" />;
};

const PlanCard = ({ plan }: { plan: ServiceSection }) => {
  const WHATSAPP_NUMBER = "525512345678";
  const message = encodeURIComponent(
    `Hola, me interesa más información sobre sus servicios.`
  );

  const whatsappLink = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${message}`;

  const priceValue = plan.price ? parseInt(plan.price.replace(/\D/g, "")) : 0;
  const oldPrice = priceValue ? `${(priceValue * 1.30).toLocaleString()} MXN` : null;

  return (
    <AnimatedSection delay={0.1}>
      <div
        className={`relative rounded-2xl shadow-lg p-8 flex flex-col transition-transform duration-300 hover:scale-105 navbar-fixed-body ${
          plan.highlight
            ? "bg-white border-2 border-blue-600 shadow-blue-200"
            : "bg-white border border-gray-200"
        }`}
      >
        {plan.highlight && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="flex items-center gap-1 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-md">
              <Star className="h-4 w-4" /> Más vendido
            </span>
          </div>
        )}

        <h3 className="text-2xl font-bold mb-2 text-center text-gray-800">{plan.title}</h3>
        <p className="text-gray-500 mb-4 text-center">{plan.description}</p>

        <div className="text-center mb-6">
          {oldPrice && <span className="text-gray-400 line-through mr-2 text-lg">${oldPrice}</span>}
          <br />  
          <span className="text-4xl font-extrabold text-blue-600">{plan.price || 'Consultar precio'}</span>
        </div>

      

        <ul className="space-y-3 flex-1">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-6 w-full py-3 px-4 rounded-xl font-semibold text-center transition duration-300 ${
            plan.highlight
              ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          Solicitar información
        </a>
      </div>
    </AnimatedSection>
  );
};

function Servicios() {
  const { data: config, isLoading: configLoading, error: configError } = useQuery<SiteConfig>({ 
    queryKey: ["/api/config"],
    retry: 1,
    staleTime: 5 * 60 * 1000,
    suspense: false
  });
  
  const { data: sections = [], isLoading: sectionsLoading, error: sectionsError } = useQuery<ServiceSection[]>({ 
    queryKey: ["/api/servicios-sections"],
    retry: 1,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    suspense: false
  });
  
  const { appearance } = useMemo(() => {
    const configData = config?.config as any;
    return { appearance: configData?.appearance || {} };
  }, [config]);

  // Separar servicios y planes, solo mostrar los activos
  const activeSections = sections.filter(section => section.isActive);
  const services = activeSections.filter(section => section.type === 'service').sort((a, b) => a.order - b.order);
  const plans = activeSections.filter(section => section.type === 'plan').sort((a, b) => a.order - b.order);

  if (configLoading || sectionsLoading) return <PageLoader message="Cargando servicios..." />;
  
  if (configError || sectionsError) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center navbar-fixed-body">
          <h1 className="text-4xl font-bold mb-4">Error</h1>
          <p className="text-xl text-muted-foreground">
            Hubo un problema cargando los servicios. Por favor, intenta más tarde.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-background overflow-x-hidden"
      style={{
        backgroundColor: appearance.backgroundColor || "inherit",
        color: appearance.textColor || "inherit",
        fontFamily: appearance.fontFamily || "inherit",
      }}
    >
      <SEOHead
        title="Servicios de Desarrollo Web | Soluciones Profesionales"
        description="Descubre nuestros servicios de diseño web, SEO y marketing digital. Planes flexibles para impulsar tu negocio online."
        image={appearance.ogImage}
      />
      <Navbar />

      {/* Hero */}
      <AnimatedSection>
        <section
          className="relative py-20 text-white text-center"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1516331138075-f3adc1e149cd?q=80&w=1208&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="relative max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              Servicios Digitales para Impulsar tu Negocio
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8">
              Diseño, SEO y soporte para que tu marca brille en internet.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact">Solicitar cotización</Link>
            </Button>
          </div>
        </section>
      </AnimatedSection>

      {/* Servicios */}
      <AnimatedSection delay={0.1}>
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
              Nuestros Servicios
            </h2>
            {services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {services.map((service, i) => (
                  <AnimatedSection key={service.id} delay={0.1 * i}>
                    <div className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-xl transition duration-300">
                      <div className="flex justify-center mb-4">{getServiceIcon(service.title)}</div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-800">{service.title}</h3>
                      <p className="text-gray-600">{service.description}</p>
                      {service.features && service.features.length > 0 && (
                        <ul className="mt-4 space-y-2 text-left">
                          {service.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-start text-sm text-gray-600">
                              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No hay servicios configurados aún.</p>
              </div>
            )}
          </div>
        </section>
      </AnimatedSection>

      {/* Planes */}
      <AnimatedSection delay={0.2}>
        <section className="py-20 bg-gradient-to-b from-white to-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">
              Planes a tu Medida
            </h2>
            <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
              Escoge el plan que mejor se adapte a tus objetivos. Todos incluyen soporte y
              optimización básica.
            </p>
            {plans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, i) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No hay planes configurados aún.</p>
              </div>
            )}
          </div>
        </section>
      </AnimatedSection>

      <Footer />
    </div>
  );
}

export default React.memo(Servicios);
