
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Palette, 
  Eye, 
  Download, 
  Upload, 
  Wand2, 
  Save,
  Monitor,
  Smartphone,
  Tablet,
  Check,
  Star,
  Zap,
  Briefcase,
  Heart,
  Leaf,
  Sun,
  Moon,
  Coffee,
  Gem
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { SiteConfig } from "@shared/schema";

// Definición de temas profesionales del mercado
const PROFESSIONAL_THEMES = {
  modern: {
    id: "modern",
    name: "Modern Business",
    category: "Business",
    icon: Briefcase,
    description: "Diseño limpio y moderno para empresas profesionales",
    preview: "/imgs/themes/modern-preview.jpg",
    isPremium: false,
    popularity: 95,
    config: {
      appearance: {
        primaryColor: "#2563EB",
        secondaryColor: "#10B981",
        accentColor: "#F59E0B",
        backgroundColor: "#FFFFFF",
        textColor: "#111827",
        linkColor: "#2563EB",
        fontFamily: "Inter",
        fontSize: "16",
        lineHeight: "1.6",
        headingFont: "Inter",
        containerWidth: "1200",
        headerHeight: "80",
        footerStyle: "standard",
        heroBackgroundType: "gradient",
        heroGradientType: "linear",
        heroGradientDirection: "to right",
        heroGradientColor1: "#2563EB",
        heroGradientColor2: "#1E40AF",
        heroOverlayOpacity: 40
      },
      components: {
        navbar: {
          style: "modern",
          transparent: true,
          shadow: "subtle"
        },
        cards: {
          borderRadius: "12px",
          shadow: "medium",
          padding: "24px"
        },
        buttons: {
          borderRadius: "8px",
          style: "filled"
        }
      }
    }
  },
  
  minimal: {
    id: "minimal",
    name: "Minimal Clean",
    category: "Clean",
    icon: Sun,
    description: "Diseño minimalista y elegante con espacios en blanco",
    preview: "/imgs/themes/minimal-preview.jpg",
    isPremium: false,
    popularity: 88,
    config: {
      appearance: {
        primaryColor: "#000000",
        secondaryColor: "#6B7280",
        accentColor: "#EF4444",
        backgroundColor: "#FFFFFF",
        textColor: "#111827",
        linkColor: "#000000",
        fontFamily: "Helvetica Neue",
        fontSize: "16",
        lineHeight: "1.7",
        headingFont: "Helvetica Neue",
        containerWidth: "1100",
        headerHeight: "70",
        footerStyle: "minimal",
        heroBackgroundType: "image",
        heroBackgroundImage: "",
        heroOverlayOpacity: 0
      },
      components: {
        navbar: {
          style: "minimal",
          transparent: false,
          shadow: "none"
        },
        cards: {
          borderRadius: "0px",
          shadow: "none",
          padding: "32px"
        },
        buttons: {
          borderRadius: "0px",
          style: "outlined"
        }
      }
    }
  },

  corporate: {
    id: "corporate",
    name: "Corporate Pro",
    category: "Business",
    icon: Briefcase,
    description: "Tema corporativo profesional para grandes empresas",
    preview: "/imgs/themes/corporate-preview.jpg",
    isPremium: true,
    popularity: 82,
    config: {
      appearance: {
        primaryColor: "#1E3A8A",
        secondaryColor: "#374151",
        accentColor: "#DC2626",
        backgroundColor: "#F9FAFB",
        textColor: "#374151",
        linkColor: "#1E3A8A",
        fontFamily: "Georgia",
        fontSize: "16",
        lineHeight: "1.6",
        headingFont: "Georgia",
        containerWidth: "1280",
        headerHeight: "90",
        footerStyle: "extended",
        heroBackgroundType: "gradient",
        heroGradientType: "linear",
        heroGradientDirection: "45deg",
        heroGradientColor1: "#1E3A8A",
        heroGradientColor2: "#3730A3",
        heroOverlayOpacity: 60
      }
    }
  },

  creative: {
    id: "creative",
    name: "Creative Studio",
    category: "Creative",
    icon: Palette,
    description: "Diseño vibrante y creativo para agencias y estudios",
    preview: "/imgs/themes/creative-preview.jpg",
    isPremium: false,
    popularity: 76,
    config: {
      appearance: {
        primaryColor: "#8B5CF6",
        secondaryColor: "#EC4899",
        accentColor: "#F59E0B",
        backgroundColor: "#FFFFFF",
        textColor: "#1F2937",
        linkColor: "#8B5CF6",
        fontFamily: "Poppins",
        fontSize: "16",
        lineHeight: "1.6",
        headingFont: "Poppins",
        containerWidth: "1200",
        headerHeight: "80",
        footerStyle: "standard",
        heroBackgroundType: "gradient",
        heroGradientType: "radial",
        heroGradientDirection: "circle",
        heroGradientColor1: "#8B5CF6",
        heroGradientColor2: "#EC4899",
        heroGradientColor3: "#F59E0B",
        heroOverlayOpacity: 30
      }
    }
  },

  dark: {
    id: "dark",
    name: "Dark Professional",
    category: "Dark",
    icon: Moon,
    description: "Tema oscuro elegante para una experiencia moderna",
    preview: "/imgs/themes/dark-preview.jpg",
    isPremium: false,
    popularity: 91,
    config: {
      appearance: {
        primaryColor: "#3B82F6",
        secondaryColor: "#10B981",
        accentColor: "#F59E0B",
        backgroundColor: "#111827",
        textColor: "#F9FAFB",
        linkColor: "#60A5FA",
        fontFamily: "Inter",
        fontSize: "16",
        lineHeight: "1.6",
        headingFont: "Inter",
        containerWidth: "1200",
        headerHeight: "80",
        footerStyle: "standard",
        heroBackgroundType: "gradient",
        heroGradientType: "linear",
        heroGradientDirection: "to bottom right",
        heroGradientColor1: "#1F2937",
        heroGradientColor2: "#111827",
        heroOverlayOpacity: 80
      }
    }
  },

  ecommerce: {
    id: "ecommerce",
    name: "E-commerce Plus",
    category: "E-commerce",
    icon: Zap,
    description: "Optimizado para tiendas online y conversiones",
    preview: "/imgs/themes/ecommerce-preview.jpg",
    isPremium: true,
    popularity: 85,
    config: {
      appearance: {
        primaryColor: "#059669",
        secondaryColor: "#DC2626",
        accentColor: "#F59E0B",
        backgroundColor: "#FFFFFF",
        textColor: "#111827",
        linkColor: "#059669",
        fontFamily: "Roboto",
        fontSize: "16",
        lineHeight: "1.5",
        headingFont: "Roboto",
        containerWidth: "1280",
        headerHeight: "85",
        footerStyle: "extended",
        heroBackgroundType: "image",
        heroBackgroundImage: "",
        heroOverlayOpacity: 50
      }
    }
  },

  wellness: {
    id: "wellness",
    name: "Health & Wellness",
    category: "Health",
    icon: Heart,
    description: "Colores suaves y relajantes para salud y bienestar",
    preview: "/imgs/themes/wellness-preview.jpg",
    isPremium: false,
    popularity: 73,
    config: {
      appearance: {
        primaryColor: "#06B6D4",
        secondaryColor: "#10B981",
        accentColor: "#F472B6",
        backgroundColor: "#F0F9FF",
        textColor: "#0F172A",
        linkColor: "#0891B2",
        fontFamily: "Lato",
        fontSize: "16",
        lineHeight: "1.7",
        headingFont: "Lato",
        containerWidth: "1150",
        headerHeight: "75",
        footerStyle: "standard",
        heroBackgroundType: "gradient",
        heroGradientType: "linear",
        heroGradientDirection: "to right",
        heroGradientColor1: "#DBEAFE",
        heroGradientColor2: "#BFDBFE",
        heroOverlayOpacity: 20
      }
    }
  },

  nature: {
    id: "nature",
    name: "Eco Natural",
    category: "Green",
    icon: Leaf,
    description: "Inspirado en la naturaleza con tonos verdes y tierra",
    preview: "/imgs/themes/nature-preview.jpg",
    isPremium: false,
    popularity: 69,
    config: {
      appearance: {
        primaryColor: "#059669",
        secondaryColor: "#92400E",
        accentColor: "#F59E0B",
        backgroundColor: "#F7F8FC",
        textColor: "#1F2937",
        linkColor: "#047857",
        fontFamily: "Source Sans Pro",
        fontSize: "16",
        lineHeight: "1.6",
        headingFont: "Source Sans Pro",
        containerWidth: "1200",
        headerHeight: "80",
        footerStyle: "standard",
        heroBackgroundType: "gradient",
        heroGradientType: "linear",
        heroGradientDirection: "135deg",
        heroGradientColor1: "#10B981",
        heroGradientColor2: "#059669",
        heroOverlayOpacity: 40
      }
    }
  },

  cafe: {
    id: "cafe",
    name: "Coffee Shop",
    category: "Food & Drink",
    icon: Coffee,
    description: "Colores cálidos perfectos para restaurantes y cafeterías",
    preview: "/imgs/themes/cafe-preview.jpg",
    isPremium: false,
    popularity: 67,
    config: {
      appearance: {
        primaryColor: "#92400E",
        secondaryColor: "#A3A3A3",
        accentColor: "#F59E0B",
        backgroundColor: "#FEF7ED",
        textColor: "#1C1917",
        linkColor: "#92400E",
        fontFamily: "Playfair Display",
        fontSize: "16",
        lineHeight: "1.6",
        headingFont: "Playfair Display",
        containerWidth: "1150",
        headerHeight: "85",
        footerStyle: "standard",
        heroBackgroundType: "gradient",
        heroGradientType: "linear",
        heroGradientDirection: "to bottom",
        heroGradientColor1: "#FED7AA",
        heroGradientColor2: "#FDBA74",
        heroOverlayOpacity: 30
      }
    }
  },

  luxury: {
    id: "luxury",
    name: "Luxury Gold",
    category: "Luxury",
    icon: Gem,
    description: "Elegancia premium con detalles dorados y tipografía refinada",
    preview: "/imgs/themes/luxury-preview.jpg",
    isPremium: true,
    popularity: 78,
    config: {
      appearance: {
        primaryColor: "#1F2937",
        secondaryColor: "#F59E0B",
        accentColor: "#EF4444",
        backgroundColor: "#F9FAFB",
        textColor: "#111827",
        linkColor: "#1F2937",
        fontFamily: "Cormorant",
        fontSize: "17",
        lineHeight: "1.7",
        headingFont: "Cormorant",
        containerWidth: "1200",
        headerHeight: "90",
        footerStyle: "extended",
        heroBackgroundType: "gradient",
        heroGradientType: "linear",
        heroGradientDirection: "45deg",
        heroGradientColor1: "#1F2937",
        heroGradientColor2: "#374151",
        heroOverlayOpacity: 70
      }
    }
  }
};

export default function AdminThemes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTheme, setActiveTheme] = useState("modern");

  const { data: config, isLoading } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
  });

  const applyThemeMutation = useMutation({
    mutationFn: async (themeId: string) => {
      const theme = PROFESSIONAL_THEMES[themeId as keyof typeof PROFESSIONAL_THEMES];
      if (!theme) throw new Error("Tema no encontrado");

      const currentConfig = config?.config as any || {};
      const updatedConfig = {
        ...currentConfig,
        appearance: {
          ...currentConfig.appearance,
          ...theme.config.appearance
        },
        theme: {
          id: themeId,
          name: theme.name,
          appliedAt: new Date().toISOString()
        }
      };

      return await apiRequest("/api/config", {
        method: "PUT",
        body: JSON.stringify({ config: updatedConfig }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({
        title: "Tema aplicado correctamente",
        description: "Los cambios se han guardado y aplicado a tu sitio web.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error al aplicar tema",
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    },
  });

  useEffect(() => {
    if (config?.config) {
      const configData = config.config as any;
      const currentTheme = configData?.theme?.id || "modern";
      setActiveTheme(currentTheme);
    }
  }, [config]);

  const categories = ["all", "Business", "Creative", "Dark", "E-commerce", "Health", "Green", "Food & Drink", "Luxury"];
  
  const filteredThemes = Object.values(PROFESSIONAL_THEMES).filter(theme => 
    selectedCategory === "all" || theme.category === selectedCategory
  );

  const handleApplyTheme = (themeId: string) => {
    const theme = PROFESSIONAL_THEMES[themeId as keyof typeof PROFESSIONAL_THEMES];
    if (theme.isPremium) {
      toast({
        title: "Tema Premium",
        description: "Este tema requiere una licencia premium. Por ahora aplicaremos una versión básica.",
      });
    }
    applyThemeMutation.mutate(themeId);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Palette className="h-8 w-8 text-purple-600" />
              Temas y Plantillas
            </h1>
            <p className="text-gray-600 mt-2">
              Transforma tu sitio web con temas profesionales inspirados en las mejores marcas del mercado
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={previewMode === "desktop" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("desktop")}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={previewMode === "tablet" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("tablet")}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={previewMode === "mobile" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("mobile")}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Importar Tema
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar Actual
            </Button>
          </div>
        </div>

        {/* Current Theme Status */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-blue-600" />
              Tema Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {PROFESSIONAL_THEMES[activeTheme as keyof typeof PROFESSIONAL_THEMES]?.name || "Tema Personalizado"}
                  </h3>
                  <p className="text-gray-600">
                    {PROFESSIONAL_THEMES[activeTheme as keyof typeof PROFESSIONAL_THEMES]?.description || "Tema configurado manualmente"}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Activo
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category === "all" ? "Todos los Temas" : category}
            </Button>
          ))}
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredThemes.map((theme) => {
            const Icon = theme.icon;
            const isActive = activeTheme === theme.id;
            
            return (
              <Card key={theme.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" style={{ color: theme.config.appearance.primaryColor }} />
                      <CardTitle className="text-lg">{theme.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {theme.isPremium && (
                        <Badge variant="outline" className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
                          <Star className="h-3 w-3 mr-1 fill-current text-amber-500" />
                          Premium
                        </Badge>
                      )}
                      {isActive && (
                        <Badge variant="default" className="bg-green-500">
                          <Check className="h-3 w-3 mr-1" />
                          Activo
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="font-medium">{theme.category}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {theme.popularity}% popularidad
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm">{theme.description}</p>
                  
                  {/* Color Palette Preview */}
                  <div className="flex items-center gap-1">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.config.appearance.primaryColor }}
                      title="Color Primario"
                    ></div>
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.config.appearance.secondaryColor }}
                      title="Color Secundario"
                    ></div>
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.config.appearance.accentColor }}
                      title="Color de Acento"
                    ></div>
                    <span className="ml-2 text-xs text-gray-500 font-medium">
                      {theme.config.appearance.fontFamily}
                    </span>
                  </div>

                  {/* Mini Preview */}
                  <div 
                    className="w-full h-24 rounded-lg border overflow-hidden relative"
                    style={{ 
                      backgroundColor: theme.config.appearance.backgroundColor,
                      color: theme.config.appearance.textColor 
                    }}
                  >
                    <div 
                      className="h-3 w-full"
                      style={{ backgroundColor: theme.config.appearance.primaryColor }}
                    ></div>
                    <div className="p-2">
                      <div className="h-2 w-1/2 rounded mb-1" style={{ backgroundColor: theme.config.appearance.primaryColor }}></div>
                      <div className="h-1 w-3/4 bg-gray-300 rounded mb-1"></div>
                      <div className="h-1 w-1/2 bg-gray-200 rounded"></div>
                    </div>
                    <div className="absolute bottom-1 right-1 flex gap-1">
                      <div className="w-1 h-1 rounded" style={{ backgroundColor: theme.config.appearance.accentColor }}></div>
                      <div className="w-1 h-1 rounded" style={{ backgroundColor: theme.config.appearance.secondaryColor }}></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleApplyTheme(theme.id)}
                      disabled={isActive || applyThemeMutation.isPending}
                      className="flex-1"
                      size="sm"
                    >
                      {applyThemeMutation.isPending ? (
                        "Aplicando..."
                      ) : isActive ? (
                        "Aplicado"
                      ) : (
                        "Aplicar Tema"
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Generar Tema Personalizado
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Guardar Tema Actual
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Vista Previa en Vivo
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
