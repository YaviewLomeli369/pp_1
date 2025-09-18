
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { UniversalButton } from "@/components/ui/universal-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  RefreshCw,
  Eye,
  Palette,
  Type,
  Layout,
  Sparkles
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminButtons() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>({
    variant: 'default',
    size: 'default',
    colors: {
      background: '#3B82F6',
      foreground: '#FFFFFF',
      border: '#3B82F6',
      hoverBackground: '#2563EB',
      hoverForeground: '#FFFFFF',
      hoverBorder: '#2563EB',
      focusBackground: '#1D4ED8',
      focusForeground: '#FFFFFF',
      focusBorder: '#1D4ED8',
      activeBackground: '#1E40AF',
      activeForeground: '#FFFFFF',
      activeBorder: '#1E40AF'
    },
    typography: {
      fontFamily: 'Inter',
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '1.4',
      letterSpacing: '0px'
    },
    spacing: {
      paddingX: '16px',
      paddingY: '8px',
      margin: '0px'
    },
    borders: {
      radius: '6px',
      width: '1px',
      style: 'solid'
    },
    effects: {
      shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      hoverShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease-in-out',
      transform: 'none',
      hoverTransform: 'translateY(-1px)'
    }
  });

  // Fetch button configurations
  const { data: buttonConfigs, isLoading } = useQuery({
    queryKey: ["/api/button-config"],
  });

  // Initialize default configurations
  const initializeDefaultsMutation = useMutation({
    mutationFn: () => apiRequest("/api/button-config/initialize-defaults", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/button-config"] });
      toast({ title: "Configuraciones por defecto inicializadas correctamente" });
    },
    onError: () => {
      toast({ 
        variant: "destructive",
        title: "Error al inicializar configuraciones" 
      });
    },
  });

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (configData: any) => {
      if (selectedConfig) {
        return await apiRequest(`/api/button-config/${selectedConfig.id}`, {
          method: "PUT",
          body: JSON.stringify(configData),
        });
      } else {
        return await apiRequest("/api/button-config", {
          method: "POST",
          body: JSON.stringify(configData),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/button-config"] });
      setShowConfigDialog(false);
      setSelectedConfig(null);
      toast({ title: "Configuración guardada correctamente" });
    },
    onError: () => {
      toast({ 
        variant: "destructive",
        title: "Error al guardar configuración" 
      });
    },
  });

  // Delete configuration mutation
  const deleteConfigMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/button-config/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/button-config"] });
      toast({ title: "Configuración eliminada correctamente" });
    },
    onError: () => {
      toast({ 
        variant: "destructive",
        title: "Error al eliminar configuración" 
      });
    },
  });

  const handleNewConfig = () => {
    setSelectedConfig(null);
    setEditingConfig({
      variant: 'default',
      size: 'default',
      colors: {
        background: '#3B82F6',
        foreground: '#FFFFFF',
        border: '#3B82F6',
        hoverBackground: '#2563EB',
        hoverForeground: '#FFFFFF',
        hoverBorder: '#2563EB',
        focusBackground: '#1D4ED8',
        focusForeground: '#FFFFFF',
        focusBorder: '#1D4ED8',
        activeBackground: '#1E40AF',
        activeForeground: '#FFFFFF',
        activeBorder: '#1E40AF'
      },
      typography: {
        fontFamily: 'Inter',
        fontSize: '14px',
        fontWeight: '500',
        lineHeight: '1.4',
        letterSpacing: '0px'
      },
      spacing: {
        paddingX: '16px',
        paddingY: '8px',
        margin: '0px'
      },
      borders: {
        radius: '6px',
        width: '1px',
        style: 'solid'
      },
      effects: {
        shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        hoverShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease-in-out',
        transform: 'none',
        hoverTransform: 'translateY(-1px)'
      }
    });
    setShowConfigDialog(true);
  };

  const handleEditConfig = (config: any) => {
    setSelectedConfig(config);
    setEditingConfig({ ...config });
    setShowConfigDialog(true);
  };

  const handleSaveConfig = () => {
    saveConfigMutation.mutate(editingConfig);
  };

  const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'];
  const sizes = ['sm', 'default', 'lg', 'icon'];

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
            <h1 className="text-2xl font-bold text-gray-900">Configuración de Botones</h1>
            <p className="text-gray-600 mt-1">Personaliza el diseño y estilo de todos los botones del sitio</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => initializeDefaultsMutation.mutate()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Inicializar Defaults
            </Button>
            <Button onClick={handleNewConfig}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Configuración
            </Button>
          </div>
        </div>

        {/* Current Configurations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buttonConfigs?.map((config: any) => (
            <Card key={config.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {config.variant} - {config.size}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditConfig(config)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteConfigMutation.mutate(config.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {config.isDefault && (
                  <Badge variant="outline" className="w-fit">
                    Por defecto
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Color Preview */}
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: config.colors?.background }}
                    />
                    <span className="text-sm text-gray-600">
                      {config.colors?.background}
                    </span>
                  </div>
                  
                  {/* Button Preview */}
                  <div className="pt-4">
                    <p className="text-sm text-gray-600 mb-2">Vista Previa:</p>
                    <UniversalButton 
                      variant={config.variant} 
                      size={config.size}
                      useConfig={true}
                    >
                      Botón de ejemplo
                    </UniversalButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Configuration Dialog */}
        <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedConfig ? "Editar Configuración" : "Nueva Configuración"}
              </DialogTitle>
              <DialogDescription>
                Personaliza el estilo de los botones
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="colors">Colores</TabsTrigger>
                <TabsTrigger value="typography">Tipografía</TabsTrigger>
                <TabsTrigger value="spacing">Espaciado</TabsTrigger>
                <TabsTrigger value="effects">Efectos</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Variante</Label>
                    <Select
                      value={editingConfig.variant}
                      onValueChange={(value) => setEditingConfig({...editingConfig, variant: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {variants.map(variant => (
                          <SelectItem key={variant} value={variant}>
                            {variant}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tamaño</Label>
                    <Select
                      value={editingConfig.size}
                      onValueChange={(value) => setEditingConfig({...editingConfig, size: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes.map(size => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4">
                  <Label>Vista Previa</Label>
                  <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                    <UniversalButton 
                      variant={editingConfig.variant} 
                      size={editingConfig.size}
                      useConfig={false}
                      style={{
                        backgroundColor: editingConfig.colors?.background,
                        color: editingConfig.colors?.foreground,
                        borderColor: editingConfig.colors?.border,
                        fontFamily: editingConfig.typography?.fontFamily,
                        fontSize: editingConfig.typography?.fontSize,
                        fontWeight: editingConfig.typography?.fontWeight,
                        paddingLeft: editingConfig.spacing?.paddingX,
                        paddingRight: editingConfig.spacing?.paddingX,
                        paddingTop: editingConfig.spacing?.paddingY,
                        paddingBottom: editingConfig.spacing?.paddingY,
                        borderRadius: editingConfig.borders?.radius,
                        boxShadow: editingConfig.effects?.shadow,
                        transition: editingConfig.effects?.transition,
                      }}
                    >
                      Botón de ejemplo
                    </UniversalButton>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="colors" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Normal State */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Estado Normal</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Color de Fondo</Label>
                        <div className="flex items-center space-x-3">
                          <Input
                            type="color"
                            value={editingConfig.colors?.background || '#3B82F6'}
                            onChange={(e) => setEditingConfig({
                              ...editingConfig,
                              colors: { ...editingConfig.colors, background: e.target.value }
                            })}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={editingConfig.colors?.background || '#3B82F6'}
                            onChange={(e) => setEditingConfig({
                              ...editingConfig,
                              colors: { ...editingConfig.colors, background: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Color de Texto</Label>
                        <div className="flex items-center space-x-3">
                          <Input
                            type="color"
                            value={editingConfig.colors?.foreground || '#FFFFFF'}
                            onChange={(e) => setEditingConfig({
                              ...editingConfig,
                              colors: { ...editingConfig.colors, foreground: e.target.value }
                            })}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={editingConfig.colors?.foreground || '#FFFFFF'}
                            onChange={(e) => setEditingConfig({
                              ...editingConfig,
                              colors: { ...editingConfig.colors, foreground: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Color de Borde</Label>
                        <div className="flex items-center space-x-3">
                          <Input
                            type="color"
                            value={editingConfig.colors?.border || '#3B82F6'}
                            onChange={(e) => setEditingConfig({
                              ...editingConfig,
                              colors: { ...editingConfig.colors, border: e.target.value }
                            })}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={editingConfig.colors?.border || '#3B82F6'}
                            onChange={(e) => setEditingConfig({
                              ...editingConfig,
                              colors: { ...editingConfig.colors, border: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover State */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Estado Hover</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Fondo (Hover)</Label>
                        <div className="flex items-center space-x-3">
                          <Input
                            type="color"
                            value={editingConfig.colors?.hoverBackground || '#2563EB'}
                            onChange={(e) => setEditingConfig({
                              ...editingConfig,
                              colors: { ...editingConfig.colors, hoverBackground: e.target.value }
                            })}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={editingConfig.colors?.hoverBackground || '#2563EB'}
                            onChange={(e) => setEditingConfig({
                              ...editingConfig,
                              colors: { ...editingConfig.colors, hoverBackground: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Texto (Hover)</Label>
                        <div className="flex items-center space-x-3">
                          <Input
                            type="color"
                            value={editingConfig.colors?.hoverForeground || '#FFFFFF'}
                            onChange={(e) => setEditingConfig({
                              ...editingConfig,
                              colors: { ...editingConfig.colors, hoverForeground: e.target.value }
                            })}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={editingConfig.colors?.hoverForeground || '#FFFFFF'}
                            onChange={(e) => setEditingConfig({
                              ...editingConfig,
                              colors: { ...editingConfig.colors, hoverForeground: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Borde (Hover)</Label>
                        <div className="flex items-center space-x-3">
                          <Input
                            type="color"
                            value={editingConfig.colors?.hoverBorder || '#2563EB'}
                            onChange={(e) => setEditingConfig({
                              ...editingConfig,
                              colors: { ...editingConfig.colors, hoverBorder: e.target.value }
                            })}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={editingConfig.colors?.hoverBorder || '#2563EB'}
                            onChange={(e) => setEditingConfig({
                              ...editingConfig,
                              colors: { ...editingConfig.colors, hoverBorder: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="typography" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Familia de Fuente</Label>
                    <Input
                      value={editingConfig.typography?.fontFamily || 'Inter'}
                      onChange={(e) => setEditingConfig({
                        ...editingConfig,
                        typography: { ...editingConfig.typography, fontFamily: e.target.value }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tamaño de Fuente</Label>
                    <Input
                      value={editingConfig.typography?.fontSize || '14px'}
                      onChange={(e) => setEditingConfig({
                        ...editingConfig,
                        typography: { ...editingConfig.typography, fontSize: e.target.value }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Peso de Fuente</Label>
                    <Select
                      value={editingConfig.typography?.fontWeight || '500'}
                      onValueChange={(value) => setEditingConfig({
                        ...editingConfig,
                        typography: { ...editingConfig.typography, fontWeight: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">Light (300)</SelectItem>
                        <SelectItem value="400">Normal (400)</SelectItem>
                        <SelectItem value="500">Medium (500)</SelectItem>
                        <SelectItem value="600">Semibold (600)</SelectItem>
                        <SelectItem value="700">Bold (700)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Altura de Línea</Label>
                    <Input
                      value={editingConfig.typography?.lineHeight || '1.4'}
                      onChange={(e) => setEditingConfig({
                        ...editingConfig,
                        typography: { ...editingConfig.typography, lineHeight: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="spacing" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Padding Horizontal</Label>
                    <Input
                      value={editingConfig.spacing?.paddingX || '16px'}
                      onChange={(e) => setEditingConfig({
                        ...editingConfig,
                        spacing: { ...editingConfig.spacing, paddingX: e.target.value }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Padding Vertical</Label>
                    <Input
                      value={editingConfig.spacing?.paddingY || '8px'}
                      onChange={(e) => setEditingConfig({
                        ...editingConfig,
                        spacing: { ...editingConfig.spacing, paddingY: e.target.value }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Margin</Label>
                    <Input
                      value={editingConfig.spacing?.margin || '0px'}
                      onChange={(e) => setEditingConfig({
                        ...editingConfig,
                        spacing: { ...editingConfig.spacing, margin: e.target.value }
                      })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Border Radius</Label>
                    <Input
                      value={editingConfig.borders?.radius || '6px'}
                      onChange={(e) => setEditingConfig({
                        ...editingConfig,
                        borders: { ...editingConfig.borders, radius: e.target.value }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Border Width</Label>
                    <Input
                      value={editingConfig.borders?.width || '1px'}
                      onChange={(e) => setEditingConfig({
                        ...editingConfig,
                        borders: { ...editingConfig.borders, width: e.target.value }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Border Style</Label>
                    <Select
                      value={editingConfig.borders?.style || 'solid'}
                      onValueChange={(value) => setEditingConfig({
                        ...editingConfig,
                        borders: { ...editingConfig.borders, style: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Solid</SelectItem>
                        <SelectItem value="dashed">Dashed</SelectItem>
                        <SelectItem value="dotted">Dotted</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="effects" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sombra Normal</Label>
                    <Input
                      value={editingConfig.effects?.shadow || '0 1px 2px 0 rgba(0, 0, 0, 0.05)'}
                      onChange={(e) => setEditingConfig({
                        ...editingConfig,
                        effects: { ...editingConfig.effects, shadow: e.target.value }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Sombra Hover</Label>
                    <Input
                      value={editingConfig.effects?.hoverShadow || '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
                      onChange={(e) => setEditingConfig({
                        ...editingConfig,
                        effects: { ...editingConfig.effects, hoverShadow: e.target.value }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Transición</Label>
                    <Input
                      value={editingConfig.effects?.transition || 'all 0.2s ease-in-out'}
                      onChange={(e) => setEditingConfig({
                        ...editingConfig,
                        effects: { ...editingConfig.effects, transition: e.target.value }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Transform Hover</Label>
                    <Input
                      value={editingConfig.effects?.hoverTransform || 'translateY(-1px)'}
                      onChange={(e) => setEditingConfig({
                        ...editingConfig,
                        effects: { ...editingConfig.effects, hoverTransform: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveConfig} disabled={saveConfigMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {saveConfigMutation.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
