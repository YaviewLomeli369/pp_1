
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { SiteConfig } from '@shared/schema';

type Theme2025 = {
  id: string;
  name: string;
  styles: {
    // Layout & Structure
    layout: 'traditional' | 'asymmetric' | 'floating' | 'minimal' | 'bold';
    spacing: 'tight' | 'normal' | 'spacious' | 'extreme';
    
    // Visual Effects
    cardStyle: 'flat' | 'elevated' | 'glassmorphic' | 'neumorphic' | 'brutal';
    borderRadius: 'none' | 'subtle' | 'rounded' | 'extreme' | 'organic';
    shadows: 'none' | 'subtle' | 'dramatic' | 'floating' | 'neon';
    
    // Typography
    typographyScale: 'standard' | 'large' | 'oversized' | 'minimal';
    fontWeight: 'light' | 'normal' | 'medium' | 'bold' | 'ultra';
    
    // Colors & Gradients
    colorScheme: 'monochrome' | 'vibrant' | 'pastel' | 'neon' | 'earth';
    gradientStyle: 'none' | 'subtle' | 'bold' | 'complex' | 'animated';
    
    // Interactions
    animations: 'none' | 'subtle' | 'smooth' | 'bouncy' | 'dramatic';
    hoverEffects: 'minimal' | 'lift' | 'glow' | 'transform' | 'morph';
    
    // Layout specific
    heroStyle: 'traditional' | 'split' | 'asymmetric' | 'fullscreen' | 'minimal';
    navigationStyle: 'traditional' | 'floating' | 'sidebar' | 'hidden' | 'mega';
  };
  cssVariables: Record<string, string>;
  customCSS: string;
};

const themes2025: Record<string, Theme2025> = {
  glassmorphic: {
    id: 'glassmorphic',
    name: 'Glassmorphic 2025',
    styles: {
      layout: 'floating',
      spacing: 'spacious',
      cardStyle: 'glassmorphic',
      borderRadius: 'rounded',
      shadows: 'floating',
      typographyScale: 'large',
      fontWeight: 'medium',
      colorScheme: 'vibrant',
      gradientStyle: 'complex',
      animations: 'smooth',
      hoverEffects: 'glow',
      heroStyle: 'fullscreen',
      navigationStyle: 'floating'
    },
    cssVariables: {
      '--glass-bg': 'rgba(255, 255, 255, 0.1)',
      '--glass-border': 'rgba(255, 255, 255, 0.2)',
      '--blur-strength': '20px',
      '--card-elevation': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '--hover-glow': '0 0 30px rgba(59, 130, 246, 0.5)',
      '--border-radius-card': '24px',
      '--border-radius-button': '16px',
      '--animation-speed': '0.3s',
      '--gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      '--gradient-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      '--spacing-section': '8rem',
      '--typography-hero': 'clamp(3rem, 8vw, 7rem)',
      '--typography-heading': 'clamp(2rem, 5vw, 4rem)'
    },
    customCSS: `
      .theme-glassmorphic {
        backdrop-filter: blur(var(--blur-strength));
        -webkit-backdrop-filter: blur(var(--blur-strength));
      }
      
      .theme-glassmorphic .card {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        backdrop-filter: blur(var(--blur-strength));
        border-radius: var(--border-radius-card);
        box-shadow: var(--card-elevation);
        transition: all var(--animation-speed) ease;
      }
      
      .theme-glassmorphic .card:hover {
        transform: translateY(-8px);
        box-shadow: var(--hover-glow), var(--card-elevation);
      }
      
      .theme-glassmorphic .hero {
        background: var(--gradient-primary);
        min-height: 100vh;
        display: flex;
        align-items: center;
      }
      
      .theme-glassmorphic .hero-title {
        font-size: var(--typography-hero);
        font-weight: 800;
        background: linear-gradient(45deg, #fff, #e0e7ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    `
  },
  
  neumorphic: {
    id: 'neumorphic',
    name: 'Neumorphic Soft UI',
    styles: {
      layout: 'minimal',
      spacing: 'normal',
      cardStyle: 'neumorphic',
      borderRadius: 'extreme',
      shadows: 'subtle',
      typographyScale: 'standard',
      fontWeight: 'normal',
      colorScheme: 'monochrome',
      gradientStyle: 'subtle',
      animations: 'subtle',
      hoverEffects: 'lift',
      heroStyle: 'minimal',
      navigationStyle: 'traditional'
    },
    cssVariables: {
      '--neu-bg': '#e6e6e6',
      '--neu-shadow-light': '#ffffff',
      '--neu-shadow-dark': '#c7c7c7',
      '--neu-inset-light': 'inset 5px 5px 10px #c7c7c7',
      '--neu-inset-dark': 'inset -5px -5px 10px #ffffff',
      '--neu-raised': '9px 9px 16px #c7c7c7, -9px -9px 16px #ffffff',
      '--border-radius-card': '30px',
      '--border-radius-button': '25px',
      '--typography-hero': 'clamp(2.5rem, 6vw, 5rem)',
      '--spacing-section': '6rem'
    },
    customCSS: `
      .theme-neumorphic {
        background: var(--neu-bg);
        color: #444;
      }
      
      .theme-neumorphic .card {
        background: var(--neu-bg);
        border-radius: var(--border-radius-card);
        box-shadow: var(--neu-raised);
        border: none;
        padding: 2rem;
        transition: all 0.3s ease;
      }
      
      .theme-neumorphic .card:hover {
        box-shadow: var(--neu-inset-light), var(--neu-inset-dark);
      }
      
      .theme-neumorphic .btn {
        background: var(--neu-bg);
        border-radius: var(--border-radius-button);
        box-shadow: var(--neu-raised);
        border: none;
        padding: 1rem 2rem;
        transition: all 0.2s ease;
      }
      
      .theme-neumorphic .btn:active {
        box-shadow: var(--neu-inset-light), var(--neu-inset-dark);
      }
    `
  },
  
  brutal: {
    id: 'brutal',
    name: 'Brutalist 2025',
    styles: {
      layout: 'asymmetric',
      spacing: 'extreme',
      cardStyle: 'brutal',
      borderRadius: 'none',
      shadows: 'dramatic',
      typographyScale: 'oversized',
      fontWeight: 'ultra',
      colorScheme: 'neon',
      gradientStyle: 'bold',
      animations: 'dramatic',
      hoverEffects: 'transform',
      heroStyle: 'asymmetric',
      navigationStyle: 'mega'
    },
    cssVariables: {
      '--brutal-primary': '#ff0066',
      '--brutal-secondary': '#00ff66',
      '--brutal-accent': '#6600ff',
      '--brutal-shadow': '8px 8px 0px #000000',
      '--brutal-shadow-hover': '12px 12px 0px #000000',
      '--typography-hero': 'clamp(4rem, 12vw, 10rem)',
      '--typography-heading': 'clamp(3rem, 8vw, 6rem)',
      '--spacing-section': '12rem'
    },
    customCSS: `
      .theme-brutal {
        font-family: 'Arial Black', Arial, sans-serif;
        background: #ffffff;
        color: #000000;
      }
      
      .theme-brutal .card {
        background: var(--brutal-secondary);
        border: 4px solid #000000;
        box-shadow: var(--brutal-shadow);
        transform: rotate(-1deg);
        transition: all 0.2s ease;
      }
      
      .theme-brutal .card:hover {
        transform: rotate(0deg) scale(1.05);
        box-shadow: var(--brutal-shadow-hover);
      }
      
      .theme-brutal .hero-title {
        font-size: var(--typography-hero);
        font-weight: 900;
        color: var(--brutal-primary);
        text-transform: uppercase;
        letter-spacing: -0.05em;
        line-height: 0.8;
      }
      
      .theme-brutal .btn {
        background: var(--brutal-primary);
        color: white;
        border: 4px solid #000000;
        box-shadow: var(--brutal-shadow);
        font-weight: 900;
        text-transform: uppercase;
        transition: all 0.1s ease;
      }
      
      .theme-brutal .btn:hover {
        transform: translate(-4px, -4px);
        box-shadow: 12px 12px 0px #000000;
      }
    `
  },
  
  minimal2025: {
    id: 'minimal2025',
    name: 'Ultra Minimal 2025',
    styles: {
      layout: 'minimal',
      spacing: 'extreme',
      cardStyle: 'flat',
      borderRadius: 'subtle',
      shadows: 'none',
      typographyScale: 'large',
      fontWeight: 'light',
      colorScheme: 'monochrome',
      gradientStyle: 'none',
      animations: 'subtle',
      hoverEffects: 'minimal',
      heroStyle: 'minimal',
      navigationStyle: 'hidden'
    },
    cssVariables: {
      '--minimal-bg': '#fafafa',
      '--minimal-text': '#1a1a1a',
      '--minimal-accent': '#007aff',
      '--minimal-border': '#e0e0e0',
      '--typography-hero': 'clamp(3rem, 8vw, 8rem)',
      '--typography-body': '1.125rem',
      '--spacing-section': '10rem',
      '--line-height-hero': '1.1',
      '--line-height-body': '1.8'
    },
    customCSS: `
      .theme-minimal2025 {
        background: var(--minimal-bg);
        color: var(--minimal-text);
        font-weight: 300;
        line-height: var(--line-height-body);
      }
      
      .theme-minimal2025 .card {
        background: transparent;
        border: 1px solid var(--minimal-border);
        border-radius: 2px;
        padding: 3rem;
        transition: border-color 0.3s ease;
      }
      
      .theme-minimal2025 .card:hover {
        border-color: var(--minimal-accent);
      }
      
      .theme-minimal2025 .hero-title {
        font-size: var(--typography-hero);
        font-weight: 100;
        line-height: var(--line-height-hero);
        letter-spacing: -0.02em;
      }
      
      .theme-minimal2025 .btn {
        background: transparent;
        color: var(--minimal-text);
        border: 1px solid var(--minimal-text);
        padding: 1rem 2rem;
        font-weight: 300;
        transition: all 0.3s ease;
      }
      
      .theme-minimal2025 .btn:hover {
        background: var(--minimal-text);
        color: var(--minimal-bg);
      }
    `
  }
};

type ThemeContextType = {
  currentTheme: Theme2025;
  setTheme: (themeId: string) => void;
  availableThemes: Theme2025[];
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function Theme2025Provider({ children }: { children: React.ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = useState('glassmorphic');
  
  const { data: config } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const currentTheme = themes2025[currentThemeId] || themes2025.glassmorphic;
  const availableThemes = Object.values(themes2025);

  // Apply theme styles to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove previous theme classes
    document.body.className = document.body.className
      .split(' ')
      .filter(cls => !cls.startsWith('theme-'))
      .join(' ');
    
    // Add current theme class
    document.body.classList.add(`theme-${currentTheme.id}`);
    
    // Apply CSS variables
    Object.entries(currentTheme.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Apply custom CSS
    let styleElement = document.getElementById('theme-2025-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'theme-2025-styles';
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = currentTheme.customCSS;
    
  }, [currentTheme]);

  // Load theme from config
  useEffect(() => {
    if (config?.config) {
      const configData = config.config as any;
      const savedTheme = configData?.theme2025?.currentTheme;
      if (savedTheme && themes2025[savedTheme]) {
        setCurrentThemeId(savedTheme);
      }
    }
  }, [config]);

  const setTheme = (themeId: string) => {
    if (themes2025[themeId]) {
      setCurrentThemeId(themeId);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme2025() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme2025 must be used within a Theme2025Provider');
  }
  return context;
}
