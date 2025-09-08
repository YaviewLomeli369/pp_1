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
        getResponseData: (responseText: string, response: any) => {
          console.log("Processing Uppy response:", { responseText, response });

          try {
            let responseData;

            if (typeof responseText === 'string' && responseText.trim() !== '') {
              try {
                responseData = JSON.parse(responseText);
                console.log("Parsed response from text:", responseData);
              } catch (parseError) {
                console.error("Failed to parse response text:", parseError);
                responseData = { success: false, error: "Invalid response format" };
              }
            } else {
              responseData = response;
              console.log("Using response object directly:", responseData);
            }

            // The backend returns the correct URL structure, so we use it directly
            console.log("Final response data for Uppy:", responseData);
            return responseData;
          } catch (error) {
            console.error("Error parsing Uppy response:", error);
            return { success: false, error: "Failed to process response" };
          }
        },
      })
      .on("upload-error", (file: any, error: any, response: any) => {
        console.error("=== ❌ UPPY UPLOAD ERROR EVENT START ===");
        console.error("ERROR-1. File name:", file?.name);
        console.error("ERROR-2. Error object:", error);
        console.error("ERROR-3. Error type:", typeof error);
        console.error("ERROR-4. Response object:", response);
        console.error("ERROR-5. Response type:", typeof response);
        console.error("ERROR-6. Response status:", response?.status);
        console.error("ERROR-7. Response statusText:", response?.statusText);
        console.error("ERROR-8. Response responseText:", response?.responseText);
        console.error("=== 🏁 UPPY UPLOAD ERROR EVENT END ===");
      })
      .on("upload-success", (file: any, response: any) => {
        console.log("=== 🎉 UPPY UPLOAD SUCCESS EVENT START ===");
        console.log("SUCCESS-1. File name:", file?.name);
        console.log("SUCCESS-2. File object keys:", Object.keys(file || {}));
        console.log("SUCCESS-3. Response object:", JSON.stringify(response, null, 2));
        console.log("SUCCESS-4. Response type:", typeof response);
        console.log("SUCCESS-5. Response keys:", Object.keys(response || {}));

        // Process the response and store it in the file object
        if (response && file) {
          try {
            console.log("SUCCESS-6. Processing response for file...");
            console.log("SUCCESS-7. Original file.response:", file.response);
            console.log("SUCCESS-8. Original file.uploadURL:", file.uploadURL);

            // Store the parsed response for later use
            file.response = response;
            console.log("SUCCESS-9. ✅ Stored response in file.response");

            // Set uploadURL to the location from S3 response
            console.log("SUCCESS-10. Checking response.location:", response.location);
            console.log("SUCCESS-11. Checking response.url:", response.url);

            if (response.location) {
              console.log("SUCCESS-12. ✅ Using response.location as uploadURL:", response.location);
              file.uploadURL = response.location;
            } else if (response.url) {
              console.log("SUCCESS-13. ✅ Using response.url as uploadURL:", response.url);
              file.uploadURL = response.url;
            } else {
              console.log("SUCCESS-14. ⚠️ No location or url found in response");
            }

            console.log("SUCCESS-15. 🎯 FINAL file.uploadURL set to:", file.uploadURL);
            console.log("SUCCESS-16. 🎯 FINAL file.response:", JSON.stringify(file.response, null, 2));
          } catch (error) {
            console.error("SUCCESS-17. ❌ Error processing upload success:", error);
          }
        } else {
          console.error("SUCCESS-18. ❌ Missing response or file object");
          console.error("SUCCESS-19. response exists:", !!response);
          console.error("SUCCESS-20. file exists:", !!file);
        }

        console.log("=== 🏁 UPPY UPLOAD SUCCESS EVENT END ===");
      })
      .on("complete", (result: any) => {
        console.log("=== 🏆 UPPY COMPLETE EVENT START ===");
        console.log("COMPLETE-1. Complete result:", JSON.stringify(result, null, 2));
        console.log("COMPLETE-2. Result.successful length:", result.successful?.length);
        console.log("COMPLETE-3. Result.failed length:", result.failed?.length);

        if (result.successful && result.successful.length > 0) {
          const file = result.successful[0];
          console.log("COMPLETE-4. First successful file:", file?.name);
          console.log("COMPLETE-5. File.uploadURL:", file?.uploadURL);
          console.log("COMPLETE-6. File.response:", JSON.stringify(file?.response, null, 2));
          console.log("COMPLETE-7. File.response.url:", file?.response?.url);
          console.log("COMPLETE-8. File.response.location:", file?.response?.location);
        }

        console.log("COMPLETE-9. Calling onComplete callback...");
        onComplete?.(result);
        console.log("COMPLETE-10. Closing modal...");
        setShowModal(false);
        console.log("=== 🏁 UPPY COMPLETE EVENT END ===");
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