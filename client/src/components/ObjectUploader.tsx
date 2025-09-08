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
        getUploadParameters: async (file: any) => {
          try {
            console.log("Getting upload parameters for file:", file.name);
            const params = await onGetUploadParameters();
            console.log("Upload parameters received:", params);
            
            return {
              ...params,
              headers: {
                'x-filename': file.name,
                'content-type': file.type || 'application/octet-stream',
              },
            };
          } catch (error) {
            console.error("Error getting upload parameters:", error);
            throw error;
          }
        },
        // Override response handling to work with our custom backend
        getResponseData: (response: any, request: any) => {
          console.log("Processing S3 response:", response);
          console.log("Request details:", request);
          
          try {
            // Parse the response data
            const responseData = typeof response.responseText === 'string' ? 
              JSON.parse(response.responseText) : response.responseText;
            
            console.log("Parsed response data:", responseData);
            
            // Return the URL in the format Uppy expects
            return {
              location: responseData.url,
              ...responseData
            };
          } catch (error) {
            console.error("Error parsing response data:", error);
            // Fallback: return the response as-is
            return response;
          }
        },
      })
      .on("upload-error", (file: any, error: any, response: any) => {
        console.error("Upload error:", { file: file?.name, error, response });
      })
      .on("upload-success", (file: any, response: any) => {
        console.log("Upload success - file:", file?.name);
        console.log("Upload success - response:", response);
        
        // Process the response and store it in the file object
        if (response && file) {
          try {
            // Store the parsed response for later use
            file.response = response;
            
            // Set uploadURL to the location from S3 response
            if (response.location) {
              file.uploadURL = response.location;
            } else if (response.url) {
              file.uploadURL = response.url;
            }
            
            console.log("Stored uploadURL:", file.uploadURL);
          } catch (error) {
            console.error("Error processing upload success:", error);
          }
        }
      })
      .on("complete", (result: any) => {
        console.log("Upload complete result:", result);
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