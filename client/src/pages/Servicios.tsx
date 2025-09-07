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

const services = [
  {
    title: "Desarrollo Web a Medida",
    description: "Creamos sitios web modernos y escalables.",
    icon: <Rocket className="h-8 w-8 text-blue-600" />,
  },
  {
    title: "Marketing Digital",
    description: "Estrategias para atraer clientes y crecer en línea.",
    icon: <Target className="h-8 w-8 text-green-600" />,
  },
  {
    title: "Consultoría Tecnológica",
    description: "Acompañamos a tu empresa en su transformación digital.",
    icon: <Users className="h-8 w-8 text-purple-600" />,
  },
];

const plans = [
  {
    name: "Esencial",
    price: "6,499 MXN",
    description: "Atrae nuevos clientes con un blog profesional que genera contenido de valor.",
    features: [
      "Diseño a medida: Apariencia profesional con tu logo, colores y tipografía.",
      "Contenido clave: 3 secciones principales (Inicio, Servicios, Contacto), con un blog y 3 servicios listados.",
      "Módulo de contacto",
      "Conexión directa: Formulario de contacto, integración con redes sociales y botón de WhatsApp.",
      'Detalles profesionales: Correo corporativo y una sección de "Conócenos" para generar confianza.',
    ],
    highlight: false,
  },
  {
    name: "Profesional",
    price: "9,499 MXN",
    description: "Un sitio web que se ve y funciona perfectamente en cualquier dispositivo, garantizando una experiencia de usuario ideal.",
    features: [
      "Construye confianza: Incluye 3 testimonios de clientes y una sección de Preguntas Frecuentes.",
      "Automatiza tu agenda: Sistema de reservas en línea para que tus clientes agenden fácilmente.",
      "Mejora tu contenido: Blog optimizado y un banner principal personalizado para destacar tu marca.",
      "Organización profesional: Gestión de entregables y documentos de forma estructurada.",
    ],
    highlight: true,
  },
  {
    name: "Premium",
    price: "15,499 MXN",
    description: "Ten el control total de tu stock para que nunca te quedes sin productos.",
    features: [
      "E-commerce completo: Tienda en línea para hasta 30 productos con categorías y gestión de inventario.",
      "Pagos seguros: Integración con Stripe para recibir pagos en línea.",
      "Marketing avanzado: Herramientas de comunicación y marketing digital para atraer y retener clientes.",
      "Análisis y crecimiento: Reportes de actividad web y una sección de servicios premium para monetizar más tu oferta.",
    ],
    highlight: false,
  },
];

const PlanCard = ({ plan }: { plan: typeof plans[0] }) => {
  const WHATSAPP_NUMBER = "525512345678";
  const message = encodeURIComponent(
    `Hola, me interesa más información sobre sus servicios.`
  );

  const whatsappLink = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${message}`;

  const priceValue = parseInt(plan.price.replace(/\D/g, ""));
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

        <h3 className="text-2xl font-bold mb-2 text-center text-gray-800">{plan.name}</h3>
        <p className="text-gray-500 mb-4 text-center">{plan.description}</p>

        <div className="text-center mb-6">
          {oldPrice && <span className="text-gray-400 line-through mr-2 text-lg">${oldPrice}</span>}
          <br />  
          <span className="text-4xl font-extrabold text-blue-600">${plan.price}</span>
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
  const { appearance } = useMemo(() => {
    const configData = config?.config as any;
    return { appearance: configData?.appearance || {} };
  }, [config]);

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
            backgroundImage: `url("/imgs/bg.png")`,
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {services.map((s, i) => (
                <AnimatedSection key={i} delay={0.1 * i}>
                  <div className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-xl transition duration-300">
                    <div className="flex justify-center mb-4">{s.icon}</div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">{s.title}</h3>
                    <p className="text-gray-600">{s.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, i) => (
                <PlanCard key={i} plan={plan} />
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      <Footer />
    </div>
  );
}

export default React.memo(Servicios);
