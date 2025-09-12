import React, { useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SEOHead } from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Star, User, Phone, Mail, Quote } from "lucide-react"; 
import AnimatedSection from "@/components/AnimatedSection";
import { InlineEditor } from "@/components/inline-editor/InlineEditor";
import { InlineTextarea } from "@/components/inline-editor/InlineTextarea";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import type { SiteConfig } from "@shared/schema";

function Conocenos() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isSuperuser = user?.role === 'superuser';

  const { data: config } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
  });

  // Mutation for updating config
  const updateConfigMutation = useMutation({
    mutationFn: async (updates: any) => {
      return apiRequest("/api/config", {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
    },
  });

  const { appearance, pagesContent } = useMemo(() => {
    const configData = config?.config as any;
    return {
      appearance: configData?.appearance || {},
      pagesContent: configData?.pagesContent?.conocenos || {
        hero: {
          title: "Conócenos",
          subtitle: "Somos un equipo comprometido con el crecimiento de tu negocio.",
          backgroundImage: "https://images.unsplash.com/photo-1516331138075-f3adc1e149cd?q=80&w=1208&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        values: [
          {
            id: "1",
            title: "Nuestra Misión",
            description: "Brindar soluciones digitales accesibles y de alto impacto.",
            icon: "Target",
            color: "blue"
          },
          {
            id: "2",
            title: "Nuestra Visión", 
            description: "Ser líderes en innovación tecnológica para PYMES en LATAM.",
            icon: "Eye",
            color: "indigo"
          },
          {
            id: "3",
            title: "Nuestros Valores",
            description: "Innovación, compromiso, transparencia.",
            icon: "Star", 
            color: "purple"
          }
        ],
        team: [
          {
            id: "1",
            name: "Juan Pérez",
            position: "CEO",
            quote: "La innovación es nuestro motor.",
            phone: "+52 55 9999 8888",
            email: "juan@novadigital.com",
            image: "https://via.placeholder.com/200"
          },
          {
            id: "2",
            name: "Ana Torres", 
            position: "Directora de Marketing",
            quote: "Las ideas valen cuando se ejecutan.",
            phone: "",
            email: "ana@novadigital.com",
            image: "https://via.placeholder.com/200"
          }
        ]
      }
    };
  }, [config]);

  const getIconComponent = (iconName: string, className: string) => {
    switch (iconName) {
      case "Target": return <Target className={className} />;
      case "Eye": return <Eye className={className} />;
      case "Star": return <Star className={className} />;
      default: return <Target className={className} />;
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case "blue": return "text-blue-600";
      case "indigo": return "text-indigo-600";
      case "purple": return "text-purple-600";
      default: return "text-blue-600";
    }
  };

  // Update functions for inline editing
  const updateHeroTitle = useCallback(async (newValue: string) => {
    if (!isSuperuser) throw new Error("Only superusers can edit");
    const updates = {
      config: {
        ...config?.config,
        pagesContent: {
          ...config?.config?.pagesContent,
          conocenos: {
            ...pagesContent,
            hero: {
              ...pagesContent.hero,
              title: newValue
            }
          }
        }
      }
    };
    await updateConfigMutation.mutateAsync(updates);
  }, [config, pagesContent, updateConfigMutation, isSuperuser]);

  const updateHeroSubtitle = useCallback(async (newValue: string) => {
    if (!isSuperuser) throw new Error("Only superusers can edit");
    const updates = {
      config: {
        ...config?.config,
        pagesContent: {
          ...config?.config?.pagesContent,
          conocenos: {
            ...pagesContent,
            hero: {
              ...pagesContent.hero,
              subtitle: newValue
            }
          }
        }
      }
    };
    await updateConfigMutation.mutateAsync(updates);
  }, [config, pagesContent, updateConfigMutation, isSuperuser]);

  const updateValueTitle = useCallback(async (valueId: string, newValue: string) => {
    if (!isSuperuser) throw new Error("Only superusers can edit");
    const updatedValues = pagesContent.values?.map((value: any) => 
      value.id === valueId ? { ...value, title: newValue } : value
    );
    const updates = {
      config: {
        ...config?.config,
        pagesContent: {
          ...config?.config?.pagesContent,
          conocenos: {
            ...pagesContent,
            values: updatedValues
          }
        }
      }
    };
    await updateConfigMutation.mutateAsync(updates);
  }, [config, pagesContent, updateConfigMutation, isSuperuser]);

  const updateValueDescription = useCallback(async (valueId: string, newValue: string) => {
    if (!isSuperuser) throw new Error("Only superusers can edit");
    const updatedValues = pagesContent.values?.map((value: any) => 
      value.id === valueId ? { ...value, description: newValue } : value
    );
    const updates = {
      config: {
        ...config?.config,
        pagesContent: {
          ...config?.config?.pagesContent,
          conocenos: {
            ...pagesContent,
            values: updatedValues
          }
        }
      }
    };
    await updateConfigMutation.mutateAsync(updates);
  }, [config, pagesContent, updateConfigMutation, isSuperuser]);

  const updateTeamMemberName = useCallback(async (memberId: string, newValue: string) => {
    if (!isSuperuser) throw new Error("Only superusers can edit");
    const updatedTeam = pagesContent.team?.map((member: any) => 
      member.id === memberId ? { ...member, name: newValue } : member
    );
    const updates = {
      config: {
        ...config?.config,
        pagesContent: {
          ...config?.config?.pagesContent,
          conocenos: {
            ...pagesContent,
            team: updatedTeam
          }
        }
      }
    };
    await updateConfigMutation.mutateAsync(updates);
  }, [config, pagesContent, updateConfigMutation, isSuperuser]);

  const updateTeamMemberPosition = useCallback(async (memberId: string, newValue: string) => {
    if (!isSuperuser) throw new Error("Only superusers can edit");
    const updatedTeam = pagesContent.team?.map((member: any) => 
      member.id === memberId ? { ...member, position: newValue } : member
    );
    const updates = {
      config: {
        ...config?.config,
        pagesContent: {
          ...config?.config?.pagesContent,
          conocenos: {
            ...pagesContent,
            team: updatedTeam
          }
        }
      }
    };
    await updateConfigMutation.mutateAsync(updates);
  }, [config, pagesContent, updateConfigMutation, isSuperuser]);

  const updateTeamMemberQuote = useCallback(async (memberId: string, newValue: string) => {
    if (!isSuperuser) throw new Error("Only superusers can edit");
    const updatedTeam = pagesContent.team?.map((member: any) => 
      member.id === memberId ? { ...member, quote: newValue } : member
    );
    const updates = {
      config: {
        ...config?.config,
        pagesContent: {
          ...config?.config?.pagesContent,
          conocenos: {
            ...pagesContent,
            team: updatedTeam
          }
        }
      }
    };
    await updateConfigMutation.mutateAsync(updates);
  }, [config, pagesContent, updateConfigMutation, isSuperuser]);

  return (
    <div 
      className="min-h-screen bg-background flex flex-col"
      style={{
        backgroundColor: appearance.backgroundColor || "inherit",
        color: appearance.textColor || "inherit",
        fontFamily: appearance.fontFamily || "inherit",
      }}
    >
      <SEOHead
        title="Conócenos"
        description="Descubre quiénes somos, nuestra misión, visión y valores."
      />
      <Navbar />

      {/* Hero principal */}
      <AnimatedSection>
        <section
          className="relative py-24 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white text-center shadow-lg navbar-fixed-body"
          style={{
            backgroundImage: `url("${pagesContent.hero?.backgroundImage}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Contenido */}
          <div className="relative max-w-4xl mx-auto px-4">
            {isSuperuser ? (
              <InlineEditor
                value={pagesContent.hero?.title || "Conócenos"}
                onSave={updateHeroTitle}
                tag="h1"
                className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight"
              />
            ) : (
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
                {pagesContent.hero?.title}
              </h1>
            )}
            {isSuperuser ? (
              <InlineTextarea
                value={pagesContent.hero?.subtitle || "Somos un equipo comprometido con el crecimiento de tu negocio."}
                onSave={updateHeroSubtitle}
                className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-gray-100"
              />
            ) : (
              <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-gray-100">
                {pagesContent.hero?.subtitle}
              </p>
            )}
          </div>
        </section>
      </AnimatedSection>


      {/* Sección principal */}
      <AnimatedSection delay={0.1}>
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
            {pagesContent.values?.map((value: any, i: number) => (
              <AnimatedSection key={value.id} delay={0.2 + (i * 0.1)}>
                <Card className="group relative overflow-hidden rounded-3xl border border-gray-200 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className={`absolute inset-0 bg-gradient-to-br from-${value.color}-500/10 to-${value.color === 'blue' ? 'indigo' : value.color === 'indigo' ? 'purple' : 'pink'}-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <CardContent className="relative p-10 text-center">
                    {getIconComponent(value.icon, `w-12 h-12 mx-auto mb-6 ${getColorClass(value.color)} group-hover:scale-110 transition-transform duration-300`)}
                    {isSuperuser ? (
                      <InlineEditor
                        value={value.title}
                        onSave={(newValue) => updateValueTitle(value.id, newValue)}
                        tag="h3"
                        className="text-2xl font-bold mb-3 text-gray-800"
                      />
                    ) : (
                      <h3 className="text-2xl font-bold mb-3 text-gray-800">{value.title}</h3>
                    )}
                    <div className={`w-12 h-1 bg-${value.color === 'indigo' ? 'indigo' : value.color}-600 mx-auto mb-4 rounded-full`} />
                    {isSuperuser ? (
                      <InlineTextarea
                        value={value.description}
                        onSave={(newValue) => updateValueDescription(value.id, newValue)}
                        className="text-gray-600 leading-relaxed"
                      />
                    ) : (
                      <p className="text-gray-600 leading-relaxed">
                        {value.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* Equipo */}
      <AnimatedSection delay={0.5}>
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-extrabold mb-6 text-gray-800">Nuestro Equipo</h2>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Detrás de cada proyecto hay personas apasionadas, listas para ayudarte a crecer.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
              {pagesContent.team?.map((member: any, i: number) => (
                <AnimatedSection key={member.id} delay={0.6 + (i * 0.1)}>
                  <Card className="group relative overflow-hidden rounded-3xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                    <CardContent className="p-8 text-center">
                      <div className="relative w-32 h-32 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 p-1">
                          <img
                            src={member.image}
                            alt="Miembro del equipo"
                            className="rounded-full object-cover w-full h-full border-4 border-white shadow-md"
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                          <div className="flex items-center justify-center w-full h-full rounded-full bg-white">
                            <User className="h-16 w-16 text-gray-400" />
                          </div>
                        </div>
                      </div>
                      {isSuperuser ? (
                        <InlineEditor
                          value={member.name}
                          onSave={(newValue) => updateTeamMemberName(member.id, newValue)}
                          tag="h4"
                          className="font-semibold text-xl text-gray-800"
                        />
                      ) : (
                        <h4 className="font-semibold text-xl text-gray-800">{member.name}</h4>
                      )}
                      {isSuperuser ? (
                        <InlineEditor
                          value={member.position}
                          onSave={(newValue) => updateTeamMemberPosition(member.id, newValue)}
                          tag="p"
                          className="text-sm text-gray-500 mb-4"
                        />
                      ) : (
                        <p className="text-sm text-gray-500 mb-4">{member.position}</p>
                      )}
                      <div className="italic text-gray-600 mb-4 flex items-center justify-center gap-2">
                        <Quote className="h-4 w-4 text-blue-500" />
                        {isSuperuser ? (
                          <InlineEditor
                            value={member.quote}
                            onSave={(newValue) => updateTeamMemberQuote(member.id, newValue)}
                            tag="span"
                            className="italic"
                          />
                        ) : (
                          <span>"{member.quote}"</span>
                        )}
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        {member.phone && (
                          <div className="flex items-center justify-center gap-2">
                            <Phone className="h-4 w-4 text-green-600" />
                            <a href={`tel:${member.phone}`} className="hover:underline">
                              {member.phone}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <a href={`mailto:${member.email}`} className="hover:underline">
                            {member.email}
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      <Footer />
    </div>
  );
}

export default Conocenos;
