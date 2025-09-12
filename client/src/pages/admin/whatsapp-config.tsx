
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageCircle, Phone, Save } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SiteConfig } from "@shared/schema";

const whatsappConfigSchema = z.object({
  whatsappNumber: z.string().min(1, "El número de WhatsApp es requerido"),
  whatsappMessage: z.string().min(1, "El mensaje de WhatsApp es requerido"),
});

type WhatsAppConfigFormData = z.infer<typeof whatsappConfigSchema>;

export default function AdminWhatsAppConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
  });

  const form = useForm<WhatsAppConfigFormData>({
    resolver: zodResolver(whatsappConfigSchema),
    defaultValues: {
      whatsappNumber: "",
      whatsappMessage: "",
    },
  });

  // Cargar datos existentes cuando se obtiene la configuración
  useEffect(() => {
    if (config?.config && !form.formState.isDirty) {
      const configData = config.config as any;
      const whatsapp = configData?.whatsapp || {};
      
      form.reset({
        whatsappNumber: whatsapp.number || "525512345678",
        whatsappMessage: whatsapp.message || "Hola 👋, estoy interesado en conocer más sobre sus servicios de desarrollo de sitios web. Me gustaría recibir información sobre planes, precios y cómo podemos comenzar. ¡Gracias!",
      });
    }
  }, [config, form]);

  const updateConfigMutation = useMutation({
    mutationFn: async (data: WhatsAppConfigFormData) => {
      // Obtener la configuración actual
      const currentConfig = config?.config as any || {};
      
      // Actualizar solo la sección de WhatsApp sin afectar el resto
      const updatedConfig = {
        ...currentConfig,
        whatsapp: {
          number: data.whatsappNumber,
          message: data.whatsappMessage,
        }
      };

      return apiRequest("/api/config", {
        method: "PUT",
        body: JSON.stringify({ config: updatedConfig }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({
        title: "Configuración actualizada",
        description: "La configuración de WhatsApp ha sido guardada correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al guardar la configuración de WhatsApp.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WhatsAppConfigFormData) => {
    updateConfigMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Configuración de WhatsApp</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración de WhatsApp</h1>
          <p className="text-muted-foreground">
            Configura el número de teléfono y mensaje por defecto para el botón de WhatsApp.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Widget de WhatsApp
            </CardTitle>
            <CardDescription>
              Personaliza el comportamiento del botón de WhatsApp que aparece en todas las páginas del sitio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Número de WhatsApp
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="525512345678" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Introduce el número en formato internacional sin el símbolo "+". 
                        Ejemplo: 525512345678 para México.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsappMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensaje por Defecto</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Hola, estoy interesado en sus servicios..."
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Este mensaje aparecerá automáticamente cuando los usuarios hagan clic en el botón de WhatsApp.
                        Puedes usar emojis y saltos de línea.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={updateConfigMutation.isPending}
                    className="min-w-32"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateConfigMutation.isPending ? "Guardando..." : "Guardar Configuración"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Vista previa */}
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa</CardTitle>
            <CardDescription>
              Así se verá el enlace de WhatsApp con la configuración actual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Número:</strong> {form.watch("whatsappNumber") || "No configurado"}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Mensaje:</strong>
              </p>
              <div className="bg-white p-3 rounded border text-sm">
                {form.watch("whatsappMessage") || "No configurado"}
              </div>
              <div className="mt-4">
                <a
                  href={`https://wa.me/${form.watch("whatsappNumber")}?text=${encodeURIComponent(form.watch("whatsappMessage") || "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Probar enlace
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
