
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { SiteConfig } from '@shared/schema';

type CompleteTheme = {
  id: string;
  name: string;
  description: string;
  category: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    link: string;
    linkHover: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
    fontSize: string;
    lineHeight: string;
    headingWeight: string;
    bodyWeight: string;
  };
  layout: {
    containerWidth: string;
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
  components: {
    navbar: {
      background: string;
      color: string;
      padding: string;
      shadow: string;
      borderBottom: string;
      height: string;
    };
    hero: {
      background: string;
      backgroundImage?: string;
      color: string;
      padding: string;
      textAlign: string;
      overlay?: string;
    };
    button: {
      primary: {
        background: string;
        color: string;
        border: string;
        padding: string;
        borderRadius: string;
        fontSize: string;
        fontWeight: string;
        shadow: string;
      };
      secondary: {
        background: string;
        color: string;
        border: string;
        padding: string;
        borderRadius: string;
        fontSize: string;
        fontWeight: string;
        shadow: string;
      };
    };
    card: {
      background: string;
      border: string;
      borderRadius: string;
      padding: string;
      shadow: string;
      hover: {
        shadow: string;
        transform: string;
      };
    };
    footer: {
      background: string;
      color: string;
      padding: string;
      borderTop: string;
    };
  };
  animations: {
    transition: string;
    hover: string;
    focus: string;
  };
};

// Theme definitions based on popular WordPress themes
const completeThemes: Record<string, CompleteTheme> = {
  astra: {
    id: 'astra',
    name: 'Astra (Lightweight Pro)',
    description: 'Tema ligero y rápido inspirado en Astra Pro. Perfecto para cualquier tipo de sitio web.',
    category: 'Popular',
    colors: {
      primary: '#0073aa',
      secondary: '#005177',
      accent: '#00a0d2',
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#333333',
      textSecondary: '#666666',
      link: '#0073aa',
      linkHover: '#005177',
      border: '#e0e0e0',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
    },
    typography: {
      fontFamily: 'Inter',
      headingFont: 'Inter',
      fontSize: '16',
      lineHeight: '1.6',
      headingWeight: '600',
      bodyWeight: '400',
    },
    layout: {
      containerWidth: '1200px',
      spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '3rem' },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' },
    },
    components: {
      navbar: {
        background: '#ffffff',
        color: '#333333',
        padding: '1rem 0',
        shadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderBottom: 'none',
        height: '70px',
      },
      hero: {
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        color: '#333333',
        padding: '5rem 0',
        textAlign: 'center',
      },
      button: {
        primary: {
          background: '#0073aa',
          color: '#ffffff',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: '500',
          shadow: '0 2px 4px rgba(0,115,170,0.3)',
        },
        secondary: {
          background: 'transparent',
          color: '#0073aa',
          border: '2px solid #0073aa',
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: '500',
          shadow: 'none',
        },
      },
      card: {
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '1.5rem',
        shadow: '0 2px 8px rgba(0,0,0,0.1)',
        hover: {
          shadow: '0 4px 16px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
        },
      },
      footer: {
        background: '#333333',
        color: '#ffffff',
        padding: '3rem 0 2rem',
        borderTop: 'none',
      },
    },
    animations: {
      transition: 'all 0.3s ease',
      hover: 'all 0.2s ease',
      focus: 'all 0.15s ease',
    },
  },

  divi: {
    id: 'divi',
    name: 'Divi (Visual Builder)',
    description: 'Inspirado en Divi Theme. Diseño vibrante y visual con elementos llamativos.',
    category: 'Creative',
    colors: {
      primary: '#2ea3f2',
      secondary: '#ff6f61',
      accent: '#ffa726',
      background: '#ffffff',
      surface: '#f7f9fc',
      text: '#333333',
      textSecondary: '#555555',
      link: '#2ea3f2',
      linkHover: '#1e88e5',
      border: '#e1e5e9',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
    },
    typography: {
      fontFamily: 'Open Sans',
      headingFont: 'Montserrat',
      fontSize: '16',
      lineHeight: '1.7',
      headingWeight: '700',
      bodyWeight: '400',
    },
    layout: {
      containerWidth: '1280px',
      spacing: { xs: '0.5rem', sm: '1rem', md: '1.5rem', lg: '2rem', xl: '4rem' },
      borderRadius: { sm: '8px', md: '12px', lg: '16px', xl: '24px' },
    },
    components: {
      navbar: {
        background: '#ffffff',
        color: '#333333',
        padding: '1.5rem 0',
        shadow: '0 4px 12px rgba(0,0,0,0.1)',
        borderBottom: 'none',
        height: '80px',
      },
      hero: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        padding: '6rem 0',
        textAlign: 'center',
      },
      button: {
        primary: {
          background: 'linear-gradient(45deg, #2ea3f2, #1e88e5)',
          color: '#ffffff',
          border: 'none',
          padding: '1rem 2rem',
          borderRadius: '50px',
          fontSize: '16px',
          fontWeight: '600',
          shadow: '0 4px 15px rgba(46,163,242,0.4)',
        },
        secondary: {
          background: 'transparent',
          color: '#2ea3f2',
          border: '2px solid #2ea3f2',
          padding: '1rem 2rem',
          borderRadius: '50px',
          fontSize: '16px',
          fontWeight: '600',
          shadow: 'none',
        },
      },
      card: {
        background: '#ffffff',
        border: 'none',
        borderRadius: '16px',
        padding: '2rem',
        shadow: '0 8px 30px rgba(0,0,0,0.12)',
        hover: {
          shadow: '0 12px 40px rgba(0,0,0,0.18)',
          transform: 'translateY(-4px)',
        },
      },
      footer: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        padding: '4rem 0 2rem',
        borderTop: 'none',
      },
    },
    animations: {
      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      hover: 'all 0.3s ease',
      focus: 'all 0.2s ease',
    },
  },

  oceanwp: {
    id: 'oceanwp',
    name: 'OceanWP (eCommerce Pro)',
    description: 'Inspirado en OceanWP. Perfecto para tiendas online y sitios de comercio electrónico.',
    category: 'eCommerce',
    colors: {
      primary: '#13aff0',
      secondary: '#1e293b',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#334155',
      textSecondary: '#64748b',
      link: '#13aff0',
      linkHover: '#0ea5e9',
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    typography: {
      fontFamily: 'Source Sans Pro',
      headingFont: 'Roboto',
      fontSize: '16',
      lineHeight: '1.6',
      headingWeight: '700',
      bodyWeight: '400',
    },
    layout: {
      containerWidth: '1200px',
      spacing: { xs: '0.25rem', sm: '0.75rem', md: '1.25rem', lg: '2rem', xl: '3rem' },
      borderRadius: { sm: '6px', md: '8px', lg: '12px', xl: '16px' },
    },
    components: {
      navbar: {
        background: '#1e293b',
        color: '#ffffff',
        padding: '1rem 0',
        shadow: '0 4px 8px rgba(0,0,0,0.15)',
        borderBottom: 'none',
        height: '75px',
      },
      hero: {
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        padding: '6rem 0',
        textAlign: 'center',
      },
      button: {
        primary: {
          background: '#13aff0',
          color: '#ffffff',
          border: 'none',
          padding: '0.875rem 1.75rem',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          shadow: '0 4px 12px rgba(19,175,240,0.3)',
        },
        secondary: {
          background: '#f8fafc',
          color: '#13aff0',
          border: '2px solid #13aff0',
          padding: '0.875rem 1.75rem',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          shadow: 'none',
        },
      },
      card: {
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.5rem',
        shadow: '0 4px 16px rgba(0,0,0,0.08)',
        hover: {
          shadow: '0 8px 24px rgba(0,0,0,0.12)',
          transform: 'translateY(-3px)',
        },
      },
      footer: {
        background: '#1e293b',
        color: '#e2e8f0',
        padding: '3rem 0 2rem',
        borderTop: '4px solid #13aff0',
      },
    },
    animations: {
      transition: 'all 0.3s ease-in-out',
      hover: 'all 0.2s ease',
      focus: 'all 0.15s ease',
    },
  },

  kadence: {
    id: 'kadence',
    name: 'Kadence (Modern Minimal)',
    description: 'Inspirado en Kadence Theme. Diseño minimalista y moderno para sitios profesionales.',
    category: 'Minimal',
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#10b981',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#1f2937',
      textSecondary: '#6b7280',
      link: '#2563eb',
      linkHover: '#1d4ed8',
      border: '#e5e7eb',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    typography: {
      fontFamily: 'Inter',
      headingFont: 'Inter',
      fontSize: '16',
      lineHeight: '1.65',
      headingWeight: '600',
      bodyWeight: '400',
    },
    layout: {
      containerWidth: '1140px',
      spacing: { xs: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.5rem', xl: '2.5rem' },
      borderRadius: { sm: '4px', md: '6px', lg: '8px', xl: '12px' },
    },
    components: {
      navbar: {
        background: '#ffffff',
        color: '#1f2937',
        padding: '1rem 0',
        shadow: 'none',
        borderBottom: '1px solid #e5e7eb',
        height: '70px',
      },
      hero: {
        background: '#f9fafb',
        color: '#1f2937',
        padding: '4rem 0',
        textAlign: 'center',
      },
      button: {
        primary: {
          background: '#2563eb',
          color: '#ffffff',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: '500',
          shadow: '0 1px 3px rgba(0,0,0,0.12)',
        },
        secondary: {
          background: 'transparent',
          color: '#2563eb',
          border: '1px solid #2563eb',
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: '500',
          shadow: 'none',
        },
      },
      card: {
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '1.5rem',
        shadow: '0 1px 3px rgba(0,0,0,0.12)',
        hover: {
          shadow: '0 4px 12px rgba(0,0,0,0.15)',
          transform: 'translateY(-1px)',
        },
      },
      footer: {
        background: '#f9fafb',
        color: '#6b7280',
        padding: '2.5rem 0',
        borderTop: '1px solid #e5e7eb',
      },
    },
    animations: {
      transition: 'all 0.2s ease',
      hover: 'all 0.15s ease',
      focus: 'all 0.1s ease',
    },
  },

  storefront: {
    id: 'storefront',
    name: 'Storefront (WooCommerce)',
    description: 'Inspirado en Storefront de WooCommerce. Optimizado para tiendas online.',
    category: 'eCommerce',
    colors: {
      primary: '#96588a',
      secondary: '#43454b',
      accent: '#00a693',
      background: '#ffffff',
      surface: '#fafafa',
      text: '#43454b',
      textSecondary: '#6d6d6d',
      link: '#96588a',
      linkHover: '#7f4d7a',
      border: '#dddddd',
      success: '#0f834d',
      warning: '#ffba00',
      error: '#e2401c',
    },
    typography: {
      fontFamily: 'Source Sans Pro',
      headingFont: 'Source Sans Pro',
      fontSize: '16',
      lineHeight: '1.6',
      headingWeight: '600',
      bodyWeight: '400',
    },
    layout: {
      containerWidth: '1140px',
      spacing: { xs: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.5rem', xl: '3rem' },
      borderRadius: { sm: '3px', md: '5px', lg: '8px', xl: '12px' },
    },
    components: {
      navbar: {
        background: '#ffffff',
        color: '#43454b',
        padding: '1rem 0',
        shadow: 'none',
        borderBottom: '1px solid #dddddd',
        height: '70px',
      },
      hero: {
        background: '#f6f6f6',
        color: '#43454b',
        padding: '5rem 0',
        textAlign: 'center',
      },
      button: {
        primary: {
          background: '#96588a',
          color: '#ffffff',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '3px',
          fontSize: '16px',
          fontWeight: '600',
          shadow: 'none',
        },
        secondary: {
          background: 'transparent',
          color: '#96588a',
          border: '2px solid #96588a',
          padding: '0.75rem 1.5rem',
          borderRadius: '3px',
          fontSize: '16px',
          fontWeight: '600',
          shadow: 'none',
        },
      },
      card: {
        background: '#ffffff',
        border: '1px solid #dddddd',
        borderRadius: '5px',
        padding: '1.5rem',
        shadow: 'none',
        hover: {
          shadow: '0 2px 8px rgba(0,0,0,0.1)',
          transform: 'none',
        },
      },
      footer: {
        background: '#43454b',
        color: '#ffffff',
        padding: '3rem 0 2rem',
        borderTop: 'none',
      },
    },
    animations: {
      transition: 'all 0.3s ease',
      hover: 'all 0.2s ease',
      focus: 'all 0.15s ease',
    },
  },

  betheme: {
    id: 'betheme',
    name: 'BeTheme (Multipurpose)',
    description: 'Inspirado en BeTheme. Tema multipropósito elegante y versátil.',
    category: 'Business',
    colors: {
      primary: '#0089ff',
      secondary: '#2c3e50',
      accent: '#e74c3c',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#2c3e50',
      textSecondary: '#7f8c8d',
      link: '#0089ff',
      linkHover: '#006dd6',
      border: '#bdc3c7',
      success: '#27ae60',
      warning: '#f39c12',
      error: '#e74c3c',
    },
    typography: {
      fontFamily: 'Lato',
      headingFont: 'Roboto',
      fontSize: '16',
      lineHeight: '1.65',
      headingWeight: '700',
      bodyWeight: '400',
    },
    layout: {
      containerWidth: '1200px',
      spacing: { xs: '0.5rem', sm: '1rem', md: '1.5rem', lg: '2rem', xl: '4rem' },
      borderRadius: { sm: '5px', md: '10px', lg: '15px', xl: '20px' },
    },
    components: {
      navbar: {
        background: '#2c3e50',
        color: '#ffffff',
        padding: '1.25rem 0',
        shadow: '0 2px 10px rgba(0,0,0,0.15)',
        borderBottom: 'none',
        height: '80px',
      },
      hero: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        padding: '6rem 0',
        textAlign: 'center',
      },
      button: {
        primary: {
          background: '#0089ff',
          color: '#ffffff',
          border: 'none',
          padding: '1rem 2rem',
          borderRadius: '25px',
          fontSize: '16px',
          fontWeight: '600',
          shadow: '0 4px 15px rgba(0,137,255,0.4)',
        },
        secondary: {
          background: 'transparent',
          color: '#0089ff',
          border: '2px solid #0089ff',
          padding: '1rem 2rem',
          borderRadius: '25px',
          fontSize: '16px',
          fontWeight: '600',
          shadow: 'none',
        },
      },
      card: {
        background: '#ffffff',
        border: 'none',
        borderRadius: '15px',
        padding: '2rem',
        shadow: '0 10px 30px rgba(0,0,0,0.1)',
        hover: {
          shadow: '0 15px 40px rgba(0,0,0,0.15)',
          transform: 'translateY(-5px)',
        },
      },
      footer: {
        background: '#34495e',
        color: '#ecf0f1',
        padding: '4rem 0 2rem',
        borderTop: 'none',
      },
    },
    animations: {
      transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
      hover: 'all 0.3s ease',
      focus: 'all 0.2s ease',
    },
  },

  avada: {
    id: 'avada',
    name: 'Avada (Premium Modern)',
    description: 'Inspirado en Avada Theme. Tema premium con diseño moderno y sofisticado.',
    category: 'Premium',
    colors: {
      primary: '#65bc7b',
      secondary: '#1d1d1d',
      accent: '#ff6b35',
      background: '#ffffff',
      surface: '#f9f9f9',
      text: '#1d1d1d',
      textSecondary: '#616161',
      link: '#65bc7b',
      linkHover: '#4a9960',
      border: '#e0e0e0',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
    },
    typography: {
      fontFamily: 'PT Sans',
      headingFont: 'PT Sans',
      fontSize: '16',
      lineHeight: '1.7',
      headingWeight: '700',
      bodyWeight: '400',
    },
    layout: {
      containerWidth: '1200px',
      spacing: { xs: '0.5rem', sm: '1rem', md: '1.5rem', lg: '2.5rem', xl: '4rem' },
      borderRadius: { sm: '6px', md: '12px', lg: '18px', xl: '24px' },
    },
    components: {
      navbar: {
        background: '#1d1d1d',
        color: '#ffffff',
        padding: '1.25rem 0',
        shadow: '0 3px 15px rgba(0,0,0,0.2)',
        borderBottom: 'none',
        height: '80px',
      },
      hero: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        padding: '6rem 0',
        textAlign: 'center',
      },
      button: {
        primary: {
          background: 'linear-gradient(45deg, #65bc7b, #4a9960)',
          color: '#ffffff',
          border: 'none',
          padding: '1rem 2rem',
          borderRadius: '30px',
          fontSize: '16px',
          fontWeight: '600',
          shadow: '0 6px 20px rgba(101,188,123,0.4)',
        },
        secondary: {
          background: 'transparent',
          color: '#65bc7b',
          border: '2px solid #65bc7b',
          padding: '1rem 2rem',
          borderRadius: '30px',
          fontSize: '16px',
          fontWeight: '600',
          shadow: 'none',
        },
      },
      card: {
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '18px',
        padding: '2rem',
        shadow: '0 8px 25px rgba(0,0,0,0.08)',
        hover: {
          shadow: '0 15px 35px rgba(0,0,0,0.12)',
          transform: 'translateY(-3px) scale(1.02)',
        },
      },
      footer: {
        background: '#1d1d1d',
        color: '#ffffff',
        padding: '4rem 0 2rem',
        borderTop: '3px solid #65bc7b',
      },
    },
    animations: {
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      hover: 'all 0.3s ease',
      focus: 'all 0.2s ease',
    },
  },

  hestia: {
    id: 'hestia',
    name: 'Hestia (Material Design)',
    description: 'Inspirado en Hestia Theme. Diseño elegante con Material Design para startups.',
    category: 'Startup',
    colors: {
      primary: '#e91e63',
      secondary: '#9c27b0',
      accent: '#00bcd4',
      background: '#ffffff',
      surface: '#fafafa',
      text: '#3c4858',
      textSecondary: '#999999',
      link: '#e91e63',
      linkHover: '#d81b60',
      border: '#e5e5e5',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
    },
    typography: {
      fontFamily: 'Roboto',
      headingFont: 'Roboto Slab',
      fontSize: '16',
      lineHeight: '1.7',
      headingWeight: '700',
      bodyWeight: '400',
    },
    layout: {
      containerWidth: '1140px',
      spacing: { xs: '0.5rem', sm: '1rem', md: '1.5rem', lg: '2rem', xl: '3rem' },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' },
    },
    components: {
      navbar: {
        background: '#ffffff',
        color: '#3c4858',
        padding: '1rem 0',
        shadow: '0 4px 18px 0 rgba(0,0,0,.12)',
        borderBottom: 'none',
        height: '70px',
      },
      hero: {
        background: 'linear-gradient(60deg, #ab47bc, #8e24aa)',
        color: '#ffffff',
        padding: '6rem 0',
        textAlign: 'center',
      },
      button: {
        primary: {
          background: 'linear-gradient(60deg, #ec407a, #d81b60)',
          color: '#ffffff',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '3px',
          fontSize: '16px',
          fontWeight: '500',
          shadow: '0 2px 2px 0 rgba(233,30,99,.14), 0 3px 1px -2px rgba(233,30,99,.2), 0 1px 5px 0 rgba(233,30,99,.12)',
        },
        secondary: {
          background: 'transparent',
          color: '#e91e63',
          border: '1px solid #e91e63',
          padding: '0.75rem 1.5rem',
          borderRadius: '3px',
          fontSize: '16px',
          fontWeight: '500',
          shadow: 'none',
        },
      },
      card: {
        background: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        padding: '1.5rem',
        shadow: '0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12)',
        hover: {
          shadow: '0 14px 26px -12px rgba(0,0,0,.42), 0 4px 23px 0 rgba(0,0,0,.12), 0 8px 10px -5px rgba(0,0,0,.2)',
          transform: 'translateY(-3px)',
        },
      },
      footer: {
        background: '#3c4858',
        color: '#ffffff',
        padding: '3rem 0 2rem',
        borderTop: 'none',
      },
    },
    animations: {
      transition: 'all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)',
      hover: 'all 0.3s ease',
      focus: 'all 0.2s ease',
    },
  },

  sydney: {
    id: 'sydney',
    name: 'Sydney (Business Corporate)',
    description: 'Inspirado en Sydney Theme. Tema corporativo profesional para empresas.',
    category: 'Corporate',
    colors: {
      primary: '#d65050',
      secondary: '#1e3a5f',
      accent: '#3498db',
      background: '#ffffff',
      surface: '#f4f4f4',
      text: '#1e3a5f',
      textSecondary: '#7a7a7a',
      link: '#d65050',
      linkHover: '#c44040',
      border: '#dddddd',
      success: '#27ae60',
      warning: '#f39c12',
      error: '#e74c3c',
    },
    typography: {
      fontFamily: 'Source Sans Pro',
      headingFont: 'Raleway',
      fontSize: '16',
      lineHeight: '1.6',
      headingWeight: '600',
      bodyWeight: '400',
    },
    layout: {
      containerWidth: '1170px',
      spacing: { xs: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.5rem', xl: '3rem' },
      borderRadius: { sm: '3px', md: '6px', lg: '10px', xl: '15px' },
    },
    components: {
      navbar: {
        background: '#ffffff',
        color: '#1e3a5f',
        padding: '1rem 0',
        shadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #dddddd',
        height: '70px',
      },
      hero: {
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2c5f7f 100%)',
        color: '#ffffff',
        padding: '5rem 0',
        textAlign: 'center',
      },
      button: {
        primary: {
          background: '#d65050',
          color: '#ffffff',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '3px',
          fontSize: '16px',
          fontWeight: '600',
          shadow: '0 3px 6px rgba(214,80,80,0.3)',
        },
        secondary: {
          background: 'transparent',
          color: '#d65050',
          border: '2px solid #d65050',
          padding: '0.75rem 1.5rem',
          borderRadius: '3px',
          fontSize: '16px',
          fontWeight: '600',
          shadow: 'none',
        },
      },
      card: {
        background: '#ffffff',
        border: '1px solid #dddddd',
        borderRadius: '6px',
        padding: '1.5rem',
        shadow: '0 2px 6px rgba(0,0,0,0.1)',
        hover: {
          shadow: '0 4px 12px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
        },
      },
      footer: {
        background: '#1e3a5f',
        color: '#ffffff',
        padding: '3rem 0 2rem',
        borderTop: '3px solid #d65050',
      },
    },
    animations: {
      transition: 'all 0.3s ease-in-out',
      hover: 'all 0.2s ease',
      focus: 'all 0.15s ease',
    },
  },

  hello: {
    id: 'hello',
    name: 'Hello Elementor (Ultra Minimal)',
    description: 'Inspirado en Hello Elementor. Tema minimalista extremo para máxima personalización.',
    category: 'Minimal',
    colors: {
      primary: '#007cba',
      secondary: '#000000',
      accent: '#666666',
      background: '#ffffff',
      surface: '#ffffff',
      text: '#000000',
      textSecondary: '#666666',
      link: '#007cba',
      linkHover: '#005a87',
      border: '#dddddd',
      success: '#46b450',
      warning: '#ffb900',
      error: '#dc3232',
    },
    typography: {
      fontFamily: 'Roboto',
      headingFont: 'Roboto',
      fontSize: '16',
      lineHeight: '1.6',
      headingWeight: '600',
      bodyWeight: '400',
    },
    layout: {
      containerWidth: '1140px',
      spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
      borderRadius: { sm: '2px', md: '4px', lg: '6px', xl: '8px' },
    },
    components: {
      navbar: {
        background: '#ffffff',
        color: '#000000',
        padding: '1rem 0',
        shadow: 'none',
        borderBottom: 'none',
        height: '60px',
      },
      hero: {
        background: '#ffffff',
        color: '#000000',
        padding: '4rem 0',
        textAlign: 'left',
      },
      button: {
        primary: {
          background: '#007cba',
          color: '#ffffff',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: '400',
          shadow: 'none',
        },
        secondary: {
          background: 'transparent',
          color: '#007cba',
          border: '1px solid #007cba',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: '400',
          shadow: 'none',
        },
      },
      card: {
        background: '#ffffff',
        border: 'none',
        borderRadius: '0px',
        padding: '1rem',
        shadow: 'none',
        hover: {
          shadow: 'none',
          transform: 'none',
        },
      },
      footer: {
        background: '#ffffff',
        color: '#000000',
        padding: '2rem 0',
        borderTop: '1px solid #dddddd',
      },
    },
    animations: {
      transition: 'none',
      hover: 'none',
      focus: 'none',
    },
  },
};

type ThemeContextType = {
  currentTheme: CompleteTheme;
  setTheme: (themeId: string) => void;
  availableThemes: CompleteTheme[];
  applyThemeStyles: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function Theme2025Provider({ children }: { children: React.ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = useState('astra');
  
  const { data: config } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const currentTheme = completeThemes[currentThemeId] || completeThemes.astra;
  const availableThemes = Object.values(completeThemes);

  // Apply theme styles to document
  const applyThemeStyles = () => {
    const root = document.documentElement;
    const theme = currentTheme;
    
    // Remove previous theme classes
    document.body.className = document.body.className
      .split(' ')
      .filter(cls => !cls.startsWith('theme-'))
      .join(' ');
    
    // Add current theme class
    document.body.classList.add(`theme-${theme.id}`);
    
    // Apply CSS variables for colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-color-${key}`, value);
    });

    // Apply typography variables
    Object.entries(theme.typography).forEach(([key, value]) => {
      root.style.setProperty(`--theme-typography-${key}`, value);
    });

    // Apply layout variables
    root.style.setProperty('--theme-container-width', theme.layout.containerWidth);
    Object.entries(theme.layout.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--theme-spacing-${key}`, value);
    });
    Object.entries(theme.layout.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--theme-radius-${key}`, value);
    });

    // Apply component-specific variables
    Object.entries(theme.components).forEach(([componentName, componentStyles]) => {
      Object.entries(componentStyles).forEach(([styleKey, styleValue]) => {
        if (typeof styleValue === 'string') {
          root.style.setProperty(`--theme-${componentName}-${styleKey}`, styleValue);
        } else if (typeof styleValue === 'object') {
          Object.entries(styleValue).forEach(([subKey, subValue]) => {
            root.style.setProperty(`--theme-${componentName}-${styleKey}-${subKey}`, subValue as string);
          });
        }
      });
    });

    // Apply animation variables
    Object.entries(theme.animations).forEach(([key, value]) => {
      root.style.setProperty(`--theme-animation-${key}`, value);
    });
  };

  useEffect(() => {
    applyThemeStyles();
  }, [currentTheme]);

  // Load theme from config
  useEffect(() => {
    if (config?.config) {
      const configData = config.config as any;
      const savedTheme = configData?.theme2025?.currentTheme;
      if (savedTheme && completeThemes[savedTheme]) {
        setCurrentThemeId(savedTheme);
      }
    }
  }, [config]);

  const setTheme = (themeId: string) => {
    if (completeThemes[themeId]) {
      setCurrentThemeId(themeId);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes, applyThemeStyles }}>
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

export function useCurrentTheme() {
  const { currentTheme } = useTheme2025();
  return currentTheme;
}
