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
    <main className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-[#1e172a] to-black font-serif text-amber-100 overflow-x-hidden selection:bg-amber-500/30 selection:text-indigo-950">

      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0"></div>

      <div className="relative z-10 w-full min-h-screen flex flex-col">
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
      </div>
    </main>
  );
}