import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SEOHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ShoppingCart, Heart, Search, Plus, Minus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { SiteConfig, Product, ProductCategory } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import AnimatedSection from "@/components/AnimatedSection";
import { Spinner } from "@/components/ui/spinner";

// Añadir estilos para ocultar scrollbar
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

// Inyectar estilos en el head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = scrollbarHideStyles;
  document.head.appendChild(styleSheet);
}

/**
 * Helper: resolveImageUrl
 * - Convierte distintas formas de image identifiers en URLs absolutas.
 * - Maneja:
 *    - URLs absolutas (http/https) => devueltas tal cual
 *    - '/objects/...' => origin + path
 *    - '/api/objects/direct-upload/<id>' => origin + '/objects/<id>'
 *    - 'somefile' o 'id' => origin + '/objects/<value>'
 */
const resolveImageUrl = (img?: string | null) => {
  if (!img) return "";
  if (typeof window === "undefined") return img; // SSR-safety

  const origin = window.location.origin;

  // If already absolute
  if (img.startsWith("http://") || img.startsWith("https://")) return img;

  // direct-upload special case
  if (img.includes("/api/objects/direct-upload/")) {
    const objectId = img.split("/api/objects/direct-upload/")[1] || "";
    return `${origin}/objects/${objectId}`;
  }

  // If already an objects path
  if (img.startsWith("/objects/")) {
    return `${origin}${img}`;
  }

  // Absolute relative (leading slash)
  if (img.startsWith("/")) {
    return `${origin}${img}`;
  }

  // Otherwise treat as bare object name or relative path
  return `${origin}/objects/${img}`;
};

/**
 * ImageWithRetry component
 * - Intenta cargar la URL resuelta, si falla prueba variantes:
 *    1. base (objects)
 *    2. fallback a /imgs/uploads/
 *    3. base + '?download=true'
 *    4. base + '?raw=true'
 * - Si al final falla, hace console.error con todos los intentos.
 */
function ImageWithRetry({
  src,
  alt,
  className,
  style,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [attempt, setAttempt] = useState(0);
  const base = useMemo(() => resolveImageUrl(src), [src]);

  const attempts = useMemo(() => {
    if (!base) return [""];
    
    const urls = [base];

    // If the original URL is an objects URL, try some alternatives
    if (src && src.includes('/objects/')) {
      const filename = src.replace('/objects/', '');
      // Agregar fallback a public/imgs/uploads/
      urls.push(`${window.location.origin}/imgs/uploads/${filename}`);
    }

    // Add query parameter variants
    const sep = base.includes("?") ? "&" : "?";
    urls.push(`${base}${sep}download=true`);
    urls.push(`${base}${sep}raw=true`);
    
    return urls;
  }, [base, src]);

  useEffect(() => {
    // reset attempt when src changes
    setAttempt(0);
  }, [base]);

  useEffect(() => {
    // nothing to do here besides updating the <img> src via attempt index
  }, [attempt, attempts]);

  // current attempt url
  const currentSrc = attempts[Math.min(attempt, attempts.length - 1)] || "";

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      onError={() => {
        // If there are more attempts, try next one
        setAttempt((a) => {
          const next = a + 1;
          if (next >= attempts.length) {
            // final failure - log all attempts
            console.error("❌ Image failed to load after retries. Attempts:", attempts);
            return attempts.length - 1;
          }
          console.log(`🔄 Retry attempt ${next}/${attempts.length}: ${attempts[next]}`);
          return next;
        });
      }}
      onLoad={() => {
        if (attempt > 0) {
          console.log(`✅ Image loaded successfully on attempt ${attempt + 1}: ${currentSrc}`);
        }
      }}
    />
  );
}

export default function Store() {
  // ✅ ALL HOOKS MUST BE AT THE TOP - NO CONDITIONAL EXECUTION
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMountedRef = useRef(true);

  // Core states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);

  // ✅ FETCH DATA WITH PROPER ERROR HANDLING AND MOBILE OPTIMIZATION
  const { data: config, isLoading: configLoading } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/store/products"],
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const { data: categories } = useQuery<ProductCategory[]>({
    queryKey: ["/api/store/categories"],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // ✅ MUTATIONS
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      if (!isMountedRef.current || isNavigating) {
        throw new Error("Component unmounted or navigating");
      }

      const product = products?.find(p => p.id === productId);
      if (!product) throw new Error("Producto no encontrado");

      // Check if product is active
      if (!product.isActive) {
        throw new Error("El producto no está disponible");
      }

      // Validate stock if tracking is enabled
      if (product.stock !== null) {
        const currentInCart = cart.find(item => item.product.id === productId)?.quantity || 0;
        const totalRequested = currentInCart + quantity;

        if (product.stock === 0) {
          throw new Error("Producto agotado");
        }

        if (totalRequested > product.stock) {
          throw new Error(`Stock insuficiente. Disponible: ${product.stock}, En carrito: ${currentInCart}, Máximo que puedes agregar: ${Math.max(0, product.stock - currentInCart)}`);
        }
      }

      setCart(prev => {
        const existing = prev.find(item => item.product.id === productId);
        let newCart;
        if (existing) {
          const newQuantity = existing.quantity + quantity;
          newCart = prev.map(item =>
            item.product.id === productId
              ? { ...item, quantity: newQuantity }
              : item
          );
        } else {
          newCart = [...prev, { product, quantity }];
        }
        saveCartToStorage(newCart);
        return newCart;
      });
      return product;
    },
    onSuccess: (product) => {
      if (isMountedRef.current && !isNavigating) {
        toast({
          title: "Producto agregado",
          description: `${product.name} fue agregado al carrito.`,
        });
      }
    },
    onError: (error) => {
      if (isMountedRef.current && !isNavigating) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "No se pudo agregar el producto",
          variant: "destructive"
        });
      }
    }
  });

  // ✅ COMPUTED VALUES - SAFE ACCESS WITH EARLY RETURNS
  const storeConfig = useMemo(() => {
    if (!config) return { isStoreEnabled: false, appearance: {} };

    const configData = config?.config as any;
    const modules = configData?.frontpage?.modulos || {};
    const appearance = configData?.appearance || {};

    return {
      isStoreEnabled: modules.tienda?.activo,
      appearance,
      modules
    };
  }, [config]);

  const { appearance } = storeConfig;

  const availableCategories = useMemo(() => {
    return ["all", ...(categories?.map(cat => cat.id) || [])];
  }, [categories]);

  const filteredProducts = useMemo(() => {
    if (!products || isNavigating) return [];

    return products.filter(p => {
      if (!p.isActive) return false;
      const matchesCategory = selectedCategory === "all" || p.categoryId === selectedCategory;
      const matchesSearch =
        searchTerm === "" ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm, isNavigating]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + ((item.product.price / 100) * item.quantity), 0);
  }, [cart]);

  // ✅ CALLBACK FUNCTIONS
  const performCleanup = useCallback(() => {
    if (!isMountedRef.current) return;

    try {
      setSelectedCategory("all");
      setSearchTerm("");
      setIsCartOpen(false);
      setSelectedProduct(null);
      setProductQuantity(1);
      // Don't clear favorites on cleanup - they should persist
      setIsNavigating(false);

      // Clear any body classes that might have been added by modals
      document.body.classList.remove('modal-open', 'overflow-hidden');
      document.body.style.overflow = '';

    } catch (error) {
      console.warn('Cleanup error:', error);
    }
  }, []);

  const handleNavigation = useCallback((href: string) => {
    if (!isMountedRef.current) return;

    try {
      setIsNavigating(true);
      performCleanup();

      setTimeout(() => {
        if (isMountedRef.current) {
          setLocation(href);
        }
      }, 50);
    } catch (error) {
      console.error('Navigation error:', error);
      setLocation(href);
    }
  }, [setLocation, performCleanup]);

  // Funciones para persistir carrito en localStorage
  const saveCartToStorage = useCallback((cartData: Array<{ product: Product; quantity: number }>) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('shopping-cart', JSON.stringify(cartData));
      // Dispatch custom event to notify other components (like navbar)
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.warn('Error saving cart to localStorage:', error);
    }
  }, []);

  // Funciones para persistir favoritos en localStorage
  const saveFavoritesToStorage = useCallback((favoritesData: Set<string>) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('store-favorites', JSON.stringify(Array.from(favoritesData)));
    } catch (error) {
      console.warn('Error saving favorites to localStorage:', error);
    }
  }, []);

  const toggleFavorite = useCallback((productId: string) => {
    if (!isMountedRef.current || isNavigating) return;

    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
        saveFavoritesToStorage(newFavorites);
        toast({ title: "Eliminado de favoritos", description: "Producto eliminado de tus favoritos" });
      } else {
        newFavorites.add(productId);
        saveFavoritesToStorage(newFavorites);
        toast({ title: "Agregado a favoritos", description: "Producto agregado a tus favoritos" });
      }
      return newFavorites;
    });
  }, [toast, isNavigating, saveFavoritesToStorage]);

  const getCategoryName = useCallback((categoryId: string) => {
    if (categoryId === "all") return "Todas las categorías";
    return categories?.find(cat => cat.id === categoryId)?.name || categoryId;
  }, [categories]);

  const openProductModal = useCallback((product: Product) => {
    if (!isMountedRef.current || isNavigating || document.visibilityState === 'hidden') return;

    setSelectedProduct(product);
    setProductQuantity(1);
    setCurrentImageIndex(0);
  }, [isNavigating]);

  const addToCartFromModal = useCallback(() => {
    if (!selectedProduct || !isMountedRef.current || isNavigating) return;

    // Additional validation before calling mutation
    if (selectedProduct.stock !== null) {
      const currentInCart = cart.find(item => item.product.id === selectedProduct.id)?.quantity || 0;
      const totalRequested = currentInCart + productQuantity;

      if (totalRequested > selectedProduct.stock) {
        toast({
          title: "Stock insuficiente",
          description: `Solo puedes agregar ${Math.max(0, selectedProduct.stock - currentInCart)} unidades más`,
          variant: "destructive"
        });
        return;
      }
    }

    addToCartMutation.mutate({ productId: selectedProduct.id, quantity: productQuantity });
    setSelectedProduct(null);
    setProductQuantity(1);
  }, [selectedProduct, productQuantity, addToCartMutation, isNavigating, cart, toast]);

  const handleCheckout = useCallback(() => {
    if (cart.length === 0 || !isMountedRef.current || isNavigating) return;

    try {
      localStorage.setItem('checkoutItems', JSON.stringify(cart));
      setIsCartOpen(false);
      handleNavigation("/checkout");
    } catch (error) {
      console.error('Checkout error:', error);
      if (isMountedRef.current) {
        toast({
          title: "Error",
          description: "No se pudo procesar el carrito. Intenta de nuevo.",
          variant: "destructive"
        });
      }
    }
  }, [cart, handleNavigation, toast, isNavigating]);

  const loadFavoritesFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return new Set<string>();
    try {
      const savedFavorites = localStorage.getItem('store-favorites');
      if (savedFavorites) {
        const parsedFavorites = JSON.parse(savedFavorites);
        if (Array.isArray(parsedFavorites)) {
          return new Set(parsedFavorites.filter(id => typeof id === 'string'));
        }
      }
    } catch (error) {
      console.warn('Error loading favorites from localStorage:', error);
    }
    return new Set<string>();
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    if (!isMountedRef.current || isNavigating) return;
    setCart(prev => {
      const newCart = prev.filter(item => item.product.id !== productId);
      saveCartToStorage(newCart);
      return newCart;
    });
  }, [isNavigating, saveCartToStorage]);

  const loadCartFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return [];
    try {
      const savedCart = localStorage.getItem('shopping-cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Validar que el carrito tenga la estructura correcta
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

  const updateCartQuantity = useCallback((productId: string, newQuantity: number) => {
    if (!isMountedRef.current || isNavigating) return;

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
  }, [removeFromCart, isNavigating, products, toast, saveCartToStorage]);

  // ✅ EFFECTS - MUST BE AFTER ALL HOOKS
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      performCleanup();
    };
  }, [performCleanup]);

  // Cargar carrito desde localStorage al montar el componente
  useEffect(() => {
    if (!cartLoaded && products && products.length > 0) {
      const savedCart = loadCartFromStorage();
      if (savedCart.length > 0) {
        // Validar que los productos del carrito guardado aún existen y están activos
        const validCartItems = savedCart.filter(item => {
          const product = products.find(p => p.id === item.product.id);
          return product && product.isActive;
        }).map(item => {
          // Actualizar los datos del producto por si han cambiado
          const currentProduct = products.find(p => p.id === item.product.id);
          return currentProduct ? { ...item, product: currentProduct } : item;
        });
        
        if (validCartItems.length > 0) {
          setCart(validCartItems);
          if (validCartItems.length !== savedCart.length) {
            // Si algunos productos fueron removidos, actualizar localStorage
            saveCartToStorage(validCartItems);
          }
        }
      }
      setCartLoaded(true);
    }
  }, [products, cartLoaded, loadCartFromStorage, saveCartToStorage]);

  // Cargar favoritos desde localStorage al montar el componente
  useEffect(() => {
    if (!favoritesLoaded && products && products.length > 0) {
      const savedFavorites = loadFavoritesFromStorage();
      if (savedFavorites.size > 0) {
        // Validar que los productos favoritos aún existen y están activos
        const validFavorites = new Set(
          Array.from(savedFavorites).filter(productId => {
            const product = products.find(p => p.id === productId);
            return product && product.isActive;
          })
        );
        setFavorites(validFavorites);
        
        if (validFavorites.size !== savedFavorites.size) {
          // Si algunos favoritos fueron removidos, actualizar localStorage
          saveFavoritesToStorage(validFavorites);
        }
      }
      setFavoritesLoaded(true);
    }
  }, [products, favoritesLoaded, loadFavoritesFromStorage, saveFavoritesToStorage]);

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

  useEffect(() => {
    const handlePopState = () => {
      if (isMountedRef.current) {
        performCleanup();
      }
    };

    const handleBeforeUnload = () => {
      performCleanup();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isMountedRef.current) {
        performCleanup();
      }
    };

    // Listen for storage changes to sync cart across tabs/components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'shopping-cart' && !isNavigating && isMountedRef.current) {
        if (e.newValue === null || e.newValue === '[]') {
          // Cart was cleared
          setCart([]);
        } else {
          try {
            const newCart = JSON.parse(e.newValue);
            if (Array.isArray(newCart) && products) {
              // Validate products still exist and are active
              const validCartItems = newCart.filter(item => {
                const product = products.find(p => p.id === item.product.id);
                return product && product.isActive;
              }).map(item => {
                const currentProduct = products.find(p => p.id === item.product.id);
                return currentProduct ? { ...item, product: currentProduct } : item;
              });
              setCart(validCartItems);
            }
          } catch (error) {
            console.warn('Error parsing cart from storage:', error);
          }
        }
      }
    };

    // Listen for cart updates from same page (custom event)
    const handleCartUpdate = () => {
      if (!isNavigating && isMountedRef.current) {
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
      }
    };

    // Listen for favorites storage changes
    const handleFavoritesStorageChange = (e: StorageEvent) => {
      if (e.key === 'store-favorites' && !isNavigating && isMountedRef.current) {
        if (e.newValue === null || e.newValue === '[]') {
          setFavorites(new Set());
        } else {
          try {
            const newFavorites = JSON.parse(e.newValue);
            if (Array.isArray(newFavorites) && products) {
              // Validate that products still exist and are active
              const validFavorites = new Set(
                newFavorites.filter(productId => {
                  const product = products.find(p => p.id === productId);
                  return product && product.isActive;
                })
              );
              setFavorites(validFavorites);
            }
          } catch (error) {
            console.warn('Error parsing favorites from storage:', error);
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage', handleFavoritesStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage', handleFavoritesStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [performCleanup, isNavigating, products, loadCartFromStorage]);

  useEffect(() => {
    if (products && categories) {
      const validCategories = categories.map(cat => cat.id);
      if (!validCategories.includes(selectedCategory) && selectedCategory !== "all") {
        setSelectedCategory("all");
      }
    }
  }, [products, categories, selectedCategory]);

  // ✅ LOADING AND ERROR STATES - AFTER ALL HOOKS
  const isLoading = configLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <AnimatedSection>
          <div className="container mx-auto px-4 py-16 flex flex-col items-center space-y-4 navbar-fixed-body">
            <Spinner size="lg" className="text-primary" />
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">Cargando tienda...</h2>
              <p className="text-sm text-muted-foreground">Por favor espere mientras cargamos los productos.</p>
            </div>
          </div>
        </AnimatedSection>
        <Footer />
      </div>
    );
  }

  if (!storeConfig.isStoreEnabled) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <AnimatedSection>
          <div className="container mx-auto px-4 py-16 text-center navbar-fixed-body">
            <h1 className="text-4xl font-bold mb-4">Tienda</h1>
            <p className="text-xl text-muted-foreground">La tienda no está disponible en este momento.</p>
          </div>
        </AnimatedSection>
        <Footer />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-background navbar-fixed-body"
      style={{
        backgroundColor: appearance.backgroundColor || "inherit",
        color: appearance.textColor || "inherit",
        fontFamily: appearance.fontFamily || "inherit",
      }}
    >
      <SEOHead title="Tienda - Productos en línea" description="Descubre nuestra colección de productos. Envío gratis en pedidos superiores a $500." />
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header y filtros */}
        <AnimatedSection>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: appearance.textColor || "#111111", fontFamily: appearance.fontFamily || "inherit" }}>Tienda</h1>
              <p className="text-xl" style={{ color: appearance.textColor || "#666666", fontFamily: appearance.fontFamily || "inherit" }}>Descubre nuestra colección de productos</p>
            </div>

            {/* Botón Carrito */}
            <Dialog open={isCartOpen && !isNavigating} onOpenChange={(open) => {
              if (!isNavigating) setIsCartOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2" disabled={isNavigating}>
                  <ShoppingCart className="h-4 w-4" /> Carrito ({cart.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Carrito de compras</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Tu carrito está vacío</p>
                  ) : (
                    <>
                      {cart.map(item => (
                        <div key={item.product.id} className="flex items-center justify-between space-x-4">
                          <div className="flex-1">
                            <h4 className="font-medium line-clamp-1">{item.product.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              ${(item.product.price / 100).toFixed(2)} x {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)} disabled={isNavigating}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                if (!isNavigating) {
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
                                }
                              }} 
                              disabled={isNavigating || (() => {
                                const product = products?.find(p => p.id === item.product.id);
                                return product?.stock !== null && item.quantity >= product.stock;
                              })()}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.product.id)} disabled={isNavigating}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-semibold">
                            ${((item.product.price / 100) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-semibold">Total:</span>
                          <span className="font-bold text-lg">${cartTotal.toFixed(2)}</span>
                        </div>
                        <Button className="w-full" onClick={handleCheckout} disabled={isNavigating}>
                          Proceder al Checkout
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => !isNavigating && setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isNavigating}
              />
            </div>

            <Select value={selectedCategory} onValueChange={(value) => !isNavigating && setSelectedCategory(value)} disabled={isNavigating}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Categoría" /></SelectTrigger>
              <SelectContent>
                {availableCategories.map(catId => (
                  <SelectItem key={catId} value={catId}>{getCategoryName(catId)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </AnimatedSection>

        {/* Grid de productos */}
        <AnimatedSection delay={0.4}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <AnimatedSection key={product.id} delay={0.1 * (index % 8)}>
                <Card
                  className="h-full overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => !isNavigating && openProductModal(product)}
                >
                  <div className="relative">
                    {product.images?.[0] && (
                      <ImageWithRetry
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    {product.stock !== null && product.stock <= 5 && product.stock > 0 && (
                      <Badge variant="destructive" className="absolute top-2 right-2">¡Pocas unidades!</Badge>
                    )}
                    {product.stock === 0 && (
                      <Badge variant="secondary" className="absolute top-2 right-2">Agotado</Badge>
                    )}
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 p-1"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          !isNavigating && toggleFavorite(product.id); 
                        }}
                        disabled={isNavigating}
                      >
                        <Heart className={`h-4 w-4 ${favorites.has(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                      </Button>
                    </div>
                    {product.categoryId && <Badge variant="outline" className="w-fit">{getCategoryName(product.categoryId)}</Badge>}
                  </CardHeader>

                  <CardContent className="pt-0 flex-1 flex flex-col">
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-2xl font-bold text-primary">${(product.price / 100).toFixed(2)}</span>
                      <Button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          !isNavigating && addToCartMutation.mutate({ productId: product.id }); 
                        }}
                        disabled={(product.stock !== null && product.stock === 0) || addToCartMutation.isPending || isNavigating}
                        className="gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" /> Agregar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>

        {/* Modal Producto */}
        <Dialog 
          open={!!selectedProduct && !isNavigating} 
          onOpenChange={(open) => {
            if (!open && !isNavigating) {
              setSelectedProduct(null);
              setProductQuantity(1);
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedProduct && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Carousel de imágenes */}
                <div className="relative">
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <div className="w-full">
                      {selectedProduct.images.length === 1 ? (
                        <div className="aspect-square w-full">
                          <ImageWithRetry
                            src={selectedProduct.images[0]}
                            alt={selectedProduct.name}
                            className="w-full h-full object-cover rounded-lg shadow-lg"
                          />
                        </div>
                      ) : (
                        <div className="relative">
                          {/* Imagen principal */}
                          <div className="aspect-square w-full overflow-hidden rounded-lg shadow-lg relative group bg-gray-100">
                            <div className="relative w-full h-full overflow-hidden">
                              <ImageWithRetry
                                src={selectedProduct.images[currentImageIndex]}
                                alt={`${selectedProduct.name} ${currentImageIndex + 1}`}
                                className="w-full h-full object-cover transition-all duration-300 ease-out group-hover:scale-125 cursor-zoom-in"
                                style={{
                                  transformOrigin: 'center center'
                                }}
                              />
                              
                              {/* Overlay sutil para mejor contraste */}
                              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                            
                            {/* Navegación de imágenes */}
                            {selectedProduct.images.length > 1 && (
                              <>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/95 hover:bg-white shadow-xl border-0 backdrop-blur-sm h-10 w-10 rounded-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newIndex = currentImageIndex === 0 ? selectedProduct.images!.length - 1 : currentImageIndex - 1;
                                    setCurrentImageIndex(newIndex);
                                  }}
                                  disabled={isNavigating}
                                >
                                  <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/95 hover:bg-white shadow-xl border-0 backdrop-blur-sm h-10 w-10 rounded-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newIndex = currentImageIndex === selectedProduct.images!.length - 1 ? 0 : currentImageIndex + 1;
                                    setCurrentImageIndex(newIndex);
                                  }}
                                  disabled={isNavigating}
                                >
                                  <ChevronRight className="h-5 w-5" />
                                </Button>
                                
                                {/* Indicadores de puntos mejorados */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-2">
                                  {selectedProduct.images.map((_, idx) => (
                                    <button
                                      key={idx}
                                      className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                                        idx === currentImageIndex 
                                          ? 'bg-white scale-125 shadow-lg' 
                                          : 'bg-white/60 hover:bg-white/80 hover:scale-110'
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex(idx);
                                      }}
                                    />
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                          
                          {/* Thumbnails para navegación mejorados */}
                          <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                            {selectedProduct.images.map((img, idx) => (
                              <div 
                                key={idx} 
                                className="flex-shrink-0 cursor-pointer group/thumb"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentImageIndex(idx);
                                }}
                              >
                                <div className={`relative overflow-hidden rounded-lg transition-all duration-200 ${
                                  idx === currentImageIndex
                                    ? 'ring-2 ring-primary shadow-lg scale-105'
                                    : 'ring-1 ring-gray-200 hover:ring-primary/50 hover:scale-105'
                                }`}>
                                  <ImageWithRetry
                                    src={img}
                                    alt={`Thumbnail ${idx + 1}`}
                                    className="w-18 h-18 object-cover"
                                  />
                                  <div className={`absolute inset-0 transition-opacity duration-200 ${
                                    idx === currentImageIndex
                                      ? 'bg-black/0'
                                      : 'bg-black/20 group-hover/thumb:bg-black/10'
                                  }`}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-square w-full bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <div className="text-4xl mb-2">📷</div>
                        <p>Sin imagen disponible</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Información del producto */}
                <div className="flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-3xl font-bold text-primary mb-2">{selectedProduct.name}</h2>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl font-bold text-primary">${(selectedProduct.price / 100).toFixed(2)}</span>
                        {selectedProduct.comparePrice && selectedProduct.comparePrice > selectedProduct.price && (
                          <span className="text-xl text-muted-foreground line-through">${(selectedProduct.comparePrice / 100).toFixed(2)}</span>
                        )}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.categoryId && (
                        <Badge variant="outline" className="text-sm">{getCategoryName(selectedProduct.categoryId)}</Badge>
                      )}
                      {selectedProduct.stock !== null && selectedProduct.stock <= 5 && selectedProduct.stock > 0 && (
                        <Badge variant="destructive">¡Pocas unidades!</Badge>
                      )}
                      {selectedProduct.stock === 0 && (
                        <Badge variant="secondary">Agotado</Badge>
                      )}
                    </div>

                    {/* Tags */}
                    {selectedProduct.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {selectedProduct.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}

                    {/* Descripción */}
                    {selectedProduct.description && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg">Descripción</h4>
                        <p className="text-muted-foreground leading-relaxed">{selectedProduct.description}</p>
                      </div>
                    )}

                    {/* Stock */}
                    {selectedProduct.stock !== null && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Stock disponible:</span>
                          <span className={`font-bold ${selectedProduct.stock <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                            {selectedProduct.stock} unidades
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cantidad y agregar al carrito */}
                  <div className="space-y-4 border-t pt-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border rounded-lg">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => !isNavigating && setProductQuantity(Math.max(1, productQuantity - 1))}
                          disabled={isNavigating}
                          className="h-12 px-4"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-6 py-3 border-x font-semibold text-lg">{productQuantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (!isNavigating && selectedProduct.stock !== null) {
                              const currentInCart = cart.find(item => item.product.id === selectedProduct.id)?.quantity || 0;
                              const maxCanAdd = Math.max(0, selectedProduct.stock - currentInCart);
                              if (productQuantity < maxCanAdd) {
                                setProductQuantity(productQuantity + 1);
                              } else {
                                toast({
                                  title: "Límite alcanzado",
                                  description: `Ya tienes ${currentInCart} en el carrito. Stock total: ${selectedProduct.stock}`,
                                  variant: "destructive"
                                });
                              }
                            } else if (!isNavigating && selectedProduct.stock === null) {
                              setProductQuantity(productQuantity + 1);
                            }
                          }}
                          disabled={isNavigating || (selectedProduct.stock !== null && (() => {
                            const currentInCart = cart.find(item => item.product.id === selectedProduct.id)?.quantity || 0;
                            const maxCanAdd = Math.max(0, selectedProduct.stock - currentInCart);
                            return productQuantity >= maxCanAdd;
                          })())}
                          className="h-12 px-4"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button 
                        onClick={addToCartFromModal} 
                        className="flex-1 h-12 text-lg font-semibold" 
                        disabled={(selectedProduct.stock !== null && selectedProduct.stock === 0) || addToCartMutation.isPending || isNavigating}
                        size="lg"
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" /> 
                        Agregar al carrito
                      </Button>
                    </div>

                    {/* Precio total */}
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">Total:</span>
                        <span className="text-2xl font-bold text-primary">
                          ${((selectedProduct.price / 100) * productQuantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {filteredProducts.length === 0 && !isNavigating && (
          <AnimatedSection delay={0.2}>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold mb-2">No hay productos disponibles</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== "all" ? "No se encontraron productos que coincidan con los filtros." : "Actualmente no tenemos productos en stock."}
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => {
                    if (!isNavigating) {
                      setSearchTerm(""); 
                      setSelectedCategory("all");
                    }
                  }}
                  disabled={isNavigating}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </AnimatedSection>
        )}
      </div>

      <Footer />
    </div>
  );
}
