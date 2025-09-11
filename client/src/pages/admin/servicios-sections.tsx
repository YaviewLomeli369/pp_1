
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Save, Settings } from "lucide-react";

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
    queryFn: () => apiRequest("/api/servicios-sections")
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
                  <select
                    value={newSection.type}
                    onChange={(e) => setNewSection({...newSection, type: e.target.value as 'service' | 'plan'})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="service">Servicio</option>
                    <option value="plan">Plan</option>
                  </select>
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
                  <input
                    type="checkbox"
                    id="highlight"
                    checked={newSection.highlight || false}
                    onChange={(e) => setNewSection({...newSection, highlight: e.target.checked})}
                  />
                  <Label htmlFor="highlight">Destacar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={newSection.isActive !== false}
                    onChange={(e) => setNewSection({...newSection, isActive: e.target.checked})}
                  />
                  <Label htmlFor="active">Activo</Label>
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
                    <select
                      value={editingSection.type}
                      onChange={(e) => setEditingSection({...editingSection, type: e.target.value as 'service' | 'plan'})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="service">Servicio</option>
                      <option value="plan">Plan</option>
                    </select>
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
                          <Trash2 className="w-4 h-4" />
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
                    <input
                      type="checkbox"
                      id="edit-highlight"
                      checked={editingSection.highlight || false}
                      onChange={(e) => setEditingSection({...editingSection, highlight: e.target.checked})}
                    />
                    <Label htmlFor="edit-highlight">Destacar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-active"
                      checked={editingSection.isActive !== false}
                      onChange={(e) => setEditingSection({...editingSection, isActive: e.target.checked})}
                    />
                    <Label htmlFor="edit-active">Activo</Label>
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
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowUp, 
  ArrowDown,
  Save,
  X
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ServiceSection } from "@shared/schema";

export default function AdminServiciosSections() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editingSection, setEditingSection] = useState<ServiceSection | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: sections = [], isLoading } = useQuery<ServiceSection[]>({
    queryKey: ["/api/servicios-sections"],
  });

  const [formData, setFormData] = useState({
    type: 'service' as 'service' | 'plan',
    title: '',
    description: '',
    price: '',
    features: [''],
    highlight: false,
    icon: '',
    order: 0,
    isActive: true
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<ServiceSection, 'id'>) => {
      return await apiRequest("/api/servicios-sections", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servicios-sections"] });
      toast({
        title: "Sección creada",
        description: "La sección ha sido creada correctamente",
      });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ServiceSection> }) => {
      return await apiRequest(`/api/servicios-sections/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servicios-sections"] });
      toast({
        title: "Sección actualizada",
        description: "La sección ha sido actualizada correctamente",
      });
      setEditingSection(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/servicios-sections/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servicios-sections"] });
      toast({
        title: "Sección eliminada",
        description: "La sección ha sido eliminada correctamente",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      type: 'service',
      title: '',
      description: '',
      price: '',
      features: [''],
      highlight: false,
      icon: '',
      order: 0,
      isActive: true
    });
    setIsCreating(false);
    setEditingSection(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      features: formData.features.filter(f => f.trim() !== ''),
      order: editingSection ? editingSection.order : sections.length
    };

    if (editingSection) {
      updateMutation.mutate({ id: editingSection.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const startEdit = (section: ServiceSection) => {
    setEditingSection(section);
    setFormData({
      type: section.type,
      title: section.title,
      description: section.description,
      price: section.price || '',
      features: section.features.length > 0 ? section.features : [''],
      highlight: section.highlight || false,
      icon: section.icon || '',
      order: section.order,
      isActive: section.isActive
    });
    setIsCreating(true);
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center">Cargando secciones...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Secciones de Servicios</h1>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" /> Agregar Sección
          </Button>
        </div>

        {/* Lista de secciones */}
        <div className="grid gap-4">
          {sections.map((section) => (
            <Card key={section.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {section.title}
                    <Badge variant={section.type === 'service' ? 'default' : 'secondary'}>
                      {section.type === 'service' ? 'Servicio' : 'Plan'}
                    </Badge>
                    {!section.isActive && <Badge variant="outline">Inactivo</Badge>}
                    {section.highlight && <Badge variant="destructive">Destacado</Badge>}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => startEdit(section)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => deleteMutation.mutate(section.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.price && (
                    <p className="font-semibold text-lg">{section.price}</p>
                  )}
                  {section.features.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Características:</p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {section.features.slice(0, 3).map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                        {section.features.length > 3 && (
                          <li>... y {section.features.length - 3} más</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal de creación/edición */}
        <Dialog open={isCreating} onOpenChange={(open) => !open && resetForm()}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSection ? 'Editar Sección' : 'Crear Nueva Sección'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value: 'service' | 'plan') => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Servicio</SelectItem>
                      <SelectItem value="plan">Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label>Activo</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              {formData.type === 'plan' && (
                <>
                  <div>
                    <Label htmlFor="price">Precio</Label>
                    <Input
                      id="price"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="$999 MXN"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.highlight}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, highlight: checked }))}
                    />
                    <Label>Destacado</Label>
                  </div>
                </>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Características</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                    <Plus className="h-4 w-4 mr-1" /> Agregar
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Característica..."
                      />
                      {formData.features.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFeature(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingSection ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
