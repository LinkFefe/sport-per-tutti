"use client";

import { useState, useEffect, useRef } from "react";

interface ImagePickerProps {
  name: string;
  initial?: string;
  onSelect?: (url: string) => void;
}

export default function ImagePicker({ name, initial, onSelect }: ImagePickerProps) {
  const sampleImages = [
    "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=1",
    "https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=3",
    "https://images.unsplash.com/photo-1496307653780-42ee777d4833?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=4",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=5",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=6",
  ];

  const [selected, setSelected] = useState<string | undefined>(initial);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (onSelect && selected) onSelect(selected);
  }, [selected, onSelect]);

  async function handleFile(file: File) {
    // Convert to data URL
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string | null;
      if (result) setSelected(result);
    };
    reader.readAsDataURL(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) {
      handleFile(f);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f && f.type.startsWith("image/")) {
      handleFile(f);
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={selected ?? ""} />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`text-gray-600 rounded-md p-3 border-dashed border-2 ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-transparent'}`}
        role="region"
        aria-label="Upload immagine"
      >
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Trascina un'immagine qui o scegli dalla galleria</div>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-3 py-1 bg-gray-100 rounded"
            >
              Carica
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} aria-label="Seleziona file immagine" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3">
          {sampleImages.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setSelected(src)}
              className={`relative rounded overflow-hidden border-2 ${selected === src ? 'border-blue-600' : 'border-transparent'} focus:outline-none`}
              title="Seleziona immagine"
            >
              <img src={src} alt="gallery" className="w-full h-20 object-cover" />
              {selected === src && (
                <div className="absolute inset-0 ring-2 ring-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
