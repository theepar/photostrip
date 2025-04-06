"use client";
import { useRef, useState } from "react";
import stripToImage from "@/lib/stripToImage";

type Props = {
  initialPhotos: File[];
  onBack: () => void;
};

export default function PhotoStripEditor({ initialPhotos, onBack }: Props) {
  const [photos, setPhotos] = useState<File[]>(initialPhotos);
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [saving, setSaving] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDrop = (index: number) => (e: React.DragEvent) => {
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (fromIndex === index) return;

    const updated = [...photos];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(index, 0, moved);
    setPhotos(updated);
  };

  const handleUploadMore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotos([...photos, file]);
  };

  const handleSave = async () => {
    if (!previewRef.current) return;
    setSaving(true);
    const imageUrl = await stripToImage(photos, bgColor);
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "photo-strip.jpg";
    a.click();
    setSaving(false);
  };

  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <h2 className="text-2xl font-semibold">Edit Photo Strip</h2>

      <div className="w-full text-left">
        <label className="block text-sm font-medium mb-1">Warna Background:</label>
        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-16 h-8 border rounded" />
      </div>

      <div ref={previewRef} className="w-[300px] min-h-[900px] bg-white border shadow-md relative p-2 flex flex-col items-center gap-2" style={{ backgroundColor: bgColor }}>
        {photos.map((file, index) => (
          <div key={index} className="relative w-[260px] rounded shadow">
            <img src={URL.createObjectURL(file)} alt={`Photo ${index + 1}`} draggable onDragStart={handleDragStart(index)} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop(index)} className="w-[260px] rounded shadow object-cover" />
            <div className="absolute bottom-2 right-2 text-white text-xs font-bold bg-black bg-opacity-50 p-1 rounded" style={{ pointerEvents: "none" }}>
              diana
            </div>
            <button onClick={() => handleRemovePhoto(index)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full">
              X
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 w-full mt-4">
        <label className="text-sm text-gray-500">Tambah foto lain:</label>
        <input type="file" accept="image/*" onChange={handleUploadMore} />

        <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">
          {saving ? "Menyimpan..." : " Simpan ke Device"}
        </button>

        <button onClick={onBack} className="text-gray-600 text-sm underline mt-2">
           Kembali Ambil Foto
        </button>
      </div>
    </div>
  );
}