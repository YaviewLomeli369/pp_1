
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/AnimatedSection";
import { ArrowRight, Heart, Target, Eye, Users, Award, Zap } from "lucide-react";
import type { PageContent } from "@shared/schema";

export default function Conocenos() {
  const { data: contents = [], isLoading } = useQuery<PageContent[]>({
    queryKey: ["/api/page-contents/conocenos"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }

  // Group contents by section
  const groupedContents = contents
    .filter(content => content.isActive)
    .reduce((acc, content) => {
      if (!acc[content.sectionKey]) {
        acc[content.sectionKey] = [];
      }
      acc[content.sectionKey].push(content);
      return acc;
    }, {} as Record<string, PageContent[]>);

  // Get content by section and order
  const getContentBySection = (sectionKey: string, order: number = 0) => {
    return groupedContents[sectionKey]?.find(content => content.order === order);
  };

  const heroContent = getContentBySection("hero", 0);
  const missionContent = getContentBySection("mission", 0);
  const visionContent = getContentBySection("vision", 0);
  const valuesContent = getContentBySection("values", 0);
  const teamContent = getContentBySection("team", 0);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-primary/5 via-white to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                {heroContent?.title || "Conócenos"}
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {heroContent?.content || "Conoce más sobre nuestro equipo y misión"}
              </p>
              <Button size="lg" className="px-8 py-3 text-lg">
                Contáctanos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mission */}
            <AnimatedSection delay={0.1}>
              <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">
                    {missionContent?.title || "Nuestra Misión"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {missionContent?.content || "Brindar soluciones digitales que impulsen el crecimiento de nuestros clientes"}
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Vision */}
            <AnimatedSection delay={0.2}>
              <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">
                    {visionContent?.title || "Nuestra Visión"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {visionContent?.content || "Ser líderes en transformación digital para empresas en crecimiento"}
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Values */}
            <AnimatedSection delay={0.3}>
              <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">
                    {valuesContent?.title || "Nuestros Valores"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {valuesContent?.content || "Innovación, compromiso, transparencia y excelencia en todo lo que hacemos"}
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {teamContent?.title || "Nuestro Equipo"}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {teamContent?.content || "Un equipo comprometido con tu éxito"}
              </p>
            </div>
          </AnimatedSection>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <AnimatedSection delay={0.1}>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">50+</div>
                <div className="text-gray-600">Proyectos Completados</div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">5+</div>
                <div className="text-gray-600">Años de Experiencia</div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">100%</div>
                <div className="text-gray-600">Satisfacción del Cliente</div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                ¿Por Qué Elegirnos?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Nos diferenciamos por nuestro compromiso con la calidad y la innovación
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatedSection delay={0.1}>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Innovación Constante</h3>
                <p className="text-gray-600">
                  Utilizamos las últimas tecnologías para crear soluciones modernas y eficientes
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Enfoque Personal</h3>
                <p className="text-gray-600">
                  Cada proyecto es único y lo tratamos con la atención personalizada que merece
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Calidad Garantizada</h3>
                <p className="text-gray-600">
                  Nuestro compromiso con la excelencia garantiza resultados de alta calidad
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Quieres conocer más sobre nosotros?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Contáctanos y descubre cómo podemos ayudarte a alcanzar tus objetivos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" className="px-8 py-3 text-lg">
                Contactar Ahora
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-white text-white hover:bg-white hover:text-primary">
                Ver Portfolio
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
