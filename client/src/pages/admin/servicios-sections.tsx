
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

interface ServiceSection {
  id: string;
  type: 'service' | 'plan';
  title: string;
  description: string;
  price?: string;
  features: string[];
  highlight?: boolean;
  icon?: string;
  order: number;
  isActive: boolean;
}

export default function ServiciosSections() {
  const [editingSection, setEditingSection] = useState<ServiceSection | null>(null);
  const [newSection, setNewSection] = useState<Partial<ServiceSection>>({
    type: 'service',
    title: '',
    description: '',
    features: [],
    order: 0,
    isActive: true
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: sections = [], isLoading } = useQuery<ServiceSection[]>({
    queryKey: ["/api/servicios-sections"],
    queryFn: () => apiRequest("/api/servicios-sections"),
    retry: 1,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const createSectionMutation = useMutation({
    mutationFn: (section: Partial<ServiceSection>) => 
      apiRequest("/api/servicios-sections", {
        method: "POST",
        body: JSON.stringify(section)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servicios-sections"] });
      setShowCreateDialog(false);
      setNewSection({
        type: 'service',
        title: '',
        description: '',
        features: [],
        order: 0,
        isActive: true
      });
      toast({ title: "Sección creada exitosamente" });
    },
    onError: (error) => {
      toast({ title: "Error al crear sección", description: error.message, variant: "destructive" });
    }
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ id, ...section }: ServiceSection) => 
      apiRequest(`/api/servicios-sections/${id}`, {
        method: "PUT",
        body: JSON.stringify(section)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servicios-sections"] });
      setEditingSection(null);
      toast({ title: "Sección actualizada exitosamente" });
    },
    onError: (error) => {
      toast({ title: "Error al actualizar sección", description: error.message, variant: "destructive" });
    }
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/servicios-sections/${id}`, {
        method: "DELETE"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servicios-sections"] });
      toast({ title: "Sección eliminada exitosamente" });
    },
    onError: (error) => {
      toast({ title: "Error al eliminar sección", description: error.message, variant: "destructive" });
    }
  });

  const handleCreateSection = () => {
    if (!newSection.title || !newSection.description) {
      toast({ title: "Error", description: "Título y descripción son requeridos", variant: "destructive" });
      return;
    }
    createSectionMutation.mutate(newSection);
  };

  const handleUpdateSection = (section: ServiceSection) => {
    if (!section.title || !section.description) {
      toast({ title: "Error", description: "Título y descripción son requeridos", variant: "destructive" });
      return;
    }
    updateSectionMutation.mutate(section);
  };

  const handleDeleteSection = (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta sección?")) {
      deleteSectionMutation.mutate(id);
    }
  };

  const addFeature = (section: ServiceSection | Partial<ServiceSection>, feature: string) => {
    if (!feature.trim()) return;
    const updatedFeatures = [...(section.features || []), feature];
    
    if ('id' in section) {
      setEditingSection({ ...section as ServiceSection, features: updatedFeatures });
    } else {
      setNewSection({ ...section, features: updatedFeatures });
    }
  };

  const removeFeature = (section: ServiceSection | Partial<ServiceSection>, index: number) => {
    const updatedFeatures = (section.features || []).filter((_, i) => i !== index);
    
    if ('id' in section) {
      setEditingSection({ ...section as ServiceSection, features: updatedFeatures });
    } else {
      setNewSection({ ...section, features: updatedFeatures });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div>Cargando...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Servicios</h1>
            <p className="text-muted-foreground mt-2">
              Administra las secciones de servicios y planes
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Sección
          </Button>
        </div>

        <div className="grid gap-6">
          {sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CardTitle>{section.title}</CardTitle>
                    <Badge variant={section.type === 'service' ? 'default' : 'secondary'}>
                      {section.type === 'service' ? 'Servicio' : 'Plan'}
                    </Badge>
                    {section.highlight && <Badge variant="outline">Destacado</Badge>}
                    <Badge variant={section.isActive ? 'default' : 'secondary'}>
                      {section.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSection(section)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSection(section.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{section.description}</p>
                {section.price && (
                  <p className="font-semibold mb-2">Precio: {section.price}</p>
                )}
                {section.features && section.features.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Características:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {section.features.map((feature, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Section Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nueva Sección de Servicios</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={newSection.type}
                    onValueChange={(value: 'service' | 'plan') => setNewSection({...newSection, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Servicio</SelectItem>
                      <SelectItem value="plan">Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Orden</Label>
                  <Input
                    type="number"
                    value={newSection.order || 0}
                    onChange={(e) => setNewSection({...newSection, order: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={newSection.title}
                  onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                  placeholder="Título de la sección"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Descripción *</Label>
                <Textarea
                  value={newSection.description}
                  onChange={(e) => setNewSection({...newSection, description: e.target.value})}
                  placeholder="Descripción de la sección"
                  rows={3}
                />
              </div>

              {newSection.type === 'plan' && (
                <div className="space-y-2">
                  <Label>Precio</Label>
                  <Input
                    value={newSection.price || ''}
                    onChange={(e) => setNewSection({...newSection, price: e.target.value})}
                    placeholder="Ej: 9,499 MXN"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Características</Label>
                <div className="space-y-2">
                  {(newSection.features || []).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input value={feature} readOnly />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(newSection, index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Nueva característica"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addFeature(newSection, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                        if (input?.value) {
                          addFeature(newSection, input.value);
                          input.value = '';
                        }
                      }}
                    >
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newSection.highlight || false}
                    onCheckedChange={(checked) => setNewSection({...newSection, highlight: checked})}
                  />
                  <Label>Destacar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newSection.isActive !== false}
                    onCheckedChange={(checked) => setNewSection({...newSection, isActive: checked})}
                  />
                  <Label>Activo</Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateSection} disabled={createSectionMutation.isPending}>
                {createSectionMutation.isPending ? "Guardando..." : "Crear Sección"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Section Dialog */}
        {editingSection && (
          <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Editar Sección</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={editingSection.type}
                      onValueChange={(value: 'service' | 'plan') => setEditingSection({...editingSection, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service">Servicio</SelectItem>
                        <SelectItem value="plan">Plan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Orden</Label>
                    <Input
                      type="number"
                      value={editingSection.order || 0}
                      onChange={(e) => setEditingSection({...editingSection, order: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input
                    value={editingSection.title}
                    onChange={(e) => setEditingSection({...editingSection, title: e.target.value})}
                    placeholder="Título de la sección"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Descripción *</Label>
                  <Textarea
                    value={editingSection.description}
                    onChange={(e) => setEditingSection({...editingSection, description: e.target.value})}
                    placeholder="Descripción de la sección"
                    rows={3}
                  />
                </div>

                {editingSection.type === 'plan' && (
                  <div className="space-y-2">
                    <Label>Precio</Label>
                    <Input
                      value={editingSection.price || ''}
                      onChange={(e) => setEditingSection({...editingSection, price: e.target.value})}
                      placeholder="Ej: 9,499 MXN"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Características</Label>
                  <div className="space-y-2">
                    {(editingSection.features || []).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input 
                          value={feature} 
                          onChange={(e) => {
                            const updatedFeatures = [...editingSection.features];
                            updatedFeatures[index] = e.target.value;
                            setEditingSection({...editingSection, features: updatedFeatures});
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFeature(editingSection, index)}
                        >
                          <Trash2 className="w-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Nueva característica"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addFeature(editingSection, e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                          if (input?.value) {
                            addFeature(editingSection, input.value);
                            input.value = '';
                          }
                        }}
                      >
                        Agregar
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingSection.highlight || false}
                      onCheckedChange={(checked) => setEditingSection({...editingSection, highlight: checked})}
                    />
                    <Label>Destacar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingSection.isActive !== false}
                      onCheckedChange={(checked) => setEditingSection({...editingSection, isActive: checked})}
                    />
                    <Label>Activo</Label>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingSection(null)}>
                  Cancelar
                </Button>
                <Button onClick={() => handleUpdateSection(editingSection)} disabled={updateSectionMutation.isPending}>
                  {updateSectionMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
}
