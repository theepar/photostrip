"use client";
import { useState } from "react";
import PhotoCollector from "@/components/PhotoCollector";
import PhotoStripEditor from "@/components/PhotoStripEditor";

export default function Home() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [userName, setUserName] = useState<string>("");

  const handleAddPhoto = (file: File) => {
    const updated = [...photos, file];
    setPhotos(updated);
  };

  const resetApp = () => {
    setPhotos([]);
    setShowEditor(false);
  };

  const handleComplete = () => {
    setShowEditor(true);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Photobooth Strip</h1>
      
      {!showEditor && <PhotoCollector onAddPhoto={handleAddPhoto} photoCount={photos.length} onComplete={handleComplete} />}

      {showEditor && <PhotoStripEditor initialPhotos={photos} onBack={resetApp} userName={userName} />}
    </main>
  );
}