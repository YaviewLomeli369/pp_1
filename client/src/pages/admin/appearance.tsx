import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, 
  Type, 
  Image, 
  Smartphone,
  Monitor,
  Tablet,
  Save
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { SiteConfig } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import ObjectUploader from "@/components/ObjectUploader";

// Define the structure for Hero Images per Page
interface PageHeroImages {
  [key: string]: string | undefined;
  inicio?: string;
  conocenos?: string;
  servicios?: string;
  faqs?: string;
  blog?: string;
}

// Component for managing Hero Images per Page
function HeroImagesManager({ appearance, setAppearance }: { appearance: any; setAppearance: (updater: any) => void }) {
  const pages = [
    { id: "inicio", name: "Inicio" },
    { id: "conocenos", name: "Conócenos" },
    { id: "servicios", name: "Servicios" },
    { id: "faqs", name: "FAQs" },
    { id: "blog", name: "Blog" },
  ];

  const handleImageUpload = (pageId: string, url: string) => {
    setAppearance((prev: any) => ({
      ...prev,
      pageHeroImages: {
        ...(prev.pageHeroImages || {}),
        [pageId]: url,
      },
    }));
  };

  const handleRemoveImage = (pageId: string) => {
    setAppearance((prev: any) => ({
      ...prev,
      pageHeroImages: {
        ...(prev.pageHeroImages || {}),
        [pageId]: undefined,
      },
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Imágenes de Hero por Página
        </CardTitle>
        <CardDescription>
          Personaliza la imagen de fondo del Hero para páginas específicas. Si no se selecciona una, se usará la imagen global.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {pages.map((page) => (
          <div key={page.id} className="border-b pb-4 last:border-b-0 last:pb-0">
            <h3 className="text-lg font-semibold mb-3">{page.name}</h3>
            <div className="space-y-2">
              <Label htmlFor={`heroImage_${page.id}`}>URL de la Imagen de Fondo</Label>
              <Input
                id={`heroImage_${page.id}`}
                value={appearance.pageHeroImages?.[page.id] || ""}
                onChange={(e) => setAppearance((prev: any) => ({
                  ...prev,
                  pageHeroImages: {
                    ...(prev.pageHeroImages || {}),
                    [page.id]: e.target.value,
                  },
                }))}
                placeholder={`https://ejemplo.com/${page.id}-hero-bg.jpg`}
              />
              {appearance.pageHeroImages?.[page.id] && (
                <div className="mt-2 flex items-center gap-4">
                  <img 
                    src={appearance.pageHeroImages[page.id]} 
                    alt={`${page.name} Hero background preview`} 
                    className="h-16 w-auto object-cover rounded border"
                    onError={(e) => {
                      console.error(`Error loading ${page.name} hero background preview`);
                    }}
                  />
                  <Button variant="outline" size="sm" onClick={() => handleRemoveImage(page.id)}>
                    Eliminar
                  </Button>
                </div>
              )}
            </div>

            {/* Image Upload Component */}
            <div className="mt-3 space-y-2">
              <Label>O sube una nueva imagen</Label>
              <ObjectUploader
                onUploadSuccess={(result) => {
                  if (result.successful && result.successful.length > 0) {
                    const imageURL = result.successful[0].response?.body?.url;
                    if (imageURL) {
                      handleImageUpload(page.id, imageURL);
                    }
                  }
                }}
                acceptedFileTypes={['image/*']}
                maxNumberOfFiles={1}
                allowMultiple={false}
                note="Recomendado: 1920x1080px o superior para mejor calidad"
                className="w-full"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function AdminAppearance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: config, isLoading } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
  });

  const [logoUploading, setLogoUploading] = useState(false);
  const [appearance, setAppearance] = useState({
    // Colores
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981", 
    accentColor: "#F59E0B",
    backgroundColor: "#FFFFFF",
    textColor: "#111827",
    linkColor: "#3B82F6",

    // Tipografía
    fontFamily: "Inter",
    fontSize: "16",
    lineHeight: "1.6",
    headingFont: "Inter",

    // Layout
    containerWidth: "1200",
    headerHeight: "80",
    footerStyle: "standard",

    // Logo y branding
    logoUrl: "",
    faviconUrl: "",
    brandName: "Mi Sitio Web",
    tagline: "Tu eslogan aquí",

    // SEO
    metaTitle: "Mi Sitio Web",
    metaDescription: "Descripción de mi sitio web",
    ogImage: "",

    // Responsive
    mobileBreakpoint: "768",
    tabletBreakpoint: "1024",

    // Hero Background
    heroBackgroundType: "image",
    heroBackgroundImage: "",
    heroBackgroundPosition: "center",
    heroBackgroundSize: "cover",
    heroGradientType: "linear",
    heroGradientDirection: "to right",
    heroGradientColor1: "#3B82F6",
    heroGradientColor2: "#1E40AF",
    heroGradientColor3: "",
    heroGradientColor4: "",
    heroOverlayColor: "#000000",
    heroOverlayOpacity: 50,
    heroTextColor: "#ffffff",

    // Page Specific Hero Images
    pageHeroImages: {} as PageHeroImages
  });

  // Cargar configuración existente
  useEffect(() => {
    if (config?.config && typeof config.config === 'object') {
      const configData = config.config as any;
      if (configData.appearance) {
        setAppearance(prev => ({
          ...prev,
          primaryColor: configData.appearance.primaryColor || prev.primaryColor,
          secondaryColor: configData.appearance.secondaryColor || prev.secondaryColor,
          accentColor: configData.appearance.accentColor || prev.accentColor,
          backgroundColor: configData.appearance.backgroundColor || prev.backgroundColor,
          textColor: configData.appearance.textColor || prev.textColor,
          linkColor: configData.appearance.linkColor || prev.linkColor,
          fontFamily: configData.appearance.fontFamily || prev.fontFamily,
          fontSize: configData.appearance.fontSize || prev.fontSize,
          lineHeight: configData.appearance.lineHeight || prev.lineHeight,
          headingFont: configData.appearance.headingFont || prev.headingFont,
          containerWidth: configData.appearance.containerWidth || prev.containerWidth,
          headerHeight: configData.appearance.headerHeight || prev.headerHeight,
          footerStyle: configData.appearance.footerStyle || prev.footerStyle,
          logoUrl: configData.appearance.logoUrl || prev.logoUrl,
          faviconUrl: configData.appearance.faviconUrl || prev.faviconUrl,
          brandName: configData.appearance.brandName || prev.brandName,
          tagline: configData.appearance.tagline || prev.tagline,
          metaTitle: configData.appearance.metaTitle || prev.metaTitle,
          metaDescription: configData.appearance.metaDescription || prev.metaDescription,
          ogImage: configData.appearance.ogImage || prev.ogImage,
          mobileBreakpoint: configData.appearance.mobileBreakpoint || prev.mobileBreakpoint,
          tabletBreakpoint: configData.appearance.tabletBreakpoint || prev.tabletBreakpoint,
          heroBackgroundType: configData.appearance.heroBackgroundType || prev.heroBackgroundType,
          heroBackgroundImage: configData.appearance.heroBackgroundImage || prev.heroBackgroundImage,
          heroBackgroundPosition: configData.appearance.heroBackgroundPosition || prev.heroBackgroundPosition,
          heroBackgroundSize: configData.appearance.heroBackgroundSize || prev.heroBackgroundSize,
          heroGradientType: configData.appearance.heroGradientType || prev.heroGradientType,
          heroGradientDirection: configData.appearance.heroGradientDirection || prev.heroGradientDirection,
          heroGradientColor1: configData.appearance.heroGradientColor1 || prev.heroGradientColor1,
          heroGradientColor2: configData.appearance.heroGradientColor2 || prev.heroGradientColor2,
          heroGradientColor3: configData.appearance.heroGradientColor3 || prev.heroGradientColor3,
          heroGradientColor4: configData.appearance.heroGradientColor4 || prev.heroGradientColor4,
          heroOverlayColor: configData.appearance.heroOverlayColor || prev.heroOverlayColor,
          heroOverlayOpacity: configData.appearance.heroOverlayOpacity !== undefined ? configData.appearance.heroOverlayOpacity : prev.heroOverlayOpacity,
          heroTextColor: configData.appearance.heroTextColor || prev.heroTextColor,
          pageHeroImages: configData.appearance.pageHeroImages || prev.pageHeroImages,
        }));
      }
    }
  }, [config]);

  const saveAppearanceMutation = useMutation({
    mutationFn: async (appearanceData: typeof appearance) => {
      const currentConfig = config?.config || {};

      const updatedConfig = {
        ...currentConfig,
        appearance: appearanceData
      };

      return await apiRequest("/api/config", {
        method: "PUT",
        body: JSON.stringify({ config: updatedConfig }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({ title: "Apariencia actualizada correctamente" });
    },
    onError: () => {
      toast({ 
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudo actualizar la apariencia"
      });
    },
  });

  const handleSave = () => {
    saveAppearanceMutation.mutate(appearance);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setLogoUploading(true);

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const token = localStorage.getItem("auth_token");
      const response = await fetch('/api/config/logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al subir el logo');
      }

      const result = await response.json();

      // Update appearance state with new logo URL
      setAppearance(prev => ({
        ...prev,
        logoUrl: result.logoUrl
      }));

      // Invalidate queries to refresh config
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });

      toast({
        title: "Logo subido exitosamente",
        description: "El logo se ha almacenado en la base de datos"
      });

    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        variant: "destructive",
        title: "Error al subir logo",
        description: "No se pudo subir el logo. Inténtalo de nuevo"
      });
    } finally {
      setLogoUploading(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  const handleReset = () => {
    setAppearance({
      primaryColor: "#3B82F6",
      secondaryColor: "#10B981", 
      accentColor: "#F59E0B",
      backgroundColor: "#FFFFFF",
      textColor: "#111827",
      linkColor: "#3B82F6",
      fontFamily: "Inter",
      fontSize: "16",
      lineHeight: "1.6",
      headingFont: "Inter",
      containerWidth: "1200",
      headerHeight: "80",
      footerStyle: "standard",
      logoUrl: "",
      faviconUrl: "",
      brandName: "Mi Sitio Web",
      tagline: "Tu eslogan aquí",
      metaTitle: "Mi Sitio Web",
      metaDescription: "Descripción de mi sitio web",
      ogImage: "",
      mobileBreakpoint: "768",
      tabletBreakpoint: "1024",
      heroBackgroundType: "image",
      heroBackgroundImage: "",
      heroBackgroundPosition: "center",
      heroBackgroundSize: "cover",
      heroGradientType: "linear",
      heroGradientDirection: "to right",
      heroGradientColor1: "#3B82F6",
      heroGradientColor2: "#1E40AF",
      heroGradientColor3: "",
      heroGradientColor4: "",
      heroOverlayColor: "#000000",
      heroOverlayOpacity: 50,
      heroTextColor: "#ffffff",
      pageHeroImages: {} // Reset page specific images
    });
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
            <h1 className="text-2xl font-bold text-gray-900">Apariencia</h1>
            <p className="text-gray-600 mt-1">Personaliza el diseño y estilo del sitio web</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleReset}>
              Restablecer
            </Button>
            <Button onClick={handleSave} disabled={saveAppearanceMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {saveAppearanceMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>

        {/* Appearance Tabs */}
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Colores
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Tipografía
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Marca
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              SEO
            </TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Esquema de Colores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Color Primario</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={appearance.primaryColor}
                        onChange={(e) => setAppearance({...appearance, primaryColor: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={appearance.primaryColor}
                        onChange={(e) => setAppearance({...appearance, primaryColor: e.target.value})}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Color Secundario</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={appearance.secondaryColor}
                        onChange={(e) => setAppearance({...appearance, secondaryColor: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={appearance.secondaryColor}
                        onChange={(e) => setAppearance({...appearance, secondaryColor: e.target.value})}
                        placeholder="#10B981"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Color de Acento</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="accentColor"
                        type="color"
                        value={appearance.accentColor}
                        onChange={(e) => setAppearance({...appearance, accentColor: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={appearance.accentColor}
                        onChange={(e) => setAppearance({...appearance, accentColor: e.target.value})}
                        placeholder="#F59E0B"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Color de Fondo</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={appearance.backgroundColor}
                        onChange={(e) => setAppearance({...appearance, backgroundColor: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={appearance.backgroundColor}
                        onChange={(e) => setAppearance({...appearance, backgroundColor: e.target.value})}
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="textColor">Color de Texto</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="textColor"
                        type="color"
                        value={appearance.textColor}
                        onChange={(e) => setAppearance({...appearance, textColor: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={appearance.textColor}
                        onChange={(e) => setAppearance({...appearance, textColor: e.target.value})}
                        placeholder="#111827"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkColor">Color de Enlaces</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="linkColor"
                        type="color"
                        value={appearance.linkColor}
                        onChange={(e) => setAppearance({...appearance, linkColor: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={appearance.linkColor}
                        onChange={(e) => setAppearance({...appearance, linkColor: e.target.value})}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Vista Previa</h3>
                  <div 
                    className="p-6 rounded-lg border-2"
                    style={{
                      backgroundColor: appearance.backgroundColor,
                      color: appearance.textColor,
                      borderColor: appearance.primaryColor
                    }}
                  >
                    <h4 
                      className="text-xl font-bold mb-2"
                      style={{ color: appearance.primaryColor }}
                    >
                      Título Principal
                    </h4>
                    <p className="mb-3">
                      Este es un párrafo de ejemplo para mostrar cómo se ve el texto normal.
                    </p>
                    <a 
                      href="#" 
                      className="underline"
                      style={{ color: appearance.linkColor }}
                    >
                      Este es un enlace de ejemplo
                    </a>
                    <div className="mt-4 flex space-x-2">
                      <div 
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: appearance.primaryColor }}
                        title="Primario"
                      ></div>
                      <div 
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: appearance.secondaryColor }}
                        title="Secundario"
                      ></div>
                      <div 
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: appearance.accentColor }}
                        title="Acento"
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Tipografía</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Fuente Principal</Label>
                    <select
                      id="fontFamily"
                      value={appearance.fontFamily}
                      onChange={(e) => setAppearance({...appearance, fontFamily: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      {/* Sans-serif modernas */}
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Nunito">Nunito</option>
                      <option value="Source Sans Pro">Source Sans Pro</option>
                      <option value="Ubuntu">Ubuntu</option>
                      <option value="Raleway">Raleway</option>
                      <option value="PT Sans">PT Sans</option>
                      <option value="Fira Sans">Fira Sans</option>
                      <option value="Work Sans">Work Sans</option>
                      <option value="Noto Sans">Noto Sans</option>
                      <option value="Rubik">Rubik</option>
                      <option value="Outfit">Outfit</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                      <option value="DM Sans">DM Sans</option>
                      <option value="Space Grotesk">Space Grotesk</option>
                      <option value="Manrope">Manrope</option>
                      <option value="IBM Plex Sans">IBM Plex Sans</option>
                      <option value="Karla">Karla</option>
                      <option value="Barlow">Barlow</option>
                      <option value="Quicksand">Quicksand</option>
                      <option value="Mulish">Mulish</option>
                      <option value="Hind">Hind</option>
                      <option value="Oxygen">Oxygen</option>
                      <option value="Red Hat Display">Red Hat Display</option>
                      <option value="Lexend">Lexend</option>
                      <option value="Sora">Sora</option>

                      {/* Serif clásicas */}
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Lora">Lora</option>
                      <option value="Merriweather">Merriweather</option>
                      <option value="Crimson Text">Crimson Text</option>
                      <option value="Source Serif Pro">Source Serif Pro</option>
                      <option value="Libre Baskerville">Libre Baskerville</option>
                      <option value="Cormorant">Cormorant</option>
                      <option value="Spectral">Spectral</option>
                      <option value="Vollkorn">Vollkorn</option>
                      <option value="Bitter">Bitter</option>
                      <option value="Arvo">Arvo</option>
                      <option value="Rokkitt">Rokkitt</option>
                      <option value="Cardo">Cardo</option>
                      <option value="Crimson Pro">Crimson Pro</option>

                      {/* Display y decorativas */}
                      <option value="Bebas Neue">Bebas Neue</option>
                      <option value="Oswald">Oswald</option>
                      <option value="Anton">Anton</option>
                      <option value="Righteous">Righteous</option>
                      <option value="Fredoka One">Fredoka One</option>
                      <option value="Lobster">Lobster</option>
                      <option value="Pacifico">Pacifico</option>
                      <option value="Dancing Script">Dancing Script</option>
                      <option value="Great Vibes">Great Vibes</option>
                      <option value="Sacramento">Sacramento</option>
                      <option value="Comfortaa">Comfortaa</option>
                      <option value="Caveat">Caveat</option>
                      <option value="Architects Daughter">Architects Daughter</option>

                      {/* Monoespaciadas */}
                      <option value="JetBrains Mono">JetBrains Mono</option>
                      <option value="Fira Code">Fira Code</option>
                      <option value="Source Code Pro">Source Code Pro</option>
                      <option value="IBM Plex Mono">IBM Plex Mono</option>
                      <option value="Roboto Mono">Roboto Mono</option>
                      <option value="Space Mono">Space Mono</option>
                      <option value="Inconsolata">Inconsolata</option>
                      <option value="Ubuntu Mono">Ubuntu Mono</option>

                      {/* Fuentes del sistema */}
                      <option value="system-ui">System UI</option>
                      <option value="-apple-system">Apple System</option>
                      <option value="BlinkMacSystemFont">Blink Mac System</option>
                      <option value="Segoe UI">Segoe UI</option>
                      <option value="Helvetica Neue">Helvetica Neue</option>
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                      <option value="Tahoma">Tahoma</option>
                      <option value="Trebuchet MS">Trebuchet MS</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="headingFont">Fuente de Títulos</Label>
                    <select
                      id="headingFont"
                      value={appearance.headingFont}
                      onChange={(e) => setAppearance({...appearance, headingFont: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      {/* Sans-serif modernas */}
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Nunito">Nunito</option>
                      <option value="Source Sans Pro">Source Sans Pro</option>
                      <option value="Ubuntu">Ubuntu</option>
                      <option value="Raleway">Raleway</option>
                      <option value="PT Sans">PT Sans</option>
                      <option value="Fira Sans">Fira Sans</option>
                      <option value="Work Sans">Work Sans</option>
                      <option value="Noto Sans">Noto Sans</option>
                      <option value="Rubik">Rubik</option>
                      <option value="Outfit">Outfit</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                      <option value="DM Sans">DM Sans</option>
                      <option value="Space Grotesk">Space Grotesk</option>
                      <option value="Manrope">Manrope</option>
                      <option value="IBM Plex Sans">IBM Plex Sans</option>
                      <option value="Karla">Karla</option>
                      <option value="Barlow">Barlow</option>
                      <option value="Quicksand">Quicksand</option>
                      <option value="Mulish">Mulish</option>
                      <option value="Hind">Hind</option>
                      <option value="Oxygen">Oxygen</option>
                      <option value="Red Hat Display">Red Hat Display</option>
                      <option value="Lexend">Lexend</option>
                      <option value="Sora">Sora</option>

                      {/* Serif clásicas */}
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Lora">Lora</option>
                      <option value="Merriweather">Merriweather</option>
                      <option value="Crimson Text">Crimson Text</option>
                      <option value="Source Serif Pro">Source Serif Pro</option>
                      <option value="Libre Baskerville">Libre Baskerville</option>
                      <option value="Cormorant">Cormorant</option>
                      <option value="Spectral">Spectral</option>
                      <option value="Vollkorn">Vollkorn</option>
                      <option value="Bitter">Bitter</option>
                      <option value="Arvo">Arvo</option>
                      <option value="Rokkitt">Rokkitt</option>
                      <option value="Cardo">Cardo</option>
                      <option value="Crimson Pro">Crimson Pro</option>

                      {/* Display y decorativas */}
                      <option value="Bebas Neue">Bebas Neue</option>
                      <option value="Oswald">Oswald</option>
                      <option value="Anton">Anton</option>
                      <option value="Righteous">Righteous</option>
                      <option value="Fredoka One">Fredoka One</option>
                      <option value="Lobster">Lobster</option>
                      <option value="Pacifico">Pacifico</option>
                      <option value="Dancing Script">Dancing Script</option>
                      <option value="Great Vibes">Great Vibes</option>
                      <option value="Sacramento">Sacramento</option>
                      <option value="Comfortaa">Comfortaa</option>
                      <option value="Caveat">Caveat</option>
                      <option value="Architects Daughter">Architects Daughter</option>

                      {/* Monoespaciadas */}
                      <option value="JetBrains Mono">JetBrains Mono</option>
                      <option value="Fira Code">Fira Code</option>
                      <option value="Source Code Pro">Source Code Pro</option>
                      <option value="IBM Plex Mono">IBM Plex Mono</option>
                      <option value="Roboto Mono">Roboto Mono</option>
                      <option value="Space Mono">Space Mono</option>
                      <option value="Inconsolata">Inconsolata</option>
                      <option value="Ubuntu Mono">Ubuntu Mono</option>

                      {/* Fuentes del sistema */}
                      <option value="system-ui">System UI</option>
                      <option value="-apple-system">Apple System</option>
                      <option value="BlinkMacSystemFont">Blink Mac System</option>
                      <option value="Segoe UI">Segoe UI</option>
                      <option value="Helvetica Neue">Helvetica Neue</option>
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                      <option value="Tahoma">Tahoma</option>
                      <option value="Trebuchet MS">Trebuchet MS</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fontSize">Tamaño de Fuente Base (px)</Label>
                    <Input
                      id="fontSize"
                      type="number"
                      value={appearance.fontSize}
                      onChange={(e) => setAppearance({...appearance, fontSize: e.target.value})}
                      min="12"
                      max="24"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lineHeight">Altura de Línea</Label>
                    <Input
                      id="lineHeight"
                      value={appearance.lineHeight}
                      onChange={(e) => setAppearance({...appearance, lineHeight: e.target.value})}
                      placeholder="1.6"
                    />
                  </div>
                </div>

                {/* Typography Preview */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Vista Previa Tipográfica</h3>
                  <div 
                    style={{
                      fontFamily: appearance.fontFamily,
                      fontSize: `${appearance.fontSize}px`,
                      lineHeight: appearance.lineHeight
                    }}
                  >
                    <h1 
                      className="text-4xl font-bold mb-3"
                      style={{ fontFamily: appearance.headingFont }}
                    >
                      Título Principal H1
                    </h1>
                    <h2 
                      className="text-2xl font-semibold mb-3"
                      style={{ fontFamily: appearance.headingFont }}
                    >
                      Subtítulo H2
                    </h2>
                    <p className="mb-3">
                      Este es un párrafo de ejemplo que muestra cómo se verá el texto normal 
                      con la fuente, tamaño y espaciado seleccionados. Lorem ipsum dolor sit amet, 
                      consectetur adipiscing elit.
                    </p>
                    <p className="text-sm text-gray-600">
                      Texto pequeño para notas y descripciones adicionales.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Layout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="containerWidth">Ancho del Contenedor (px)</Label>
                    <Input
                      id="containerWidth"
                      type="number"
                      value={appearance.containerWidth}
                      onChange={(e) => setAppearance({...appearance, containerWidth: e.target.value})}
                      min="800"
                      max="1600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="headerHeight">Altura del Header (px)</Label>
                    <Input
                      id="headerHeight"
                      type="number"
                      value={appearance.headerHeight}
                      onChange={(e) => setAppearance({...appearance, headerHeight: e.target.value})}
                      min="60"
                      max="120"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footerStyle">Estilo del Footer</Label>
                    <select
                      id="footerStyle"
                      value={appearance.footerStyle}
                      onChange={(e) => setAppearance({...appearance, footerStyle: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="standard">Estándar</option>
                      <option value="minimal">Minimalista</option>
                      <option value="extended">Extendido</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobileBreakpoint">Breakpoint Móvil (px)</Label>
                    <Input
                      id="mobileBreakpoint"
                      type="number"
                      value={appearance.mobileBreakpoint}
                      onChange={(e) => setAppearance({...appearance, mobileBreakpoint: e.target.value})}
                      placeholder="768"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tabletBreakpoint">Breakpoint Tablet (px)</Label>
                    <Input
                      id="tabletBreakpoint"
                      type="number"
                      value={appearance.tabletBreakpoint}
                      onChange={(e) => setAppearance({...appearance, tabletBreakpoint: e.target.value})}
                      placeholder="1024"
                    />
                  </div>
                </div>

                {/* Responsive Preview */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Vista Previa Responsive</h3>
                  <div className="flex space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="text-sm">Móvil: {appearance.mobileBreakpoint}px</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Tablet className="h-4 w-4" />
                      <span className="text-sm">Tablet: {appearance.tabletBreakpoint}px</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4" />
                      <span className="text-sm">Desktop: {appearance.containerWidth}px</span>
                    </div>
                  </div>

                  <div className="bg-gray-100 rounded p-4">
                    <div 
                      className="bg-white border rounded mx-auto"
                      style={{ 
                        maxWidth: `${appearance.containerWidth}px`,
                        height: `${appearance.headerHeight}px`
                      }}
                    >
                      <div className="h-full flex items-center justify-center">
                        <span className="text-sm text-gray-500">Header Preview</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="mt-6">
            <div className="space-y-6">
              {/* Logo and Brand Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Marca y Logo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="brandName">Nombre de la Marca</Label>
                        <Input
                          id="brandName"
                          value={appearance.brandName}
                          onChange={(e) => setAppearance({...appearance, brandName: e.target.value})}
                          placeholder="Mi Empresa"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tagline">Eslogan</Label>
                        <Input
                          id="tagline"
                          value={appearance.tagline}
                          onChange={(e) => setAppearance({...appearance, tagline: e.target.value})}
                          placeholder="Tu eslogan aquí"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="logoUpload">Logo</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          {appearance.logoUrl ? (
                            <div className="space-y-2">
                              <img 
                                src={appearance.logoUrl} 
                                alt="Logo actual" 
                                className="h-16 mx-auto object-contain"
                                onError={(e) => {
                                  console.error("Error loading logo preview");
                                }}
                              />
                              <p className="text-sm text-gray-600">Logo actual</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Image className="h-16 w-16 mx-auto text-gray-400" />
                              <p className="text-sm text-gray-600">No hay logo cargado</p>
                            </div>
                          )}
                          <input
                            id="logoUpload"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={logoUploading}
                            className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          {logoUploading && (
                            <p className="text-sm text-blue-600 mt-2">Subiendo logo...</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="faviconUrl">URL del Favicon</Label>
                        <Input
                          id="faviconUrl"
                          value={appearance.faviconUrl}
                          onChange={(e) => setAppearance({...appearance, faviconUrl: e.target.value})}
                          placeholder="https://ejemplo.com/favicon.ico"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="heroBackgroundImage">Imagen de Fondo Global (Por Defecto)</Label>
                        <Input
                          id="heroBackgroundImage"
                          value={appearance.heroBackgroundImage}
                          onChange={(e) => setAppearance({...appearance, heroBackgroundImage: e.target.value})}
                          placeholder="https://ejemplo.com/hero-bg.jpg"
                        />
                        {appearance.heroBackgroundImage && (
                          <div className="mt-2">
                            <img 
                              src={appearance.heroBackgroundImage} 
                              alt="Hero background preview" 
                              className="h-24 w-full object-cover rounded border"
                              onError={(e) => {
                                console.error("Error loading hero background preview");
                              }}
                            />
                          </div>
                        )}
                        <p className="text-xs text-gray-500">
                          Esta imagen se usará en todas las páginas que no tengan una imagen específica.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hero Images by Page Section */}
              <HeroImagesManager appearance={appearance} setAppearance={setAppearance} />
            </div>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Título Meta</Label>
                    <Input
                      id="metaTitle"
                      value={appearance.metaTitle}
                      onChange={(e) => setAppearance({...appearance, metaTitle: e.target.value})}
                      placeholder="Mi Sitio Web"
                      maxLength={60}
                    />
                    <p className="text-sm text-gray-500">
                      {appearance.metaTitle.length}/60 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Descripción</Label>
                    <Textarea
                      id="metaDescription"
                      value={appearance.metaDescription}
                      onChange={(e) => setAppearance({...appearance, metaDescription: e.target.value})}
                      placeholder="Descripción de mi sitio web"
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-sm text-gray-500">
                      {appearance.metaDescription.length}/160 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ogImage">Imagen Open Graph</Label>
                    <Input
                      id="ogImage"
                      value={appearance.ogImage}
                      onChange={(e) => setAppearance({...appearance, ogImage: e.target.value})}
                      placeholder="https://example.com/og-image.jpg"
                    />
                    <p className="text-sm text-gray-500">
                      Imagen que aparece cuando compartes el sitio en redes sociales (1200x630px recomendado)
                    </p>
                  </div>
                </div>

                {/* SEO Preview */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Vista Previa en Buscadores</h3>
                  <div className="bg-white border rounded p-4">
                    <h4 className="text-lg text-blue-600 hover:underline cursor-pointer">
                      {appearance.metaTitle || "Mi Sitio Web"}
                    </h4>
                    <p className="text-green-600 text-sm">
                      https://mi-sitio.com
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {appearance.metaDescription || "Descripción de mi sitio web"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}