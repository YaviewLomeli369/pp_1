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

export default function AdminAppearance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: config, isLoading } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
  });

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
    heroOverlayOpacity: 50
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
      heroOverlayOpacity: 50
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
              {/* Brand Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Información de Marca</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="brandName">Nombre de la Marca</Label>
                      <Input
                        id="brandName"
                        value={appearance.brandName}
                        onChange={(e) => setAppearance({...appearance, brandName: e.target.value})}
                        placeholder="Mi Sitio Web"
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
                      <Label htmlFor="logoUrl">URL del Logo</Label>
                      <Input
                        id="logoUrl"
                        value={appearance.logoUrl}
                        onChange={(e) => setAppearance({...appearance, logoUrl: e.target.value})}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="faviconUrl">URL del Favicon</Label>
                      <Input
                        id="faviconUrl"
                        value={appearance.faviconUrl}
                        onChange={(e) => setAppearance({...appearance, faviconUrl: e.target.value})}
                        placeholder="https://example.com/favicon.ico"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hero Background Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Fondo del Hero (Todas las páginas)
                  </CardTitle>
                  <CardDescription>
                    Configura el fondo principal que aparece en inicio, servicios, conocenos, blog, testimonios, reservas y FAQs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Background Type Selector */}
                  <div className="space-y-2">
                    <Label>Tipo de Fondo</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="heroBackgroundType"
                          value="image"
                          checked={(appearance as any).heroBackgroundType !== "gradient"}
                          onChange={() => setAppearance({...appearance, heroBackgroundType: "image"} as any)}
                        />
                        <span>Imagen</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="heroBackgroundType"
                          value="gradient"
                          checked={(appearance as any).heroBackgroundType === "gradient"}
                          onChange={() => setAppearance({...appearance, heroBackgroundType: "gradient"} as any)}
                        />
                        <span>Gradiente</span>
                      </label>
                    </div>
                  </div>

                  {/* Image Configuration */}
                  {(appearance as any).heroBackgroundType !== "gradient" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="heroBackgroundImage">URL de la Imagen de Fondo</Label>
                        <Input
                          id="heroBackgroundImage"
                          value={(appearance as any).heroBackgroundImage || ""}
                          onChange={(e) => setAppearance({...appearance, heroBackgroundImage: e.target.value} as any)}
                          placeholder="https://example.com/hero-background.jpg"
                        />
                      </div>
                      
                      {/* Image Upload Component */}
                      <div className="space-y-2">
                        <Label>Subir Nueva Imagen</Label>
                        <ObjectUploader
                          onUploadSuccess={(result) => {
                            if (result.successful && result.successful.length > 0) {
                              const imageURL = result.successful[0].response?.body?.url;
                              if (imageURL) {
                                setAppearance({...appearance, heroBackgroundImage: imageURL} as any);
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

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="heroBackgroundPosition">Posición</Label>
                          <select
                            id="heroBackgroundPosition"
                            value={(appearance as any).heroBackgroundPosition || "center"}
                            onChange={(e) => setAppearance({...appearance, heroBackgroundPosition: e.target.value} as any)}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="center">Centro</option>
                            <option value="top">Arriba</option>
                            <option value="bottom">Abajo</option>
                            <option value="left">Izquierda</option>
                            <option value="right">Derecha</option>
                            <option value="top left">Arriba Izquierda</option>
                            <option value="top right">Arriba Derecha</option>
                            <option value="bottom left">Abajo Izquierda</option>
                            <option value="bottom right">Abajo Derecha</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="heroBackgroundSize">Tamaño</Label>
                          <select
                            id="heroBackgroundSize"
                            value={(appearance as any).heroBackgroundSize || "cover"}
                            onChange={(e) => setAppearance({...appearance, heroBackgroundSize: e.target.value} as any)}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="cover">Cubrir</option>
                            <option value="contain">Contener</option>
                            <option value="auto">Automático</option>
                            <option value="100% 100%">Estirar</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gradient Configuration */}
                  {(appearance as any).heroBackgroundType === "gradient" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="gradientType">Tipo de Gradiente</Label>
                        <select
                          id="gradientType"
                          value={(appearance as any).heroGradientType || "linear"}
                          onChange={(e) => setAppearance({...appearance, heroGradientType: e.target.value} as any)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="linear">Lineal</option>
                          <option value="radial">Radial</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gradientDirection">Dirección</Label>
                        <select
                          id="gradientDirection"
                          value={(appearance as any).heroGradientDirection || "to right"}
                          onChange={(e) => setAppearance({...appearance, heroGradientDirection: e.target.value} as any)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="to right">Izquierda → Derecha</option>
                          <option value="to left">Derecha → Izquierda</option>
                          <option value="to bottom">Arriba → Abajo</option>
                          <option value="to top">Abajo → Arriba</option>
                          <option value="to bottom right">Diagonal ↘</option>
                          <option value="to bottom left">Diagonal ↙</option>
                          <option value="to top right">Diagonal ↗</option>
                          <option value="to top left">Diagonal ↖</option>
                          <option value="45deg">45 grados</option>
                          <option value="90deg">90 grados</option>
                          <option value="135deg">135 grados</option>
                          <option value="180deg">180 grados</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="gradientColor1">Color 1</Label>
                          <div className="flex items-center space-x-3">
                            <Input
                              type="color"
                              value={(appearance as any).heroGradientColor1 || "#3B82F6"}
                              onChange={(e) => setAppearance({...appearance, heroGradientColor1: e.target.value} as any)}
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              value={(appearance as any).heroGradientColor1 || "#3B82F6"}
                              onChange={(e) => setAppearance({...appearance, heroGradientColor1: e.target.value} as any)}
                              placeholder="#3B82F6"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gradientColor2">Color 2</Label>
                          <div className="flex items-center space-x-3">
                            <Input
                              type="color"
                              value={(appearance as any).heroGradientColor2 || "#1E40AF"}
                              onChange={(e) => setAppearance({...appearance, heroGradientColor2: e.target.value} as any)}
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              value={(appearance as any).heroGradientColor2 || "#1E40AF"}
                              onChange={(e) => setAppearance({...appearance, heroGradientColor2: e.target.value} as any)}
                              placeholder="#1E40AF"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Additional Colors */}
                      <div className="space-y-2">
                        <Label>Colores Adicionales (Opcional)</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="gradientColor3">Color 3</Label>
                            <div className="flex items-center space-x-3">
                              <Input
                                type="color"
                                value={(appearance as any).heroGradientColor3 || ""}
                                onChange={(e) => setAppearance({...appearance, heroGradientColor3: e.target.value} as any)}
                                className="w-16 h-10 p-1"
                              />
                              <Input
                                value={(appearance as any).heroGradientColor3 || ""}
                                onChange={(e) => setAppearance({...appearance, heroGradientColor3: e.target.value} as any)}
                                placeholder="#8B5CF6"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="gradientColor4">Color 4</Label>
                            <div className="flex items-center space-x-3">
                              <Input
                                type="color"
                                value={(appearance as any).heroGradientColor4 || ""}
                                onChange={(e) => setAppearance({...appearance, heroGradientColor4: e.target.value} as any)}
                                className="w-16 h-10 p-1"
                              />
                              <Input
                                value={(appearance as any).heroGradientColor4 || ""}
                                onChange={(e) => setAppearance({...appearance, heroGradientColor4: e.target.value} as any)}
                                placeholder="#EC4899"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Overlay Configuration */}
                  <div className="space-y-4">
                    <Label>Overlay (Capa Oscura)</Label>
                    <div className="space-y-2">
                      <Label htmlFor="heroOverlayOpacity">Opacidad del Overlay</Label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          id="heroOverlayOpacity"
                          min="0"
                          max="100"
                          value={((appearance as any).heroOverlayOpacity || 50)}
                          onChange={(e) => setAppearance({...appearance, heroOverlayOpacity: parseInt(e.target.value)} as any)}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium w-12">{(appearance as any).heroOverlayOpacity || 50}%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="heroOverlayColor">Color del Overlay</Label>
                      <div className="flex items-center space-x-3">
                        <Input
                          type="color"
                          value={(appearance as any).heroOverlayColor || "#000000"}
                          onChange={(e) => setAppearance({...appearance, heroOverlayColor: e.target.value} as any)}
                          className="w-16 h-10 p-1"
                        />
                        <select
                          value={(appearance as any).heroOverlayColor || "#000000"}
                          onChange={(e) => setAppearance({...appearance, heroOverlayColor: e.target.value} as any)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="#000000">Negro</option>
                          <option value="#ffffff">Blanco</option>
                          <option value="#3B82F6">Azul</option>
                          <option value="#1E40AF">Azul Oscuro</option>
                          <option value="#10B981">Verde</option>
                          <option value="#F59E0B">Naranja</option>
                          <option value="#EF4444">Rojo</option>
                          <option value="#8B5CF6">Morado</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Vista Previa del Hero</h3>
                    <div 
                      className="relative h-40 rounded-lg overflow-hidden flex items-center justify-center"
                      style={{
                        background: (appearance as any).heroBackgroundType === "gradient" 
                          ? (() => {
                              const color1 = (appearance as any).heroGradientColor1 || "#3B82F6";
                              const color2 = (appearance as any).heroGradientColor2 || "#1E40AF";
                              const color3 = (appearance as any).heroGradientColor3;
                              const color4 = (appearance as any).heroGradientColor4;
                              const direction = (appearance as any).heroGradientDirection || "to right";
                              const type = (appearance as any).heroGradientType || "linear";
                              
                              let colors = [color1, color2];
                              if (color3) colors.push(color3);
                              if (color4) colors.push(color4);
                              
                              return type === "radial" 
                                ? `radial-gradient(circle, ${colors.join(", ")})`
                                : `linear-gradient(${direction}, ${colors.join(", ")})`;
                            })()
                          : (appearance as any).heroBackgroundImage 
                            ? `url("${(appearance as any).heroBackgroundImage}")`
                            : 'url("https://images.unsplash.com/photo-1516331138075-f3adc1e149cd?q=80&w=1208&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
                        backgroundSize: (appearance as any).heroBackgroundSize || "cover",
                        backgroundPosition: (appearance as any).heroBackgroundPosition || "center",
                        backgroundRepeat: "no-repeat"
                      }}
                    >
                      <div 
                        className="absolute inset-0"
                        style={{
                          backgroundColor: (appearance as any).heroOverlayColor || "#000000",
                          opacity: ((appearance as any).heroOverlayOpacity || 50) / 100
                        }}
                      ></div>
                      <div className="relative text-white text-center">
                        <h4 className="text-2xl font-bold mb-2">
                          {appearance.brandName || "Tu Marca"}
                        </h4>
                        <p className="text-sm opacity-90">
                          {appearance.tagline || "Tu eslogan aquí"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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