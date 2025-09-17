
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTheme2025 } from "@/components/theme-provider";
import type { SiteConfig } from "@shared/schema";

export function useTheme() {
  const { data: config } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    suspense: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const { currentTheme, isTheme2025Active } = useTheme2025();
  
  const configData = (config?.config as any) || {};
  const appearance = configData?.appearance || {};
  const themeConfig = configData?.theme || {};

  useEffect(() => {
    if (config?.config && typeof config.config === 'object') {
      const root = document.documentElement;

      // Check if theme 2025 is active and apply its styles
      if (isTheme2025Active && currentTheme) {
        // Apply theme 2025 colors
        if (currentTheme.colors?.primary) {
          const hsl = hexToHsl(currentTheme.colors.primary);
          root.style.setProperty('--primary', hsl);
          root.style.setProperty('--color-primary', currentTheme.colors.primary);
        }
        if (currentTheme.colors?.secondary) {
          const hsl = hexToHsl(currentTheme.colors.secondary);
          root.style.setProperty('--secondary', hsl);
          root.style.setProperty('--color-secondary', currentTheme.colors.secondary);
        }
        if (currentTheme.colors?.accent) {
          const hsl = hexToHsl(currentTheme.colors.accent);
          root.style.setProperty('--accent', hsl);
          root.style.setProperty('--color-accent', currentTheme.colors.accent);
        }
        if (currentTheme.colors?.background) {
          const hsl = hexToHsl(currentTheme.colors.background);
          root.style.setProperty('--background', hsl);
          root.style.setProperty('--color-background', currentTheme.colors.background);
        }
        if (currentTheme.colors?.text) {
          const hsl = hexToHsl(currentTheme.colors.text);
          root.style.setProperty('--foreground', hsl);
          root.style.setProperty('--color-text', currentTheme.colors.text);
        }
        if (currentTheme.colors?.link) {
          const hsl = hexToHsl(currentTheme.colors.link);
          root.style.setProperty('--color-link', currentTheme.colors.link);
        }

        // Apply theme 2025 typography
        if (currentTheme.typography?.fontFamily) {
          root.style.setProperty('--font-sans', `'${currentTheme.typography.fontFamily}', sans-serif`);
          root.style.setProperty('--font-family', currentTheme.typography.fontFamily);
        }
        if (currentTheme.typography?.fontSize) {
          root.style.setProperty('--base-font-size', currentTheme.typography.fontSize + 'px');
          root.style.setProperty('--font-size-base', `${currentTheme.typography.fontSize}px`);
        }
        if (currentTheme.typography?.lineHeight) {
          root.style.setProperty('--base-line-height', currentTheme.typography.lineHeight);
          root.style.setProperty('--line-height', currentTheme.typography.lineHeight);
        }
        if (currentTheme.typography?.headingFont) {
          root.style.setProperty('--font-heading', `'${currentTheme.typography.headingFont}', serif`);
        }

        // Apply theme 2025 layout
        if (currentTheme.layout?.containerWidth) {
          root.style.setProperty('--container-width', currentTheme.layout.containerWidth);
        }
        if (currentTheme.components?.navbar?.height) {
          root.style.setProperty('--header-height', currentTheme.components.navbar.height);
        }

        // Apply theme 2025 specific CSS classes
        document.body.className = `theme-${currentTheme.id} ${document.body.className.replace(/theme-\w+/g, '')}`;

        return; // Exit early if theme 2025 is active
      }

      // Fallback to regular appearance settings
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
  }, [config, appearance, isTheme2025Active, currentTheme]);

  const applyThemeToDocument = () => {
    // This function is now handled by the useEffect above automatically
    // but keeping it for backwards compatibility
  };

  return {
    config,
    appearance: isTheme2025Active && currentTheme ? currentTheme.colors : appearance,
    themeConfig,
    isLoading: !config,
    applyThemeToDocument,
    currentTheme: isTheme2025Active ? currentTheme?.name : (themeConfig?.name || 'Custom'),
    themeId: isTheme2025Active ? currentTheme?.id : (themeConfig?.id || 'custom'),
    isTheme2025Active,
    theme2025Data: currentTheme
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
