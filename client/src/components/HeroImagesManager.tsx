
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Image, Upload, Trash2 } from "lucide-react";

interface HeroImagesManagerProps {
  appearance: any;
  setAppearance: (appearance: any) => void;
}

interface PageConfig {
  id: string;
  name: string;
  key: string;
  description: string;
}

const pages: PageConfig[] = [
  { id: 'home', name: 'Inicio', key: 'heroHomeBackgroundImage', description: 'Imagen para la página de inicio' },
  { id: 'servicios', name: 'Servicios', key: 'heroServiciosBackgroundImage', description: 'Imagen para la página de servicios' },
  { id: 'conocenos', name: 'Conócenos', key: 'heroConocenosBackgroundImage', description: 'Imagen para la página conócenos' },
  { id: 'faqs', name: 'FAQs', key: 'heroFaqsBackgroundImage', description: 'Imagen para la página de preguntas frecuentes' },
  { id: 'blog', name: 'Blog', key: 'heroBlogBackgroundImage', description: 'Imagen para la página del blog' }
];

export default function HeroImagesManager({ appearance, setAppearance }: HeroImagesManagerProps) {
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleImageUpload = async (pageId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El archivo es demasiado grande. Máximo 5MB permitido"
      });
      return;
    }

    setUploading(prev => ({ ...prev, [pageId]: true }));

    try {
      const formData = new FormData();
      formData.append('heroImage', file);

      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/config/hero/${pageId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen hero');
      }

      const result = await response.json();
      
      // Update appearance state with new hero image URL
      const pageConfig = pages.find(p => p.id === pageId);
      if (pageConfig) {
        console.log(`Updating appearance for ${pageConfig.key} with URL: ${result.heroImageUrl}`);
        setAppearance(prev => ({
          ...prev,
          [pageConfig.key]: result.heroImageUrl
        }));
      }

      // Invalidate queries to refresh config
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });

      toast({
        title: "Imagen hero subida exitosamente",
        description: `La imagen para ${pages.find(p => p.id === pageId)?.name} se ha almacenado en la base de datos`
      });

    } catch (error) {
      console.error('Error uploading hero image:', error);
      toast({
        variant: "destructive",
        title: "Error al subir imagen",
        description: "No se pudo subir la imagen hero. Inténtalo de nuevo"
      });
    } finally {
      setUploading(prev => ({ ...prev, [pageId]: false }));
      // Clear the file input
      event.target.value = '';
    }
  };

  const handleDeleteImage = async (pageId: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la imagen hero de ${pages.find(p => p.id === pageId)?.name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/config/hero/${pageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la imagen hero');
      }

      // Update appearance state to remove the hero image URL
      const pageConfig = pages.find(p => p.id === pageId);
      if (pageConfig) {
        setAppearance(prev => ({
          ...prev,
          [pageConfig.key]: undefined
        }));
      }

      // Invalidate queries to refresh config
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });

      toast({
        title: "Imagen hero eliminada",
        description: `La imagen para ${pages.find(p => p.id === pageId)?.name} ha sido eliminada. Se usará la imagen global por defecto.`
      });

    } catch (error) {
      console.error('Error deleting hero image:', error);
      toast({
        variant: "destructive",
        title: "Error al eliminar imagen",
        description: "No se pudo eliminar la imagen hero. Inténtalo de nuevo"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Imágenes Hero por Página
        </CardTitle>
        <p className="text-sm text-gray-600">
          Personaliza la imagen de fondo del hero para cada página. Si no se especifica una imagen, 
          se usará la imagen global por defecto.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <div key={page.id} className="border rounded-lg p-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{page.name}</h4>
                  <p className="text-xs text-gray-500">{page.description}</p>
                </div>

                {/* Image Preview */}
                <div className="aspect-video bg-gray-100 rounded border overflow-hidden">
                  {appearance[page.key] ? (
                    <img
                      src={appearance[page.key]}
                      alt={`Hero ${page.name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Error loading hero image for ${page.name}`);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <Image className="h-8 w-8 mx-auto mb-1" />
                        <p className="text-xs">Sin imagen específica</p>
                        <p className="text-xs">Usa imagen global</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(page.id, e)}
                        disabled={uploading[page.id]}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading[page.id]}
                        className="w-full"
                        onClick={() => {
                          const input = document.querySelector(`input[type="file"]`) as HTMLInputElement;
                          if (input) input.click();
                        }}
                      >
                        {uploading[page.id] ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload className="h-3 w-3 mr-2" />
                            Subir
                          </>
                        )}
                      </Button>
                    </label>

                    {appearance[page.key] && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteImage(page.id)}
                        className="px-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    {appearance[page.key] ? 'Imagen personalizada activa' : 'Usando imagen global por defecto'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
