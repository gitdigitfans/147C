"use client";

// Signed upload helper for Cloudinary. Gets a signature from our own
// /api/cloudinary/sign server route (which holds the API secret) then
// uploads directly to Cloudinary - no unsigned upload preset required,
// so it works even if no preset has been whitelisted in the console.

const FOLDER = "pharaoh-furniture";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

async function getSignature(): Promise<{ signature: string; timestamp: number; apiKey: string; cloudName: string; folder: string }> {
  const res = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder: FOLDER }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "تعذر توقيع رفع الصورة، تأكد من إعداد CLOUDINARY_API_SECRET");
  }
  return data;
}

export async function uploadToCloudinary(
  file: File,
  resourceType: "image" | "video" = "image",
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
  const { signature, timestamp, apiKey, cloudName, folder } = await getSignature();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
          resolve({ url: data.secure_url as string, publicId: data.public_id as string });
        } else {
          reject(new Error(data.error?.message || "Cloudinary upload failed"));
        }
      } catch (err) {
        reject(err);
      }
    };

    xhr.onerror = () => reject(new Error("Network error during Cloudinary upload"));
    xhr.send(formData);
  });
}
