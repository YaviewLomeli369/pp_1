import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { SiteConfig } from "@shared/schema";

export function useTheme() {
  const { data: config } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
  });

  useEffect(() => {
    if (config?.config && typeof config.config === 'object') {
      const configData = config.config as any;
      
      // Update CSS custom properties for appearance
      if (configData.appearance) {
        const root = document.documentElement;
        const appearance = configData.appearance;
        
        // Update color variables
        if (appearance.primaryColor) {
          // Convert hex to HSL for better CSS variable compatibility
          const hsl = hexToHsl(appearance.primaryColor);
          root.style.setProperty('--primary', hsl);
        }
        if (appearance.secondaryColor) {
          const hsl = hexToHsl(appearance.secondaryColor);
          root.style.setProperty('--secondary', hsl);
        }
        if (appearance.accentColor) {
          const hsl = hexToHsl(appearance.accentColor);
          root.style.setProperty('--accent', hsl);
        }
        if (appearance.backgroundColor) {
          const hsl = hexToHsl(appearance.backgroundColor);
          root.style.setProperty('--background', hsl);
        }
        if (appearance.textColor) {
          const hsl = hexToHsl(appearance.textColor);
          root.style.setProperty('--foreground', hsl);
        }
        if (appearance.linkColor) {
          const hsl = hexToHsl(appearance.linkColor);
          root.style.setProperty('--primary', hsl);
        }
        
        // Update typography
        if (appearance.fontFamily) {
          root.style.setProperty('--font-sans', `'${appearance.fontFamily}', sans-serif`);
        }
        if (appearance.fontSize) {
          root.style.setProperty('--base-font-size', appearance.fontSize + 'px');
        }
        if (appearance.lineHeight) {
          root.style.setProperty('--base-line-height', appearance.lineHeight);
        }
        if (appearance.headingFont) {
          root.style.setProperty('--font-heading', `'${appearance.headingFont}', serif`);
        }
        
        // Update layout variables
        if (appearance.containerWidth) {
          root.style.setProperty('--container-width', appearance.containerWidth + 'px');
        }
        if (appearance.headerHeight) {
          root.style.setProperty('--header-height', appearance.headerHeight + 'px');
        }
      }
    }
  }, [config]);

  return config;
}

// Helper function to convert hex to HSL
function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
import { useQuery } from "@tanstack/react-query";
import type { SiteConfig } from "@shared/schema";

export const useTheme = () => {
  const { data: config } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const configData = (config?.config as any) || {};
  const appearance = configData?.appearance || {};
  const themeConfig = configData?.theme || {};

  // CSS custom properties para aplicar dinámicamente
  const applyThemeToDocument = () => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // Colores principales
      root.style.setProperty('--color-primary', appearance.primaryColor || '#3B82F6');
      root.style.setProperty('--color-secondary', appearance.secondaryColor || '#10B981');
      root.style.setProperty('--color-accent', appearance.accentColor || '#F59E0B');
      root.style.setProperty('--color-background', appearance.backgroundColor || '#FFFFFF');
      root.style.setProperty('--color-text', appearance.textColor || '#111827');
      root.style.setProperty('--color-link', appearance.linkColor || '#3B82F6');
      
      // Tipografía
      root.style.setProperty('--font-family', appearance.fontFamily || 'Inter, sans-serif');
      root.style.setProperty('--font-heading', appearance.headingFont || appearance.fontFamily || 'Inter, sans-serif');
      root.style.setProperty('--font-size-base', `${appearance.fontSize || 16}px`);
      root.style.setProperty('--line-height', appearance.lineHeight || '1.6');
      
      // Layout
      root.style.setProperty('--container-width', `${appearance.containerWidth || 1200}px`);
      root.style.setProperty('--header-height', `${appearance.headerHeight || 80}px`);
      
      // Hero background
      if (appearance.heroBackgroundType === 'gradient') {
        const colors = [
          appearance.heroGradientColor1 || '#3B82F6',
          appearance.heroGradientColor2 || '#1E40AF'
        ];
        if (appearance.heroGradientColor3) colors.push(appearance.heroGradientColor3);
        if (appearance.heroGradientColor4) colors.push(appearance.heroGradientColor4);
        
        const gradientType = appearance.heroGradientType || 'linear';
        const direction = appearance.heroGradientDirection || 'to right';
        
        const gradient = gradientType === 'radial' 
          ? `radial-gradient(circle, ${colors.join(', ')})`
          : `linear-gradient(${direction}, ${colors.join(', ')})`;
          
        root.style.setProperty('--hero-background', gradient);
      } else if (appearance.heroBackgroundImage) {
        root.style.setProperty('--hero-background', `url("${appearance.heroBackgroundImage}")`);
        root.style.setProperty('--hero-background-size', appearance.heroBackgroundSize || 'cover');
        root.style.setProperty('--hero-background-position', appearance.heroBackgroundPosition || 'center');
      }
      
      // Overlay
      const overlayOpacity = (appearance.heroOverlayOpacity || 50) / 100;
      const overlayColor = appearance.heroOverlayColor || '#000000';
      root.style.setProperty('--hero-overlay', `${overlayColor}${Math.round(overlayOpacity * 255).toString(16).padStart(2, '0')}`);
    }
  };

  return {
    appearance,
    themeConfig,
    isLoading: !config,
    applyThemeToDocument,
    currentTheme: themeConfig?.name || 'Custom',
    themeId: themeConfig?.id || 'custom'
  };
};
