
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Upload, Eye, EyeOff, GripVertical, Plus } from "lucide-react";
import ObjectUploader from "@/components/ObjectUploader";
import { useToast } from "@/hooks/use-toast";

interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  isVisible: boolean;
  order: number;
}

interface CarouselManagerProps {
  slides: CarouselSlide[];
  onSlidesChange: (slides: CarouselSlide[]) => void;
}

export default function CarouselManager({ slides, onSlidesChange }: CarouselManagerProps) {
  const { toast } = useToast();
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddSlide = () => {
    const newSlide: CarouselSlide = {
      id: `slide-${Date.now()}`,
      title: "",
      subtitle: "",
      description: "",
      image: "",
      buttonText: "Ver más",
      buttonLink: "#",
      isVisible: true,
      order: slides.length
    };
    setEditingSlide(newSlide);
    setShowAddForm(true);
  };

  const handleSaveSlide = (slide: CarouselSlide) => {
    const updatedSlides = editingSlide?.id && slides.find(s => s.id === editingSlide.id)
      ? slides.map(s => s.id === slide.id ? slide : s)
      : [...slides, slide];
    
    onSlidesChange(updatedSlides);
    setEditingSlide(null);
    setShowAddForm(false);
    toast({
      title: "Slide guardado",
      description: "El slide del carrusel se ha guardado correctamente"
    });
  };

  const handleDeleteSlide = (slideId: string) => {
    const updatedSlides = slides.filter(s => s.id !== slideId);
    onSlidesChange(updatedSlides);
    toast({
      title: "Slide eliminado",
      description: "El slide del carrusel se ha eliminado correctamente"
    });
  };

  const handleToggleVisibility = (slideId: string) => {
    const updatedSlides = slides.map(slide =>
      slide.id === slideId ? { ...slide, isVisible: !slide.isVisible } : slide
    );
    onSlidesChange(updatedSlides);
  };

  const moveSlide = (slideId: string, direction: 'up' | 'down') => {
    const slideIndex = slides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) return;

    const newIndex = direction === 'up' ? slideIndex - 1 : slideIndex + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;

    const updatedSlides = [...slides];
    [updatedSlides[slideIndex], updatedSlides[newIndex]] = [updatedSlides[newIndex], updatedSlides[slideIndex]];
    
    // Update order
    updatedSlides.forEach((slide, index) => {
      slide.order = index;
    });

    onSlidesChange(updatedSlides);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Carrusel de Inicio</h3>
          <p className="text-sm text-gray-600">Gestiona los slides del carrusel principal</p>
        </div>
        <Button onClick={handleAddSlide}>
          <Plus className="h-4 w-4 mr-2" />
          Añadir Slide
        </Button>
      </div>

      {/* Lista de slides existentes */}
      <div className="grid gap-4">
        {slides.map((slide) => (
          <Card key={slide.id} className="relative">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveSlide(slide.id, 'up')}
                      disabled={slide.order === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveSlide(slide.id, 'down')}
                      disabled={slide.order === slides.length - 1}
                    >
                      ↓
                    </Button>
                  </div>
                  
                  {slide.image && (
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  
                  <div className="flex-1">
                    <h4 className="font-medium">{slide.title || "Sin título"}</h4>
                    <p className="text-sm text-gray-600">{slide.subtitle}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={slide.isVisible ? "default" : "secondary"}>
                        {slide.isVisible ? "Visible" : "Oculto"}
                      </Badge>
                      <span className="text-xs text-gray-500">Orden: {slide.order + 1}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleVisibility(slide.id)}
                  >
                    {slide.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingSlide(slide);
                      setShowAddForm(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSlide(slide.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formulario de edición/creación */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingSlide?.id && slides.find(s => s.id === editingSlide.id) ? "Editar Slide" : "Nuevo Slide"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SlideForm
              slide={editingSlide}
              onSave={handleSaveSlide}
              onCancel={() => {
                setEditingSlide(null);
                setShowAddForm(false);
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface SlideFormProps {
  slide: CarouselSlide | null;
  onSave: (slide: CarouselSlide) => void;
  onCancel: () => void;
}

function SlideForm({ slide, onSave, onCancel }: SlideFormProps) {
  const [formData, setFormData] = useState<CarouselSlide>(
    slide || {
      id: `slide-${Date.now()}`,
      title: "",
      subtitle: "",
      description: "",
      image: "",
      buttonText: "Ver más",
      buttonLink: "#",
      isVisible: true,
      order: 0
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Título del slide"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="subtitle">Subtítulo</Label>
          <Input
            id="subtitle"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="Subtítulo del slide"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descripción del slide"
          rows={3}
        />
      </div>

      <div>
        <Label>Imagen del Slide</Label>
        <div className="mt-2">
          {formData.image && (
            <div className="mb-4">
              <img
                src={formData.image}
                alt="Preview"
                className="w-full max-w-md h-48 object-cover rounded"
              />
            </div>
          )}
          <ObjectUploader
            onUploadSuccess={(result) => {
              if (result.successful && result.successful.length > 0) {
                const imageURL = result.successful[0].response?.body?.url;
                if (imageURL) {
                  setFormData({ ...formData, image: imageURL });
                }
              }
            }}
            acceptedFileTypes={['image/*']}
            maxNumberOfFiles={1}
            allowMultiple={false}
            note="Recomendado: 1920x1080px para mejor calidad"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="buttonText">Texto del Botón</Label>
          <Input
            id="buttonText"
            value={formData.buttonText}
            onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
            placeholder="Ver más"
          />
        </div>
        
        <div>
          <Label htmlFor="buttonLink">Enlace del Botón</Label>
          <Input
            id="buttonLink"
            value={formData.buttonLink}
            onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
            placeholder="/servicios"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isVisible"
            checked={formData.isVisible}
            onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
            className="rounded"
          />
          <Label htmlFor="isVisible">Visible en el carrusel</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Guardar Slide
          </Button>
        </div>
      </div>
    </form>
  );
}
