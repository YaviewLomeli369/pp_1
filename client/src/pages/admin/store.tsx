import React, { useState , useEffect  } from "react";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";

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

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);

  // Fetch store statistics
  const { data: stats = {} } = useQuery({
    queryKey: ["/api/store/stats"],
    queryFn: () => apiRequest("/api/store/stats", { method: "GET" }),
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchOnWindowFocus: true, // Refresh when user returns to tab
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/store/products"],
    queryFn: () => apiRequest("/api/store/products", { method: "GET" }),
  });

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
  const [showOrderEdit, setShowOrderEdit] = useState(false);

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

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/store/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/store/stats"] }); // Refresh stats
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente",
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Error al eliminar producto",
        variant: "destructive" 
      });
    },
  });

  // Handle delete with confirmation
  const handleDeleteProduct = (product: any) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${product.name}"? Esta acción no se puede deshacer y también se archivará el producto en Stripe.`)) {
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
    mutationFn: ({ id, imageURL }: { id: string; imageURL: string }) => 
      apiRequest(`/api/store/products/${id}`, { method: "PUT", body: JSON.stringify({ images: [imageURL] }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/store/stats"] }); // Refresh stats
      toast({ title: "Imagen actualizada exitosamente" });
      setUploadingImage(null);
      setTempImageUrl(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Error al actualizar imagen",
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
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    console.log("=== COMPREHENSIVE UPLOAD DIAGNOSTIC START ===");
    console.log("1. Raw upload result object:", JSON.stringify(result, null, 2));
    console.log("2. Result.successful exists:", !!result.successful);
    console.log("3. Result.successful length:", result.successful?.length);
    console.log("4. Result.failed exists:", !!result.failed);
    console.log("5. Result.failed length:", result.failed?.length);
    
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      console.log("=== DETAILED FILE OBJECT ANALYSIS ===");
      console.log("6. Uploaded file keys:", Object.keys(uploadedFile));
      console.log("7. uploadedFile.response exists:", !!uploadedFile.response);
      console.log("8. uploadedFile.response type:", typeof uploadedFile.response);
      console.log("9. uploadedFile.uploadURL exists:", !!uploadedFile.uploadURL);
      console.log("10. uploadedFile.uploadURL value:", uploadedFile.uploadURL);
      console.log("11. uploadedFile.uploadURL type:", typeof uploadedFile.uploadURL);
      console.log("12. Full uploadedFile object:", JSON.stringify(uploadedFile, null, 2));
      
      let imageURL: string | null = null;
      
      // STEP-BY-STEP URL EXTRACTION WITH DETAILED LOGGING
      console.log("=== URL EXTRACTION ANALYSIS ===");
      
      // Step 1: Check uploadedFile.response.url
      console.log("13. uploadedFile.response exists:", !!uploadedFile.response);
      if (uploadedFile.response) {
        console.log("14. uploadedFile.response.url exists:", !!uploadedFile.response.url);
        console.log("15. uploadedFile.response.url value:", uploadedFile.response.url);
        console.log("16. uploadedFile.response.url type:", typeof uploadedFile.response.url);
        console.log("17. uploadedFile.response object:", JSON.stringify(uploadedFile.response, null, 2));
      }
      
      if (uploadedFile.response && uploadedFile.response.url) {
        console.log("18. ✅ FOUND response.url, using it:", uploadedFile.response.url);
        imageURL = uploadedFile.response.url;
      } 
      // Step 2: Check uploadURL if it's absolute
      else if (uploadedFile.uploadURL && uploadedFile.uploadURL.includes('://')) {
        console.log("19. ✅ FOUND absolute uploadURL, using it:", uploadedFile.uploadURL);
        imageURL = uploadedFile.uploadURL;
      }
      // Step 3: Parse response body
      else if (uploadedFile.response && uploadedFile.response.body) {
        try {
          console.log("20. Attempting to parse response.body");
          console.log("21. response.body exists:", !!uploadedFile.response.body);
          console.log("22. response.body type:", typeof uploadedFile.response.body);
          console.log("23. response.body value:", uploadedFile.response.body);
          
          const response = uploadedFile.response as any;
          const parsedBody = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
          console.log("24. Parsed body result:", JSON.stringify(parsedBody, null, 2));
          
          if (parsedBody.success === false) {
            console.error("Backend reported upload failure:", parsedBody);
            toast({ 
              title: "Error al subir imagen", 
              description: parsedBody.message || "Error en el servidor",
              variant: "destructive"
            });
            return;
          }
          
          // Look for URL in different possible keys
          console.log("25. parsedBody.url:", parsedBody.url);
          console.log("26. parsedBody.uploadURL:", parsedBody.uploadURL);
          console.log("27. parsedBody.Location:", parsedBody.Location);
          console.log("28. parsedBody.location:", parsedBody.location);
          
          imageURL = parsedBody.url || parsedBody.uploadURL || parsedBody.Location || parsedBody.location || null;
          console.log("29. ✅ URL extracted from parsed body:", imageURL);
        } catch (error) {
          console.error("30. ❌ Error parsing response body:", error);
          console.error("31. Raw response body that failed to parse:", uploadedFile.response.body);
        }
      }
      
      console.log("=== FINAL URL DECISION SUMMARY ===");
      console.log("32. Available uploadedFile.response?.url:", uploadedFile.response?.url);
      console.log("33. Available uploadedFile.uploadURL:", uploadedFile.uploadURL);
      console.log("34. 🎯 FINAL imageURL selected:", imageURL);
      console.log("35. Final imageURL type:", typeof imageURL);
      console.log("36. Final imageURL length:", imageURL?.length);
      
      // STEP 4: COMPREHENSIVE URL VALIDATION
      console.log("=== URL VALIDATION PHASE ===");
      console.log("37. imageURL exists:", !!imageURL);
      console.log("38. imageURL is string:", typeof imageURL === 'string');
      console.log("39. imageURL after trim:", imageURL?.trim());
      console.log("40. imageURL is not empty after trim:", imageURL?.trim() !== '');
      
      if (imageURL && typeof imageURL === 'string' && imageURL.trim() !== '') {
        console.log("41. Testing URL format...");
        console.log("42. Contains '://':", imageURL.includes('://'));
        console.log("43. Starts with '/':", imageURL.startsWith('/'));
        
        // Validate that URL has correct format
        if (!imageURL.includes('://') && !imageURL.startsWith('/')) {
          console.error("44. ❌ INVALID URL FORMAT - not absolute or relative:", imageURL);
          console.error("45. Full uploaded file object for debug:", JSON.stringify(uploadedFile, null, 2));
          toast({ 
            title: "Error al subir imagen", 
            description: "Formato de URL inválido: " + imageURL,
            variant: "destructive"
          });
          return;
        }
        
        // Additional URL validation - try to construct URL if absolute
        if (imageURL.includes('://')) {
          try {
            new URL(imageURL);
            console.log("46. ✅ ABSOLUTE URL validation passed - can construct URL object");
          } catch (urlError) {
            console.error("47. ❌ ABSOLUTE URL validation FAILED:", urlError);
            console.error("48. Failed URL:", imageURL);
            toast({ 
              title: "Error al subir imagen", 
              description: "URL absoluta inválida: " + urlError,
              variant: "destructive"
            });
            return;
          }
        }
        
        console.log("49. ✅ ALL URL VALIDATIONS PASSED for:", imageURL);
        
        console.log("=== URL USAGE DECISION ===");
        console.log("50. selectedProduct exists:", !!selectedProduct);
        console.log("51. selectedProduct.id:", selectedProduct?.id);
        
        if (selectedProduct?.id) {
          // Update existing product with validated URL
          console.log("52. 🔄 UPDATING EXISTING PRODUCT with image URL:", imageURL);
          console.log("53. Calling updateProductImageMutation with:", { id: selectedProduct.id, imageURL });
          updateProductImageMutation.mutate({ id: selectedProduct.id, imageURL });
        } else {
          // Store temporarily for new product
          console.log("54. 💾 STORING tempImageUrl for new product:", imageURL);
          console.log("55. Previous tempImageUrl value:", tempImageUrl);
          setTempImageUrl(imageURL);
          console.log("56. ✅ tempImageUrl should now be set to:", imageURL);
          
          // Verify tempImageUrl was set correctly after state update
          setTimeout(() => {
            console.log("57. 🔍 VERIFICATION - tempImageUrl after setState:", tempImageUrl);
          }, 100);
          
          toast({ 
            title: "Imagen subida exitosamente", 
            description: "Se aplicará al guardar el producto. URL: " + imageURL
          });
        }
      } else {
        console.error("=== ❌ NO VALID URL FOUND ERROR ANALYSIS ===");
        console.error("58. imageURL value:", imageURL);
        console.error("59. imageURL type:", typeof imageURL);
        console.error("60. imageURL truthiness:", !!imageURL);
        console.error("61. imageURL === null:", imageURL === null);
        console.error("62. imageURL === undefined:", imageURL === undefined);
        console.error("63. imageURL === '':", imageURL === '');
        console.error("64. Full uploaded file keys:", Object.keys(uploadedFile));
        console.error("65. Full uploaded file object:", JSON.stringify(uploadedFile, null, 2));
        console.error("66. uploadedFile.response:", uploadedFile.response);
        console.error("67. uploadedFile.uploadURL:", uploadedFile.uploadURL);
        
        toast({ 
          title: "Error al subir imagen", 
          description: `No se pudo obtener la URL de la imagen. Tipo: ${typeof imageURL}, Valor: ${imageURL}`,
          variant: "destructive"
        });
      }
    } else {
      console.error("❌ Upload failed or no successful uploads:", result);
      
      let errorMessage = "La subida falló. Intenta nuevamente.";
      
      if (result.failed && result.failed.length > 0) {
        const failedFile = result.failed[0];
        console.error("Failed file details:", failedFile);
        
        if (failedFile.error && typeof failedFile.error === 'string') {
          errorMessage = failedFile.error;
        } else if (failedFile.response) {
          const response = failedFile.response as any;
          console.error("Failed response body:", response.body);
          if (response.body) {
            try {
              const parsedBody = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
              errorMessage = parsedBody.message || parsedBody.error || errorMessage;
            } catch (error) {
              errorMessage = response.body || errorMessage;
            }
          }
        }
      }
      
      toast({ 
        title: "Error al subir imagen", 
        description: errorMessage,
        variant: "destructive"
      });
    }
    
    console.log("=== 🏁 COMPREHENSIVE UPLOAD DIAGNOSTIC END ===");
  };

  const handleCloseProductForm = () => {
    setShowProductForm(false);
    setSelectedProduct(null);
    setTempImageUrl(null);
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
        variant: "destructive"
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
      // For new products: include tempImageUrl if it exists and is valid
      ...(tempImageUrl && !selectedProduct ? { images: [tempImageUrl] } : {}),
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

  const [activeTab, setActiveTab] = useState("overview"); // ✅ ahora dentro del componente

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

  const defaultTab = window.location.hash === '#categories' ? 'categories' : 'products';

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
                  {products.map((product: any) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{product.name}</h3>
                          {product.isFeatured && <Badge>Destacado</Badge>}
                          {!product.isActive && <Badge variant="secondary">Inactivo</Badge>}
                          {product.stock <= product.lowStockThreshold && (
                            <Badge variant="destructive">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Stock Bajo
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{product.shortDescription}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="font-medium">{formatPrice(product.price, product.currency)}</span>
                          <span>Stock: {product.stock}</span>
                          <span>SKU: {product.sku}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowProductForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
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

            {/* Sección de subida de imagen */}
            <div className="space-y-2">
              <Label>Imagen del Producto</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <div className="flex items-center gap-2 justify-center">
                  {/* Preview de imagen */}
                  {(tempImageUrl || selectedProduct?.images?.[0]) && (
                    <img
                      src={tempImageUrl || selectedProduct?.images?.[0]}
                      alt="Producto"
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}

                  <div className="flex-1 text-center">
                    {tempImageUrl || selectedProduct?.images?.[0] ? (
                      <p className="text-sm text-gray-600">
                        {tempImageUrl ? "Imagen seleccionada" : "Imagen actual del producto"}
                      </p>
                    ) : (
                      <>
                        <div className="text-gray-400 mb-2">
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
                        <p className="text-gray-600 mb-2">No hay imagen</p>
                      </>
                    )}

                    {/* ObjectUploader */}
                    <ObjectUploader
                      onGetUploadParameters={handleGetUploadParameters}
                      onComplete={handleUploadComplete}
                      buttonProps={{ type: "button" }}
                      buttonClassName={`${
                        tempImageUrl || selectedProduct?.images?.[0]
                          ? "text-blue-600 hover:text-blue-800 text-sm underline bg-transparent border-none p-0"
                          : "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      }`}
                    >
                      {tempImageUrl || selectedProduct?.images?.[0] ? "Cambiar imagen" : "Subir Imagen"}
                    </ObjectUploader>
                  </div>
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
                      {selectedOrder.status === 'confirmed' ? 'Confirmado' :
                       selectedOrder.status === 'pending' ? 'Pendiente' :
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
                    <SelectItem value="confirmed">Confirmado</SelectItem>
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