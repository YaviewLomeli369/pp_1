
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function AdminNavbarConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<NavbarItem[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editHref, setEditHref] = useState("");

  const { data: config, isLoading } = useQuery({
    queryKey: ["/api/config"],
    staleTime: 5 * 60 * 1000,
  });

  // Initialize items based on active modules and existing navbar config
  useEffect(() => {
    if (config) {
      const modules = (config as any)?.config?.frontpage?.modulos || {};
      const navbarConfig = (config as any)?.config?.navbar || {};

      // Get available items based on active modules or required status
      const availableItems = defaultNavItems.filter(item => 
        item.isRequired || (item.moduleKey && modules[item.moduleKey]?.activo)
      );

      // Create items with existing navbar config or defaults
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

      // Sort by order
      configuredItems.sort((a, b) => a.order - b.order);
      setItems(configuredItems);
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    // Update order values
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

  const handleSaveConfiguration = () => {
    if (!config) return;

    // Create navbar configuration object
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

    // Update the existing config without resetting anything
    const updatedConfig = {
      ...(config as any).config,
      navbar: navbarConfig
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
              Gestiona el orden, visibilidad, etiquetas y enlaces de los elementos en la barra de navegación
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
              onClick={handleSaveConfiguration} 
              disabled={updateConfigMutation.isPending || !config}
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar Configuración
            </Button>
          </div>
        </div>

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
                                          placeholder="Ruta del enlace (ej: /contacto)"
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
      </div>
    </AdminLayout>
  );
}
