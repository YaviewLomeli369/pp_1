
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme2025 } from '@/components/theme-provider';
import { Check, Palette, Sparkles, Zap, Minimize, Grid } from 'lucide-react';

const themeIcons = {
  glassmorphic: Sparkles,
  neumorphic: Grid,
  brutal: Zap,
  minimal2025: Minimize,
};

interface ThemeCard2025Props {
  themeId: string;
  isActive?: boolean;
  onSelect?: (themeId: string) => void;
}

export function ThemeCard2025({ themeId, isActive, onSelect }: ThemeCard2025Props) {
  const { availableThemes } = useTheme2025();
  const theme = availableThemes.find(t => t.id === themeId);
  
  if (!theme) return null;

  const IconComponent = themeIcons[themeId as keyof typeof themeIcons] || Palette;

  const getThemeDescription = (themeId: string) => {
    switch (themeId) {
      case 'glassmorphic':
        return 'Efectos de vidrio, transparencias y gradientes complejos. Perfecto para apps modernas.';
      case 'neumorphic':
        return 'Diseño suave con sombras internas y externas. Elegante y minimalista.';
      case 'brutal':
        return 'Colores neón, tipografías oversized y layouts asimétricos. Máximo impacto visual.';
      case 'minimal2025':
        return 'Espacios extremos, tipografías ligeras y enfoque en el contenido.';
      default:
        return 'Tema moderno con las últimas tendencias de diseño 2025.';
    }
  };

  const getStyleTags = (themeId: string) => {
    switch (themeId) {
      case 'glassmorphic':
        return ['Glassmorphism', 'Blur Effects', 'Gradients', 'Floating'];
      case 'neumorphic':
        return ['Soft UI', 'Shadows', 'Minimal', 'Elegant'];
      case 'brutal':
        return ['Bold', 'Neon', 'Asymmetric', 'High Impact'];
      case 'minimal2025':
        return ['Ultra Clean', 'Typography', 'Whitespace', 'Content Focus'];
      default:
        return ['Modern', 'Trending'];
    }
  };

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${
      isActive 
        ? 'ring-2 ring-primary shadow-lg scale-105' 
        : 'hover:shadow-md hover:scale-102'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IconComponent className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{theme.name}</CardTitle>
          </div>
          {isActive && (
            <div className="flex items-center space-x-1 text-primary">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">Activo</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Theme Preview */}
        <div className={`h-32 rounded-lg border-2 relative overflow-hidden theme-preview-${themeId}`}>
          {themeId === 'glassmorphic' && (
            <div className="h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative">
              <div className="absolute inset-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 flex items-center justify-center">
                <div className="text-white font-semibold">Glass Effect</div>
              </div>
            </div>
          )}
          
          {themeId === 'neumorphic' && (
            <div className="h-full bg-gray-200 flex items-center justify-center relative">
              <div className="w-20 h-20 bg-gray-200 rounded-2xl shadow-[9px_9px_16px_#bebebe,-9px_-9px_16px_#ffffff] flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-200 rounded-lg shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff]"></div>
              </div>
            </div>
          )}
          
          {themeId === 'brutal' && (
            <div className="h-full bg-white relative overflow-hidden">
              <div className="absolute top-2 left-2 w-16 h-16 bg-yellow-400 border-2 border-black transform rotate-12"></div>
              <div className="absolute bottom-2 right-2 w-20 h-12 bg-pink-500 border-2 border-black transform -rotate-6"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-blue-500 text-white px-3 py-1 border-2 border-black font-bold transform -rotate-3">
                  BRUTAL
                </div>
              </div>
            </div>
          )}
          
          {themeId === 'minimal2025' && (
            <div className="h-full bg-gray-50 flex items-center justify-center relative">
              <div className="text-center space-y-2">
                <div className="w-12 h-px bg-gray-800"></div>
                <div className="text-gray-800 text-xs font-light">MINIMAL</div>
                <div className="w-8 h-px bg-gray-400"></div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {getThemeDescription(themeId)}
        </p>

        {/* Style Tags */}
        <div className="flex flex-wrap gap-1">
          {getStyleTags(themeId).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Action Button */}
        <Button 
          variant={isActive ? "secondary" : "default"}
          className="w-full"
          onClick={() => onSelect?.(themeId)}
          disabled={isActive}
        >
          {isActive ? "Tema Activo" : "Aplicar Tema"}
        </Button>
      </CardContent>
    </Card>
  );
}
