import React, { useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SEOHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loader";
import { InlineEditor } from "@/components/inline-editor/InlineEditor";
import { InlineTextarea } from "@/components/inline-editor/InlineTextarea";
import AnimatedSection from "@/components/AnimatedSection";
import AlternatingSection from "@/components/AlternatingSection";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Rocket, Users, Target, Star, Check } from "lucide-react";
import type { SiteConfig, Section, Testimonial } from "@shared/schema";

const PlanCard = ({ plan }: { plan: any }) => {
  // Use plan-specific WhatsApp configuration or fallback to defaults
  const WHATSAPP_NUMBER = plan.whatsappPhone || "525512345678";
  const messageTemplate = plan.whatsappMessage || "Hola, me interesa más información sobre sus servicios.";
  
  // Replace [PLAN_NAME] placeholder with actual plan name
  const personalizedMessage = messageTemplate.replace(/\[PLAN_NAME\]/g, plan.name);
  const message = encodeURIComponent(personalizedMessage);

  const whatsappLink = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${message}`;

  // Check if it's a valid promotion
  const isValidPromotion = plan.isPromotion && 
                          plan.originalPrice && 
                          plan.originalPrice.trim() !== '' &&
                          plan.discountPercentage > 0;

  // Calculate prices
  // Parse price strings - handle different formats (with/without commas and decimals)
  const parsePrice = (priceStr: string) => {
    if (!priceStr) return 0;
    // Remove everything except numbers, commas, and dots
    const cleanStr = priceStr.replace(/[^\d,.\s]/g, '');
    // Handle Mexican format: 15,000.00 or 15000.00 or 15000
    const numStr = cleanStr.replace(/,/g, '');
    return parseFloat(numStr) || 0;
  };

  const currentPriceNum = parsePrice(plan.price);
  const originalPriceNum = plan.originalPrice ? parsePrice(plan.originalPrice) : 0;

  // For promotions, show the calculated discounted price, otherwise show the current price
  const displayPrice = isValidPromotion && originalPriceNum > 0
    ? (originalPriceNum * (1 - plan.discountPercentage / 100)).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : currentPriceNum.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Show original price (crossed out) only if it's a valid promotion
  const displayOriginalPrice = isValidPromotion && originalPriceNum > 0
    ? originalPriceNum.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : null;

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

        <h3 className="text-2xl font-bold mb-2 text-center text-gray-800">{plan.name}</h3>
        <p className="text-gray-500 mb-4 text-center">{plan.description}</p>

        <div className="text-center mb-6">
          {displayOriginalPrice && (
            <>
              <span className="text-gray-400 line-through mr-2 text-lg">${displayOriginalPrice} MXN</span>
              <br />
            </>
          )}
          <span className="text-4xl font-extrabold text-blue-600">${displayPrice} MXN</span>
          {isValidPromotion && (
            <span className="text-green-600 font-semibold ml-2">({plan.discountPercentage}% OFF)</span>
          )}
        </div>

        <ul className="space-y-3 flex-1">
          {plan.features?.map((feature: string, i: number) => (
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

function Home() {
  const [location] = useLocation();

  const { data: config, isLoading: configLoading } = useQuery<SiteConfig>({ queryKey: ["/api/config"] });
  const { data: sections, isLoading: sectionsLoading } = useQuery<Section[]>({ queryKey: ["/api/sections"] });
  const { data: testimonials, isLoading: testimonialsLoading } = useQuery<Testimonial[]>({ queryKey: ["/api/testimonials"] });

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isSuperuser = user?.role === "superuser";

  const updateSectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest(`/api/sections/${id}`, { method: "PUT", body: JSON.stringify(data) });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/sections"] }),
  });

  const featuredTestimonials = useMemo(
    () => testimonials?.filter(t => t.isFeatured && t.isApproved).slice(0, 3) || [],
    [testimonials]
  );

  const { appearance, frontpage, modules, pagesContent } = useMemo(() => {
    const configData = config?.config as any;
    return {
      appearance: configData?.appearance || {},
      frontpage: configData?.frontpage || {},
      modules: configData?.frontpage?.modulos || {},
      pagesContent: configData?.pagesContent?.servicios || {
        plans: [
          {
            id: "1",
            name: "Esencial",
            price: "6,499.00 MXN",
            originalPrice: "",
            discountPercentage: 0,
            isPromotion: false,
            description: "Atrae nuevos clientes con un blog profesional que genera contenido de valor.",
            features: [
              "Diseño a medida: Apariencia profesional con tu logo, colores y tipografía.",
              "Contenido clave: 3 secciones principales (Inicio, Servicios, Contacto), con un blog y 3 servicios listados.",
              "Módulo de contacto",
              "Conexión directa: Formulario de contacto, integración con redes sociales y botón de WhatsApp.",
              'Detalles profesionales: Correo corporativo y una sección de "Conócenos" para generar confianza.'
            ],
            highlight: false
          },
          {
            id: "2",
            name: "Profesional",
            price: "7,599.00 MXN",
            originalPrice: "9,499.00 MXN",
            discountPercentage: 20,
            isPromotion: true,
            description: "Un sitio web que se ve y funciona perfectamente en cualquier dispositivo, garantizando una experiencia de usuario ideal.",
            features: [
              "Construye confianza: Incluye 3 testimonios de clientes y una sección de Preguntas Frecuentes.",
              "Automatiza tu agenda: Sistema de reservas en línea para que tus clientes agenden fácilmente.",
              "Mejora tu contenido: Blog optimizado y un banner principal personalizado para destacar tu marca.",
              "Organización profesional: Gestión de entregables y documentos de forma estructurada."
            ],
            highlight: true
          },
          {
            id: "3",
            name: "Premium",
            price: "15,499.00 MXN",
            originalPrice: "",
            discountPercentage: 0,
            isPromotion: false,
            description: "Ten el control total de tu stock para que nunca te quedes sin productos.",
            features: [
              "E-commerce completo: Tienda en línea para hasta 30 productos con categorías y gestión de inventario.",
              "Pagos seguros: Integración con Stripe para recibir pagos en línea.",
              "Marketing avanzado: Herramientas de comunicación y marketing digital para atraer y retener clientes.",
              "Análisis y crecimiento: Reportes de actividad web y una sección de servicios premium para monetizar más tu oferta."
            ],
            highlight: false
          }
        ]
      }
    };
  }, [config]);

  const getIconComponent = useCallback((iconType: string = "rocket") => {
    const iconMap: { [key: string]: JSX.Element } = {
      rocket: <Rocket />,
      users: <Users />,
      target: <Target />,
      star: <Star />,
    };
    return iconMap[iconType] || <Rocket />;
  }, []);

  const fallbackColors = ["#2563EB", "#25D366", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

  if (configLoading || sectionsLoading || testimonialsLoading) {
    return <PageLoader message="Cargando contenido del sitio..." />;
  }

  return (
    <div
      key={location} // fuerza remount al cambiar de ruta
      className="min-h-screen bg-background overflow-x-hidden"
      style={{
        backgroundColor: appearance.backgroundColor || "inherit",
        color: appearance.textColor || "inherit",
        fontFamily: appearance.fontFamily || "inherit",
      }}
    >
      <SEOHead
        title={appearance.metaTitle || appearance.brandName}
        description={appearance.metaDescription}
        image={appearance.ogImage}
      />
      <Navbar />

      {/* Hero */}
      <AnimatedSection>
        <section
          className="relative py-20 text-white navbar-fixed-body"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1516331138075-f3adc1e149cd?q=80&w=1208&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            fontFamily: appearance.fontFamily || "inherit",
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              {frontpage?.contenidos?.titulo || appearance.brandName || "Bienvenido a Nuestro Sistema"}
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              {frontpage?.contenidos?.subtitulo || appearance.tagline || "Calidad y Servicio a tu Alcance"}
            </p>
            <div className="space-x-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">Contáctanos</Link>
              </Button>
              {modules.tienda?.activo && (
                <Button variant="ghost" className="text-white hover:bg-white hover:text-black border border-white">
                  <Link href="/store">Ver Tienda</Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </AnimatedSection>


      {/* Planes - Solo mostrar si el módulo está activo */}
      {modules.planes?.activo === true && pagesContent.plans && pagesContent.plans.length > 0 && (
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {pagesContent.plans?.map((plan: any) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* Dynamic Sections */}
      {sections?.filter(s => s.isActive).map((section, index) => {
        const sectionConfig = (section as any).config || {};
        const alternatingConfig = sectionConfig.alternating || {};
        return (
          <AlternatingSection
            key={section.id}
            reverse={alternatingConfig.forceReverse ?? index % 2 === 1}
            icon={alternatingConfig.showDecorative !== false ? getIconComponent(alternatingConfig.iconType) : undefined}
            background={alternatingConfig.backgroundColor || fallbackColors[index % fallbackColors.length]}
            image={alternatingConfig.backgroundImage}
            hideOnMobile={alternatingConfig.hideOnMobile || false}
            delay={0.8 + index * 0.2}
          >
            {isSuperuser ? (
              <>
                <InlineEditor
                  value={section.name || ""}
                  onSave={newValue => updateSectionMutation.mutate({ id: section.id, data: { name: newValue } })}
                  placeholder="Nombre de la sección..."
                  className="text-3xl font-bold mb-4 block"
                  tag="h2"
                  style={{ color: appearance.textColor, fontFamily: appearance.fontFamily }}
                />
                <InlineTextarea
                  value={section.content || ""}
                  onSave={newValue => updateSectionMutation.mutate({ id: section.id, data: { content: newValue } })}
                  placeholder="Contenido de la sección..."
                  className="text-lg mb-6 opacity-80"
                  style={{ color: appearance.textColor, fontFamily: appearance.fontFamily }}
                  rows={4}
                />
              </>
            ) : (
              <>
                {section.name && (
                  <h2 className="text-3xl font-bold mb-4" style={{ color: appearance.textColor, fontFamily: appearance.fontFamily }}>
                    {section.name}
                  </h2>
                )}
                {section.content && (
                  <p className="text-lg mb-6 opacity-80" style={{ color: appearance.textColor, fontFamily: appearance.fontFamily }}>
                    {section.content}
                  </p>
                )}
              </>
            )}
          </AlternatingSection>
        );
      })}

      {/* Testimonials */}
      <AnimatedSection delay={0.2}>
        <section className="py-16" style={{ backgroundColor: appearance.backgroundColor ? `${appearance.backgroundColor}20` : "var(--muted)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" style={{ color: appearance.textColor || "#111", fontFamily: appearance.fontFamily || "sans-serif" }}>
                Lo que Dicen Nuestros Clientes
              </h2>
              <p className="text-lg opacity-80" style={{ color: appearance.textColor || "#444", fontFamily: appearance.fontFamily || "sans-serif" }}>
                Testimonios reales de clientes satisfechos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials?.filter(t => t.isApproved).length ? (
                testimonials.filter(t => t.isApproved).map(testimonial => (
                  <Card
                    key={testimonial.id}
                    className="h-full border rounded-xl shadow-sm"
                    style={{
                      backgroundColor: appearance.backgroundColor ? `${appearance.backgroundColor}10` : "#fff",
                      borderColor: appearance.primaryColor ? `${appearance.primaryColor}30` : "#e2e8f0",
                    }}
                  >
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center mb-4">
                        {[...Array(testimonial.rating ?? 5)].map((_, i) => <span key={i} className="text-yellow-400 text-xl">★</span>)}
                        {[...Array(5 - (testimonial.rating ?? 5))].map((_, i) => <span key={i} className="text-gray-300 text-xl">★</span>)}
                      </div>
                      <blockquote className="mb-4 flex-grow opacity-90" style={{ color: appearance.textColor || "#111", fontFamily: appearance.fontFamily || "sans-serif" }}>
                        "{testimonial.content}"
                      </blockquote>
                      <div className="text-sm font-semibold mt-auto" style={{ color: appearance.textColor || "#111", fontFamily: appearance.fontFamily || "sans-serif" }}>
                        {testimonial.name}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-1 md:col-span-3 text-center py-16">
                  <CardContent>
                    <p className="text-gray-600 text-lg">Aún no hay testimonios. ¡Sé el primero en compartir tu experiencia!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </AnimatedSection>

      <Footer />
    </div>
  );
}

export default Home;

