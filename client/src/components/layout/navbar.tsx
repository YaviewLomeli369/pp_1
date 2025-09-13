import { useLocation } from "wouter";
// import { useQuery } from "@tanstack/react-query";
import { useMemo }  from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import type { SiteConfig } from "@shared/schema";

import logoSvg from "/imgs/NYUXO_LOGO_CLARO.svg";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShoppingCart, User, LogOut, Settings, Menu, Plus, Minus, X } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1075);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navRef = useRef(`navbar-${Date.now()}`);
  const isNavigatingRef = useRef(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: navbarConfig } = useQuery({
    queryKey: ["/api/navbar-config"],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Get navbar styles from config
  const navbarStyles = useMemo(() => {
    const configData = config?.config as any;
    const styles = configData?.navbarStyles || {};

    return {
      height: styles.height || '64px',
      backgroundColor: styles.backgroundColor || '#ffffff',
      backgroundBlur: styles.backgroundBlur !== false,
      backgroundOpacity: styles.backgroundOpacity || '0.95',
      borderBottom: styles.borderBottom || '1px solid rgba(229, 231, 235, 0.8)',
      fontSize: styles.fontSize || '16px',
      fontWeight: styles.fontWeight || '500',
      fontFamily: styles.fontFamily || 'inherit',
      textColor: styles.textColor || '#374151',
      textHoverColor: styles.textHoverColor || '#059669',
      activeTextColor: styles.activeTextColor || '#059669',
      logoSize: styles.logoSize || '40px',
      boxShadow: styles.boxShadow || '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      borderRadius: styles.borderRadius || '0px',
      transition: styles.transition || 'all 0.3s ease',
      maxWidth: styles.maxWidth || '1280px',
      padding: styles.padding || '0 16px',
      position: styles.position || 'fixed',
      customCSS: styles.customCSS || ''
    };
  }, [config]);

  // Products query for cart functionality
  const { data: products } = useQuery({
    queryKey: ["/api/store/products"],
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Cart state - using localStorage like store.tsx
  const [cart, setCart] = useState<Array<{ product: any; quantity: number }>>([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  // Cart helper functions
  const saveCartToStorage = useCallback((cartData: Array<{ product: any; quantity: number }>) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('shopping-cart', JSON.stringify(cartData));
    } catch (error) {
      console.warn('Error saving cart to localStorage:', error);
    }
  }, []);

  const loadCartFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return [];
    try {
      const savedCart = localStorage.getItem('shopping-cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          return parsedCart.filter(item => 
            item && 
            typeof item === 'object' && 
            item.product && 
            typeof item.quantity === 'number' &&
            item.quantity > 0
          );
        }
      }
    } catch (error) {
      console.warn('Error loading cart from localStorage:', error);
    }
    return [];
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => {
      const newCart = prev.filter(item => item.product.id !== productId);
      saveCartToStorage(newCart);
      return newCart;
    });
    toast({
      title: "Producto eliminado",
      description: "El producto se eliminó del carrito"
    });
  }, [saveCartToStorage, toast]);

  const clearCart = useCallback(() => {
    setCart([]);
    saveCartToStorage([]);
    toast({
      title: "Carrito vaciado",
      description: "Todos los productos fueron eliminados del carrito"
    });
  }, [saveCartToStorage, toast]);

  // Load cart from localStorage when products are available
  useEffect(() => {
    if (!cartLoaded && products && products.length > 0) {
      const savedCart = loadCartFromStorage();
      if (savedCart.length > 0) {
        // Validate that products still exist and are active
        const validCartItems = savedCart.filter(item => {
          const product = products.find(p => p.id === item.product.id);
          return product && product.isActive;
        }).map(item => {
          // Update product data in case it changed
          const currentProduct = products.find(p => p.id === item.product.id);
          return currentProduct ? { ...item, product: currentProduct } : item;
        });

        if (validCartItems.length > 0) {
          setCart(validCartItems);
          if (validCartItems.length !== savedCart.length) {
            saveCartToStorage(validCartItems);
          }
        }
      }
      setCartLoaded(true);
    }
  }, [products, cartLoaded, loadCartFromStorage, saveCartToStorage]);

  // Periodic cart sync to ensure data consistency
  useEffect(() => {
    if (!cartLoaded || !products) return;

    const syncInterval = setInterval(() => {
      const currentCartString = JSON.stringify(cart);
      const storageCartString = localStorage.getItem('shopping-cart') || '[]';

      // Only sync if there's a difference
      if (currentCartString !== storageCartString) {
        const storageCart = loadCartFromStorage();
        if (storageCart.length > 0) {
          const validCartItems = storageCart.filter(item => {
            const product = products.find(p => p.id === item.product.id);
            return product && product.isActive;
          }).map(item => {
            const currentProduct = products.find(p => p.id === item.product.id);
            return currentProduct ? { ...item, product: currentProduct } : item;
          });
          setCart(validCartItems);
        } else if (cart.length > 0) {
          setCart([]);
        }
      }
    }, 1000); // Check every second

    return () => clearInterval(syncInterval);
  }, [cart, cartLoaded, products, loadCartFromStorage]);

  const configData = config?.config as any;
  const modules = configData?.frontpage?.modulos || {};
  const appearance = configData?.appearance || {};

  // Cart helper functions
  const cartTotal = cart.reduce((sum: number, item: any) => sum + ((item.product.price / 100) * item.quantity), 0);
  const cartItemCount = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);

  const updateCartQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products?.find(p => p.id === productId);
    if (!product) {
      toast({
        title: "Error",
        description: "Producto no encontrado",
        variant: "destructive"
      });
      return;
    }

    // Validate stock if tracking is enabled
    if (product.stock !== null && newQuantity > product.stock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${product.stock} unidades disponibles`,
        variant: "destructive"
      });
      return;
    }

    setCart(prev => {
      const newCart = prev.map(item =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      );
      saveCartToStorage(newCart);
      return newCart;
    });
  }, [removeFromCart, products, toast, saveCartToStorage]);

  const handleNavigation = useCallback((href: string) => {
    if (isNavigatingRef.current) return;

    isNavigatingRef.current = true;
    document.body.classList.remove("modal-open", "overflow-hidden");
    document.body.style.overflow = "";

    if (href === location) {
      const refreshHref = `${href}?refresh=${Date.now()}`;
      window.history.replaceState(null, "", href);
      setLocation(refreshHref);
      setTimeout(() => setLocation(href), 50);
    } else {
      setLocation(href);
    }

    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 300);
  }, [location, setLocation]);

  const handleCheckout = useCallback(() => {
    if (cart.length === 0) return;
    try {
      localStorage.setItem('checkoutItems', JSON.stringify(cart));
      setIsCartOpen(false);
      handleNavigation('/checkout');
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar el carrito. Intenta de nuevo.",
        variant: "destructive"
      });
    }
  }, [cart, handleNavigation, toast]);

  const navItems = useMemo(() => {
    const navbarConfig = configData?.navbar || {};

    // Default navigation items
    const defaultItems = [
      { href: "/", label: "Inicio", moduleKey: "home", always: true, order: 0 },
      { href: "/testimonials", label: "Testimonios", moduleKey: "testimonios", order: 1 },
      { href: "/faqs", label: "FAQs", moduleKey: "faqs", order: 2 },
      { href: "/contact", label: "Contacto", moduleKey: "contacto", order: 3 },
      { href: "/store", label: "Tienda", moduleKey: "tienda", order: 4 },
      { href: "/blog", label: "Blog", moduleKey: "blog", order: 5 },
      { href: "/reservations", label: "Reservas", moduleKey: "reservas", order: 6 },
      { href: "/conocenos", label: "Conócenos", moduleKey: "conocenos", always: true, order: 7 },
      { href: "/servicios", label: "Servicios", moduleKey: "servicios", always: true, order: 8 }
    ];

    // Build navigation items from config or defaults
    const items = defaultItems
      .map(item => {
        const config = navbarConfig[item.moduleKey];
        return {
          href: config?.href || item.href,
          label: config?.label || item.label,
          moduleKey: item.moduleKey,
          always: item.always,
          isVisible: config?.isVisible !== undefined ? config.isVisible : true,
          isRequired: config?.isRequired || item.always,
          order: config?.order !== undefined ? config.order : item.order
        };
      })
      .filter(item => {
        // Show if always visible or if module is active
        if (item.always || item.isRequired) return item.isVisible;

        // Check if module is active and item is visible
        const moduleActive = item.moduleKey && modules[item.moduleKey]?.activo;
        return moduleActive && item.isVisible;
      })
      .sort((a, b) => a.order - b.order);

    return items;
  }, [configData, modules]);

  useEffect(() => {
    const handleResize = () => {
      const newIsDesktop = window.innerWidth > 1075;
      if (isMobileMenuOpen && newIsDesktop) setIsMobileMenuOpen(false);
      setIsDesktop(newIsDesktop);
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Listen for storage changes to sync cart across tabs/components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'shopping-cart') {
        if (e.newValue === null || e.newValue === '[]') {
          // Cart was cleared
          setCart([]);
        } else {
          try {
            const newCart = JSON.parse(e.newValue);
            if (Array.isArray(newCart)) {
              setCart(newCart);
            }
          } catch (error) {
            console.warn('Error parsing cart from storage:', error);
          }
        }
      }
    };

    // Listen for checkout completion event
    const handleCheckoutComplete = () => {
      setCart([]);
      saveCartToStorage([]);
    };

    // Listen for cart updates from same page (custom event)
    const handleCartUpdate = () => {
      const updatedCart = loadCartFromStorage();
      if (products && products.length > 0) {
        // Validate that products still exist and are active
        const validCartItems = updatedCart.filter(item => {
          const product = products.find(p => p.id === item.product.id);
          return product && product.isActive;
        }).map(item => {
          // Update product data in case it changed
          const currentProduct = products.find(p => p.id === item.product.id);
          return currentProduct ? { ...item, product: currentProduct } : item;
        });
        setCart(validCartItems);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("checkoutComplete", handleCheckoutComplete);
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("checkoutComplete", handleCheckoutComplete);
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [isMobileMenuOpen, saveCartToStorage, products, loadCartFromStorage]);

  const NavLink = useCallback(({ href, children, className, onClick }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }) => (
    <div
      className={`cursor-pointer ${className} ${location === href ? 'active' : ''}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onClick) onClick();
        handleNavigation(href);
      }}
      style={isNavigatingRef.current ? { pointerEvents: "none", opacity: 0.6 } : {}}
    >
      {children}
    </div>
  ), [handleNavigation, location]);

  // Update navbar styles and body padding on mount and config changes
  useEffect(() => {
    if (!navbarConfig) return;

    // Apply navbar styles
    const navElement = document.querySelector('nav[data-navbar="true"]') as HTMLElement;
    if (navElement && navbarStyles) {
      Object.assign(navElement.style, {
        position: navbarStyles.position || 'fixed',
        backgroundColor: navbarStyles.backgroundColor || '#ffffff',
        backdropFilter: navbarStyles.backgroundBlur ? `blur(10px)` : 'none',
        borderBottom: navbarStyles.borderBottom || '1px solid #e5e7eb',
        boxShadow: navbarStyles.boxShadow || '0 1px 3px rgba(0, 0, 0, 0.1)',
        zIndex: navbarStyles.zIndex || '1000',
        width: navbarStyles.width || '100%',
        height: navbarStyles.height || 'auto',
        padding: navbarStyles.padding || '0.75rem 1rem',
        transition: navbarStyles.transition || 'all 0.3s ease'
      });

      // Function to update body padding based on exact navbar height
      const updateBodyPadding = () => {
        // Force a reflow to ensure accurate measurements
        navElement.offsetHeight;
        
        if (navbarStyles.position === 'fixed') {
          // Get the actual computed height of the navbar
          const navRect = navElement.getBoundingClientRect();
          const navHeight = navRect.height;
          
          // Apply the exact height as padding
          document.body.style.paddingTop = `${navHeight}px`;
          document.body.style.transition = 'padding-top 0.3s ease';
        } else {
          document.body.style.paddingTop = '0px';
          document.body.style.transition = 'padding-top 0.3s ease';
        }
      };

      // Initial padding update with a small delay to ensure styles are applied
      setTimeout(updateBodyPadding, 10);

      // Set up ResizeObserver to watch for navbar size changes
      const resizeObserver = new ResizeObserver((entries) => {
        // Use requestAnimationFrame for smooth updates
        requestAnimationFrame(updateBodyPadding);
      });

      resizeObserver.observe(navElement);

      // Also listen for window resize events
      const handleResize = () => {
        requestAnimationFrame(updateBodyPadding);
      };

      window.addEventListener('resize', handleResize);

      // Listen for font load events that might change navbar height
      const handleFontLoad = () => {
        setTimeout(updateBodyPadding, 100);
      };

      document.fonts.addEventListener('loadingdone', handleFontLoad);

      // Cleanup function
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', handleResize);
        document.fonts.removeEventListener('loadingdone', handleFontLoad);
        if (navbarStyles?.position !== 'fixed') {
          document.body.style.paddingTop = '0px';
        }
      };
    }
  }, [navbarConfig, navbarStyles]);

  // Additional effect to handle immediate updates when navbar styles change
  useEffect(() => {
    const navElement = document.querySelector('nav[data-navbar="true"]') as HTMLElement;
    if (navElement && navbarStyles?.position === 'fixed') {
      // Use requestAnimationFrame to ensure the style changes are applied first
      requestAnimationFrame(() => {
        const navRect = navElement.getBoundingClientRect();
        const navHeight = navRect.height;
        document.body.style.paddingTop = `${navHeight}px`;
      });
    }
  }, [navbarStyles?.height, navbarStyles?.padding, navbarStyles?.fontSize, navbarStyles?.logoSize]);


  return (
    <>
      {/* Inject custom styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .navbar-custom {
            height: ${navbarStyles.height} !important;
            background-color: ${navbarStyles.backgroundColor} !important;
            ${navbarStyles.backgroundBlur ? `backdrop-filter: blur(10px) !important;` : ''}
            ${navbarStyles.backgroundOpacity !== '1' ? `background-color: ${navbarStyles.backgroundColor}${Math.round(parseFloat(navbarStyles.backgroundOpacity) * 255).toString(16).padStart(2, '0')} !important;` : ''}
            border-bottom: ${navbarStyles.borderBottom} !important;
            box-shadow: ${isScrolled ? navbarStyles.boxShadow : 'none'} !important;
            border-radius: ${navbarStyles.borderRadius} !important;
            transition: ${navbarStyles.transition} !important;
            position: ${navbarStyles.position} !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 50 !important;
          }

          .navbar-custom .navbar-container {
            max-width: ${navbarStyles.maxWidth} !important;
            padding: ${navbarStyles.padding} !important;
            margin: 0 auto !important;
            height: 100% !important;
          }

          .navbar-custom .navbar-link {
            font-size: ${navbarStyles.fontSize} !important;
            font-weight: ${navbarStyles.fontWeight} !important;
            font-family: ${navbarStyles.fontFamily} !important;
            color: ${navbarStyles.textColor} !important;
            transition: ${navbarStyles.transition} !important;
          }

          .navbar-custom .navbar-link:hover {
            color: ${navbarStyles.textHoverColor} !important;
          }

          .navbar-custom .navbar-link.active {
            color: ${navbarStyles.activeTextColor} !important;
            font-weight: 600 !important;
          }

          .navbar-custom .navbar-logo {
            height: ${navbarStyles.logoSize} !important;
            width: auto !important;
          }

          ${navbarStyles.customCSS}
        `
      }} />

      <nav
        className="navbar-custom w-full z-50"
        key={navRef.current}
        data-navbar="true"
      >
      <div className="navbar-container">
        <div className="flex items-center justify-between h-full">
          {/* Logo + Brand */}
          <NavLink href="/" className="flex items-center space-x-3">
            <img
              src={logoSvg}
              alt="Logo"
              className="navbar-logo object-contain"
            />
          </NavLink>

          {/* Desktop Menu */}
          <div className={`items-center space-x-8 ${isDesktop ? "flex" : "hidden"}`}>
            {navItems.slice(0, 6).map((item) => (
              <NavLink
                key={`${item.href}-${navRef.current}`}
                href={item.href}
                className="navbar-link"
              >
                {item.label}
              </NavLink>
            ))}
            {navItems.length > 6 && (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-base font-medium hover:text-primary">
                  Más
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {navItems.slice(6).map((item) => (
                    <DropdownMenuItem key={item.href} onClick={() => handleNavigation(item.href)}>
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {modules.tienda?.activo && (
              <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="relative gap-2" size="sm">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Carrito de compras</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {cart.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">Tu carrito está vacío</p>
                        <Button 
                          onClick={() => {
                            setIsCartOpen(false);
                            handleNavigation('/store');
                          }}
                        >
                          Ir a la tienda
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="max-h-96 overflow-y-auto space-y-4">
                          {cart.map((item: any) => (
                            <div key={item.product.id} className="flex items-center justify-between space-x-4 p-4 border rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium line-clamp-1">{item.product.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  ${(item.product.price / 100).toFixed(2)} c/u
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    const product = products?.find(p => p.id === item.product.id);
                                    if (product?.stock !== null && item.quantity >= product.stock) {
                                      toast({
                                        title: "Stock insuficiente",
                                        description: `Solo hay ${product.stock} unidades disponibles`,
                                        variant: "destructive"
                                      });
                                      return;
                                    }
                                    updateCartQuantity(item.product.id, item.quantity + 1);
                                  }}
                                  disabled={(() => {
                                    const product = products?.find(p => p.id === item.product.id);
                                    return product?.stock !== null && item.quantity >= product.stock;
                                  })()}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => removeFromCart(item.product.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">
                                  ${((item.product.price / 100) * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-t pt-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Total:</span>
                            <span className="font-bold text-lg">${cartTotal.toFixed(2)}</span>
                          </div>

                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => {
                                setIsCartOpen(false);
                                handleNavigation('/store');
                              }}
                            >
                              Seguir comprando
                            </Button>
                            <Button 
                              className="flex-1" 
                              onClick={handleCheckout}
                              disabled={cart.length === 0}
                            >
                              Checkout
                            </Button>
                          </div>

                          <Button 
                            variant="ghost" 
                            className="w-full text-red-600 hover:text-red-700"
                            onClick={clearCart}
                          >
                            Vaciar carrito
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Auth Desktop */}
            <div className={`items-center space-x-3 ${isDesktop ? "flex" : "hidden"}`}>
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-white/40">
                      <AvatarFallback>
                        {user?.username?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white/90 backdrop-blur-md" align="end">
                    <DropdownMenuItem onClick={() => handleNavigation("/profile")}>
                      <User className="mr-2 h-4 w-4" /> Perfil
                    </DropdownMenuItem>
                    {(user?.role === "admin" || user?.role === "superuser") && (
                      <DropdownMenuItem onClick={() => handleNavigation("/admin")}>
                        <Settings className="mr-2 h-4 w-4" /> Administración
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <NavLink href="/login" className="text-gray-700 hover:text-primary">
                    Iniciar Sesión
                  </NavLink>
                  <NavLink
                    href="/register"
                    className="border border-primary text-primary rounded-md px-4 py-2 hover:bg-primary hover:text-white transition"
                  >
                    Registrarse
                  </NavLink>
                </>
              )}
            </div>

            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <div
                  className={`inline-flex items-center justify-center h-9 px-3 cursor-pointer ${
                    isDesktop ? "hidden" : "block"
                  }`}
                >
                  <Menu className="h-6 w-6" />
                </div>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[400px] flex flex-col bg-white backdrop-blur-xl border-l border-gray-200"
              >
                <SheetHeader>
                  <SheetTitle>{appearance.brandName || "Sistema Modular"}</SheetTitle>
                  <SheetDescription>Navegación principal</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-6 overflow-y-auto flex-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={`mobile-${item.href}-${navRef.current}`}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`text-lg font-medium p-2 rounded-md ${
                        location === item.href
                          ? "text-primary bg-primary/10"
                          : "text-gray-700 hover:text-primary"
                      }`}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>

                {/* Auth en Mobile abajo */}
                <div className="border-t pt-4">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="p-2 bg-gray-50 rounded-md">
                        <p className="font-medium">{user?.username}</p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                      </div>
                      <NavLink
                        href="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
                      >
                        <User className="h-4 w-4" /> Perfil
                      </NavLink>
                      {(user?.role === "admin" || user?.role === "superuser") && (
                        <NavLink
                          href="/admin"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
                        >
                          <Settings className="h-4 w-4" /> Administración
                        </NavLink>
                      )}
                      <div
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center space-x-2 text-red-600 hover:text-red-700 p-2 rounded-md cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" /> Cerrar Sesión
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <NavLink
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full text-center py-2 px-4 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition"
                      >
                        Iniciar Sesión
                      </NavLink>
                      <NavLink
                        href="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full text-center py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition"
                      >
                        Registrarse
                      </NavLink>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}