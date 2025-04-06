"use client";
import { useRef, useState, useEffect } from "react";

type Props = {
  onAddPhoto: (file: File) => void;
  photoCount: number;
  onComplete: () => void;
};

export default function PhotoCollector({ onAddPhoto, photoCount, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [userName, setUserName] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (photoCount >= 4) {
      onComplete();
    }
  }, [photoCount, onComplete]);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError("Gagal mengakses kamera.");
      console.error("Gagal mengakses kamera:", err);
    }
  };

  const takePhoto = () => {
    setError(null);
    if (!canvasRef.current || !videoRef.current) return;

    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    context.drawImage(videoRef.current, 0, 0, 640, 480);
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${userName ? `${userName}-` : ""}photo-${Date.now()}.png`, {
          type: "image/png",
        });
        onAddPhoto(file);
        setPreviewImage(URL.createObjectURL(file));
        setTimeout(() => {
          setPreviewImage(null); // Hilangkan pratinjau setelah 3 detik
        }, 3000);
      } else {
        setError("Gagal mengambil foto.");
        console.error("Gagal membuat blob gambar.");
      }
    }, "image/png");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      const renamedFile = new File([file], `${userName ? `${userName}-` : ""}${file.name}`, {
        type: file.type,
      });
      onAddPhoto(renamedFile);
      setPreviewImage(URL.createObjectURL(renamedFile));
      setTimeout(() => {
        setPreviewImage(null); // Hilangkan pratinjau setelah 3 detik
      }, 3000);
    } else {
      setError("Tidak ada file yang dipilih.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-gray-600 text-sm">Foto ke-{photoCount + 1} dari 4</p>

      {error && <p className="text-red-500">{error}</p>}

      {previewImage ? (
        <img src={previewImage} width={320} height={240} className="rounded shadow" />
      ) : (
        <video ref={videoRef} width={320} height={240} className="rounded shadow" />
      )}
      <canvas ref={canvasRef} width={640} height={480} className="hidden" />

      <button onClick={startCamera} className="bg-green-600 text-white px-4 py-2 rounded">
         Aktifkan Kamera
      </button>

      <button onClick={takePhoto} className="bg-blue-600 text-white px-4 py-2 rounded">
         Ambil Foto
      </button>

      <label className="text-sm mt-2">atau upload foto:</label>
      <input type="file" accept="image/*" onChange={handleFileUpload} />
    </div>
  );
}