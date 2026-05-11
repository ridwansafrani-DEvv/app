import React, { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

/**
 * Uploads file(s) directly to Cloudinary using a signed signature from the backend.
 * - mode="single": value is a string URL; onChange returns string
 * - mode="multi":  value is string[] (gallery); onChange returns string[]
 */
export default function ImageUploader({ value, onChange, mode = "single", label }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const isMulti = mode === "multi";
  const urls = isMulti ? (Array.isArray(value) ? value : []) : value ? [value] : [];

  const uploadOne = async (file) => {
    const { data: sig } = await api.get("/cloudinary/signature", {
      params: { folder: "ritri/vehicles" },
    });
    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", sig.api_key);
    fd.append("timestamp", sig.timestamp);
    fd.append("signature", sig.signature);
    fd.append("folder", sig.folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
      { method: "POST", body: fd }
    );
    if (!res.ok) throw new Error("Upload gagal");
    const j = await res.json();
    return j.secure_url || j.url;
  };

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const f of files) {
        if (!f.type.startsWith("image/")) {
          toast.error(`${f.name}: bukan file gambar`);
          continue;
        }
        if (f.size > 8 * 1024 * 1024) {
          toast.error(`${f.name}: ukuran > 8MB`);
          continue;
        }
        // eslint-disable-next-line no-await-in-loop
        const url = await uploadOne(f);
        uploaded.push(url);
      }
      if (!uploaded.length) return;
      if (isMulti) onChange([...(urls || []), ...uploaded]);
      else onChange(uploaded[0]);
      toast.success(`${uploaded.length} foto terupload`);
    } catch (e) {
      toast.error(e.message || "Upload gagal");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (idx) => {
    if (isMulti) {
      const next = urls.filter((_, i) => i !== idx);
      onChange(next);
    } else {
      onChange("");
    }
  };

  return (
    <div>
      {label && <div className="text-sm font-medium mb-1.5">{label}</div>}

      {urls.length > 0 && (
        <div className={`grid ${isMulti ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-1"} gap-2 mb-3`}>
          {urls.map((u, i) => (
            <div key={u + i} className="relative group aspect-[4/3] overflow-hidden bg-slate-100 border border-slate-200">
              <img src={u} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid={`uploader-remove-${i}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-navy hover:bg-slate-50 transition-colors px-4 py-6 cursor-pointer text-sm text-slate-600">
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Mengupload...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            {isMulti ? "Upload foto (bisa pilih banyak)" : "Upload foto"}
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={isMulti}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          data-testid="uploader-input"
        />
      </label>
      <div className="text-xs text-slate-400 mt-1.5">JPG/PNG/WebP · max 8MB per foto</div>
    </div>
  );
}
