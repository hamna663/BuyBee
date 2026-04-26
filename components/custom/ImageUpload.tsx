"use client";

import { useState, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CloudUploadIcon, Close } from "@hugeicons/core-free-icons";
import Image from "next/image";

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  multiple?: boolean;
}

export function ImageUpload({ value, onChange, multiple = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadingCount(files.length);
    setError("");
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error(`File ${file.name} is not an image`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large (>5MB)`);
        }

        // Get unique upload auth token for THIS file
        const authRes = await fetch("/api/upload-auth");
        const authData = await authRes.json();

        if (!authData.token) {
          throw new Error(`Failed to get authentication for ${file.name}`);
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", file.name);
        formData.append("folder", "/buybee");
        formData.append("publicKey", authData.publicKey);
        formData.append("signature", authData.signature);
        formData.append("expire", authData.expire);
        formData.append("token", authData.token);

        const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          return uploadData.url;
        } else if (uploadData.error) {
          throw new Error(`${file.name}: ${uploadData.error.message}`);
        }
        throw new Error(`${file.name}: Upload failed`);
      });

      const results = await Promise.allSettled(uploadPromises);
      const uploadedUrls: string[] = [];
      const errors: string[] = [];

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          uploadedUrls.push(result.value);
        } else {
          errors.push(result.reason.message);
        }
      });

      if (errors.length > 0) {
        setError(errors.join(", "));
      }

      if (uploadedUrls.length > 0) {
        if (multiple) {
          onChange?.(value ? `${value},${uploadedUrls.join(",")}` : uploadedUrls.join(","));
        } else {
          onChange?.(uploadedUrls[0]);
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      setUploadingCount(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index?: number) => {
    if (!value) return;
    
    if (multiple && index !== undefined) {
      const images = value.split(",").filter(Boolean);
      images.splice(index, 1);
      onChange?.(images.join(","));
    } else {
      onChange?.("");
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple={multiple}
        className="hidden"
      />

      {value ? (
        <div className="space-y-2">
          {multiple ? (
            <div className="flex flex-wrap gap-2">
              {value.split(",").filter(Boolean).map((url, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={url.trim()}
                    alt={`Upload ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <HugeiconsIcon icon={Close} className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-20 h-20 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
              >
                {uploading ? (
                   <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                ) : (
                  <>
                    <HugeiconsIcon icon={CloudUploadIcon} className="h-6 w-6" />
                    <span className="text-[10px] mt-1 font-bold">Add More</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="relative group inline-block">
              <Image
                src={value}
                alt="Uploaded"
                width={128}
                height={128}
                className="w-32 h-32 object-cover rounded-md border"
              />
              <button
                type="button"
                onClick={() => removeImage()}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <HugeiconsIcon icon={Close} className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              <span className="text-sm mt-2 font-bold">Uploading {uploadingCount} images...</span>
            </>
          ) : (
            <>
              <HugeiconsIcon icon={CloudUploadIcon} className="h-8 w-8" />
              <span className="text-sm mt-2 font-bold">Click to upload image</span>
              <span className="text-xs">Max 5MB, PNG/JPG/GIF</span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs text-destructive font-medium mt-1">{error}</p>}
    </div>
  );
}