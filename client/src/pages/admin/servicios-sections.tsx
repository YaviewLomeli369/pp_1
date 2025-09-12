
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Plus, Trash2, FileText, Target, Users, Rocket } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { SiteConfig } from "@shared/schema";

interface ServiceSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
}

interface ServicesSectionForm {
  title: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
}

const iconOptions = [
  { value: "Rocket", label: "Cohete", component: Rocket },
  { value: "Target", label: "Diana", component: Target },
  { value: "Users", label: "Usuarios", component: Users },
  { value: "FileText", label: "Documento", component: FileText }
];

const colorOptions = [
  { value: "blue", label: "Azul" },
  { value: "green", label: "Verde" },
  { value: "purple", label: "Morado" },
  { value: "red", label: "Rojo" },
  { value: "yellow", label: "Amarillo" },
  { value: "indigo", label: "Índigo" }
];

export default function AdminServiciosSections() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<ServiceSection | null>(null);
  const [formData, setFormData] = useState<ServicesSectionForm>({
    title: "",
    description: "",
    icon: "Rocket",
    color: "blue",
    isActive: true
  });

  const { data: config } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
  });

  const services = useMemo(() => {
    const configData = config?.config as any;
    return configData?.pagesContent?.servicios?.services || [];
  }, [config]);

  const updateConfigMutation = useMutation({
    mutationFn: async (updatedServices: ServiceSection[]) => {
      const configData = config?.config as any;
      const updatedConfig = {
        ...configData,
        pagesContent: {
          ...configData?.pagesContent,
          servicios: {
            ...configData?.pagesContent?.servicios,
            services: updatedServices
          }
        }
      };

      return await apiRequest("/api/config", {
        method: "PUT",
        body: JSON.stringify({ config: updatedConfig }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({ title: "Servicios actualizados correctamente" });
      setShowForm(false);
      setEditingService(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error al actualizar servicios", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      icon: "Rocket",
      color: "blue",
      isActive: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({ title: "Por favor completa todos los campos", variant: "destructive" });
      return;
    }

    let updatedServices;
    
    if (editingService) {
      updatedServices = services.map((service: ServiceSection) =>
        service.id === editingService.id
          ? { ...service, ...formData }
          : service
      );
    } else {
      const newService: ServiceSection = {
        id: Date.now().toString(),
        ...formData
      };
      updatedServices = [...services, newService];
    }

    updateConfigMutation.mutate(updatedServices);
  };

  const handleEdit = (service: ServiceSection) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      icon: service.icon,
      color: service.color,
      isActive: service.isActive
    });
    setShowForm(true);
  };

  const handleDelete = (serviceId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este servicio?")) {
      const updatedServices = services.filter((service: ServiceSection) => service.id !== serviceId);
      updateConfigMutation.mutate(updatedServices);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(option => option.value === iconName);
    return iconOption?.component || Rocket;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Secciones de Servicios</h1>
            <p className="text-gray-600 mt-1">Gestiona los servicios mostrados en la página de servicios</p>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingService(null); }}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Servicio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? "Editar Servicio" : "Nuevo Servicio"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: Desarrollo Web"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción del servicio"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="icon">Icono</Label>
                  <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.component className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="color">Color</Label>
                  <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Activo</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={updateConfigMutation.isPending} className="flex-1">
                    {updateConfigMutation.isPending ? "Guardando..." : editingService ? "Actualizar" : "Crear"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Services List */}
        <div className="grid gap-4">
          {services.map((service: ServiceSection) => {
            const IconComponent = getIconComponent(service.icon);
            return (
              <Card key={service.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg text-${service.color}-600 bg-${service.color}-100`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                        <p className="text-gray-600 mt-1">{service.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            service.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {service.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                          <span className="text-sm text-gray-500">
                            Color: {colorOptions.find(c => c.value === service.color)?.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(service)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {services.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay servicios</h3>
                <p className="text-gray-600 mb-4">Crea tu primer servicio para comenzar</p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Servicio
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
