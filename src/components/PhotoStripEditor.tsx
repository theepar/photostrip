"use client";
import { useRef, useState } from "react";
import stripToImage from "@/lib/stripToImage";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  initialPhotos: File[];
  onBack: () => void;
};

export default function PhotoStripEditor({ initialPhotos, onBack }: Props) {
  const [photos, setPhotos] = useState<File[]>(initialPhotos);
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [saving, setSaving] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [frameSize] = useState({ width: 260, height: 195 }); // 4:3
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(
    null
  );
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [name, setName] = useState("");

  const handleUploadMore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotos([...photos, file]);
  };

  const handleSave = async () => {
    if (!previewRef.current) return;
    setSaving(true);
    const imageUrl = await stripToImage(photos, bgColor, name);
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "photo-strip.jpg";
    a.click();
    setSaving(false);
    setShowSavedModal(true);
    setTimeout(() => setShowSavedModal(false), 2000);
  };

  const handleRemovePhoto = (index: number) => {
    setShowConfirmDelete(index);
  };

  const confirmDelete = () => {
    if (showConfirmDelete !== null) {
      const updatedPhotos = photos.filter((_, i) => i !== showConfirmDelete);
      setPhotos(updatedPhotos);
      setShowConfirmDelete(null);
    }
  };

  const handleDownloadPhoto = (file: File, index: number) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = `photo-${index + 1}.jpg`;
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-4 w-full max-w-md"
    >
      <h2 className="text-2xl font-semibold">Edit Photo Strip</h2>

      <div className="w-full text-left">
        <label className="block text-sm font-medium mb-1">
          Warna Background:
        </label>
        <input
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          className="w-16 h-8 border rounded"
        />
      </div>

      <div className="w-full text-left">
        <label className="block text-sm font-medium mb-1">Nama di Strip:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-2 py-1"
          placeholder="Contoh: Budi & Sarah"
        />
      </div>

      <div
        ref={previewRef}
        className="w-[300px] min-h-[900px] bg-white border shadow-md relative p-2 flex flex-col items-center gap-2"
        style={{ backgroundColor: bgColor }}
      >
        {photos.map((file, index) => {
          const imgUrl = URL.createObjectURL(file);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative w-[260px] rounded shadow"
            >
              <div
                className="relative overflow-hidden"
                style={{ width: frameSize.width, height: frameSize.height }}
              >
                <Image
                  src={imgUrl}
                  alt={`Photo ${index + 1}`}
                  width={frameSize.width}
                  height={frameSize.height}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-2 left-2 flex gap-2">
                <button
                  onClick={() => handleDownloadPhoto(file, index)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Unduh
                </button>
                <button
                  onClick={() => handleRemovePhoto(index)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  X
                </button>
              </div>
            </motion.div>
          );
        })}
        <div className="text-center text-lg font-bold mt-4 text-black">
  {name}
</div>

      </div>

      <div className="flex flex-col gap-2 w-full mt-4">
        <label className="text-sm text-gray-500">Tambah foto lain:</label>
        <input type="file" accept="image/*" onChange={handleUploadMore} />

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {saving ? "Menyimpan..." : " Simpan ke Device"}
        </button>

        <button
          onClick={onBack}
          className="text-gray-600 text-sm underline mt-2"
        >
          Kembali Ambil Foto
        </button>
      </div>

      <AnimatePresence>
        {showConfirmDelete !== null && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-4 rounded shadow w-72 text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <p className="mb-4">Hapus foto ini?</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={confirmDelete}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Hapus
                </button>
                <button
                  onClick={() => setShowConfirmDelete(null)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSavedModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white px-6 py-4 rounded shadow text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <p className="text-green-600 font-medium">
                Foto berhasil disimpan!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
