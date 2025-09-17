import React, { useState , useEffect, useMemo  } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ObjectUploader from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";

// Define Product type for better type safety
interface Product {
  id: string;
  name: string;
  description?: string | null;
  shortDescription?: string | null;
  price: number;
  currency: string;
  comparePrice?: number | null;
  categoryId: string;
  stock: number;
  lowStockThreshold: number;
  sku: string;
  weight: number;
  isActive: boolean;
  isFeatured: boolean;
  tags?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  images?: string[]; // Array of image URLs
}

export default function AdminStore() {
  return (
    <AdminLayout>
      <AdminStoreContent />
    </AdminLayout>
  );
}

function AdminStoreContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [tempImageUrls, setTempImageUrls] = useState<string[]>([]);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [showProductDetails, setShowProductDetails] = useState(false); // State for product details dialog
  const [showOrderEdit, setShowOrderEdit] = useState(false); // State for order edit dialog

  // Fetch store statistics
  const { data: stats = {} } = useQuery({
    queryKey: ["/api/store/stats"],
    queryFn: () => apiRequest("/api/store/stats", { method: "GET" }),
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchOnWindowFocus: true, // Refresh when user returns to tab
  });

  // Fetch products
  const { data: rawProducts, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/store/products"],
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });

  // Normalize image URLs for all products
  const products = useMemo(() => {
    if (!rawProducts) return undefined;

    return rawProducts.map(product => ({
      ...product,
      images: Array.isArray(product.images)
        ? product.images.map(imgUrl => {
            if (typeof imgUrl !== 'string') return imgUrl;

            // Handle object URLs that already start with /objects/
            if (imgUrl.startsWith('/objects/')) {
              return imgUrl;
            }

            // Handle full URLs by extracting the path
            if (imgUrl.startsWith('http')) {
              try {
                const url = new URL(imgUrl);
                if (url.pathname.startsWith('/objects/')) {
                  return url.pathname;
                }
              } catch (e) {
                console.warn('Invalid URL:', imgUrl);
              }
            }

            // Handle relative paths - prepend /objects/ if not present
            if (!imgUrl.startsWith('/')) {
              return `/objects/${imgUrl}`;
            }

            return imgUrl;
          })
        : product.images
    }));
  }, [rawProducts]);


  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/store/categories"],
    queryFn: () => apiRequest("/api/store/categories", { method: "GET" }),
  });

  // Fetch orders
  const { data: orders = [] } = useQuery({
    queryKey: ["/api/store/orders"],
    queryFn: () => apiRequest("/api/store/orders", { method: "GET" }),
  });

  // State for order management
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  // const [showOrderEdit, setShowOrderEdit] = useState(false); // Moved this state up

  // Fetch customers
  const { data: customers = [] } = useQuery({
    queryKey: ["/api/store/customers"],
    queryFn: () => apiRequest("/api/store/customers", { method: "GET" }),
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest(`/api/store/orders/${id}`, { method: "PUT", body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/store/stats"] }); // Refresh stats
      toast({
        title: "Pedido actualizado",
        description: "El estado del pedido se ha actualizado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el pedido",
        variant: "destructive",
      });
    }
  });

  // Fetch order items for selected order
  const { data: orderItems = [] } = useQuery({
    queryKey: ["/api/store/orders", selectedOrder?.id, "items"],
    queryFn: () => apiRequest(`/api/store/orders/${selectedOrder.id}/items`, { method: "GET" }),
    enabled: !!selectedOrder
  });

  // Product mutations
  const createProductMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/store/products", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/store/stats"] }); // Refresh stats
      handleCloseProductForm();
      toast({ title: "Producto creado exitosamente" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear producto",
        variant: "destructive"
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      let body: string | FormData;
      let headers: any = {};

      // Si el producto tiene una imagen, usar FormData
      if (data.image instanceof File) {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          formData.append(key, data[key]);
        });
        body = formData;
        // Con FormData no agregues Content-Type, fetch lo hace solo
      } else {
        body = JSON.stringify(data);
        headers["Content-Type"] = "application/json";
      }

      return apiRequest(`/api/store/products/${id}`, {
        method: "PUT",
        body,
        headers,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/store/stats"] });
      handleCloseProductForm();
      toast({ title: "Producto actualizado exitosamente" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar producto",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/store/products/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/store/stats"] }); // Refresh stats
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente",
      });
    },
    onError: (error: any) => {
      if (error.status === 409 && error.hasOrders) {
        // Product has orders, show deactivation option
        toast({
          title: "No se puede eliminar",
          description: error.message,
          variant: "destructive",
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => deactivateProductMutation.mutate(error.productId || selectedProduct?.id)}
            >
              Desactivar
            </Button>
          ),
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "No se pudo eliminar el producto",
          variant: "destructive",
        });
      }
    }
  });

  // Deactivate product mutation
  const deactivateProductMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/store/products/${id}/deactivate`, { method: "PUT" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/store/stats"] });
      toast({
        title: "Producto desactivado",
        description: "El producto ha sido desactivado y ya no aparecerá en la tienda",
      });
      setShowProductDetails(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo desactivar el producto",
        variant: "destructive",
      });
    }
  });

  // Reactivate product mutation
  const reactivateProductMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/store/products/${id}/activate`, { method: "PUT" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/store/stats"] });
      toast({
        title: "Producto reactivado",
        description: "El producto ha sido reactivado y volverá a aparecer en la tienda",
      });
      setShowProductDetails(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo reactivar el producto",
        variant: "destructive",
      });
    }
  });

  // Handle delete with confirmation
  const handleDeleteProduct = (product: Product) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${product.name}"? Esta acción no se puede deshacer.`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/store/categories", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/store/stats"] }); // Refresh stats
      setShowCategoryForm(false);
      setSelectedCategory(null);
      toast({ title: "Categoría creada exitosamente" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear categoría",
        variant: "destructive"
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/store/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/store/stats"] }); // Refresh stats
      setShowCategoryForm(false);
      setSelectedCategory(null);
      toast({ title: "Categoría actualizada exitosamente" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar categoría",
        variant: "destructive"
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/store/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/store/stats"] }); // Refresh stats
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar categoría",
        variant: "destructive"
      });
    },
  });



  // Image upload mutation
  const updateProductImageMutation = useMutation({
    mutationFn: ({ id, imageURL }: { id: string; imageURL: string | string[] }) => {
      const images = Array.isArray(imageURL) ? imageURL : [imageURL];
      return apiRequest(`/api/store/products/${id}`, { method: "PUT", body: JSON.stringify({ images }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/store/stats"] }); // Refresh stats
      toast({ title: "Imágenes actualizadas exitosamente" });
      setUploadingImage(null);
      setTempImageUrl(null);
      setTempImageUrls([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar imágenes",
        variant: "destructive"
      });
    },
  });

  // Handle image upload functions
  const handleGetUploadParameters = async () => {
    try {
      const response = await apiRequest("/api/objects/upload", { method: "POST" });
      console.log("Upload parameters response:", response);
      return {
        method: "PUT" as const,
        url: response.uploadURL
      };
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al obtener URL de carga",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUploadComplete = (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => {
    console.log("=== 🏆 UPLOAD COMPLETE START ===");

    if (!result.successful || result.successful.length === 0) {
      console.error("❌ Upload failed:", result);
      let errorMessage = "Error al subir las imágenes";
      if (result.failed && result.failed.length > 0) {
        const failedFile = result.failed[0];
        if (failedFile.error) {
          errorMessage =
            typeof failedFile.error === "string"
              ? failedFile.error
              : "Error desconocido en la subida";
        }
        console.error("❌ Failed file details:", failedFile);
      }

      toast({
        title: "Error al subir imágenes",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    // Procesar todas las imágenes exitosas
    const newImageUrls: string[] = [];

    result.successful.forEach((file, index) => {
      console.log(`COMPLETE-${index + 1}. File name:`, file?.name);
      console.log(`COMPLETE-${index + 1}. File.response:`, file?.response);

      if (file?.response?.error) {
        console.error("❌ Server error in response:", file.response.error);
        return;
      }

      const serverResponse = file?.response?.body || {};
      console.log(`COMPLETE-${index + 1}. Server response:`, serverResponse);

      const imageURL = serverResponse.url ||
                       serverResponse.location ||
                       serverResponse.uploadURL ||
                       null;

      if (!imageURL) {
        console.error(`❌ No se encontró URL para el archivo ${index + 1}`, serverResponse);
        return;
      }

      const finalURL = imageURL.trim();
      console.log(`COMPLETE-${index + 1}. ✅ Final URL:`, finalURL);

      // Validar formato
      const urlPattern = /^(https?:\/\/|\/)/;
      if (!urlPattern.test(finalURL)) {
        console.error(`❌ Invalid URL format for file ${index + 1}:`, finalURL);
        return;
      }

      newImageUrls.push(finalURL);
    });

    if (newImageUrls.length === 0) {
      toast({
        title: "Error al procesar imágenes",
        description: "No se pudieron procesar las URLs de las imágenes",
        variant: "destructive",
      });
      return;
    }

    // Guardar según el caso (producto existente o nuevo)
    if (selectedProduct?.id) {
      console.log("COMPLETE-FINAL. Updating product with images:", newImageUrls);
      
      // Combinar imágenes existentes con las nuevas (máximo 5)
      const existingImages = selectedProduct.images || [];
      const allImages = [...existingImages, ...newImageUrls].slice(0, 5);
      
      updateProductImageMutation.mutate({
        id: selectedProduct.id,
        imageURL: allImages,
      });
    } else {
      console.log("COMPLETE-FINAL. Setting tempImageUrls:", newImageUrls);
      setTempImageUrls(prev => [...prev, ...newImageUrls].slice(0, 5));
      toast({
        title: `${newImageUrls.length} imagen(es) subida(s) exitosamente`,
        description: "Se aplicarán al guardar el producto",
      });
    }

    console.log("=== 🏁 UPLOAD COMPLETE END ===");
  };


  const handleCloseProductForm = () => {
    setShowProductForm(false);
    setSelectedProduct(null);
    setTempImageUrl(null);
    setTempImageUrls([]);
    setUploadingImage(null);
  };

  const handleProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const categoryId = formData.get("categoryId") as string;

    // Validate category selection
    if (!categoryId || categoryId === "") {
      toast({
        title: "Error",
        description: "Debes seleccionar una categoría",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      name: formData.get("name"),
      description: formData.get("description"),
      shortDescription: formData.get("shortDescription"),
      price: Math.round(parseFloat(formData.get("price") as string) * 100), // Convert to cents
      currency: formData.get("currency") || "MXN",
      comparePrice: formData.get("comparePrice") ? Math.round(parseFloat(formData.get("comparePrice") as string) * 100) : null,
      categoryId,
      stock: parseInt(formData.get("stock") as string),
      lowStockThreshold: parseInt(formData.get("lowStockThreshold") as string),
      sku: formData.get("sku"),
      weight: parseInt(formData.get("weight") as string),
      isActive: formData.get("isActive") === "on",
      isFeatured: formData.get("isFeatured") === "on",
      tags: (formData.get("tags") as string)?.split(",").map(tag => tag.trim()),
      seoTitle: formData.get("seoTitle"),
      seoDescription: formData.get("seoDescription"),
      // For new products: include all temp images if they exist
      ...(!selectedProduct && (tempImageUrl || tempImageUrls.length > 0) 
          ? { images: tempImageUrl ? [tempImageUrl, ...tempImageUrls] : tempImageUrls } 
          : {}),
    };

    console.log("=== PRODUCT SUBMISSION DEBUG ===");
    console.log("selectedProduct:", selectedProduct?.id);
    console.log("tempImageUrl:", tempImageUrl);
    console.log("productData.images:", productData.images);

    if (selectedProduct) {
      updateProductMutation.mutate({ id: selectedProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleCategorySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const categoryData = {
      name: formData.get("name"),
      description: formData.get("description"),
      isActive: formData.get("isActive") === "on",
    };

    if (selectedCategory) {
      updateCategoryMutation.mutate({ id: selectedCategory.id, data: categoryData });
    } else {
      createCategoryMutation.mutate(categoryData);
    }
  };

  const formatPrice = (price: number, currency: string = 'MXN') => {
    const amount = (price / 100).toFixed(2);
    const currencySymbols: { [key: string]: string } = {
      'MXN': '$',
      'USD': 'US$',
      'EUR': '€'
    };
    const symbol = currencySymbols[currency] || currency + ' ';
    return `${symbol}${amount}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const [activeTab, setActiveTab] = useState("products"); // ✅ now inside the component

  // Handle URL hash for direct navigation to tabs
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash && ['products', 'orders', 'customers', 'categories'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash && ['products', 'orders', 'customers', 'categories'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update URL hash when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.history.pushState(null, '', `#${value}`);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };


  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Tienda</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/store/stats"] });
              queryClient.invalidateQueries({ queryKey: ["/api/store/orders"] });
              queryClient.invalidateQueries({ queryKey: ["/api/store/products"] });
              queryClient.invalidateQueries({ queryKey: ["/api/store/customers"] });
              toast({
                title: "Estadísticas actualizadas",
                description: "Los datos se han refrescado correctamente",
              });
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar Stats
          </Button>
          <Button onClick={() => setShowProductForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
          <Button variant="outline" onClick={() => setShowCategoryForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Categoría
          </Button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos Totales</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeProducts} activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingOrders} pendientes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Promedio: {formatPrice(stats.averageOrderValue)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Productos</CardTitle>
              <CardDescription>
                Gestiona tu inventario de productos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="text-center py-4">Cargando productos...</div>
              ) : (
                <div className="space-y-4">
                  {products && products.map((product: Product) => (
                    <Card key={product.id} className={`cursor-pointer hover:shadow-md transition-shadow ${!product.isActive ? 'opacity-60 border-gray-300' : ''}`} onClick={() => handleProductSelect(product)}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          {product.images && product.images.length > 0 && (
                            <div className="flex-shrink-0">
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-md"
                                onError={(e) => {
                                  console.error('Image failed to load:', product.images[0]);
                                  e.currentTarget.src = '/imgs/placeholder.png';
                                }}
                              />
                              {product.images.length > 1 && (
                                <div className="text-xs text-center mt-1 text-gray-500">
                                  +{product.images.length - 1} más
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                              {!product.isActive && (
                                <Badge variant="secondary" className="text-xs">
                                  Inactivo
                                </Badge>
                              )}
                              {product.isFeatured && (
                                <Badge variant="default" className="text-xs">
                                  Destacado
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-lg font-bold text-green-600">
                                ${(product.price / 100).toFixed(2)} {product.currency || 'MXN'}
                              </span>
                              <div className="text-sm text-gray-500">
                                Stock: {product.stock ?? 'N/A'}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Acciones
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {/* <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleProductSelect(product);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver Detalles
                                </DropdownMenuItem> */}
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProduct(product);
                                    setShowProductForm(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUploadingImage(product.id);
                                  }}
                                >
                                  <Package className="w-4 h-4 mr-2" />
                                  Cambiar Imagen
                                </DropdownMenuItem> */}
                                {product.isActive ? (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deactivateProductMutation.mutate(product.id);
                                    }}
                                    className="text-orange-600"
                                  >
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Desactivar
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      reactivateProductMutation.mutate(product.id);
                                    }}
                                    className="text-green-600"
                                  >
                                    <Package className="w-4 h-4 mr-2" />
                                    Reactivar
                                  </DropdownMenuItem>
                                )}
                                {/* <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProduct(product);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem> */}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos</CardTitle>
              <CardDescription>
                Gestiona los pedidos de los clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">#{order.orderNumber}</h3>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                          {order.paymentStatus}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.guestEmail || 'Cliente registrado'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="font-medium">{formatPrice(order.total, order.currency)}</span>
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={order.status}
                        onValueChange={(value) =>
                          updateOrderMutation.mutate({
                            id: order.id,
                            data: { status: value }
                          })
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="processing">Procesando</SelectItem>
                          <SelectItem value="shipped">Enviado</SelectItem>
                          <SelectItem value="delivered">Entregado</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clientes</CardTitle>
              <CardDescription>
                Lista de clientes registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customers.map((customer: any) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {customer.firstName} {customer.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Registrado: {new Date(customer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categorías</CardTitle>
              <CardDescription>
                Gestiona las categorías de productos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category: any) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{category.name}</h3>
                        {!category.isActive && <Badge variant="secondary">Inactiva</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategoryForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`¿Estás seguro de que deseas eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`)) {
                            deleteCategoryMutation.mutate(category.id);
                          }
                        }}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Form Dialog */}
      <Dialog open={showProductForm} onOpenChange={handleCloseProductForm}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct
                ? "Modifica los datos del producto"
                : "Crea un nuevo producto para tu tienda"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleProductSubmit} className="space-y-4">
            {/* Nombre y SKU */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={selectedProduct?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  name="sku"
                  defaultValue={selectedProduct?.sku}
                  required
                />
              </div>
            </div>

            {/* Descripción corta y larga */}
            <div className="space-y-2">
              <Label htmlFor="shortDescription">Descripción Corta</Label>
              <Input
                id="shortDescription"
                name="shortDescription"
                defaultValue={selectedProduct?.shortDescription}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={selectedProduct?.description}
                rows={3}
              />
            </div>

            {/* Sección de subida de múltiples imágenes */}
            <div className="space-y-2">
              <Label>Imágenes del Producto (máximo 5)</Label>
              
              {/* Preview de imágenes existentes */}
              {(selectedProduct?.images && selectedProduct.images.length > 0) && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Imágenes actuales:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedProduct.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Producto ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                          onError={(e) => {
                            console.error("❌ Image preview failed to load:", imageUrl);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            // Remover imagen específica
                            const updatedImages = selectedProduct.images?.filter((_, i) => i !== index) || [];
                            if (selectedProduct.id) {
                              updateProductImageMutation.mutate({
                                id: selectedProduct.id,
                                imageURL: updatedImages.length > 0 ? updatedImages : []
                              });
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview de imágenes temporales (nuevas) */}
              {tempImageUrl && (
                <div className="mb-4">
                  <p className="text-sm text-green-600 mb-2">Nueva imagen seleccionada:</p>
                  <div className="inline-block relative group">
                    <img
                      src={tempImageUrl}
                      alt="Nueva imagen"
                      className="w-20 h-20 object-cover rounded border border-green-300"
                    />
                    <button
                      type="button"
                      onClick={() => setTempImageUrl(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <div className="space-y-4">
                  <div className="text-gray-400">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-2">Agregar imágenes del producto</p>
                    <p className="text-xs text-gray-500">
                      {selectedProduct?.images?.length || 0} de 5 imágenes
                    </p>
                  </div>

                  {/* ObjectUploader para múltiples imágenes */}
                  <ObjectUploader
                    onUploadSuccess={handleUploadComplete}
                    onUploadError={(error) => {
                      console.error("Upload error:", error);
                      toast({
                        title: "Error al subir imágenes",
                        description: "No se pudieron subir las imágenes",
                        variant: "destructive",
                      });
                    }}
                    acceptedFileTypes={['image/*']}
                    maxFileSize={10 * 1024 * 1024}
                    maxNumberOfFiles={5}
                    allowMultiple={true}
                    note="Formatos: JPG, PNG, GIF. Máximo 10MB por imagen. Hasta 5 imágenes."
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  />
                </div>
              </div>
            </div>



            {/* Precios y moneda */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Precio *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={
                    selectedProduct ? (selectedProduct.price / 100).toFixed(2) : ""
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Select
                  name="currency"
                  defaultValue={selectedProduct?.currency || "MXN"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                    <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comparePrice">Precio de Comparación</Label>
                <Input
                  id="comparePrice"
                  name="comparePrice"
                  type="number"
                  step="0.01"
                  defaultValue={
                    selectedProduct?.comparePrice
                      ? (selectedProduct.comparePrice / 100).toFixed(2)
                      : ""
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (g)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  defaultValue={selectedProduct?.weight}
                />
              </div>
            </div>

            {/* Stock y categoría */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  defaultValue={selectedProduct?.stock}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Límite Stock Bajo</Label>
                <Input
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  type="number"
                  defaultValue={selectedProduct?.lowStockThreshold}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoría *</Label>
                <Select
                  name="categoryId"
                  defaultValue={selectedProduct?.categoryId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.length
                      ? categories.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      : (
                        <SelectItem value="" disabled>
                          No hay categorías disponibles
                        </SelectItem>
                      )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags y SEO */}
            <div className="space-y-2">
              <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={selectedProduct?.tags?.join(", ")}
                placeholder="etiqueta1, etiqueta2, etiqueta3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">Título SEO</Label>
                <Input
                  id="seoTitle"
                  name="seoTitle"
                  defaultValue={selectedProduct?.seoTitle}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">Descripción SEO</Label>
                <Input
                  id="seoDescription"
                  name="seoDescription"
                  defaultValue={selectedProduct?.seoDescription}
                />
              </div>
            </div>

            {/* Switches */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  name="isActive"
                  defaultChecked={selectedProduct?.isActive ?? true}
                />
                <Label htmlFor="isActive">Producto Activo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  name="isFeatured"
                  defaultChecked={selectedProduct?.isFeatured ?? false}
                />
                <Label htmlFor="isFeatured">Producto Destacado</Label>
              </div>
            </div>

            {/* Footer */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProductForm(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {selectedProduct ? "Actualizar" : "Crear"} Producto
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Category Form Dialog */}
      <Dialog open={showCategoryForm} onOpenChange={(open) => {
        setShowCategoryForm(open);
        if (!open) {
          setSelectedCategory(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? "Modifica los datos de la categoría"
                : "Crea una nueva categoría para organizar tus productos"
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nombre *</Label>
              <Input
                id="categoryName"
                name="name"
                defaultValue={selectedCategory?.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryDescription">Descripción</Label>
              <Textarea
                id="categoryDescription"
                name="description"
                defaultValue={selectedCategory?.description}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="categoryIsActive"
                name="isActive"
                defaultChecked={selectedCategory?.isActive ?? true}
              />
              <Label htmlFor="categoryIsActive">Categoría Activa</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCategoryForm(false);
                  setSelectedCategory(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                {createCategoryMutation.isPending || updateCategoryMutation.isPending
                  ? "Guardando..."
                  : selectedCategory ? "Actualizar Categoría" : "Crear Categoría"
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido #{selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Información completa del pedido
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status and Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Estado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status === 'pending' ? 'Pendiente' :
                       selectedOrder.status === 'processing' ? 'Procesando' :
                       selectedOrder.status === 'shipped' ? 'Enviado' :
                       selectedOrder.status === 'delivered' ? 'Entregado' :
                       selectedOrder.status === 'cancelled' ? 'Cancelado' :
                       selectedOrder.status}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Pago</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={selectedOrder.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                      {selectedOrder.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedOrder.paymentMethod === 'stripe' ? 'Tarjeta de Crédito' : selectedOrder.paymentMethod}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">
                      {formatPrice(selectedOrder.total, selectedOrder.currency)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Información del Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p><strong>Fecha:</strong> {new Date(selectedOrder.createdAt).toLocaleString('es-MX')}</p>
                      <p><strong>Email:</strong> {selectedOrder.guestEmail || 'Cliente registrado'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle>Dirección de Envío</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      try {
                        const address = typeof selectedOrder.shippingAddress === 'string'
                          ? JSON.parse(selectedOrder.shippingAddress)
                          : selectedOrder.shippingAddress;
                        return (
                          <div className="space-y-2">
                            <p><strong>{address.firstName} {address.lastName}</strong></p>
                            <p>{address.address1}</p>
                            {address.address2 && <p>{address.address2}</p>}
                            <p>{address.city}, {address.state} {address.zipCode}</p>
                            <p>{address.country}</p>
                            {address.phone && <p><strong>Tel:</strong> {address.phone}</p>}
                          </div>
                        );
                      } catch (e) {
                        return <p>{selectedOrder.shippingAddress}</p>;
                      }
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Productos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderItems.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.productName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Cantidad: {item.quantity} × {formatPrice(item.unitPrice, selectedOrder.currency)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatPrice(item.totalPrice, selectedOrder.currency)}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Subtotal:</span>
                        <span>{formatPrice(selectedOrder.subtotal || selectedOrder.total, selectedOrder.currency)}</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-lg mt-2">
                        <span>Total:</span>
                        <span>{formatPrice(selectedOrder.total, selectedOrder.currency)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowOrderDetails(false);
                    setShowOrderEdit(true);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Estado
                </Button>

                <Button onClick={() => setShowOrderDetails(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={!!uploadingImage} onOpenChange={(open) => {
        if (!open) {
          setUploadingImage(null);
          setTempImageUrl(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Imagen del Producto</DialogTitle>
            <DialogDescription>
              Selecciona una nueva imagen para el producto
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {uploadingImage && (() => {
              const product = products?.find(p => p.id === uploadingImage);
              return product ? (
                <div className="flex items-center gap-4">
                  <img
                    src={product.images?.[0] || '/imgs/placeholder.png'}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">Imagen actual</p>
                  </div>
                </div>
              ) : null;
            })()}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {tempImageUrl ? (
                <div className="space-y-4">
                  <img
                    src={tempImageUrl}
                    alt="Nueva imagen"
                    className="w-32 h-32 object-cover rounded mx-auto"
                  />
                  <p className="text-sm text-green-600">Nueva imagen seleccionada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-gray-400">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-gray-600">Selecciona una nueva imagen</p>
                </div>
              )}

              <ObjectUploader
                onUploadSuccess={handleUploadComplete}
                onUploadError={(error) => {
                  console.error("Upload error:", error);
                  toast({
                    title: "Error al subir imagen",
                    description: "No se pudo subir la imagen",
                    variant: "destructive",
                  });
                }}
                acceptedFileTypes={['image/*']}
                maxFileSize={10 * 1024 * 1024}
                maxNumberOfFiles={1}
                allowMultiple={false}
                note="Formatos: JPG, PNG, GIF. Máximo 10MB"
                className="mt-4"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadingImage(null);
                setTempImageUrl(null);
              }}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Edit Dialog */}
      <Dialog open={showOrderEdit} onOpenChange={setShowOrderEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pedido #{selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Actualiza el estado y información del pedido
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Estado del Pedido</Label>
                <Select
                  defaultValue={selectedOrder.status}
                  onValueChange={(value) =>
                    updateOrderMutation.mutate({
                      id: selectedOrder.id,
                      data: { status: value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="processing">Procesando</SelectItem>
                    <SelectItem value="shipped">Enviado</SelectItem>
                    <SelectItem value="delivered">Entregado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estado del Pago</Label>
                <Select
                  defaultValue={selectedOrder.paymentStatus}
                  onValueChange={(value) =>
                    updateOrderMutation.mutate({
                      id: selectedOrder.id,
                      data: { paymentStatus: value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="paid">Pagado</SelectItem>
                    <SelectItem value="refunded">Reembolsado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowOrderEdit(false)}>
                  Cancelar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}