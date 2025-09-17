

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeCard2025 } from "@/components/ThemeCard2025";
import { useTheme2025 } from "@/components/theme-provider";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Palette, 
  Monitor, 
  Smartphone, 
  Eye,
  Settings,
  Save,
  RefreshCw,
  Zap,
  Crown,
  Leaf,
  Grid
} from "lucide-react";
import type { SiteConfig } from "@shared/schema";

const themesByCategory = {
  'Trending': ['glassmorphic', 'aurora'],
  'Bold & Dramatic': ['brutal', 'cyberpunk', 'retro80s'],
  'Clean & Minimal': ['minimal2025', 'neumorphic'],
  'Premium & Elegant': ['luxury', 'organic'],
  'Tech & Developer': ['monospace']
};

export default function Themes2025() {
  const { currentTheme, setTheme, availableThemes } = useTheme2025();
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
    staleTime: 5 * 60 * 1000,
  });

  const saveThemeMutation = useMutation({
    mutationFn: async (themeId: string) => {
      const configData = config?.config as any || {};
      const updatedConfig = {
        ...configData,
        theme2025: {
          ...configData.theme2025,
          currentTheme: themeId,
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
      setPreviewTheme(null);
      toast({
        title: "Tema aplicado",
        description: "El nuevo tema se ha aplicado correctamente y es visible en el sitio público.",
        duration: 5000,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo aplicar el tema. Intenta de nuevo.",
      });
    },
  });

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId);
    saveThemeMutation.mutate(themeId);
  };

  const handlePreview = (themeId: string) => {
    setPreviewTheme(themeId);
    setTheme(themeId);
    toast({
      title: "Vista previa activada",
      description: "Abre el sitio público en otra pestaña para ver los cambios. Usa 'Aplicar' para guardar permanentemente.",
      duration: 4000,
    });
  };

  const handleResetPreview = () => {
    if (previewTheme) {
      const originalTheme = (config?.config as any)?.theme2025?.currentTheme || 'glassmorphic';
      setTheme(originalTheme);
      setPreviewTheme(null);
      toast({
        title: "Vista previa cancelada",
        description: "Se ha restaurado el tema original.",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Trending': return <Sparkles className="h-5 w-5" />;
      case 'Bold & Dramatic': return <Zap className="h-5 w-5" />;
      case 'Clean & Minimal': return <Grid className="h-5 w-5" />;
      case 'Premium & Elegant': return <Crown className="h-5 w-5" />;
      case 'Tech & Developer': return <Settings className="h-5 w-5" />;
      default: return <Palette className="h-5 w-5" />;
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Temas 2025 - Tendencias de Diseño Web
            </h1>
            <p className="text-muted-foreground">
              10 temas únicos que transforman completamente el aspecto de tu sitio web público
            </p>
          </div>
          
          {previewTheme && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                <Eye className="h-3 w-3 mr-1" />
                Vista Previa: {availableThemes.find(t => t.id === previewTheme)?.name}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleResetPreview}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            </div>
          )}
        </div>

        {/* Current Theme Info */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Tema Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <h3 className="font-semibold text-lg">{currentTheme.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {previewTheme ? 'Vista previa activa - no guardado' : 'Tema guardado y público'}
                </p>
                <Badge variant="secondary" className="mt-2">
                  {currentTheme.category}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{currentTheme.description}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Layout: {currentTheme.styles.layout}</Badge>
                  <Badge variant="outline" className="text-xs">Estilo: {currentTheme.styles.cardStyle}</Badge>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('/', '_blank')}
                >
                  <Monitor className="h-4 w-4 mr-1" />
                  Ver Sitio
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('/testimonials', '_blank')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Testimonials
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Theme Categories */}
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Catálogo de Temas 2025
          </h2>
          
          {Object.entries(themesByCategory).map(([category, themeIds]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-2">
                {getCategoryIcon(category)}
                <h3 className="text-xl font-medium">{category}</h3>
                <Badge variant="secondary">{themeIds.length} temas</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {themeIds.map((themeId) => (
                  <div key={themeId} className="space-y-2">
                    <ThemeCard2025
                      themeId={themeId}
                      isActive={currentTheme.id === themeId && !previewTheme}
                      onSelect={handleThemeSelect}
                    />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handlePreview(themeId)}
                      disabled={currentTheme.id === themeId}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Vista Previa
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">¿Cómo usar los temas 2025?</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 text-sm space-y-2">
            <p><strong>Vista Previa:</strong> Haz clic en "Vista Previa" para ver el tema temporalmente. Abre el sitio público en otra pestaña.</p>
            <p><strong>Aplicar Tema:</strong> Haz clic en "Aplicar" para guardar el tema permanentemente en tu sitio público.</p>
            <p><strong>Páginas afectadas:</strong> Los temas cambian el diseño de todas las páginas públicas (inicio, testimonials, FAQs, contacto, etc.)</p>
            <p><strong>Compatibilidad:</strong> Todos los temas son responsivos y funcionan en móvil y desktop.</p>
          </CardContent>
        </Card>

        {/* Theme Performance Info */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento y Características</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">10</div>
                <div className="text-sm text-muted-foreground">Temas Únicos</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">100%</div>
                <div className="text-sm text-muted-foreground">Responsivo</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-600">CSS3</div>
                <div className="text-sm text-muted-foreground">Tecnología</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-orange-600">SEO</div>
                <div className="text-sm text-muted-foreground">Optimizado</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

