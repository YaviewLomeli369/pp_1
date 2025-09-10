
import React, { useEffect, useRef, useState } from 'react';
import { Uppy } from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
import Dashboard from '@uppy/dashboard';
import { Button } from './ui/button';
import { X, AlertCircle, CheckCircle, Upload } from 'lucide-react';

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
  acceptedFileTypes = ['image/*'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxNumberOfFiles = 10,
  allowMultiple = true,
  note = "Formatos soportados: JPG, PNG, GIF, WEBP. Máximo 10MB por archivo",
  className = "",
}: ObjectUploaderProps) {
  const uppyRef = useRef<Uppy | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'ready' | 'error' | 'uploading' | 'success'>('testing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Detectar entorno y configurar URLs
  const isReplit = window.location.hostname.includes('replit');
  const PROTOCOL = window.location.protocol;
  const HOST = window.location.hostname;
  const PORT = window.location.port;
  
  // En Replit siempre usar HTTPS para evitar mixed content
  const SECURE_PROTOCOL = isReplit ? 'https:' : PROTOCOL;
  const BASE_URL = SECURE_PROTOCOL + '//' + HOST + (PORT && !isReplit ? ':' + PORT : '');

  // Función para probar la conexión
  const testConnection = async (): Promise<boolean> => {
    try {
      console.log('🔍 Testing connection to:', `${BASE_URL}/api/objects/upload`);
      
      const token = localStorage.getItem("token");
      const testResponse = await fetch(`${BASE_URL}/api/objects/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ filename: 'test-connection.jpg' }),
      });

      if (!testResponse.ok) {
        throw new Error(`Test endpoint failed: ${testResponse.status} ${testResponse.statusText}`);
      }

      const testData = await testResponse.json();
      console.log('✅ Connection test successful:', testData);
      
      return true;
    } catch (err) {
      console.error('❌ Connection test failed:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Unknown connection error');
      return false;
    }
  };

  // Limpiar Uppy instance
  const cleanupUppy = () => {
    if (uppyRef.current) {
      try {
        uppyRef.current.cancelAll();
        if (typeof uppyRef.current.close === 'function') {
          uppyRef.current.close();
        }
        uppyRef.current = null;
        console.log('🧹 Uppy instance cleaned up');
      } catch (error) {
        console.warn('Warning cleaning up Uppy:', error);
        uppyRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const initializeUppy = async () => {
      setConnectionStatus('testing');
      setErrorMessage('');
      setUploadProgress(0);
      
      // Limpiar instancia anterior
      cleanupUppy();
      
      // Probar conexión
      const isConnected = await testConnection();
      
      if (!isConnected) {
        setConnectionStatus('error');
        return;
      }

      // Cambiar estado a ready
      setConnectionStatus('ready');
      
      // Esperar a que el DOM esté listo
      let attempts = 0;
      const maxAttempts = 20;
      
      while (attempts < maxAttempts && (!dashboardRef.current || !dashboardRef.current.isConnected)) {
        console.log(`Waiting for dashboard ref... attempt ${attempts + 1}/${maxAttempts}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!dashboardRef.current?.isConnected) {
        console.error('Dashboard ref not available after waiting');
        setConnectionStatus('error');
        setErrorMessage('UI component not ready');
        return;
      }

      console.log('🌐 Environment:', isReplit ? 'Replit' : 'Local/VPS');
      console.log('🌐 Base URL:', BASE_URL);

      try {
        // Crear instancia de Uppy
        const uppy = new Uppy({
          id: `uppy-${Date.now()}`,
          autoProceed: false,
          allowMultipleUploadBatches: true,
          restrictions: {
            maxFileSize,
            maxNumberOfFiles: allowMultiple ? maxNumberOfFiles : 1,
            allowedFileTypes: acceptedFileTypes,
          },
        });

        // Configurar XHRUpload
        uppy.use(XHRUpload, {
          id: 'XHRUpload',
          endpoint: `${BASE_URL}/api/objects/upload`,
          method: 'POST',
          getUploadParameters: async (file) => {
            try {
              console.log('🔄 Getting upload parameters for:', file.name);
              
              const token = localStorage.getItem("token");
              const response = await fetch(`${BASE_URL}/api/objects/upload`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
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
              throw error;
            }
          },
          timeout: 60 * 1000, // 60 segundos
          limit: 2, // Máximo 2 uploads simultáneos
          retryDelays: [0, 1000, 3000], // Reintentos
        });

        // Configurar Dashboard
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
              dropHereOr: 'Arrastra imágenes aquí o %{browse}',
              browse: 'selecciona archivos',
              uploadComplete: '¡Subida completada!',
              uploadFailed: 'Subida fallida',
              retry: 'Reintentar',
              cancel: 'Cancelar',
              remove: 'Eliminar',
              addMore: 'Agregar más',
              importFrom: 'Importar desde',
              dashboardWindowTitle: 'Subir Archivos',
              dashboardTitle: 'Subir Archivos',
              copyLinkToClipboardSuccess: 'Link copiado al portapapeles',
              copyLinkToClipboardFallback: 'Copia el link de abajo',
              done: 'Listo',
              localDisk: 'Disco Local',
              myDevice: 'Mi Dispositivo',
            }
          }
        });

        // Event handlers
        uppy.on('error', (error) => {
          console.error('❌ Uppy general error:', error);
          setConnectionStatus('error');
          setErrorMessage(error.message);
          onUploadError?.(error);
        });

        uppy.on('upload', () => {
          console.log('🚀 Upload started');
          setConnectionStatus('uploading');
          setUploadProgress(0);
        });

        uppy.on('progress', (progress) => {
          setUploadProgress(progress);
          console.log(`📊 Upload progress: ${progress}%`);
        });

        uppy.on('upload-error', (file, error, response) => {
          console.error('❌ Upload error:', {
            file: file?.name,
            error: error.message,
            response
          });
          setConnectionStatus('error');
          setErrorMessage(`Error subiendo ${file?.name}: ${error.message}`);
          onUploadError?.(error);
        });

        uppy.on('upload-success', (file, response) => {
          console.log('✅ Upload successful:', file?.name, response?.status);
        });

        uppy.on('complete', (result) => {
          console.log('🏆 Upload complete:', result);

          if (result.failed && result.failed.length > 0) {
            console.error('❌ Failed uploads:', result.failed);
            setConnectionStatus('error');
            setErrorMessage(`${result.failed.length} archivo(s) fallaron al subir`);
            onUploadError?.(new Error('Some uploads failed'));
            return;
          }

          if (result.successful && result.successful.length > 0) {
            console.log('✅ Successful uploads:', result.successful);
            setConnectionStatus('success');
            
            result.successful.forEach((file) => {
              const serverResponse = file.response?.body || {};
              const imageURL = serverResponse.url || serverResponse.location;
              
              if (imageURL) {
                console.log('📸 Image URL received:', imageURL);
              } else {
                console.warn('⚠️ No URL in server response:', serverResponse);
              }
            });

            // Llamar callback de éxito
            onUploadSuccess(result);

            // Cerrar modal después de un breve delay
            setTimeout(() => {
              setIsOpen(false);
            }, 1500);
          }
        });

        uppyRef.current = uppy;
        console.log('✅ Uppy initialized successfully');

      } catch (error) {
        console.error('❌ Error initializing Uppy:', error);
        setConnectionStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Error initializing uploader');
      }
    };

    initializeUppy();

    return cleanupUppy;
  }, [isOpen, onUploadSuccess, onUploadError, acceptedFileTypes, maxFileSize, maxNumberOfFiles, allowMultiple]);

  const handleClose = () => {
    setIsOpen(false);
    setConnectionStatus('testing');
    setErrorMessage('');
    setUploadProgress(0);
    cleanupUppy();
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />;
      case 'ready':
        return <Upload className="h-5 w-5 text-blue-600" />;
      case 'uploading':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Upload className="h-5 w-5" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'testing':
        return 'Verificando conexión...';
      case 'ready':
        return 'Listo para subir archivos';
      case 'uploading':
        return `Subiendo... ${uploadProgress}%`;
      case 'success':
        return '¡Subida exitosa!';
      case 'error':
        return 'Error de conexión';
      default:
        return 'Subir Archivos';
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={className}
        type="button"
      >
        <Upload className="h-4 w-4 mr-2" />
        Subir Imágenes
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <h3 className="text-lg font-semibold">Subir Imágenes</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">{getStatusText()}</p>
            {uploadProgress > 0 && connectionStatus === 'uploading' && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>

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

          {(connectionStatus === 'ready' || connectionStatus === 'uploading') && (
            <>
              <div 
                ref={dashboardRef} 
                id="uppy-dashboard-container"
                className="min-h-[400px] w-full border border-gray-200 rounded-lg"
              />
              {note && (
                <p className="text-sm text-gray-500 mt-3 text-center">{note}</p>
              )}
            </>
          )}

          {connectionStatus === 'success' && (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-sm text-green-600 mb-2">¡Imágenes subidas exitosamente!</p>
                <p className="text-xs text-gray-500">Cerrando automáticamente...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
