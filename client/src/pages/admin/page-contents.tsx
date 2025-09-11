
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, FileText, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PageContent } from "@shared/schema";

export default function AdminPageContents() {
  const [selectedPage, setSelectedPage] = useState<"servicios" | "conocenos">("servicios");
  const [editingContent, setEditingContent] = useState<PageContent | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newContent, setNewContent] = useState({
    pageId: selectedPage,
    sectionKey: "",
    type: "text" as "text" | "card",
    title: "",
    content: "",
    order: 0,
    isActive: true,
  });

  // Fetch page contents
  const { data: contents = [], isLoading } = useQuery<PageContent[]>({
    queryKey: [`/api/page-contents/${selectedPage}`],
    enabled: !!selectedPage,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof newContent) => {
      const response = await fetch("/api/page-contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create content");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/page-contents/${selectedPage}`] });
      setCreateDialogOpen(false);
      setNewContent({
        pageId: selectedPage,
        sectionKey: "",
        type: "text",
        title: "",
        content: "",
        order: 0,
        isActive: true,
      });
      toast({ title: "Contenido creado exitosamente" });
    },
    onError: () => {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "No se pudo crear el contenido" 
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<PageContent> & { id: number }) => {
      const response = await fetch(`/api/page-contents/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update content");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/page-contents/${selectedPage}`] });
      setEditDialogOpen(false);
      setEditingContent(null);
      toast({ title: "Contenido actualizado exitosamente" });
    },
    onError: () => {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "No se pudo actualizar el contenido" 
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/page-contents/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete content");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/page-contents/${selectedPage}`] });
      toast({ title: "Contenido eliminado exitosamente" });
    },
    onError: () => {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "No se pudo eliminar el contenido" 
      });
    },
  });

  const handleCreate = () => {
    createMutation.mutate({ ...newContent, pageId: selectedPage });
  };

  const handleUpdate = () => {
    if (editingContent) {
      updateMutation.mutate(editingContent);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar este contenido?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (content: PageContent) => {
    setEditingContent(content);
    setEditDialogOpen(true);
  };

  const groupedContents = contents.reduce((acc, content) => {
    if (!acc[content.sectionKey]) {
      acc[content.sectionKey] = [];
    }
    acc[content.sectionKey].push(content);
    return acc;
  }, {} as Record<string, PageContent[]>);

  if (isLoading) {
    return <div className="flex justify-center p-8">Cargando contenidos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Contenidos</h1>
          <p className="text-muted-foreground">
            Administra el contenido de las páginas Servicios y Conócenos
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Contenido
        </Button>
      </div>

      <Tabs value={selectedPage} onValueChange={(value) => setSelectedPage(value as "servicios" | "conocenos")}>
        <TabsList>
          <TabsTrigger value="servicios">Servicios</TabsTrigger>
          <TabsTrigger value="conocenos">Conócenos</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPage} className="space-y-6">
          {Object.entries(groupedContents).map(([sectionKey, sectionContents]) => (
            <Card key={sectionKey}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  <FileText className="h-5 w-5" />
                  Sección: {sectionKey}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {sectionContents
                    .sort((a, b) => a.order - b.order)
                    .map((content) => (
                      <div
                        key={content.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{content.title}</h4>
                            <Badge variant={content.type === "text" ? "default" : "secondary"}>
                              {content.type}
                            </Badge>
                            <Badge variant={content.isActive ? "success" : "destructive"}>
                              {content.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {content.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Orden: {content.order}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(content)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(content.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Contenido</DialogTitle>
            <DialogDescription>
              Agrega nuevo contenido para la página {selectedPage}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sectionKey">Clave de Sección</Label>
              <Input
                id="sectionKey"
                value={newContent.sectionKey}
                onChange={(e) => setNewContent({ ...newContent, sectionKey: e.target.value })}
                placeholder="hero, services, mission, etc."
              />
            </div>
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={newContent.type}
                onValueChange={(value) => setNewContent({ ...newContent, type: value as "text" | "card" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="card">Tarjeta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newContent.title}
                onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="content">Contenido</Label>
              <Textarea
                id="content"
                value={newContent.content}
                onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="order">Orden</Label>
              <Input
                id="order"
                type="number"
                value={newContent.order}
                onChange={(e) => setNewContent({ ...newContent, order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={newContent.isActive}
                onCheckedChange={(checked) => setNewContent({ ...newContent, isActive: checked })}
              />
              <Label htmlFor="isActive">Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Contenido</DialogTitle>
            <DialogDescription>
              Modifica el contenido seleccionado
            </DialogDescription>
          </DialogHeader>
          {editingContent && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-sectionKey">Clave de Sección</Label>
                <Input
                  id="edit-sectionKey"
                  value={editingContent.sectionKey}
                  onChange={(e) => setEditingContent({ ...editingContent, sectionKey: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Tipo</Label>
                <Select
                  value={editingContent.type}
                  onValueChange={(value) => setEditingContent({ ...editingContent, type: value as "text" | "card" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="card">Tarjeta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={editingContent.title}
                  onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-content">Contenido</Label>
                <Textarea
                  id="edit-content"
                  value={editingContent.content}
                  onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="edit-order">Orden</Label>
                <Input
                  id="edit-order"
                  type="number"
                  value={editingContent.order}
                  onChange={(e) => setEditingContent({ ...editingContent, order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={editingContent.isActive}
                  onCheckedChange={(checked) => setEditingContent({ ...editingContent, isActive: checked })}
                />
                <Label htmlFor="edit-isActive">Activo</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
