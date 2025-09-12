
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

  const { data: navbarConfig, isLoading } = useQuery({
    queryKey: ["/api/navbar-config"],
    onSuccess: (data: NavbarConfig[]) => {
      if (data && data.length > 0) {
        setItems(data);
      } else {
        // Initialize with default items if no config exists
        const defaultItems = defaultNavItems.map((item, index) => ({
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
              Gestiona el orden y visibilidad de los elementos en la barra de navegación
            </p>
          </div>
          <Button onClick={handleSaveOrder} disabled={reorderMutation.isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Orden
          </Button>
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
              <CardContent>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="navbar-items">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {items.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`flex items-center justify-between p-4 border rounded-lg bg-white ${
                                  snapshot.isDragging ? "shadow-lg border-primary" : "border-gray-200"
                                }`}
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
              </CardContent>
            </Card>
          </div>

          {/* Add New Item */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Agregar Nuevo Elemento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="moduleKey">Clave del Módulo</Label>
                  <Input
                    id="moduleKey"
                    value={newItem.moduleKey}
                    onChange={(e) => setNewItem({ ...newItem, moduleKey: e.target.value })}
                    placeholder="ej: mi-modulo"
                  />
                </div>

                <div>
                  <Label htmlFor="label">Etiqueta</Label>
                  <Input
                    id="label"
                    value={newItem.label}
                    onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                    placeholder="ej: Mi Módulo"
                  />
                </div>

                <div>
                  <Label htmlFor="href">Enlace</Label>
                  <Input
                    id="href"
                    value={newItem.href}
                    onChange={(e) => setNewItem({ ...newItem, href: e.target.value })}
                    placeholder="ej: /mi-modulo"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newItem.isVisible}
                    onCheckedChange={(checked) => setNewItem({ ...newItem, isVisible: checked })}
                  />
                  <Label>Visible</Label>
                </div>

                <Button 
                  onClick={handleAddItem} 
                  className="w-full"
                  disabled={createMutation.isLoading}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Elemento
                </Button>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Instrucciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>• Arrastra los elementos para cambiar el orden</p>
                <p>• Usa el switch para mostrar/ocultar elementos</p>
                <p>• Los elementos "Requeridos" no se pueden eliminar</p>
                <p>• Guarda el orden cuando termines de reorganizar</p>
                <p>• Los cambios se reflejan inmediatamente en el navbar público</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
