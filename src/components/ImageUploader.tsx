"use client";

import { useRef, useState } from "react";

type UploaderProps = {
  onUploaded: (urls: string[]) => void;
};

type UploadState = { name: string; status: "uploading" | "done" | "error"; url?: string };

export default function ImageUploader({ onUploaded }: UploaderProps) {
  const [items, setItems] = useState<UploadState[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    const fileArray = Array.from(files);
    setItems((prev) => [...prev, ...fileArray.map((f) => ({ name: f.name, status: "uploading" as const }))]);

    // One signature covers the whole batch — same folder, same timestamp.
    const signRes = await fetch("/api/uploads/sign", { method: "POST" });
    if (!signRes.ok) {
      setItems((prev) => prev.map((it) => (fileArray.some((f) => f.name === it.name) ? { ...it, status: "error" } : it)));
      return;
    }
    const { timestamp, signature, folder, apiKey, cloudName } = await signRes.json();

    const uploadedUrls: string[] = [];

    for (const file of fileArray) {
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", apiKey);
      form.append("timestamp", String(timestamp));
      form.append("signature", signature);
      form.append("folder", folder);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: form
        });
        const data = await res.json();
        if (res.ok && data.secure_url) {
          uploadedUrls.push(data.secure_url);
          setItems((prev) =>
            prev.map((it) => (it.name === file.name ? { ...it, status: "done", url: data.secure_url } : it))
          );
        } else {
          setItems((prev) => prev.map((it) => (it.name === file.name ? { ...it, status: "error" } : it)));
        }
      } catch {
        setItems((prev) => prev.map((it) => (it.name === file.name ? { ...it, status: "error" } : it)));
      }
    }

    if (uploadedUrls.length > 0) onUploaded(uploadedUrls);
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        className="cursor-pointer border-2 border-dashed border-ink p-6 text-center text-sm text-mute hover:border-clay hover:text-clay"
      >
        Drag photos here, or click to choose files
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-mute">
          {items.map((it) => (
            <li key={it.name} className="flex items-center gap-2">
              <span
                className={
                  it.status === "done"
                    ? "text-green-600"
                    : it.status === "error"
                      ? "text-red-600"
                      : "text-mute/60"
                }
              >
                {it.status === "done" ? "✓" : it.status === "error" ? "✕" : "…"}
              </span>
              {it.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}