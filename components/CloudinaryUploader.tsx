"use client";

import { useRef, useState } from "react";
import { UploadCloud, Loader2, X } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface Props {
  resourceType?: "image" | "video";
  onUploaded: (url: string, publicId: string) => void;
  previewUrl?: string;
  label?: string;
  // When true, the uploader resets to its empty "اضغط للرفع" state right
  // after a successful upload instead of keeping the just-uploaded image as
  // its own preview - used for gallery-style pickers where the uploaded
  // image is added to a list above and the uploader's job is to stay ready
  // for the next one.
  resetAfterUpload?: boolean;
}

export default function CloudinaryUploader({ resourceType = "image", onUploaded, previewUrl, label, resetAfterUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | undefined>(previewUrl);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setProgress(0);
    try {
      const result = await uploadToCloudinary(file, resourceType, setProgress);
      setPreview(resetAfterUpload ? undefined : result.url);
      if (resetAfterUpload && inputRef.current) inputRef.current.value = "";
      onUploaded(result.url, result.publicId);
    } catch (err: any) {
      setError(err.message || "فشل رفع الملف");
    } finally {
      setProgress(null);
    }
  }

  function clearPreview(e: React.MouseEvent) {
    e.stopPropagation();
    setPreview(undefined);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    onUploaded("", "");
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-bold text-charcoal/70 mb-1">{label}</label>}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gold/40 rounded-xl p-4 text-center cursor-pointer hover:border-gold transition-colors bg-ivory/40"
      >
        {preview ? (
          <div className="relative inline-block">
            <button
              type="button"
              onClick={clearPreview}
              aria-label="إلغاء الصورة"
              className="absolute -top-2 -end-2 z-10 w-7 h-7 rounded-full bg-charcoal text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
            {resourceType === "image" ? (
              <img src={preview} alt="preview" className="mx-auto max-h-40 rounded-lg object-cover" />
            ) : (
              <video src={preview} className="mx-auto max-h-40 rounded-lg" controls />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-charcoal/60">
            <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center">
              <UploadCloud size={26} className="text-goldDark" />
            </div>
            <span className="text-sm font-bold text-goldDark">اضغط هنا لرفع صورة</span>
            <span className="text-xs text-charcoal/40">أو اسحب الملف وأفلته هنا</span>
          </div>
        )}
        {progress !== null && (
          <div className="mt-2 flex items-center justify-center gap-2 text-xs text-goldDark">
            <Loader2 size={14} className="animate-spin" /> جاري الرفع {progress}%
          </div>
        )}
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={resourceType === "image" ? "image/*" : "video/*"}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
