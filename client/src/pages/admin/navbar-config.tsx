import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  Plus,
  Trash2,
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
} from "lucide-react";

type NavbarConfig = {
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
  { moduleKey: "home", label: "Inicio", href: "/", isRequired: true },
  { moduleKey: "testimonios", label: "Testimonios", href: "/testimonials", isRequired: false },
  { moduleKey: "faqs", label: "FAQs", href: "/faqs", isRequired: false },
  { moduleKey: "contacto", label: "Contacto", href: "/contact", isRequired: false },
  { moduleKey: "tienda", label: "Tienda", href: "/store", isRequired: false },
  { moduleKey: "blog", label: "Blog", href: "/blog", isRequired: false },
  { moduleKey: "reservas", label: "Reservas", href: "/reservations", isRequired: false },
  { moduleKey: "conocenos", label: "Conócenos", href: "/conocenos", isRequired: true },
  { moduleKey: "servicios", label: "Servicios", href: "/servicios", isRequired: true },
];

export default function AdminNavbarConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<NavbarConfig[]>([]);
  const [newItem, setNewItem] = useState({
    moduleKey: "",
    label: "",
    href: "",
    isVisible: true,
  });

  const { data: config } = useQuery({
    queryKey: ["/api/config"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: navbarConfig, isLoading } = useQuery({
    queryKey: ["/api/navbar-config"],
    onSuccess: (data: NavbarConfig[]) => {
      if (data && data.length > 0) {
        setItems(data);
      } else if (config) {
        // Initialize with items based on active modules
        const modules = (config as any)?.config?.frontpage?.modulos || {};
        const availableItems = defaultNavItems.filter(item => 
          item.isRequired || (item.moduleKey && modules[item.moduleKey]?.activo)
        );

        const defaultItems = availableItems.map((item, index) => ({
          id: `default-${item.moduleKey}`,
          moduleKey: item.moduleKey,
          label: item.label,
          href: item.href,
          isVisible: true,
          order: index,
          isRequired: item.isRequired,
        }));
        setItems(defaultItems);
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/navbar-config", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/navbar-config"] });
      toast({ title: "Elemento creado", description: "El elemento del navbar ha sido creado correctamente" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "No se pudo crear el elemento" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/navbar-config/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/navbar-config"] });
      toast({ title: "Actualizado", description: "El elemento ha sido actualizado correctamente" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el elemento" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; order: number }[]) => apiRequest("/api/navbar-config/reorder", {
      method: "PUT",
      body: JSON.stringify({ items }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/navbar-config"] });
      toast({ title: "Orden actualizado", description: "El orden del navbar ha sido guardado" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el orden" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/navbar-config/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/navbar-config"] });
      toast({ title: "Eliminado", description: "El elemento ha sido eliminado correctamente" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el elemento" });
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

  const handleSaveOrder = () => {
    const orderData = items.map((item, index) => ({
      id: item.id,
      order: index,
    }));
    reorderMutation.mutate(orderData);
  };

  const handleToggleVisibility = (id: string, isVisible: boolean) => {
    const item = items.find(i => i.id === id);
    if (item && !item.isRequired) {
      updateMutation.mutate({
        id,
        data: { ...item, isVisible },
      });
      setItems(items.map(i => i.id === id ? { ...i, isVisible } : i));
    }
  };

  const handleAddItem = () => {
    if (!newItem.moduleKey || !newItem.label || !newItem.href) {
      toast({ variant: "destructive", title: "Error", description: "Todos los campos son obligatorios" });
      return;
    }

    const itemData = {
      ...newItem,
      order: items.length,
      isRequired: false,
    };

    createMutation.mutate(itemData);
    setNewItem({ moduleKey: "", label: "", href: "", isVisible: true });
  };

  const handleDeleteItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item && !item.isRequired) {
      deleteMutation.mutate(id);
      setItems(items.filter(i => i.id !== id));
    }
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
      // Create the new items in database
      newItems.forEach(item => {
        createMutation.mutate(item);
      });

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
              Configuración del Navbar
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona el orden y visibilidad de los elementos en la barra de navegación basados en módulos activos
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefreshFromModules}
              disabled={!config}
            >
              <Plus className="mr-2 h-4 w-4" />
              Actualizar desde Módulos
            </Button>
            <Button onClick={handleSaveOrder} disabled={reorderMutation.isLoading}>
              <Save className="mr-2 h-4 w-4" />
              Guardar Orden
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
                  Arrastra para reordenar. Los elementos marcados como requeridos no se pueden eliminar.
                </p>
              </CardHeader>
              <CardContent className="min-h-[200px]">
                {items.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    <p>No hay elementos configurados. Usa "Actualizar desde Módulos" para cargar los elementos.</p>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="navbar-items">
                      {(provided, snapshot) => (
                        <div 
                          {...provided.droppableProps} 
                          ref={provided.innerRef} 
                          className={`space-y-2 min-h-[100px] transition-colors ${
                            snapshot.isDraggingOver ? "bg-gray-50 border-dashed border-2 border-primary rounded-lg p-2" : ""
                          }`}
                        >
                          {items.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-center justify-between p-4 border rounded-lg bg-white transition-all ${
                                    snapshot.isDragging ? "shadow-lg border-primary rotate-1 scale-105" : "border-gray-200 hover:border-gray-300"
                                  }`}
                                  style={{
                                    ...provided.draggableProps.style,
                                    transform: snapshot.isDragging 
                                      ? `${provided.draggableProps.style?.transform} rotate(1deg)` 
                                      : provided.draggableProps.style?.transform,
                                  }}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div {...provided.dragHandleProps}>
                                      <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {iconMap[item.moduleKey] || <Package className="h-4 w-4" />}
                                      <span className="font-medium">{item.label}</span>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {item.href}
                                    </Badge>
                                    {item.isRequired && (
                                      <Badge variant="secondary" className="text-xs">
                                        Requerido
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      checked={item.isVisible}
                                      onCheckedChange={(checked) => handleToggleVisibility(item.id, checked)}
                                      disabled={item.isRequired}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleToggleVisibility(item.id, !item.isVisible)}
                                      disabled={item.isRequired}
                                    >
                                      {item.isVisible ? (
                                        <Eye className="h-4 w-4" />
                                      ) : (
                                        <EyeOff className="h-4 w-4" />
                                      )}
                                    </Button>
                                    {!item.isRequired && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
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

          {/* Module Status */}
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
                    <div key={item.moduleKey} className="flex items-center justify-between p-2 border rounded">
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
                <p>• <strong>Actualizar desde Módulos:</strong> Agrega automáticamente elementos basados en módulos activos</p>
                <p>• <strong>Arrastrar:</strong> Cambia el orden de los elementos</p>
                <p>• <strong>Switch:</strong> Muestra/oculta elementos en el navbar público</p>
                <p>• <strong>Elementos Requeridos:</strong> "Inicio", "Conócenos" y "Servicios" siempre están presentes</p>
                <p>• <strong>Guardar Orden:</strong> Confirma los cambios de posición</p>
                <p>• Los cambios se reflejan inmediatamente en el navbar público</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}