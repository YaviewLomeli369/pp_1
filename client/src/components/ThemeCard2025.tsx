
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme2025 } from '@/components/theme-provider';
import { Check, Palette, Sparkles, Zap, Minimize, Grid, Cpu, Leaf, Music, Crown, Terminal, Building2, Users, Eye } from 'lucide-react';

const themeIcons = {
  astra: Sparkles,
  divi: Zap,
  oceanwp: Building2,
  kadence: Minimize,
  storefront: Grid,
  betheme: Crown,
  avada: Sparkles,
  hestia: Users,
  sydney: Building2,
  hello: Minimize,
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

  const getThemePreview = (themeData: any) => {
    const { colors, components } = themeData;
    
    return (
      <div 
        className="h-full relative overflow-hidden rounded-lg"
        style={{ backgroundColor: colors.background }}
      >
        {/* Mini Navbar */}
        <div 
          className="h-3 w-full flex items-center justify-between px-2"
          style={{ 
            backgroundColor: components.navbar.background,
            color: components.navbar.color
          }}
        >
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
            <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
            <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
          </div>
          <div className="w-3 h-0.5 bg-current opacity-60 rounded"></div>
        </div>

        {/* Mini Hero */}
        <div 
          className="h-8 flex items-center justify-center px-2"
          style={{ 
            background: components.hero.background,
            color: components.hero.color
          }}
        >
          <div className="text-center space-y-1">
            <div 
              className="w-8 h-1 mx-auto rounded"
              style={{ backgroundColor: 'currentColor', opacity: 0.9 }}
            ></div>
            <div 
              className="w-6 h-0.5 mx-auto rounded"
              style={{ backgroundColor: 'currentColor', opacity: 0.7 }}
            ></div>
          </div>
        </div>

        {/* Mini Content */}
        <div className="p-2 space-y-1">
          {/* Mini Cards */}
          <div className="grid grid-cols-2 gap-1">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-4 rounded-sm p-1"
                style={{ 
                  backgroundColor: components.card.background,
                  border: `0.5px solid ${colors.border}`,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <div 
                  className="w-full h-1 rounded-sm mb-1"
                  style={{ backgroundColor: colors.primary, opacity: 0.8 }}
                ></div>
                <div 
                  className="w-3/4 h-0.5 rounded-sm"
                  style={{ backgroundColor: colors.text, opacity: 0.4 }}
                ></div>
              </div>
            ))}
          </div>

          {/* Mini Button */}
          <div 
            className="w-6 h-1.5 mx-auto rounded-sm"
            style={{ 
              backgroundColor: components.button.primary.background,
              color: components.button.primary.color
            }}
          ></div>
        </div>

        {/* Mini Footer */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-2"
          style={{ 
            backgroundColor: components.footer.background,
            color: components.footer.color
          }}
        >
          <div className="flex items-center justify-center h-full">
            <div 
              className="w-4 h-0.5 rounded"
              style={{ backgroundColor: 'currentColor', opacity: 0.6 }}
            ></div>
          </div>
        </div>

        {/* Theme indicator dot */}
        <div 
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: colors.primary }}
        ></div>
      </div>
    );
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
            <IconComponent className="h-4 w-4 text-primary" />
            <div>
              <CardTitle className="text-sm font-semibold">{theme.name}</CardTitle>
              <Badge variant="secondary" className="text-xs mt-1">
                {theme.category}
              </Badge>
            </div>
          </div>
          {isActive && (
            <div className="flex items-center space-x-1 text-primary">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Theme Preview */}
        <div className="h-24 rounded-lg border-2 relative overflow-hidden bg-gray-50">
          {getThemePreview(theme)}
        </div>

        {/* Color Palette Preview */}
        <div className="flex items-center gap-1">
          <div 
            className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: theme.colors.primary }}
            title="Primary Color"
          ></div>
          <div 
            className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: theme.colors.secondary }}
            title="Secondary Color"
          ></div>
          <div 
            className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: theme.colors.accent }}
            title="Accent Color"
          ></div>
          <span className="ml-2 text-xs text-gray-500 font-medium">
            {theme.typography.fontFamily}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {theme.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">
            {theme.components.button.primary.borderRadius !== 'none' ? 'Rounded' : 'Sharp'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {theme.components.card.shadow !== 'none' ? 'Shadows' : 'Flat'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {theme.typography.headingWeight === '700' ? 'Bold' : 'Light'}
          </Badge>
        </div>

        {/* Action Button */}
        <Button 
          variant={isActive ? "secondary" : "default"}
          size="sm"
          className="w-full"
          onClick={() => onSelect?.(themeId)}
          disabled={isActive}
        >
          {isActive ? "Activo" : "Aplicar"}
        </Button>
      </CardContent>
    </Card>
  );
}
