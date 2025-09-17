
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { SiteConfig } from "@shared/schema";

export function useTheme() {
  const { data: config } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    suspense: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const configData = (config?.config as any) || {};
  const appearance = configData?.appearance || {};
  const themeConfig = configData?.theme || {};

  useEffect(() => {
    if (config?.config && typeof config.config === 'object') {
      const root = document.documentElement;

      // Update color variables with HSL conversion for better CSS compatibility
      if (appearance.primaryColor) {
        const hsl = hexToHsl(appearance.primaryColor);
        root.style.setProperty('--primary', hsl);
        root.style.setProperty('--color-primary', appearance.primaryColor);
      }
      if (appearance.secondaryColor) {
        const hsl = hexToHsl(appearance.secondaryColor);
        root.style.setProperty('--secondary', hsl);
        root.style.setProperty('--color-secondary', appearance.secondaryColor);
      }
      if (appearance.accentColor) {
        const hsl = hexToHsl(appearance.accentColor);
        root.style.setProperty('--accent', hsl);
        root.style.setProperty('--color-accent', appearance.accentColor);
      }
      if (appearance.backgroundColor) {
        const hsl = hexToHsl(appearance.backgroundColor);
        root.style.setProperty('--background', hsl);
        root.style.setProperty('--color-background', appearance.backgroundColor);
      }
      if (appearance.textColor) {
        const hsl = hexToHsl(appearance.textColor);
        root.style.setProperty('--foreground', hsl);
        root.style.setProperty('--color-text', appearance.textColor);
      }
      if (appearance.linkColor) {
        const hsl = hexToHsl(appearance.linkColor);
        root.style.setProperty('--color-link', appearance.linkColor);
      }

      // Update typography
      if (appearance.fontFamily) {
        root.style.setProperty('--font-sans', `'${appearance.fontFamily}', sans-serif`);
        root.style.setProperty('--font-family', appearance.fontFamily);
      }
      if (appearance.fontSize) {
        root.style.setProperty('--base-font-size', appearance.fontSize + 'px');
        root.style.setProperty('--font-size-base', `${appearance.fontSize}px`);
      }
      if (appearance.lineHeight) {
        root.style.setProperty('--base-line-height', appearance.lineHeight);
        root.style.setProperty('--line-height', appearance.lineHeight);
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

      // Hero background configuration
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

      // Overlay configuration
      const overlayOpacity = (appearance.heroOverlayOpacity || 50) / 100;
      const overlayColor = appearance.heroOverlayColor || '#000000';
      root.style.setProperty('--hero-overlay', `${overlayColor}${Math.round(overlayOpacity * 255).toString(16).padStart(2, '0')}`);
    }
  }, [config, appearance]);

  const applyThemeToDocument = () => {
    // This function is now handled by the useEffect above automatically
    // but keeping it for backwards compatibility
  };

  return {
    config,
    appearance,
    themeConfig,
    isLoading: !config,
    applyThemeToDocument,
    currentTheme: themeConfig?.name || 'Custom',
    themeId: themeConfig?.id || 'custom'
  };
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
