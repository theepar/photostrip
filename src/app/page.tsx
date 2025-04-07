"use client";
import { useState } from "react";
import PhotoCollector from "@/components/PhotoCollector";
import PhotoStripEditor from "@/components/PhotoStripEditor";
import { AnimatePresence, motion } from "framer-motion";

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

      <AnimatePresence mode="wait">
        {!showEditor && (
          <motion.div
            key="collector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PhotoCollector onAddPhoto={handleAddPhoto} onComplete={handleComplete} />
          </motion.div>
        )}

        {showEditor && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PhotoStripEditor initialPhotos={photos} onBack={resetApp} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
