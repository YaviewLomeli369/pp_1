
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Search, 
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  Eye,
  EyeOff
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type PageContent = {
  id: string;
  pageId: string;
  sectionKey: string;
  type: string;
  title?: string;
  content?: string;
  imageUrl?: string;
  metadata?: any;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export default function AdminPageContents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingContent, setEditingContent] = useState<PageContent | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [newContent, setNewContent] = useState({
    pageId: "",
    sectionKey: "",
    type: "text",
    title: "",
    content: "",
    imageUrl: "",
    order: 0,
    isActive: true
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: contents, isLoading } = useQuery<PageContent[]>({
    queryKey: ["/api/page-contents", selectedPage],
    queryFn: () => apiRequest(`/api/page-contents${selectedPage ? `?pageId=${selectedPage}` : ""}`),
  });

  const createContentMutation = useMutation({
    mutationFn: async (contentData: typeof newContent) => {
      return await apiRequest("/api/page-contents", {
        method: "POST",
        body: JSON.stringify(contentData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/page-contents"] });
      setShowCreateDialog(false);
      setNewContent({
        pageId: "",
        sectionKey: "",
        type: "text",
        title: "",
        content: "",
        imageUrl: "",
        order: 0,
        isActive: true
      });
      toast({ title: "Contenido creado correctamente" });
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PageContent> }) => {
      return await apiRequest(`/api/page-contents/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/page-contents"] });
      setEditingContent(null);
      toast({ title: "Contenido actualizado correctamente" });
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/page-contents/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/page-contents"] });
      toast({ title: "Contenido eliminado correctamente" });
    },
  });

  const filteredContents = contents?.filter(content =>
    content.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.sectionKey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.pageId?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const sortedContents = filteredContents.sort((a, b) => {
    if (a.pageId !== b.pageId) {
      return a.pageId.localeCompare(b.pageId);
    }
    return (a.order || 0) - (b.order || 0);
  });

  const handleCreateContent = (e: React.FormEvent) => {
    e.preventDefault();
    createContentMutation.mutate(newContent);
  };

  const handleUpdateContent = (content: PageContent, updates: Partial<PageContent>) => {
    updateContentMutation.mutate({ id: content.id, data: updates });
  };

  const handleDeleteContent = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este contenido?")) {
      deleteContentMutation.mutate(id);
    }
  };

  const pageOptions = [
    { value: "", label: "Todas las páginas" },
    { value: "servicios", label: "Servicios" },
    { value: "conocenos", label: "Conócenos" },
  ];

  const typeOptions = [
    { value: "text", label: "Texto" },
    { value: "image", label: "Imagen" },
    { value: "card", label: "Tarjeta" },
    { value: "list", label: "Lista" },
  ];

  const sectionOptions = {
    servicios: [
      { value: "hero", label: "Hero Principal" },
      { value: "services", label: "Servicios" },
      { value: "plans", label: "Planes" },
      { value: "features", label: "Características" },
    ],
    conocenos: [
      { value: "hero", label: "Hero Principal" },
      { value: "mission", label: "Misión" },
      { value: "vision", label: "Visión" },
      { value: "values", label: "Valores" },
      { value: "team", label: "Equipo" },
    ]
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
            <h1 className="text-2xl font-bold text-gray-900">Contenidos de Páginas</h1>
            <p className="text-gray-600 mt-1">Administra el contenido editable de Servicios y Conócenos</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Contenido
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar contenidos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por página" />
            </SelectTrigger>
            <SelectContent>
              {pageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Contents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Contenidos ({sortedContents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Página</TableHead>
                  <TableHead>Sección</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedContents.map((content) => (
                  <TableRow key={content.id}>
                    <TableCell>
                      <Badge variant="outline">{content.pageId}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{content.sectionKey}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{content.type}</Badge>
                    </TableCell>
                    <TableCell>{content.title || "Sin título"}</TableCell>
                    <TableCell>{content.order}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={content.isActive || false}
                          onCheckedChange={(checked) => 
                            handleUpdateContent(content, { isActive: checked })
                          }
                        />
                        {content.isActive ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => setEditingContent(content)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteContent(content.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create Content Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nuevo Contenido</DialogTitle>
              <DialogDescription>
                Crea un nuevo contenido para una página específica
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateContent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pageId">Página</Label>
                  <Select 
                    value={newContent.pageId} 
                    onValueChange={(value) => setNewContent({...newContent, pageId: value, sectionKey: ""})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar página" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="servicios">Servicios</SelectItem>
                      <SelectItem value="conocenos">Conócenos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sectionKey">Sección</Label>
                  <Select 
                    value={newContent.sectionKey} 
                    onValueChange={(value) => setNewContent({...newContent, sectionKey: value})}
                    disabled={!newContent.pageId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar sección" />
                    </SelectTrigger>
                    <SelectContent>
                      {newContent.pageId && sectionOptions[newContent.pageId as keyof typeof sectionOptions]?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select 
                    value={newContent.type} 
                    onValueChange={(value) => setNewContent({...newContent, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Orden</Label>
                  <Input
                    id="order"
                    type="number"
                    value={newContent.order}
                    onChange={(e) => setNewContent({...newContent, order: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newContent.title}
                  onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                  placeholder="Título del contenido"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Contenido</Label>
                <Textarea
                  id="content"
                  value={newContent.content}
                  onChange={(e) => setNewContent({...newContent, content: e.target.value})}
                  placeholder="Contenido del elemento"
                  rows={4}
                />
              </div>

              {newContent.type === 'image' && (
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL de Imagen</Label>
                  <Input
                    id="imageUrl"
                    value={newContent.imageUrl}
                    onChange={(e) => setNewContent({...newContent, imageUrl: e.target.value})}
                    placeholder="URL de la imagen"
                  />
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newContent.isActive}
                  onCheckedChange={(checked) => setNewContent({...newContent, isActive: checked})}
                />
                <Label>Activo</Label>
              </div>
            </form>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateContent} disabled={createContentMutation.isPending}>
                {createContentMutation.isPending ? "Creando..." : "Crear Contenido"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Content Dialog */}
        {editingContent && (
          <Dialog open={!!editingContent} onOpenChange={() => setEditingContent(null)}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Editar Contenido</DialogTitle>
                <DialogDescription>
                  Modifica el contenido seleccionado
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-pageId">Página</Label>
                    <Select 
                      value={editingContent.pageId} 
                      onValueChange={(value) => setEditingContent({...editingContent, pageId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="servicios">Servicios</SelectItem>
                        <SelectItem value="conocenos">Conócenos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-sectionKey">Sección</Label>
                    <Input
                      id="edit-sectionKey"
                      value={editingContent.sectionKey}
                      onChange={(e) => setEditingContent({...editingContent, sectionKey: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Tipo</Label>
                    <Select 
                      value={editingContent.type} 
                      onValueChange={(value) => setEditingContent({...editingContent, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-order">Orden</Label>
                    <Input
                      id="edit-order"
                      type="number"
                      value={editingContent.order || 0}
                      onChange={(e) => setEditingContent({...editingContent, order: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Título</Label>
                  <Input
                    id="edit-title"
                    value={editingContent.title || ""}
                    onChange={(e) => setEditingContent({...editingContent, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-content">Contenido</Label>
                  <Textarea
                    id="edit-content"
                    value={editingContent.content || ""}
                    onChange={(e) => setEditingContent({...editingContent, content: e.target.value})}
                    rows={4}
                  />
                </div>

                {editingContent.type === 'image' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-imageUrl">URL de Imagen</Label>
                    <Input
                      id="edit-imageUrl"
                      value={editingContent.imageUrl || ""}
                      onChange={(e) => setEditingContent({...editingContent, imageUrl: e.target.value})}
                    />
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingContent.isActive || false}
                    onCheckedChange={(checked) => setEditingContent({...editingContent, isActive: checked})}
                  />
                  <Label>Activo</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingContent(null)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => handleUpdateContent(editingContent, editingContent)} 
                  disabled={updateContentMutation.isPending}
                >
                  {updateContentMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
}
