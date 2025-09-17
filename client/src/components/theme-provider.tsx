

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { SiteConfig } from '@shared/schema';

type Theme2025 = {
  id: string;
  name: string;
  description: string;
  category: string;
  styles: {
    // Layout & Structure
    layout: 'traditional' | 'asymmetric' | 'floating' | 'minimal' | 'bold' | 'grid' | 'masonry';
    spacing: 'tight' | 'normal' | 'spacious' | 'extreme';
    
    // Visual Effects
    cardStyle: 'flat' | 'elevated' | 'glassmorphic' | 'neumorphic' | 'brutal' | 'outlined';
    borderRadius: 'none' | 'subtle' | 'rounded' | 'extreme' | 'organic';
    shadows: 'none' | 'subtle' | 'dramatic' | 'floating' | 'neon' | 'colorful';
    
    // Typography
    typographyScale: 'standard' | 'large' | 'oversized' | 'minimal' | 'display';
    fontWeight: 'light' | 'normal' | 'medium' | 'bold' | 'ultra';
    
    // Colors & Gradients
    colorScheme: 'monochrome' | 'vibrant' | 'pastel' | 'neon' | 'earth' | 'ocean' | 'sunset';
    gradientStyle: 'none' | 'subtle' | 'bold' | 'complex' | 'animated' | 'mesh';
    
    // Interactions
    animations: 'none' | 'subtle' | 'smooth' | 'bouncy' | 'dramatic' | 'morphing';
    hoverEffects: 'minimal' | 'lift' | 'glow' | 'transform' | 'morph' | 'scale';
    
    // Layout specific
    heroStyle: 'traditional' | 'split' | 'asymmetric' | 'fullscreen' | 'minimal' | 'video';
    navigationStyle: 'traditional' | 'floating' | 'sidebar' | 'hidden' | 'mega' | 'sticky';
  };
  cssVariables: Record<string, string>;
  customCSS: string;
};

const themes2025: Record<string, Theme2025> = {
  glassmorphic: {
    id: 'glassmorphic',
    name: 'Glassmorphic 2025',
    description: 'Efectos de vidrio, transparencias y gradientes complejos. Perfecto para apps modernas.',
    category: 'Trending',
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
      '--primary-color': '#667eea',
      '--secondary-color': '#764ba2',
      '--accent-color': '#f093fb',
      '--background-color': '#f8fafc',
      '--text-color': '#1e293b',
      '--card-bg': 'rgba(255, 255, 255, 0.25)',
      '--nav-bg': 'rgba(255, 255, 255, 0.1)',
    },
    customCSS: `
      .theme-glassmorphic {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        backdrop-filter: blur(20px);
        min-height: 100vh;
      }
      
      .theme-glassmorphic .navbar {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .theme-glassmorphic .card {
        background: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 24px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }
      
      .theme-glassmorphic .hero {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
        backdrop-filter: blur(10px);
      }
      
      .theme-glassmorphic .testimonials-section {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(15px);
        border-radius: 32px;
        margin: 2rem;
        padding: 3rem;
      }
    `
  },
  
  neumorphic: {
    id: 'neumorphic',
    name: 'Neumorphic Soft UI',
    description: 'Diseño suave con sombras internas y externas. Elegante y minimalista.',
    category: 'Elegant',
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
      '--primary-color': '#667eea',
      '--secondary-color': '#f1f5f9',
      '--text-color': '#374151',
      '--shadow-light': '#ffffff',
      '--shadow-dark': '#c7c7c7',
    },
    customCSS: `
      .theme-neumorphic {
        background: #e6e6e6;
        color: #374151;
        font-family: 'Inter', -apple-system, sans-serif;
      }
      
      .theme-neumorphic .card {
        background: #e6e6e6;
        border-radius: 30px;
        box-shadow: 9px 9px 16px #c7c7c7, -9px -9px 16px #ffffff;
        border: none;
        padding: 2rem;
      }
      
      .theme-neumorphic .navbar {
        background: #e6e6e6;
        box-shadow: inset 5px 5px 10px #c7c7c7, inset -5px -5px 10px #ffffff;
        border-radius: 0 0 25px 25px;
      }
      
      .theme-neumorphic .hero {
        background: #e6e6e6;
        box-shadow: inset 20px 20px 40px #c7c7c7, inset -20px -20px 40px #ffffff;
      }
      
      .theme-neumorphic .testimonials-section .card:hover {
        box-shadow: inset 9px 9px 16px #c7c7c7, inset -9px -9px 16px #ffffff;
      }
    `
  },
  
  brutal: {
    id: 'brutal',
    name: 'Brutalist 2025',
    description: 'Colores neón, tipografías oversized y layouts asimétricos. Máximo impacto visual.',
    category: 'Bold',
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
      '--brutal-yellow': '#ffff00',
      '--brutal-cyan': '#00ffff',
    },
    customCSS: `
      .theme-brutal {
        background: #ffffff;
        color: #000000;
        font-family: 'Arial Black', Arial, sans-serif;
      }
      
      .theme-brutal .navbar {
        background: #ff0066;
        color: white;
        border: 4px solid #000000;
        transform: rotate(-1deg);
        margin: 10px;
        border-radius: 0;
      }
      
      .theme-brutal .card {
        background: #00ff66;
        border: 4px solid #000000;
        box-shadow: 8px 8px 0px #000000;
        transform: rotate(1deg);
        margin: 1rem;
      }
      
      .theme-brutal .hero {
        background: linear-gradient(45deg, #ff0066 0%, #6600ff 50%, #00ff66 100%);
        color: white;
        text-transform: uppercase;
        border: 8px solid #000000;
      }
      
      .theme-brutal .testimonials-section {
        background: #ffff00;
        border: 6px solid #000000;
        transform: rotate(-2deg);
        margin: 2rem;
      }
      
      .theme-brutal .testimonials-section .card:nth-child(even) {
        background: #00ffff;
        transform: rotate(-3deg);
      }
    `
  },
  
  minimal2025: {
    id: 'minimal2025',
    name: 'Ultra Minimal 2025',
    description: 'Espacios extremos, tipografías ligeras y enfoque en el contenido.',
    category: 'Clean',
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
    },
    customCSS: `
      .theme-minimal2025 {
        background: #fafafa;
        color: #1a1a1a;
        font-family: 'Inter', -apple-system, sans-serif;
        font-weight: 300;
        line-height: 1.8;
      }
      
      .theme-minimal2025 .navbar {
        background: transparent;
        border-bottom: 1px solid #e0e0e0;
        backdrop-filter: blur(10px);
      }
      
      .theme-minimal2025 .card {
        background: transparent;
        border: 1px solid #e0e0e0;
        border-radius: 2px;
        padding: 4rem 3rem;
      }
      
      .theme-minimal2025 .hero {
        background: #fafafa;
        padding: 12rem 0;
      }
      
      .theme-minimal2025 .testimonials-section {
        background: transparent;
        padding: 8rem 0;
      }
    `
  },
  
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Estética futurista con neones, glitch effects y tipografía techno.',
    category: 'Futuristic',
    styles: {
      layout: 'grid',
      spacing: 'normal',
      cardStyle: 'outlined',
      borderRadius: 'subtle',
      shadows: 'neon',
      typographyScale: 'display',
      fontWeight: 'bold',
      colorScheme: 'neon',
      gradientStyle: 'animated',
      animations: 'morphing',
      hoverEffects: 'glow',
      heroStyle: 'video',
      navigationStyle: 'floating'
    },
    cssVariables: {
      '--cyber-primary': '#00ffff',
      '--cyber-secondary': '#ff00ff',
      '--cyber-accent': '#ffff00',
      '--cyber-bg': '#0a0a0a',
      '--cyber-text': '#00ff41',
    },
    customCSS: `
      .theme-cyberpunk {
        background: linear-gradient(45deg, #0a0a0a 0%, #1a0033 100%);
        color: #00ff41;
        font-family: 'Orbitron', 'Courier New', monospace;
      }
      
      .theme-cyberpunk .navbar {
        background: rgba(0, 255, 255, 0.1);
        border: 1px solid #00ffff;
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
      }
      
      .theme-cyberpunk .card {
        background: rgba(255, 0, 255, 0.05);
        border: 1px solid #ff00ff;
        box-shadow: 0 0 15px rgba(255, 0, 255, 0.3);
        position: relative;
        overflow: hidden;
      }
      
      .theme-cyberpunk .card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
        animation: scan 3s infinite;
      }
      
      .theme-cyberpunk .hero {
        background: radial-gradient(circle at center, rgba(0, 255, 255, 0.1) 0%, transparent 70%);
        position: relative;
      }
      
      .theme-cyberpunk .testimonials-section {
        background: rgba(255, 255, 0, 0.05);
        border-top: 2px solid #ffff00;
        border-bottom: 2px solid #ffff00;
      }
      
      @keyframes scan {
        0% { left: -100%; }
        100% { left: 100%; }
      }
    `
  },
  
  organic: {
    id: 'organic',
    name: 'Organic Flow',
    description: 'Formas orgánicas, colores tierra y transiciones fluidas inspiradas en la naturaleza.',
    category: 'Nature',
    styles: {
      layout: 'asymmetric',
      spacing: 'spacious',
      cardStyle: 'elevated',
      borderRadius: 'organic',
      shadows: 'colorful',
      typographyScale: 'large',
      fontWeight: 'medium',
      colorScheme: 'earth',
      gradientStyle: 'mesh',
      animations: 'smooth',
      hoverEffects: 'morph',
      heroStyle: 'split',
      navigationStyle: 'sticky'
    },
    cssVariables: {
      '--organic-primary': '#8b5a3c',
      '--organic-secondary': '#6b8e23',
      '--organic-accent': '#daa520',
      '--organic-bg': '#f5f5dc',
    },
    customCSS: `
      .theme-organic {
        background: linear-gradient(135deg, #f5f5dc 0%, #e6ddd4 100%);
        color: #3e2723;
        font-family: 'Georgia', serif;
      }
      
      .theme-organic .navbar {
        background: rgba(139, 90, 60, 0.9);
        border-radius: 0 0 50% 50% / 0 0 20px 20px;
        color: white;
      }
      
      .theme-organic .card {
        background: rgba(245, 245, 220, 0.8);
        border-radius: 30px 10px 30px 10px;
        box-shadow: 0 8px 32px rgba(139, 90, 60, 0.3);
        border: 2px solid rgba(107, 142, 35, 0.2);
      }
      
      .theme-organic .hero {
        background: radial-gradient(ellipse at top left, rgba(107, 142, 35, 0.2) 0%, transparent 50%),
                    radial-gradient(ellipse at bottom right, rgba(218, 165, 32, 0.2) 0%, transparent 50%);
        border-radius: 0 0 50% 30% / 0 0 100px 50px;
      }
      
      .theme-organic .testimonials-section {
        background: rgba(107, 142, 35, 0.1);
        border-radius: 80px 20px 80px 20px;
        margin: 2rem;
      }
    `
  },
  
  retro80s: {
    id: 'retro80s',
    name: 'Retro 80s Synthwave',
    description: 'Estética retro de los 80s con colores neón, gradientes y tipografía synthwave.',
    category: 'Retro',
    styles: {
      layout: 'grid',
      spacing: 'normal',
      cardStyle: 'elevated',
      borderRadius: 'rounded',
      shadows: 'neon',
      typographyScale: 'oversized',
      fontWeight: 'bold',
      colorScheme: 'sunset',
      gradientStyle: 'bold',
      animations: 'smooth',
      hoverEffects: 'glow',
      heroStyle: 'fullscreen',
      navigationStyle: 'floating'
    },
    cssVariables: {
      '--retro-primary': '#ff0080',
      '--retro-secondary': '#0080ff',
      '--retro-accent': '#ffff00',
      '--retro-bg': '#1a0033',
    },
    customCSS: `
      .theme-retro80s {
        background: linear-gradient(45deg, #1a0033 0%, #330066 50%, #660099 100%);
        color: #ffffff;
        font-family: 'Orbitron', sans-serif;
      }
      
      .theme-retro80s .navbar {
        background: linear-gradient(90deg, #ff0080 0%, #0080ff 100%);
        box-shadow: 0 0 20px rgba(255, 0, 128, 0.5);
      }
      
      .theme-retro80s .card {
        background: rgba(26, 0, 51, 0.8);
        border: 2px solid #ff0080;
        box-shadow: 0 0 20px rgba(255, 0, 128, 0.3), inset 0 0 20px rgba(0, 128, 255, 0.1);
        border-radius: 15px;
      }
      
      .theme-retro80s .hero {
        background: 
          radial-gradient(circle at 20% 80%, rgba(255, 0, 128, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(0, 128, 255, 0.3) 0%, transparent 50%);
      }
      
      .theme-retro80s .testimonials-section {
        background: linear-gradient(135deg, rgba(255, 0, 128, 0.1) 0%, rgba(0, 128, 255, 0.1) 100%);
        border: 1px solid rgba(255, 255, 0, 0.3);
        border-radius: 20px;
        margin: 2rem;
      }
    `
  },
  
  aurora: {
    id: 'aurora',
    name: 'Aurora Borealis',
    description: 'Inspirado en las auroras boreales con gradientes dinámicos y efectos de luz.',
    category: 'Magical',
    styles: {
      layout: 'floating',
      spacing: 'spacious',
      cardStyle: 'glassmorphic',
      borderRadius: 'rounded',
      shadows: 'floating',
      typographyScale: 'large',
      fontWeight: 'medium',
      colorScheme: 'ocean',
      gradientStyle: 'animated',
      animations: 'smooth',
      hoverEffects: 'glow',
      heroStyle: 'fullscreen',
      navigationStyle: 'floating'
    },
    cssVariables: {
      '--aurora-primary': '#00ffaa',
      '--aurora-secondary': '#0088ff',
      '--aurora-accent': '#aa00ff',
      '--aurora-bg': '#001122',
    },
    customCSS: `
      .theme-aurora {
        background: 
          radial-gradient(ellipse at bottom, #001122 0%, #003366 100%),
          linear-gradient(45deg, rgba(0, 255, 170, 0.1) 0%, rgba(0, 136, 255, 0.1) 50%, rgba(170, 0, 255, 0.1) 100%);
        color: #ffffff;
        font-family: 'Inter', sans-serif;
        animation: aurora-bg 10s ease-in-out infinite alternate;
      }
      
      .theme-aurora .navbar {
        background: rgba(0, 17, 34, 0.8);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(0, 255, 170, 0.2);
      }
      
      .theme-aurora .card {
        background: rgba(0, 17, 34, 0.4);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(0, 255, 170, 0.3);
        box-shadow: 0 8px 32px rgba(0, 255, 170, 0.1);
        border-radius: 20px;
      }
      
      .theme-aurora .hero {
        background: 
          radial-gradient(circle at 30% 30%, rgba(0, 255, 170, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 70% 70%, rgba(0, 136, 255, 0.3) 0%, transparent 50%);
        animation: aurora-glow 8s ease-in-out infinite alternate;
      }
      
      @keyframes aurora-bg {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(60deg); }
      }
      
      @keyframes aurora-glow {
        0% { box-shadow: 0 0 50px rgba(0, 255, 170, 0.3); }
        100% { box-shadow: 0 0 80px rgba(0, 136, 255, 0.4); }
      }
    `
  },
  
  monospace: {
    id: 'monospace',
    name: 'Developer Terminal',
    description: 'Estética de terminal con tipografía monospace y colores de código.',
    category: 'Tech',
    styles: {
      layout: 'traditional',
      spacing: 'tight',
      cardStyle: 'outlined',
      borderRadius: 'subtle',
      shadows: 'none',
      typographyScale: 'standard',
      fontWeight: 'normal',
      colorScheme: 'monochrome',
      gradientStyle: 'none',
      animations: 'none',
      hoverEffects: 'minimal',
      heroStyle: 'traditional',
      navigationStyle: 'traditional'
    },
    cssVariables: {
      '--term-bg': '#0d1117',
      '--term-text': '#c9d1d9',
      '--term-green': '#7c3aed',
      '--term-blue': '#2563eb',
      '--term-border': '#30363d',
    },
    customCSS: `
      .theme-monospace {
        background: #0d1117;
        color: #c9d1d9;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        line-height: 1.6;
      }
      
      .theme-monospace .navbar {
        background: #161b22;
        border-bottom: 1px solid #30363d;
        font-family: 'JetBrains Mono', monospace;
      }
      
      .theme-monospace .card {
        background: #161b22;
        border: 1px solid #30363d;
        border-radius: 6px;
        padding: 1.5rem;
      }
      
      .theme-monospace .hero {
        background: #0d1117;
        border: 1px solid #30363d;
        font-family: 'JetBrains Mono', monospace;
      }
      
      .theme-monospace .testimonials-section {
        background: #161b22;
        border: 1px solid #30363d;
        border-radius: 8px;
        margin: 1rem;
        padding: 2rem;
      }
      
      .theme-monospace pre {
        background: #0d1117;
        border: 1px solid #30363d;
        color: #7c3aed;
      }
    `
  },
  
  luxury: {
    id: 'luxury',
    name: 'Luxury Gold',
    description: 'Elegancia premium con dorados, mármol y tipografía serif clásica.',
    category: 'Premium',
    styles: {
      layout: 'traditional',
      spacing: 'spacious',
      cardStyle: 'elevated',
      borderRadius: 'subtle',
      shadows: 'dramatic',
      typographyScale: 'large',
      fontWeight: 'medium',
      colorScheme: 'earth',
      gradientStyle: 'subtle',
      animations: 'subtle',
      hoverEffects: 'lift',
      heroStyle: 'traditional',
      navigationStyle: 'traditional'
    },
    cssVariables: {
      '--luxury-gold': '#d4af37',
      '--luxury-dark': '#1a1a1a',
      '--luxury-cream': '#faf7f0',
      '--luxury-accent': '#8b4513',
    },
    customCSS: `
      .theme-luxury {
        background: linear-gradient(135deg, #faf7f0 0%, #f5f0e8 100%);
        color: #1a1a1a;
        font-family: 'Playfair Display', serif;
      }
      
      .theme-luxury .navbar {
        background: rgba(26, 26, 26, 0.95);
        color: #d4af37;
        border-bottom: 2px solid #d4af37;
        backdrop-filter: blur(10px);
      }
      
      .theme-luxury .card {
        background: rgba(250, 247, 240, 0.9);
        border: 1px solid rgba(212, 175, 55, 0.3);
        box-shadow: 0 8px 40px rgba(212, 175, 55, 0.15);
        border-radius: 8px;
        position: relative;
      }
      
      .theme-luxury .card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #d4af37 0%, #f4e17c 100%);
        border-radius: 8px 8px 0 0;
      }
      
      .theme-luxury .hero {
        background: 
          radial-gradient(ellipse at center, rgba(212, 175, 55, 0.1) 0%, transparent 70%),
          linear-gradient(135deg, #faf7f0 0%, #f0e6d2 100%);
      }
      
      .theme-luxury .testimonials-section {
        background: rgba(212, 175, 55, 0.05);
        border-top: 1px solid rgba(212, 175, 55, 0.3);
        border-bottom: 1px solid rgba(212, 175, 55, 0.3);
        padding: 4rem 2rem;
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

