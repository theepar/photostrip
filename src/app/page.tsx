"use client";
import { useState } from "react";
import PhotoCollector from "@/components/PhotoCollector";
import PhotoStripEditor from "@/components/PhotoStripEditor";

export default function Home() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [showEditor, setShowEditor] = useState(false);

  const handleAddPhoto = (file: File) => {
    setPhotos((prev) => [...prev, file]);
  };

  const handleComplete = () => {
    setShowEditor(true);
  };

  const resetApp = () => {
    setPhotos([]);
    setShowEditor(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Photobooth Strip</h1>

      {!showEditor && (
        <PhotoCollector
          onAddPhoto={handleAddPhoto}
          onComplete={handleComplete}
        />
      )}

      {showEditor && (
        <PhotoStripEditor
          initialPhotos={photos}
          onBack={resetApp}
        />
      )}
    </main>
  );
}
