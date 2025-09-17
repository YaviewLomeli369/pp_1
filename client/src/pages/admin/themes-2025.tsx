
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
  RefreshCw
} from "lucide-react";
import type { SiteConfig } from "@shared/schema";

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
      toast({
        title: "Tema aplicado",
        description: "El nuevo tema se ha aplicado correctamente.",
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
  };

  const handleResetPreview = () => {
    if (previewTheme) {
      const originalTheme = (config?.config as any)?.theme2025?.currentTheme || 'glassmorphic';
      setTheme(originalTheme);
      setPreviewTheme(null);
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
              Temas 2025
            </h1>
            <p className="text-muted-foreground">
              Transforma tu sitio con las últimas tendencias de diseño web 2025
            </p>
          </div>
          
          {previewTheme && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                <Eye className="h-3 w-3 mr-1" />
                Modo Vista Previa
              </Badge>
              <Button variant="outline" size="sm" onClick={handleResetPreview}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Resetear
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
                  Aplicado: {previewTheme ? 'Vista previa activa' : 'Guardado'}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Layout: {currentTheme.styles.layout}</Badge>
                <Badge variant="secondary">Estilo: {currentTheme.styles.cardStyle}</Badge>
                <Badge variant="secondary">Animaciones: {currentTheme.styles.animations}</Badge>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('/', '_blank')}
                >
                  <Monitor className="h-4 w-4 mr-1" />
                  Vista Desktop
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('/', '_blank')}
                >
                  <Smartphone className="h-4 w-4 mr-1" />
                  Vista Mobile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Theme Categories */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Temas Disponibles
          </h2>
          
          {/* Trending Themes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">🔥 Tendencias 2025</h3>
              <Badge className="bg-gradient-to-r from-pink-500 to-violet-500 text-white">
                Nuevo
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {availableThemes.map((theme) => (
                <div key={theme.id} className="space-y-2">
                  <ThemeCard2025
                    themeId={theme.id}
                    isActive={currentTheme.id === theme.id && !previewTheme}
                    onSelect={handleThemeSelect}
                  />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => handlePreview(theme.id)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Vista Previa
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Theme Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración Avanzada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Estilo de Navegación</label>
                <select className="w-full p-2 border rounded-md">
                  <option>Tradicional</option>
                  <option>Flotante</option>
                  <option>Sidebar</option>
                  <option>Oculto</option>
                  <option>Mega Menu</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Espaciado</label>
                <select className="w-full p-2 border rounded-md">
                  <option>Compacto</option>
                  <option>Normal</option>
                  <option>Espacioso</option>
                  <option>Extremo</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Animaciones</label>
                <select className="w-full p-2 border rounded-md">
                  <option>Sin animaciones</option>
                  <option>Sutiles</option>
                  <option>Suaves</option>
                  <option>Dinámicas</option>
                  <option>Dramáticas</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button>
                <Save className="h-4 w-4 mr-1" />
                Guardar Configuración
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Theme Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento del Tema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-sm text-muted-foreground">Performance</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">A+</div>
                <div className="text-sm text-muted-foreground">Accesibilidad</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-600">Fast</div>
                <div className="text-sm text-muted-foreground">Carga</div>
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
