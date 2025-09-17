

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme2025 } from '@/components/theme-provider';
import { Check, Palette, Sparkles, Zap, Minimize, Grid, Cpu, Leaf, Music, Crown, Terminal } from 'lucide-react';

const themeIcons = {
  glassmorphic: Sparkles,
  neumorphic: Grid,
  brutal: Zap,
  minimal2025: Minimize,
  cyberpunk: Cpu,
  organic: Leaf,
  retro80s: Music,
  aurora: Sparkles,
  monospace: Terminal,
  luxury: Crown,
};

const themeCategories = {
  glassmorphic: 'Trending',
  neumorphic: 'Elegant',
  brutal: 'Bold',
  minimal2025: 'Clean',
  cyberpunk: 'Futuristic',
  organic: 'Nature',
  retro80s: 'Retro',
  aurora: 'Magical',
  monospace: 'Tech',
  luxury: 'Premium'
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
  const category = themeCategories[themeId as keyof typeof themeCategories] || 'Modern';

  const getThemePreview = (themeId: string) => {
    switch (themeId) {
      case 'glassmorphic':
        return (
          <div className="h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative">
            <div className="absolute inset-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 flex items-center justify-center">
              <div className="text-white font-semibold text-xs">Glass Effect</div>
            </div>
          </div>
        );
      
      case 'neumorphic':
        return (
          <div className="h-full bg-gray-200 flex items-center justify-center relative">
            <div className="w-16 h-16 bg-gray-200 rounded-xl shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] flex items-center justify-center">
              <div className="w-6 h-6 bg-gray-200 rounded-md shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff]"></div>
            </div>
          </div>
        );
      
      case 'brutal':
        return (
          <div className="h-full bg-white relative overflow-hidden">
            <div className="absolute top-1 left-1 w-12 h-12 bg-yellow-400 border-2 border-black transform rotate-12"></div>
            <div className="absolute bottom-1 right-1 w-16 h-8 bg-pink-500 border-2 border-black transform -rotate-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-blue-500 text-white px-2 py-1 border-2 border-black font-bold transform -rotate-3 text-xs">
                BRUTAL
              </div>
            </div>
          </div>
        );
      
      case 'minimal2025':
        return (
          <div className="h-full bg-gray-50 flex items-center justify-center relative">
            <div className="text-center space-y-2">
              <div className="w-10 h-px bg-gray-800"></div>
              <div className="text-gray-800 text-xs font-light">MINIMAL</div>
              <div className="w-6 h-px bg-gray-400"></div>
            </div>
          </div>
        );
      
      case 'cyberpunk':
        return (
          <div className="h-full bg-gray-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-pink-500/20"></div>
            <div className="absolute top-2 left-2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-pink-400 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-cyan-400 text-xs font-mono">CYBER</div>
            </div>
          </div>
        );
      
      case 'organic':
        return (
          <div className="h-full bg-gradient-to-br from-green-100 to-brown-100 relative">
            <div className="absolute top-1 right-1 w-8 h-8 bg-green-300 rounded-full opacity-60"></div>
            <div className="absolute bottom-2 left-2 w-6 h-6 bg-brown-300 rounded-full opacity-60"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-green-800 text-xs">Organic</div>
            </div>
          </div>
        );
      
      case 'retro80s':
        return (
          <div className="h-full bg-gradient-to-br from-purple-900 to-pink-900 relative">
            <div className="absolute inset-2 border border-pink-400 border-dashed rounded"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-pink-400 text-xs font-bold">80s</div>
            </div>
            <div className="absolute top-1 left-1 w-2 h-2 bg-cyan-400 rounded-full"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
          </div>
        );
      
      case 'aurora':
        return (
          <div className="h-full bg-gradient-to-br from-blue-900 via-green-500/30 to-purple-900 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-green-400/20 to-transparent animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-green-300 text-xs">Aurora</div>
            </div>
          </div>
        );
      
      case 'monospace':
        return (
          <div className="h-full bg-gray-900 text-green-400 font-mono text-xs p-2 relative">
            <div className="text-green-400">{'>'} theme</div>
            <div className="text-gray-500">terminal_</div>
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-400 animate-pulse"></div>
          </div>
        );
      
      case 'luxury':
        return (
          <div className="h-full bg-gradient-to-br from-yellow-50 to-yellow-100 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-yellow-800 text-xs font-serif">Luxury</div>
            </div>
            <div className="absolute bottom-1 right-1">
              <Crown className="w-3 h-3 text-yellow-600" />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Palette className="w-6 h-6 text-gray-400" />
          </div>
        );
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
            <div>
              <CardTitle className="text-sm">{theme.name}</CardTitle>
              <Badge variant="secondary" className="text-xs mt-1">
                {category}
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
        <div className="h-24 rounded-lg border-2 relative overflow-hidden">
          {getThemePreview(themeId)}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {theme.description}
        </p>

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

