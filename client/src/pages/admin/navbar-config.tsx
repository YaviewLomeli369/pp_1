import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  Navigation,
  GripVertical,
  Save,
  Eye,
  EyeOff,
  Home,
  ShoppingCart,
  MessageSquare,
  Calendar,
  FileText,
  Quote,
  HelpCircle,
  Users,
  Package,
  Edit2,
  RefreshCw,
  Palette,
  Layout,
  Paintbrush,
} from "lucide-react";

type NavbarItem = {
  id: string;
  moduleKey: string;
  label: string;
  href: string;
  isVisible: boolean;
  order: number;
  isRequired: boolean;
};

type NavbarStyles = {
  // Layout
  height: string;
  maxWidth: string;
  padding: string;
  position: string;

  // Background
  backgroundColor: string;
  backgroundBlur: boolean;
  backgroundOpacity: string;
  borderBottom: string;

  // Typography
  fontSize: string;
  fontWeight: string;
  fontFamily: string;

  // Colors
  textColor: string;
  textHoverColor: string;
  activeTextColor: string;
  logoSize: string;

  // Shadow & Effects
  boxShadow: string;
  borderRadius: string;
  transition: string;

  // Responsive
  mobileBreakpoint: string;
  mobileHeight: string;

  // Advanced
  customCSS: string;
};

const iconMap: { [key: string]: React.ReactNode } = {
  home: <Home className="h-4 w-4" />,
  tienda: <ShoppingCart className="h-4 w-4" />,
  contacto: <MessageSquare className="h-4 w-4" />,
  reservas: <Calendar className="h-4 w-4" />,
  blog: <FileText className="h-4 w-4" />,
  testimonios: <Quote className="h-4 w-4" />,
  faqs: <HelpCircle className="h-4 w-4" />,
  conocenos: <Users className="h-4 w-4" />,
  servicios: <Package className="h-4 w-4" />,
};

const defaultNavItems = [
  { moduleKey: "home", label: "Inicio", href: "/", isRequired: true, order: 0 },
  { moduleKey: "testimonios", label: "Testimonios", href: "/testimonials", isRequired: false, order: 1 },
  { moduleKey: "faqs", label: "FAQs", href: "/faqs", isRequired: false, order: 2 },
  { moduleKey: "contacto", label: "Contacto", href: "/contact", isRequired: false, order: 3 },
  { moduleKey: "tienda", label: "Tienda", href: "/store", isRequired: false, order: 4 },
  { moduleKey: "blog", label: "Blog", href: "/blog", isRequired: false, order: 5 },
  { moduleKey: "reservas", label: "Reservas", href: "/reservations", isRequired: false, order: 6 },
  { moduleKey: "conocenos", label: "Conócenos", href: "/conocenos", isRequired: true, order: 7 },
  { moduleKey: "servicios", label: "Servicios", href: "/servicios", isRequired: true, order: 8 },
];

const defaultNavbarStyles: NavbarStyles = {
  // Layout
  height: "64px",
  maxWidth: "1280px",
  padding: "0 16px",
  position: "fixed",

  // Background
  backgroundColor: "#ffffff",
  backgroundBlur: true,
  backgroundOpacity: "0.95",
  borderBottom: "1px solid rgba(229, 231, 235, 0.8)",

  // Typography
  fontSize: "16px",
  fontWeight: "500",
  fontFamily: "inherit",

  // Colors
  textColor: "#374151",
  textHoverColor: "#059669",
  activeTextColor: "#059669",
  logoSize: "40px",

  // Shadow & Effects
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  borderRadius: "0px",
  transition: "all 0.3s ease",

  // Responsive
  mobileBreakpoint: "1075px",
  mobileHeight: "64px",

  // Advanced
  customCSS: "",
};

export default function AdminNavbarConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<NavbarItem[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editHref, setEditHref] = useState("");
  const [navbarStyles, setNavbarStyles] = useState<NavbarStyles>(defaultNavbarStyles);
  const [activeTab, setActiveTab] = useState("structure");

  const { data: config, isLoading } = useQuery({
    queryKey: ["/api/config"],
    staleTime: 5 * 60 * 1000,
  });

  // Initialize items and styles based on config
  useEffect(() => {
    if (config) {
      const modules = (config as any)?.config?.frontpage?.modulos || {};
      const navbarConfig = (config as any)?.config?.navbar || {};
      const savedStyles = (config as any)?.config?.navbarStyles || {};

      // Initialize navbar items
      const availableItems = defaultNavItems.filter(item => 
        item.isRequired || (item.moduleKey && modules[item.moduleKey]?.activo)
      );

      const configuredItems = availableItems.map((item, index) => {
        const existingConfig = navbarConfig[item.moduleKey] || {};
        return {
          id: `${item.moduleKey}-${Date.now()}`,
          moduleKey: item.moduleKey,
          label: existingConfig.label || item.label,
          href: existingConfig.href || item.href,
          isVisible: existingConfig.isVisible !== undefined ? existingConfig.isVisible : true,
          order: existingConfig.order !== undefined ? existingConfig.order : item.order,
          isRequired: item.isRequired,
        };
      });

      configuredItems.sort((a, b) => a.order - b.order);
      setItems(configuredItems);

      // Initialize navbar styles
      setNavbarStyles({ ...defaultNavbarStyles, ...savedStyles });
    }
  }, [config]);

  const updateConfigMutation = useMutation({
    mutationFn: (newConfig: any) => apiRequest("/api/config", {
      method: "PUT",
      body: JSON.stringify({ config: newConfig }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({ title: "Configuración actualizada", description: "El navbar ha sido actualizado correctamente" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar la configuración" });
    },
  });

  // Navigation items handlers (existing code)
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index,
    }));

    setItems(updatedItems);
  };

  const handleToggleVisibility = (moduleKey: string, isVisible: boolean) => {
    setItems(items.map(item => 
      item.moduleKey === moduleKey ? { ...item, isVisible } : item
    ));
  };

  const handleEditItem = (item: NavbarItem) => {
    setEditingItem(item.moduleKey);
    setEditLabel(item.label);
    setEditHref(item.href);
  };

  const handleSaveEdit = () => {
    if (editingItem) {
      setItems(items.map(item => 
        item.moduleKey === editingItem 
          ? { ...item, label: editLabel, href: editHref }
          : item
      ));
      setEditingItem(null);
      setEditLabel("");
      setEditHref("");
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditLabel("");
    setEditHref("");
  };

  // Style handlers
  const handleStyleChange = (key: keyof NavbarStyles, value: string | boolean) => {
    setNavbarStyles(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveConfiguration = () => {
    if (!config) return;

    const navbarConfig: { [key: string]: any } = {};
    items.forEach(item => {
      navbarConfig[item.moduleKey] = {
        isVisible: item.isVisible,
        order: item.order,
        label: item.label,
        href: item.href,
        isRequired: item.isRequired
      };
    });

    const updatedConfig = {
      ...(config as any).config,
      navbar: navbarConfig,
      navbarStyles: navbarStyles
    };

    updateConfigMutation.mutate(updatedConfig);
  };

  const handleRefreshFromModules = () => {
    if (!config) return;

    const modules = (config as any)?.config?.frontpage?.modulos || {};
    const availableItems = defaultNavItems.filter(item => 
      item.isRequired || (item.moduleKey && modules[item.moduleKey]?.activo)
    );

    // Keep existing items that are still valid, add new ones
    const existingModuleKeys = new Set(items.map(item => item.moduleKey));
    const newItems = availableItems
      .filter(item => !existingModuleKeys.has(item.moduleKey))
      .map((item, index) => ({
        id: `new-${item.moduleKey}-${Date.now()}`,
        moduleKey: item.moduleKey,
        label: item.label,
        href: item.href,
        isVisible: true,
        order: items.length + index,
        isRequired: item.isRequired,
      }));

    if (newItems.length > 0) {
      setItems([...items, ...newItems]);
      toast({ 
        title: "Módulos actualizados", 
        description: `Se agregaron ${newItems.length} nuevos elementos del navbar` 
      });
    } else {
      toast({ 
        title: "Sin cambios", 
        description: "No hay nuevos módulos activos para agregar" 
      });
    }
  };

  const handleResetToDefaults = () => {
    if (!config) return;

    const modules = (config as any)?.config?.frontpage?.modulos || {};
    const availableItems = defaultNavItems.filter(item => 
      item.isRequired || (item.moduleKey && modules[item.moduleKey]?.activo)
    );

    const resetItems = availableItems.map((item, index) => ({
      id: `reset-${item.moduleKey}-${Date.now()}`,
      moduleKey: item.moduleKey,
      label: item.label,
      href: item.href,
      isVisible: true,
      order: item.order,
      isRequired: item.isRequired,
    }));

    setItems(resetItems);
    toast({ 
      title: "Configuración restablecida", 
      description: "Se han restaurado los valores por defecto" 
    });
  };

  const handleResetStyles = () => {
    setNavbarStyles(defaultNavbarStyles);
    toast({ 
      title: "Estilos restablecidos", 
      description: "Se han restaurado los estilos por defecto" 
    });
  };

  const generateCSS = () => {
    // Ensure backgroundOpacity is treated as a number for calculations
    const opacityValue = parseFloat(navbarStyles.backgroundOpacity);
    const isValidOpacity = !isNaN(opacityValue) && opacityValue >= 0 && opacityValue <= 1;

    // Construct RGBA string for background color if opacity is valid and not 1
    let backgroundColorWithOpacity = navbarStyles.backgroundColor;
    if (isValidOpacity && opacityValue < 1 && navbarStyles.backgroundColor.startsWith('rgb(')) {
      backgroundColorWithOpacity = navbarStyles.backgroundColor.replace('rgb', 'rgba').replace(')', `, ${navbarStyles.backgroundOpacity})`);
    } else if (isValidOpacity && opacityValue < 1 && navbarStyles.backgroundColor.startsWith('hsl(')) {
       // Handle HSL colors if necessary, though typically color inputs default to hex or rgb
       // For simplicity, we'll assume hex or rgb for now. If HSL is a common input, add specific handling.
    } else if (opacityValue === 1) {
        backgroundColorWithOpacity = navbarStyles.backgroundColor; // Use original color if opacity is 1
    }


    return `
/*Navbar Styles Generated by Admin */
.navbar-custom {
  height: ${navbarStyles.height} !important;
  ${navbarStyles.backgroundBlur ? `backdrop-filter: blur(10px) !important;` : ''}
  background-color: ${isValidOpacity && opacityValue < 1 ? backgroundColorWithOpacity : navbarStyles.backgroundColor} !important;
  border-bottom: ${navbarStyles.borderBottom} !important;
  box-shadow: ${navbarStyles.boxShadow} !important;
  border-radius: ${navbarStyles.borderRadius} !important;
  transition: ${navbarStyles.transition} !important;
  position: ${navbarStyles.position} !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 50 !important;
}

.navbar-custom .navbar-container {
  max-width: ${navbarStyles.maxWidth} !important;
  padding: ${navbarStyles.padding} !important;
  margin: 0 auto !important;
}

.navbar-custom .navbar-link {
  font-size: ${navbarStyles.fontSize} !important;
  font-weight: ${navbarStyles.fontWeight} !important;
  font-family: ${navbarStyles.fontFamily} !important;
  color: ${navbarStyles.textColor} !important;
  transition: ${navbarStyles.transition} !important;
}

.navbar-custom .navbar-link:hover {
  color: ${navbarStyles.textHoverColor} !important;
}

.navbar-custom .navbar-link.active {
  color: ${navbarStyles.activeTextColor} !important;
}

.navbar-custom .navbar-logo {
  height: ${navbarStyles.logoSize} !important;
  width: auto !important;
}

@media (max-width: ${navbarStyles.mobileBreakpoint}) {
  .navbar-custom {
    height: ${navbarStyles.mobileHeight} !important;
  }
}

${navbarStyles.customCSS}
`;
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
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Navigation className="h-6 w-6" />
              Configuración Avanzada del Navbar
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona estructura, estilos y apariencia de la barra de navegación
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefreshFromModules}
              disabled={!config}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar desde Módulos
            </Button>
            <Button 
              variant="outline" 
              onClick={handleResetToDefaults}
              disabled={!config}
            >
              Restablecer
            </Button>
            <Button 
              variant="outline" 
              onClick={handleResetStyles}
              disabled={!config}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Restablecer Estilos
            </Button>
            <Button 
              onClick={handleSaveConfiguration} 
              disabled={updateConfigMutation.isPending || !config}
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar Todo
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="structure" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Estructura
            </TabsTrigger>
            <TabsTrigger value="styles" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Estilos
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Paintbrush className="h-4 w-4" />
              Avanzado
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Vista Previa
            </TabsTrigger>
          </TabsList>

          {/* Structure Tab */}
          <TabsContent value="structure">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Current Navigation Items */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Elementos del Navbar</CardTitle>
                    <p className="text-sm text-gray-600">
                      Arrastra para reordenar. Haz clic en el ícono de editar para modificar etiquetas y enlaces.
                    </p>
                  </CardHeader>
                  <CardContent>
                    {items.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No hay elementos configurados</p>
                      </div>
                    ) : (
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="navbar-items">
                          {(provided) => (
                            <div 
                              {...provided.droppableProps} 
                              ref={provided.innerRef} 
                              className="space-y-3"
                            >
                              {items.map((item, index) => (
                                <Draggable 
                                  key={item.id} 
                                  draggableId={item.id} 
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`border rounded-lg bg-white transition-all ${
                                        snapshot.isDragging 
                                          ? "shadow-lg border-primary scale-105" 
                                          : "border-gray-200 hover:border-gray-300"
                                      }`}
                                    >
                                      {editingItem === item.moduleKey ? (
                                        <div className="p-4 space-y-4">
                                          <div className="space-y-2">
                                            <Label>Etiqueta</Label>
                                            <Input
                                              value={editLabel}
                                              onChange={(e) => setEditLabel(e.target.value)}
                                              placeholder="Nombre que aparece en el navbar"
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Enlace</Label>
                                            <Input
                                              value={editHref}
                                              onChange={(e) => setEditHref(e.target.value)}
                                              placeholder="Ruta del enlace (ej: / contacto)"
                                            />
                                          </div>
                                          <div className="flex gap-2">
                                            <Button size="sm" onClick={handleSaveEdit}>
                                              Guardar
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                              Cancelar
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-between p-4">
                                          <div className="flex items-center space-x-3">
                                            <div 
                                              {...provided.dragHandleProps}
                                              className="cursor-grab active:cursor-grabbing"
                                            >
                                              <GripVertical className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              {iconMap[item.moduleKey] || <Package className="h-4 w-4" />}
                                              <div>
                                                <span className="font-medium">{item.label}</span>
                                                <div className="text-xs text-gray-500">{item.href}</div>
                                              </div>
                                            </div>
                                            {item.isRequired && (
                                              <Badge variant="secondary" className="text-xs">
                                                Requerido
                                              </Badge>
                                            )}
                                          </div>

                                          <div className="flex items-center space-x-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleEditItem(item)}
                                              className="text-blue-600 hover:text-blue-700"
                                            >
                                              <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Switch
                                              checked={item.isVisible}
                                              onCheckedChange={(checked) => 
                                                handleToggleVisibility(item.moduleKey, checked)
                                              }
                                              disabled={item.isRequired}
                                            />
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => 
                                                handleToggleVisibility(item.moduleKey, !item.isVisible)
                                              }
                                              disabled={item.isRequired}
                                            >
                                              {item.isVisible ? (
                                                <Eye className="h-4 w-4" />
                                              ) : (
                                                <EyeOff className="h-4 w-4" />
                                              )}
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Module Status & Instructions */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Estado de Módulos</CardTitle>
                    <p className="text-sm text-gray-600">
                      Solo se pueden agregar elementos de módulos activos
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {defaultNavItems.map((item) => {
                      const isActive = item.isRequired || 
                        (item.moduleKey && (config as any)?.config?.frontpage?.modulos?.[item.moduleKey]?.activo);
                      const isInNavbar = items.some(navItem => navItem.moduleKey === item.moduleKey);

                      return (
                        <div key={item.moduleKey} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center space-x-2">
                            {iconMap[item.moduleKey] || <Package className="h-4 w-4" />}
                            <span className="text-sm font-medium">{item.label}</span>
                            {item.isRequired && (
                              <Badge variant="secondary" className="text-xs">Requerido</Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {isActive ? (
                              <Badge variant="default" className="text-xs">Activo</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Inactivo</Badge>
                            )}
                            {isInNavbar && (
                              <Badge variant="outline" className="text-xs">En Navbar</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Instructions */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Instrucciones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-gray-600">
                    <p>• <strong>Arrastrar:</strong> Cambia el orden de los elementos</p>
                    <p>• <strong>Editar:</strong> Modifica etiquetas y enlaces personalizados</p>
                    <p>• <strong>Switch:</strong> Muestra/oculta elementos en el navbar público</p>
                    <p>• <strong>Elementos Requeridos:</strong> "Inicio", "Conócenos" y "Servicios" siempre están presentes</p>
                    <p>• <strong>Actualizar desde Módulos:</strong> Agrega automáticamente elementos basados en módulos activos</p>
                    <p>• <strong>Restablecer:</strong> Vuelve a la configuración por defecto</p>
                    <p>• Los cambios se reflejan inmediatamente en el navbar público al guardar</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Styles Tab */}
          <TabsContent value="styles">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Layout Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Diseño y Layout</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Altura</Label>
                      <Input
                        value={navbarStyles.height}
                        onChange={(e) => handleStyleChange('height', e.target.value)}
                        placeholder="64px"
                      />
                    </div>
                    <div>
                      <Label>Ancho máximo</Label>
                      <Input
                        value={navbarStyles.maxWidth}
                        onChange={(e) => handleStyleChange('maxWidth', e.target.value)}
                        placeholder="1280px"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Padding interno</Label>
                    <Input
                      value={navbarStyles.padding}
                      onChange={(e) => handleStyleChange('padding', e.target.value)}
                      placeholder="0 16px"
                    />
                  </div>

                  <div>
                    <Label>Posición</Label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={navbarStyles.position}
                      onChange={(e) => handleStyleChange('position', e.target.value)}
                    >
                      <option value="fixed">Fijo (fixed)</option>
                      <option value="sticky">Pegajoso (sticky)</option>
                      <option value="relative">Relativo (relative)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Background Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Fondo y Efectos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Color de fondo</Label>
                    <Input
                      type="color"
                      value={navbarStyles.backgroundColor}
                      onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={navbarStyles.backgroundBlur}
                      onCheckedChange={(checked) => handleStyleChange('backgroundBlur', checked)}
                    />
                    <Label>Efecto de desenfoque</Label>
                  </div>

                  <div>
                    <Label>Opacidad del fondo</Label>
                    <Input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={navbarStyles.backgroundOpacity}
                      onChange={(e) => handleStyleChange('backgroundOpacity', e.target.value)}
                    />
                    <span className="text-sm text-gray-500">{navbarStyles.backgroundOpacity}</span>
                  </div>

                  <div>
                    <Label>Borde inferior</Label>
                    <Input
                      value={navbarStyles.borderBottom}
                      onChange={(e) => handleStyleChange('borderBottom', e.target.value)}
                      placeholder="1px solid rgba(229, 231, 235, 0.8)"
                    />
                  </div>

                  <div>
                    <Label>Sombra</Label>
                    <Input
                      value={navbarStyles.boxShadow}
                      onChange={(e) => handleStyleChange('boxShadow', e.target.value)}
                      placeholder="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Typography Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Tipografía</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Tamaño de fuente</Label>
                    <Input
                      value={navbarStyles.fontSize}
                      onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                      placeholder="16px"
                    />
                  </div>

                  <div>
                    <Label>Peso de fuente</Label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={navbarStyles.fontWeight}
                      onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                    >
                      <option value="300">Ligera (300)</option>
                      <option value="400">Normal (400)</option>
                      <option value="500">Media (500)</option>
                      <option value="600">Semi-negrita (600)</option>
                      <option value="700">Negrita (700)</option>
                    </select>
                  </div>

                  <div>
                    <Label>Familia de fuente</Label>
                    <Input
                      value={navbarStyles.fontFamily}
                      onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                      placeholder="inherit, Inter, sans-serif"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Colors Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Colores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Color de texto</Label>
                    <Input
                      type="color"
                      value={navbarStyles.textColor}
                      onChange={(e) => handleStyleChange('textColor', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Color al pasar cursor</Label>
                    <Input
                      type="color"
                      value={navbarStyles.textHoverColor}
                      onChange={(e) => handleStyleChange('textHoverColor', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Color de enlace activo</Label>
                    <Input
                      type="color"
                      value={navbarStyles.activeTextColor}
                      onChange={(e) => handleStyleChange('activeTextColor', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Tamaño del logo</Label>
                    <Input
                      value={navbarStyles.logoSize}
                      onChange={(e) => handleStyleChange('logoSize', e.target.value)}
                      placeholder="40px"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración Responsive</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Breakpoint móvil</Label>
                    <Input
                      value={navbarStyles.mobileBreakpoint}
                      onChange={(e) => handleStyleChange('mobileBreakpoint', e.target.value)}
                      placeholder="1075px"
                    />
                  </div>

                  <div>
                    <Label>Altura en móvil</Label>
                    <Input
                      value={navbarStyles.mobileHeight}
                      onChange={(e) => handleStyleChange('mobileHeight', e.target.value)}
                      placeholder="64px"
                    />
                  </div>

                  <div>
                    <Label>Transición</Label>
                    <Input
                      value={navbarStyles.transition}
                      onChange={(e) => handleStyleChange('transition', e.target.value)}
                      placeholder="all 0.3s ease"
                    />
                  </div>

                  <div>
                    <Label>Border radius</Label>
                    <Input
                      value={navbarStyles.borderRadius}
                      onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                      placeholder="0px"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:row-span-2">
                <CardHeader>
                  <CardTitle>CSS Personalizado</CardTitle>
                  <p className="text-sm text-gray-600">
                    Agrega CSS personalizado para estilos avanzados
                  </p>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="w-full h-64 p-3 border rounded-md font-mono text-sm"
                    value={navbarStyles.customCSS}
                    onChange={(e) => handleStyleChange('customCSS', e.target.value)}
                    placeholder={`/* CSS personalizado */
.navbar-custom .navbar-link {
  text-transform: uppercase;
  letter-spacing: 1px;
}

.navbar-custom:hover {
  background-color: rgba(255, 255, 255, 0.98);
}`}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>CSS Generado</CardTitle>
                  <p className="text-sm text-gray-600">
                    Vista previa del CSS que se aplicará
                  </p>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-auto max-h-48">
                    {generateCSS()}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa del Navbar</CardTitle>
                <p className="text-sm text-gray-600">
                  Así se verá tu navbar con los estilos aplicados
                </p>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <nav 
                    className="w-full navbar-custom"
                    style={{
                      height: navbarStyles.height,
                      backgroundColor: navbarStyles.backgroundColor,
                      backdropFilter: navbarStyles.backgroundBlur ? 'blur(10px)' : 'none',
                      borderBottom: navbarStyles.borderBottom,
                      boxShadow: navbarStyles.boxShadow,
                      borderRadius: navbarStyles.borderRadius,
                      position: 'relative', // Changed from fixed to relative for preview
                      top: undefined, // Remove fixed positioning properties
                      left: undefined,
                      right: undefined,
                      transition: navbarStyles.transition
                    }}
                  >
                    <div 
                      className="h-full flex items-center justify-between navbar-container"
                      style={{
                        maxWidth: navbarStyles.maxWidth,
                        padding: navbarStyles.padding,
                        margin: '0 auto'
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="bg-gray-300 rounded navbar-logo"
                          style={{ 
                            height: navbarStyles.logoSize, 
                            width: navbarStyles.logoSize 
                          }}
                        />
                        <span className="font-semibold text-xl">Logo</span>
                      </div>

                      <div className="flex items-center space-x-6">
                        {items.filter(item => item.isVisible).slice(0, 5).map((item) => (
                          <span
                            key={item.moduleKey}
                            className="navbar-link cursor-pointer hover:opacity-80"
                            style={{
                              fontSize: navbarStyles.fontSize,
                              fontWeight: navbarStyles.fontWeight,
                              fontFamily: navbarStyles.fontFamily,
                              color: navbarStyles.textColor,
                              transition: navbarStyles.transition,
                            }}
                          >
                            {item.label}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                  </nav>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h4 className="font-medium">Información de los estilos:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Altura:</span> {navbarStyles.height}
                    </div>
                    <div>
                      <span className="font-medium">Posición:</span> {navbarStyles.position}
                    </div>
                    <div>
                      <span className="font-medium">Color de fondo:</span> 
                      <div 
                        className="inline-block w-4 h-4 rounded ml-2 border"
                        style={{ backgroundColor: navbarStyles.backgroundColor }}
                      />
                    </div>
                    <div>
                      <span className="font-medium">Color de texto:</span>
                      <div 
                        className="inline-block w-4 h-4 rounded ml-2 border"
                        style={{ backgroundColor: navbarStyles.textColor }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}