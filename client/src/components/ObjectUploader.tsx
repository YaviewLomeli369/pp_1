import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 * 
 * Features:
 * - Renders as a customizable button that opens a file upload modal
 * - Provides a modal interface for:
 *   - File selection
 *   - File preview
 *   - Upload progress tracking
 *   - Upload status display
 * 
 * The component uses Uppy under the hood to handle all file upload functionality.
 * All file management features are automatically handled by the Uppy dashboard modal.
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed to be uploaded
 *   (default: 1)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onGetUploadParameters - Function to get upload parameters (method and URL).
 *   Typically used to fetch a presigned URL from the backend server for direct-to-S3
 *   uploads.
 * @param props.onComplete - Callback function called when upload is complete. Typically
 *   used to make post-upload API calls to update server state and set object ACL
 *   policies.
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonProps,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
      },
      autoProceed: false,
      debug: true,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: async (file) => {
          try {
            console.log("Getting upload parameters for file:", file.name);
            const params = await onGetUploadParameters();
            console.log("Upload parameters received:", params);
            
            return {
              ...params,
              headers: {
                'x-original-filename': file.name,
                'content-type': file.type || 'application/octet-stream',
              },
            };
          } catch (error) {
            console.error("Error getting upload parameters:", error);
            throw error;
          }
        },
      })
      .on("upload-error", (file, error, response) => {
        console.error("Upload error:", { file: file?.name, error, response });
      })
      .on("upload-success", (file, response) => {
        console.log("Upload success:", { file: file?.name, response });
        
        // Validate and normalize response
        if (response && typeof response === 'object') {
          const responseData = response as any;
          
          // Ensure we have a valid URL
          if (responseData.url) {
            try {
              // Test if URL is valid
              new URL(responseData.url, window.location.origin);
              console.log("Valid URL confirmed:", responseData.url);
            } catch (urlError) {
              console.warn("Invalid URL in response, attempting to fix:", responseData.url);
              // Try to construct a valid URL from relative path
              if (responseData.relativePath) {
                responseData.url = new URL(responseData.relativePath, window.location.origin).href;
              } else if (responseData.objectName) {
                responseData.url = new URL(`/objects/${responseData.objectName}`, window.location.origin).href;
              }
            }
          } else if (responseData.uploadURL) {
            responseData.url = responseData.uploadURL;
          } else if (responseData.relativePath) {
            responseData.url = new URL(responseData.relativePath, window.location.origin).href;
          } else if (responseData.objectName) {
            responseData.url = new URL(`/objects/${responseData.objectName}`, window.location.origin).href;
          }
        }
      })
      .on("complete", (result) => {
        console.log("Upload complete:", result);
        
        // Validate all successful uploads have proper URL format
        if (result.successful) {
          result.successful.forEach(file => {
            if (file.response && typeof file.response === 'object') {
              const response = file.response as any;
              
              // Ensure URL exists and is valid
              if (!response.url) {
                if (response.uploadURL) {
                  response.url = response.uploadURL;
                } else if (response.relativePath) {
                  response.url = new URL(response.relativePath, window.location.origin).href;
                } else if (response.objectName) {
                  response.url = new URL(`/objects/${response.objectName}`, window.location.origin).href;
                } else {
                  console.error("No valid URL found in upload response:", response);
                }
              }
              
              // Final validation
              if (response.url) {
                try {
                  new URL(response.url, window.location.origin);
                  console.log("Final URL validation successful:", response.url);
                } catch (urlError) {
                  console.error("Final URL validation failed:", response.url, urlError);
                  response.url = null; // Clear invalid URL
                }
              }
            }
          });
        }
        
        onComplete?.(result);
        setShowModal(false);
      })
  );

  return (
    <div>
      <Button 
        type="button"
        onClick={() => setShowModal(true)} 
        className={buttonClassName}
        {...buttonProps}
      >
        {children}
      </Button>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
      />
    </div>
  );
}