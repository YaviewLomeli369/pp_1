
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
  BarChart3,
  Puzzle,
  Palette,
  Users,
  Layout,
  Quote,
  HelpCircle,
  ShoppingCart,
  Calendar,
  Mail,
  MessageSquare,
  FileText,
  Settings,
  CreditCard,
  Package,
  Warehouse,
  MapPin,
  MessageCircle,
  Navigation,
  GripVertical,
  Save,
  Eye,
  EyeOff,
  Edit2,
  RefreshCw,
  Sidebar,
} from "lucide-react";

type SidebarItem = {
  id: string;
  href: string;
  label: string;
  icon: string;
  section?: string;
  moduleRequired?: string;
  superuserOnly?: boolean;
  isVisible: boolean;
  order: number;
};

const iconMap: { [key: string]: React.ReactNode } = {
  BarChart3: <BarChart3 className="h-4 w-4" />,
  Puzzle: <Puzzle className="h-4 w-4" />,
  Palette: <Palette className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Layout: <Layout className="h-4 w-4" />,
  Quote: <Quote className="h-4 w-4" />,
  HelpCircle: <HelpCircle className="h-4 w-4" />,
  ShoppingCart: <ShoppingCart className="h-4 w-4" />,
  Calendar: <Calendar className="h-4 w-4" />,
  Mail: <Mail className="h-4 w-4" />,
  MessageSquare: <MessageSquare className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
  CreditCard: <CreditCard className="h-4 w-4" />,
  Package: <Package className="h-4 w-4" />,
  Warehouse: <Warehouse className="h-4 w-4" />,
  MapPin: <MapPin className="h-4 w-4" />,
  MessageCircle: <MessageCircle className="h-4 w-4" />,
  Navigation: <Navigation className="h-4 w-4" />,
};

const defaultSidebarItems = [
  { href: "/admin", label: "Dashboard", icon: "BarChart3", section: "", order: 0 },
  { href: "/admin/modules", label: "Módulos", icon: "Puzzle", section: "Configuración", superuserOnly: true, order: 1 },
  { href: "/admin/appearance", label: "Apariencia", icon: "Palette", section: "Configuración", order: 2 },
  { href: "/admin/users", label: "Usuarios", icon: "Users", section: "Configuración", order: 3 },
  { href: "/admin/sections", label: "Secciones", icon: "Layout", section: "Contenido", superuserOnly: true, order: 4 },
  { href: "/admin/pages-content", label: "Contenido de Páginas", icon: "FileText", section: "Contenido", order: 5 },
  { href: "/admin/testimonials", label: "Testimonios", icon: "Quote", section: "Contenido", moduleRequired: "testimonios", order: 6 },
  { href: "/admin/faqs", label: "FAQs", icon: "HelpCircle", section: "Contenido", moduleRequired: "faqs", order: 7 },
  { href: "/admin/blog", label: "Blog", icon: "FileText", section: "Contenido", moduleRequired: "blog", order: 8 },
  { href: "/admin/store", label: "Productos", icon: "ShoppingCart", section: "Módulos de Negocio", moduleRequired: "tienda", order: 9 },
  { href: "/admin/inventory", label: "Inventario", icon: "Warehouse", section: "Módulos de Negocio", moduleRequired: "tienda", order: 10 },
  { href: "/admin/orders", label: "Pedidos", icon: "Package", section: "Módulos de Negocio", moduleRequired: "tienda", order: 11 },
  { href: "/admin/reservations", label: "Reservas", icon: "Calendar", section: "Módulos de Negocio", moduleRequired: "reservas", order: 12 },
  { href: "/admin/reservation-settings", label: "Config. Reservas", icon: "Settings", section: "Módulos de Negocio", moduleRequired: "reservas", order: 13 },
  { href: "/admin/contact", label: "Mensajes", icon: "MessageSquare", section: "Módulos de Negocio", moduleRequired: "contacto", order: 14 },
  { href: "/admin/contact-info", label: "Información de Contacto", icon: "MapPin", section: "Módulos de Negocio", moduleRequired: "contacto", order: 15 },
  { href: "/admin/whatsapp-config", label: "WhatsApp", icon: "MessageCircle", section: "Configuración General", order: 16 },
  { href: "/admin/navbar-config", label: "Navbar", icon: "Navigation", section: "Configuración General", order: 17 },
  { href: "/admin/sidebar-config", label: "Sidebar", icon: "Sidebar", section: "Configuración General", order: 18 },
  { href: "/admin/email-config", label: "Config. Email", icon: "Mail", section: "Módulos de Negocio", order: 19 },
  { href: "/admin/payments", label: "Config. Pagos", icon: "CreditCard", section: "Módulos de Negocio", moduleRequired: "tienda", order: 20 },
];

export default function AdminSidebarConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<SidebarItem[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editHref, setEditHref] = useState("");

  const { data: config, isLoading } = useQuery({
    queryKey: ["/api/config"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  // Initialize items based on user role, active modules and existing sidebar config
  useEffect(() => {
    if (config && currentUser) {
      const modules = (config as any)?.config?.frontpage?.modulos || {};
      const sidebarConfig = (config as any)?.config?.sidebar || {};
      const isSuperuser = (currentUser as any)?.role === 'superuser';

      // Filter items based on user role and module requirements
      const availableItems = defaultSidebarItems.filter(item => {
        // Superuser sees everything
        if (isSuperuser) return true;
        
        // Hide superuser-only items from admin
        if (item.superuserOnly) return false;
        
        // For items with module requirements, check if module is active
        if (item.moduleRequired) {
          return modules[item.moduleRequired]?.activo || false;
        }
        
        return true;
      });

      // Create items with existing sidebar config or defaults
      const configuredItems = availableItems.map((item) => {
        const existingConfig = sidebarConfig[item.href] || {};
        return {
          id: `${item.href.replace(/\//g, '_')}-${Date.now()}`,
          href: item.href,
          label: existingConfig.label || item.label,
          icon: item.icon,
          section: item.section,
          moduleRequired: item.moduleRequired,
          superuserOnly: item.superuserOnly,
          isVisible: existingConfig.isVisible !== undefined ? existingConfig.isVisible : true,
          order: existingConfig.order !== undefined ? existingConfig.order : item.order,
        };
      });

      // Sort by order
      configuredItems.sort((a, b) => a.order - b.order);
      setItems(configuredItems);
    }
  }, [config, currentUser]);

  const updateConfigMutation = useMutation({
    mutationFn: (newConfig: any) => apiRequest("/api/config", {
      method: "PUT",
      body: JSON.stringify({ config: newConfig }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({ title: "Configuración actualizada", description: "El sidebar ha sido actualizado correctamente" });
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

  const handleToggleVisibility = (href: string, isVisible: boolean) => {
    setItems(items.map(item => 
      item.href === href ? { ...item, isVisible } : item
    ));
  };

  const handleEditItem = (item: SidebarItem) => {
    setEditingItem(item.href);
    setEditLabel(item.label);
    setEditHref(item.href);
  };

  const handleSaveEdit = () => {
    if (editingItem) {
      setItems(items.map(item => 
        item.href === editingItem 
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

    // Create sidebar configuration object
    const sidebarConfig: { [key: string]: any } = {};
    items.forEach(item => {
      sidebarConfig[item.href] = {
        isVisible: item.isVisible,
        order: item.order,
        label: item.label,
        href: item.href,
        icon: item.icon,
        section: item.section
      };
    });

    // Update the existing config without resetting anything
    const updatedConfig = {
      ...(config as any).config,
      sidebar: sidebarConfig
    };

    updateConfigMutation.mutate(updatedConfig);
  };

  const handleResetToDefaults = () => {
    if (!config || !currentUser) return;

    const modules = (config as any)?.config?.frontpage?.modulos || {};
    const isSuperuser = (currentUser as any)?.role === 'superuser';

    const availableItems = defaultSidebarItems.filter(item => {
      if (isSuperuser) return true;
      if (item.superuserOnly) return false;
      if (item.moduleRequired) {
        return modules[item.moduleRequired]?.activo || false;
      }
      return true;
    });

    const resetItems = availableItems.map((item) => ({
      id: `reset-${item.href.replace(/\//g, '_')}-${Date.now()}`,
      href: item.href,
      label: item.label,
      icon: item.icon,
      section: item.section,
      moduleRequired: item.moduleRequired,
      superuserOnly: item.superuserOnly,
      isVisible: true,
      order: item.order,
    }));

    setItems(resetItems);
    toast({ 
      title: "Configuración restablecida", 
      description: "Se han restaurado los valores por defecto" 
    });
  };

  // Group items by section for display
  const groupedItems = items.reduce((groups, item) => {
    const section = item.section || 'General';
    if (!groups[section]) {
      groups[section] = [];
    }
    groups[section].push(item);
    return groups;
  }, {} as { [key: string]: SidebarItem[] });

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
              <Layout className="h-6 w-6" />
              Configuración Avanzada del Sidebar
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona el orden, visibilidad y etiquetas de los elementos en el panel de administración
            </p>
          </div>
          <div className="flex gap-2">
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
          {/* Current Sidebar Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Elementos del Sidebar</CardTitle>
                <p className="text-sm text-gray-600">
                  Arrastra para reordenar. Haz clic en el ícono de editar para modificar etiquetas.
                </p>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No hay elementos configurados</p>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="sidebar-items">
                      {(provided) => (
                        <div 
                          {...provided.droppableProps} 
                          ref={provided.innerRef} 
                          className="space-y-3"
                        >
                          {Object.entries(groupedItems).map(([section, sectionItems]) => (
                            <div key={section} className="space-y-2">
                              {section !== 'General' && (
                                <h3 className="text-sm font-semibold text-gray-700 px-2">{section}</h3>
                              )}
                              {sectionItems.map((item, index) => {
                                const globalIndex = items.findIndex(i => i.id === item.id);
                                return (
                                  <Draggable 
                                    key={item.id} 
                                    draggableId={item.id} 
                                    index={globalIndex}
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
                                        {editingItem === item.href ? (
                                          <div className="p-4 space-y-4">
                                            <div className="space-y-2">
                                              <Label>Etiqueta</Label>
                                              <Input
                                                value={editLabel}
                                                onChange={(e) => setEditLabel(e.target.value)}
                                                placeholder="Nombre que aparece en el sidebar"
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
                                                {iconMap[item.icon] || <Settings className="h-4 w-4" />}
                                                <div>
                                                  <span className="font-medium">{item.label}</span>
                                                  <div className="text-xs text-gray-500">{item.href}</div>
                                                </div>
                                              </div>
                                              {item.superuserOnly && (
                                                <Badge variant="secondary" className="text-xs">
                                                  Superuser
                                                </Badge>
                                              )}
                                              {item.moduleRequired && (
                                                <Badge variant="outline" className="text-xs">
                                                  {item.moduleRequired}
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
                                                  handleToggleVisibility(item.href, checked)
                                                }
                                              />
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => 
                                                  handleToggleVisibility(item.href, !item.isVisible)
                                                }
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
                                );
                              })}
                            </div>
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

          {/* Instructions & Preview */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa por Secciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(groupedItems).map(([section, sectionItems]) => (
                  <div key={section} className="space-y-2">
                    <h4 className="font-medium text-sm">{section}</h4>
                    <div className="space-y-1">
                      {sectionItems.filter(item => item.isVisible).map(item => (
                        <div key={item.id} className="flex items-center space-x-2 text-xs p-2 bg-gray-50 rounded">
                          {iconMap[item.icon] || <Settings className="h-3 w-3" />}
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Instrucciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>• <strong>Arrastrar:</strong> Cambia el orden de los elementos</p>
                <p>• <strong>Editar:</strong> Modifica etiquetas personalizadas</p>
                <p>• <strong>Switch:</strong> Muestra/oculta elementos en el sidebar</p>
                <p>• <strong>Secciones:</strong> Los elementos se agrupan por categorías</p>
                <p>• <strong>Superuser:</strong> Elementos exclusivos para superusuarios</p>
                <p>• <strong>Módulos:</strong> Elementos que dependen de módulos activos</p>
                <p>• Los cambios se reflejan inmediatamente al guardar</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
