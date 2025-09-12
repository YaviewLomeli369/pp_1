import React, { useMemo } from "react";
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



const PlanCard = ({ plan }: { plan: typeof plans[0] }) => {
  const WHATSAPP_NUMBER = "525512345678";
  const message = encodeURIComponent(
    `Hola, me interesa más información sobre sus servicios.`
  );

  const whatsappLink = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${message}`;

  // Check if it's a valid promotion
  const isValidPromotion = plan.isPromotion && 
                          plan.originalPrice && 
                          plan.originalPrice.trim() !== '' &&
                          plan.discountPercentage > 0;

  // Calculate prices
  const currentPriceNum = parseInt(plan.price.replace(/\D/g, "")) || 0;
  const originalPriceNum = plan.originalPrice ? parseInt(plan.originalPrice.replace(/\D/g, "")) : 0;
  
  // For promotions, show the calculated discounted price, otherwise show the current price
  const displayPrice = isValidPromotion && originalPriceNum > 0
    ? (originalPriceNum * (1 - plan.discountPercentage / 100)).toLocaleString()
    : currentPriceNum.toLocaleString();

  // Show original price (crossed out) only if it's a valid promotion
  const displayOriginalPrice = isValidPromotion && originalPriceNum > 0
    ? originalPriceNum.toLocaleString()
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
  const { data: config, isLoading } = useQuery<SiteConfig>({ queryKey: ["/api/config"] });
  const { appearance, pagesContent, modules } = useMemo(() => {
    const configData = config?.config as any;
    return {
      appearance: configData?.appearance || {},
      modules: configData?.frontpage?.modulos || {},
      pagesContent: configData?.pagesContent?.servicios || {
        hero: {
          title: "Servicios Digitales para Impulsar tu Negocio",
          subtitle: "Diseño, SEO y soporte para que tu marca brille en internet.",
          backgroundImage: "https://images.unsplash.com/photo-1516331138075-f3adc1e149cd?q=80&w=1208&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        services: [
          {
            id: "1",
            title: "Desarrollo Web a Medida",
            description: "Creamos sitios web modernos y escalables.",
            icon: "Rocket",
            color: "blue"
          },
          {
            id: "2",
            title: "Marketing Digital",
            description: "Estrategias para atraer clientes y crecer en línea.",
            icon: "Target",
            color: "green"
          },
          {
            id: "3",
            title: "Consultoría Tecnológica",
            description: "Acompañamos a tu empresa en su transformación digital.",
            icon: "Users",
            color: "purple"
          }
        ],
        plans: [
          {
            id: "1",
            name: "Esencial",
            price: "6,499 MXN",
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
            price: "7,599 MXN",
            originalPrice: "9,499 MXN",
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
            price: "15,499 MXN",
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

  const getIconComponent = (iconName: string, className: string) => {
    switch (iconName) {
      case "Rocket": return <Rocket className={className} />;
      case "Target": return <Target className={className} />;
      case "Users": return <Users className={className} />;
      default: return <Rocket className={className} />;
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case "blue": return "text-blue-600";
      case "green": return "text-green-600";
      case "purple": return "text-purple-600";
      default: return "text-blue-600";
    }
  };

  if (isLoading) return <PageLoader message="Cargando servicios..." />;

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
            backgroundImage: `url("${pagesContent.hero?.backgroundImage}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="relative max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              {pagesContent.hero?.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8">
              {pagesContent.hero?.subtitle}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {pagesContent.services?.map((service: any, i: number) => (
                <AnimatedSection key={service.id} delay={0.1 * i}>
                  <div className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-xl transition duration-300">
                    <div className="flex justify-center mb-4">
                      {getIconComponent(service.icon, `h-8 w-8 ${getColorClass(service.color)}`)}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">{service.title}</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                </AnimatedSection>
              ))}
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

      <Footer />
    </div>
  );
}

export default React.memo(Servicios);