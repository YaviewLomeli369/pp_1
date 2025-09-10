import React, { useEffect, useRef, useState } from 'react';
import Uppy from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
import Dashboard from '@uppy/dashboard';
import { Button } from './ui/button';
import { X } from 'lucide-react';

import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';

interface ObjectUploaderProps {
  onUploadSuccess: (result: { successful: any[], failed: any[] }) => void;
  onUploadError?: (error: any) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  maxNumberOfFiles?: number;
  allowMultiple?: boolean;
  note?: string;
  className?: string;
}

export default function ObjectUploader({
  onUploadSuccess,
  onUploadError,
  acceptedFileTypes = ['image/*', 'video/*', 'application/pdf'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxNumberOfFiles = 10,
  allowMultiple = true,
  note = "Tamaño máximo: 10MB por archivo",
  className = "",
}: ObjectUploaderProps) {
  const uppyRef = useRef<Uppy | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Mocking selectedProduct and updateProductImageMutation for compilation
  // In a real scenario, these would be passed as props or accessed from context/state management
  const selectedProduct = null; // Replace with actual selected product
  const updateProductImageMutation = {
    mutate: (data: { id: string | null, imageURL: string }) => {
      console.log("Mock updateProductImageMutation.mutate called with:", data);
    }
  };
  const toast = ({ title, description, variant }: { title: string, description: string, variant?: string }) => {
    console.log(`Toast: ${title} - ${description} (${variant})`);
  };
  const setTempImageUrl = (url: string) => {
    console.log("Mock setTempImageUrl called with:", url);
  };


  useEffect(() => {
    if (!isOpen || uppyRef.current) return;

    // Detectar protocolo y host dinámicamente
    const protocol = window.location.protocol; // 'http:' o 'https:'
    const host = window.location.host;         // 'www.nyuxo.com' o 'localhost:5000'
    const baseUrl = `${protocol}//${host}`;

    console.log('🌐 Protocol detected:', protocol);
    console.log('🌐 Host detected:', host);
    console.log('🌐 Base URL:', baseUrl);

    // Crear instancia de Uppy
    const uppy = new Uppy({
      autoProceed: false,
      allowMultipleUploadBatches: true,
      restrictions: {
        maxFileSize,
        maxNumberOfFiles: allowMultiple ? maxNumberOfFiles : 1,
        allowedFileTypes: acceptedFileTypes,
      },
      onBeforeUpload: (files) => {
        console.log('📁 Files ready to upload:', Object.keys(files).length);
        return true;
      }
    });

    // Configurar XHRUpload con el nuevo flujo
    uppy.use(XHRUpload, {
      endpoint: `${baseUrl}/api/objects/upload`,
      method: 'POST',
      getUploadParameters: async (file) => {
        try {
          console.log('🔄 Getting upload parameters for:', file.name);
          
          const response = await fetch(`${baseUrl}/api/objects/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ filename: file.name }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          console.log('✅ Upload parameters received:', data);

          return {
            method: 'PUT',
            url: data.uploadURL,
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
            },
          };
        } catch (error) {
          console.error('❌ Error getting upload parameters:', error);
          toast({
            title: "Error",
            description: "Error al obtener parámetros de carga",
            variant: "destructive"
          });
          throw error;
        }
      },
      timeout: 60 * 1000, // 60 segundos timeout
      limit: 3, // Máximo 3 subidas simultáneas
    });

    // Configurar Dashboard
    uppy.use(Dashboard, {
      inline: true,
      target: dashboardRef.current!,
      showProgressDetails: true,
      proudlyDisplayPoweredByUppy: false,
      height: 350,
      showRemoveButtonAfterComplete: true,
      locale: {
        strings: {
          dropHereOr: 'Arrastra archivos aquí o %{browse}',
          browse: 'selecciona',
          uploadComplete: '¡Subida completada!',
          uploadFailed: 'Subida fallida',
          retry: 'Reintentar',
          cancel: 'Cancelar',
          remove: 'Eliminar',
        }
      }
    });

    // Event handlers mejorados
    uppy.on('error', (error) => {
      console.error('❌ UPPY GENERAL ERROR:', error);
      onUploadError?.(error);
    });

    uppy.on('upload-error', (file, error, response) => {
      console.log('=== ❌ UPPY UPLOAD ERROR EVENT START ===');
      console.log('ERROR-1. File name:', file?.name || 'Unknown');
      console.log('ERROR-2. Error object:', error);
      console.log('ERROR-3. Error type:', typeof error);
      console.log('ERROR-4. Response object:', response);
      console.log('ERROR-5. Response type:', typeof response);
      console.log('ERROR-6. Response status:', response?.status);
      console.log('ERROR-7. Response statusText:', response?.statusText);
      console.log('ERROR-8. Response responseText:', response?.body || response?.responseText);
      console.log('=== 🏁 UPPY UPLOAD ERROR EVENT END ===');

      onUploadError?.(error);
    });

    uppy.on('upload-success', (file, response) => {
      console.log('✅ Upload successful:', file?.name, response?.status);
    });

    uppy.on('complete', (result) => {
      console.log('=== 🏆 UPPY COMPLETE EVENT START ===');
      console.log('COMPLETE-1. Complete result:', result);
      console.log('COMPLETE-2. Result.successful length:', result.successful?.length || 0);
      console.log('COMPLETE-3. Result.failed length:', result.failed?.length || 0);

      if (result.failed && result.failed.length > 0) {
        console.log('COMPLETE-4. Failed files:', result.failed);
        result.failed.forEach((file, index) => {
          console.log(`COMPLETE-5.${index}. Failed file:`, file.name, 'Error:', file.error);
        });
      }

      if (result.successful && result.successful.length > 0) {
        console.log('COMPLETE-6. Successful files:', result.successful);
        result.successful.forEach((file) => {
          // Handle successful upload
          console.log("COMPLETE-3. ✅ Upload successful, file data:", file);
          console.log("COMPLETE-3. ✅ Response body:", file.response?.body);

          const serverBody = (file.response?.body as any) || {};
          let imageURL = serverBody.url || serverBody.location;

          if (!imageURL) {
            console.error("❌ No se pudo obtener URL desde la respuesta:", file.response);
            toast({
              title: "Error al subir imagen",
              description: "No se pudo determinar la URL del objeto en el servidor",
              variant: "destructive"
            });
            return;
          }

          // Si es relativa (/objects/...) convertir a absoluta para <img src="">
          let finalURL = imageURL.trim();
          if (finalURL.startsWith("/")) {
            finalURL = `${window.location.origin}${finalURL}`;
          }

          console.log("COMPLETE-4. ✅ Final URL a guardar:", finalURL);

          // Guardar según el caso (producto existente o nuevo)
          if (selectedProduct?.id) {
            updateProductImageMutation.mutate({
              id: selectedProduct.id,
              imageURL: finalURL,
            });
          } else {
            setTempImageUrl(finalURL);
            toast({
              title: "Imagen subida exitosamente",
              description: "Se aplicará al guardar el producto",
            });
          }
        });
      }

      console.log('COMPLETE-9. Calling onComplete callback...');

      // Llamar callback de éxito
      onUploadSuccess(result);

      console.log('COMPLETE-10. Closing modal...');
      setTimeout(() => {
        setIsOpen(false);
      }, 1000);

      console.log('=== 🏁 UPPY COMPLETE EVENT END ===');
    });

    uppyRef.current = uppy;

    return () => {
      if (uppyRef.current) {
        try {
          // Use close() instead of destroy() for newer Uppy versions
          if (typeof uppyRef.current.close === 'function') {
            uppyRef.current.close();
          } else if (typeof uppyRef.current.destroy === 'function') {
            uppyRef.current.destroy();
          }
          uppyRef.current = null;
        } catch (error) {
          console.warn('Error cleaning up Uppy instance:', error);
          uppyRef.current = null;
        }
      }
    };
  }, [isOpen, onUploadSuccess, onUploadError, acceptedFileTypes, maxFileSize, maxNumberOfFiles, allowMultiple]);

  const handleClose = () => {
    setIsOpen(false);
    if (uppyRef.current) {
      try {
        // Use close() instead of destroy() for newer Uppy versions
        if (typeof uppyRef.current.close === 'function') {
          uppyRef.current.close();
        } else if (typeof uppyRef.current.destroy === 'function') {
          uppyRef.current.destroy();
        }
        uppyRef.current = null;
      } catch (error) {
        console.warn('Error cleaning up Uppy instance:', error);
        uppyRef.current = null;
      }
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={className}
        type="button"
      >
        Subir Archivos
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Subir Archivos</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
          <div ref={dashboardRef} />
          {note && (
            <p className="text-sm text-gray-500 mt-2">{note}</p>
          )}
        </div>
      </div>
    </div>
  );
}