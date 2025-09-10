
import React, { useEffect, useRef, useState } from 'react';
import Uppy from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
import Dashboard from '@uppy/dashboard';
import { Button } from './ui/button';
import { X, AlertCircle } from 'lucide-react';

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
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'ready' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Detectar entorno automáticamente
  const isReplit = window.location.hostname.includes('replit');
  const PROTOCOL = window.location.protocol;
  const HOST = window.location.hostname;
  const PORT = window.location.port;
  const BASE_URL = PROTOCOL + '//' + HOST + (PORT ? ':' + PORT : '');

  // Mocking functions for compilation
  const selectedProduct = null;
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

  // Función para probar la conexión antes de subir archivos reales
  const testConnection = async (): Promise<boolean> => {
    try {
      console.log('🔍 Probando conexión con:', `${BASE_URL}/api/objects/upload`);
      
      // Crear archivo dummy para prueba
      const blob = new Blob(['Test upload connection'], { type: 'text/plain' });
      
      // Probar primero el endpoint de generación de parámetros
      const testResponse = await fetch(`${BASE_URL}/api/objects/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ filename: 'test-connection.txt' }),
      });

      if (!testResponse.ok) {
        throw new Error(`Test endpoint failed: ${testResponse.status} ${testResponse.statusText}`);
      }

      const testData = await testResponse.json();
      console.log('✅ Test de endpoint exitoso:', testData);
      
      return true;
    } catch (err) {
      console.error('❌ Test de conexión falló:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Error de conexión desconocido');
      return false;
    }
  };

  // Limpiar Uppy instance
  const cleanupUppy = () => {
    if (uppyRef.current) {
      try {
        uppyRef.current.destroy();
        uppyRef.current = null;
      } catch (error) {
        console.warn('Error cleaning up Uppy instance:', error);
        uppyRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const initializeUppy = async () => {
      setConnectionStatus('testing');
      
      // Limpiar instancia anterior si existe
      cleanupUppy();
      
      // Probar conexión primero
      const isConnected = await testConnection();
      
      if (!isConnected) {
        setConnectionStatus('error');
        return;
      }

      // Verificar que el elemento DOM esté disponible
      if (!dashboardRef.current) {
        console.error('Dashboard ref is not available');
        setConnectionStatus('error');
        setErrorMessage('Error: Dashboard container not found');
        return;
      }

      setConnectionStatus('ready');

      console.log('🌐 Entorno detectado:', isReplit ? 'Replit' : 'VPS/Local');
      console.log('🌐 Protocol:', PROTOCOL);
      console.log('🌐 Host:', HOST);
      console.log('🌐 Base URL:', BASE_URL);

      try {
        // Crear instancia de Uppy
        const uppy = new Uppy({
          id: `uppy-${Date.now()}`, // ID único para evitar conflictos
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

        // Configurar XHRUpload con el flujo mejorado
        uppy.use(XHRUpload, {
          id: 'XHRUpload',
          endpoint: `${BASE_URL}/api/objects/upload`,
          method: 'POST',
          getUploadParameters: async (file) => {
            try {
              console.log('🔄 Getting upload parameters for:', file.name);
              
              const response = await fetch(`${BASE_URL}/api/objects/upload`, {
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
          timeout: 60 * 1000,
          limit: 3,
        });

        // Configurar Dashboard después de un pequeño delay para asegurar que el DOM está listo
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (dashboardRef.current) {
          uppy.use(Dashboard, {
            id: 'Dashboard',
            inline: true,
            target: dashboardRef.current,
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
        }

        // Event handlers mejorados
        uppy.on('error', (error) => {
          console.error('❌ UPPY GENERAL ERROR:', error);
          onUploadError?.(error);
        });

        uppy.on('upload-error', (file, error, response) => {
          console.log('=== ❌ UPPY UPLOAD ERROR EVENT START ===');
          console.log('ERROR-1. File name:', file?.name || 'Unknown');
          console.log('ERROR-2. Error object:', error);
          console.log('ERROR-3. Response object:', response);
          console.log('ERROR-4. Response status:', response?.status);
          console.log('ERROR-5. Response statusText:', response?.statusText);
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
              console.log("COMPLETE-7. ✅ Upload successful, file data:", file);
              console.log("COMPLETE-8. ✅ Response body:", file.response?.body);

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

              // Si es relativa (/objects/...) convertir a absoluta
              let finalURL = imageURL.trim();
              if (finalURL.startsWith("/")) {
                finalURL = `${window.location.origin}${finalURL}`;
              }

              console.log("COMPLETE-9. ✅ Final URL a guardar:", finalURL);

              // Guardar según el caso
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

          // Llamar callback de éxito
          onUploadSuccess(result);

          setTimeout(() => {
            setIsOpen(false);
          }, 1000);

          console.log('=== 🏁 UPPY COMPLETE EVENT END ===');
        });

        uppyRef.current = uppy;
      } catch (error) {
        console.error('❌ Error initializing Uppy:', error);
        setConnectionStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Error desconocido al inicializar uploader');
      }
    };

    initializeUppy();

    return cleanupUppy;
  }, [isOpen, onUploadSuccess, onUploadError, acceptedFileTypes, maxFileSize, maxNumberOfFiles, allowMultiple]);

  const handleClose = () => {
    setIsOpen(false);
    setConnectionStatus('testing');
    setErrorMessage('');
    cleanupUppy();
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
          {connectionStatus === 'testing' && (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Probando conexión...</p>
                <p className="text-xs text-gray-500 mt-1">Entorno: {isReplit ? 'Replit' : 'VPS/Local'}</p>
                <p className="text-xs text-gray-500">URL: {BASE_URL}</p>
              </div>
            </div>
          )}

          {connectionStatus === 'error' && (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-sm text-red-600 mb-2">Error de conexión</p>
                <p className="text-xs text-gray-500 mb-4">{errorMessage}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setConnectionStatus('testing');
                    setIsOpen(false);
                    setTimeout(() => setIsOpen(true), 500);
                  }}
                >
                  Reintentar
                </Button>
              </div>
            </div>
          )}

          {connectionStatus === 'ready' && (
            <>
              <div ref={dashboardRef} />
              {note && (
                <p className="text-sm text-gray-500 mt-2">{note}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
