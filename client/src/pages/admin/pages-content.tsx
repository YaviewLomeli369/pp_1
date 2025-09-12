
import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, FileText, Users, Briefcase } from "lucide-react";
import type { SiteConfig } from "@shared/schema";

interface PageContent {
  id: string;
  title: string;
  content: string;
  type: string;
  order?: number;
  isActive?: boolean;
  metadata?: any;
}

function PagesContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showContentForm, setShowContentForm] = useState(false);
  const [selectedContent, setSelectedContent] = useState<PageContent | null>(null);
  const [selectedPage, setSelectedPage] = useState<"servicios" | "conocenos">("servicios");

  const { data: config } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
  });

  const pagesContent = useMemo(() => {
    const configData = config?.config as any;
    return {
      servicios: configData?.pagesContent?.servicios || {
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
            price: "9,499 MXN",
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
      },
      conocenos: configData?.pagesContent?.conocenos || {
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

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: any) => {
      const response = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: newConfig }),
      });
      if (!response.ok) throw new Error("Failed to update config");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({
        title: "Contenido actualizado",
        description: "Los cambios se han guardado correctamente",
      });
      setShowContentForm(false);
      setSelectedContent(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el contenido",
      });
    },
  });

  const handleSaveContent = (formData: FormData) => {
    const configData = config?.config as any;
    const newConfig = { ...configData };
    
    if (!newConfig.pagesContent) {
      newConfig.pagesContent = {};
    }
    if (!newConfig.pagesContent[selectedPage]) {
      newConfig.pagesContent[selectedPage] = pagesContent[selectedPage];
    }

    const contentData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      content: formData.get("content") as string,
      metadata: JSON.parse((formData.get("metadata") as string) || "{}"),
    };

    // Update specific content based on context
    if (selectedContent) {
      // Update existing content logic here
      const contentType = selectedContent.type;
      if (contentType === "hero") {
        newConfig.pagesContent[selectedPage].hero = {
          ...newConfig.pagesContent[selectedPage].hero,
          ...contentData
        };
      }
      // Add more content type handling as needed
    }

    updateConfigMutation.mutate(newConfig);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contenido de Páginas</h1>
            <p className="text-gray-600">Gestiona el contenido de las páginas Servicios y Conócenos</p>
          </div>
        </div>

        <Tabs value={selectedPage} onValueChange={(value) => setSelectedPage(value as "servicios" | "conocenos")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="servicios" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Servicios
            </TabsTrigger>
            <TabsTrigger value="conocenos" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Conócenos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="servicios" className="space-y-6">
            <div className="grid gap-6">
              {/* Hero Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Sección Hero
                  </CardTitle>
                  <CardDescription>
                    Contenido principal de la página de servicios
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Título</Label>
                    <p className="text-sm text-gray-600">{pagesContent.servicios.hero?.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Subtítulo</Label>
                    <p className="text-sm text-gray-600">{pagesContent.servicios.hero?.subtitle}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedContent({
                        id: "hero",
                        title: pagesContent.servicios.hero?.title || "",
                        content: pagesContent.servicios.hero?.subtitle || "",
                        type: "hero"
                      });
                      setShowContentForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Hero
                  </Button>
                </CardContent>
              </Card>

              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Servicios</CardTitle>
                  <CardDescription>Lista de servicios ofrecidos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {pagesContent.servicios.services?.map((service: any, index: number) => (
                      <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{service.title}</h4>
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedContent({
                              id: service.id,
                              title: service.title,
                              content: service.description,
                              type: "service"
                            });
                            setShowContentForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Plans */}
              <Card>
                <CardHeader>
                  <CardTitle>Planes</CardTitle>
                  <CardDescription>Planes de servicio disponibles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {pagesContent.servicios.plans?.map((plan: any) => (
                      <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{plan.name} - {plan.price}</h4>
                          <p className="text-sm text-gray-600">{plan.description}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedContent({
                              id: plan.id,
                              title: plan.name,
                              content: plan.description,
                              type: "plan"
                            });
                            setShowContentForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="conocenos" className="space-y-6">
            <div className="grid gap-6">
              {/* Hero Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Sección Hero
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Título</Label>
                    <p className="text-sm text-gray-600">{pagesContent.conocenos.hero?.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Subtítulo</Label>
                    <p className="text-sm text-gray-600">{pagesContent.conocenos.hero?.subtitle}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedContent({
                        id: "hero",
                        title: pagesContent.conocenos.hero?.title || "",
                        content: pagesContent.conocenos.hero?.subtitle || "",
                        type: "hero"
                      });
                      setShowContentForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Hero
                  </Button>
                </CardContent>
              </Card>

              {/* Values */}
              <Card>
                <CardHeader>
                  <CardTitle>Valores</CardTitle>
                  <CardDescription>Misión, visión y valores de la empresa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {pagesContent.conocenos.values?.map((value: any) => (
                      <div key={value.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{value.title}</h4>
                          <p className="text-sm text-gray-600">{value.description}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedContent({
                              id: value.id,
                              title: value.title,
                              content: value.description,
                              type: "value"
                            });
                            setShowContentForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Team */}
              <Card>
                <CardHeader>
                  <CardTitle>Equipo</CardTitle>
                  <CardDescription>Miembros del equipo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {pagesContent.conocenos.team?.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{member.name} - {member.position}</h4>
                          <p className="text-sm text-gray-600">{member.quote}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedContent({
                              id: member.id,
                              title: member.name,
                              content: member.quote,
                              type: "team"
                            });
                            setShowContentForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Content Dialog */}
        <Dialog open={showContentForm} onOpenChange={setShowContentForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Editar Contenido - {selectedContent?.type}
              </DialogTitle>
              <DialogDescription>
                Modifica el contenido de la sección seleccionada
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveContent(new FormData(e.currentTarget));
            }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={selectedContent?.title}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="content">Contenido</Label>
                  <Textarea
                    id="content"
                    name="content"
                    defaultValue={selectedContent?.content}
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="metadata">Metadatos (JSON)</Label>
                  <Textarea
                    id="metadata"
                    name="metadata"
                    placeholder='{"color": "blue", "icon": "Target"}'
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowContentForm(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateConfigMutation.isPending}>
                  {updateConfigMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

export default PagesContent;
