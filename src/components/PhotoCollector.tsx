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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [attempt, setAttempt] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [acceptedImage, setAcceptedImage] = useState<File | null>(null);

  useEffect(() => {
    if (attempt > 4) {
      onComplete();
    }
  }, [attempt, onComplete]);

  useEffect(() => {
    startCamera();
  }, [facingMode]);

  const startCamera = async () => {
    setError(null);
    try {
      const constraints = {
        video: { facingMode: facingMode },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      setError("Gagal mengakses kamera: " + err.message);
      console.error("Gagal mengakses kamera:", err);
    }
  };

  const takePhoto = () => {
    setError(null);
    if (!canvasRef.current || !videoRef.current) return;

    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    if (facingMode === "user") {
      context.translate(640, 0);
      context.scale(-1, 1);
    }

    context.drawImage(videoRef.current, 0, 0, 640, 480);

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.png`, {
          type: "image/png",
        });
        setAcceptedImage(file);
        setPreviewImage(URL.createObjectURL(file));
        setShowModal(true);
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
      setAcceptedImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setShowModal(true);
    } else {
      setError("Tidak ada file yang dipilih.");
    }
  };

  const toggleCamera = () => {
    setFacingMode(facingMode === "user" ? "environment" : "user");
  };

  const handleRetake = () => {
    setPreviewImage(null);
    startCamera();
    setShowModal(false);
    setAcceptedImage(null);
  };

  const handleContinue = () => {
    if (acceptedImage && attempt <= 4) {
      onAddPhoto(acceptedImage);
      setAttempt(attempt + 1);
      setAcceptedImage(null);
    }
    setShowModal(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 relative">
      <p className="text-gray-600 text-sm">Foto ke {attempt} dari 4</p>

      {error && <p className="text-red-500">{error}</p>}

      <div className="relative">
        <video ref={videoRef} width={320} height={240} className="rounded shadow" />
        <div className="absolute top-2 right-2 flex gap-2">
          <button onClick={toggleCamera} className="bg-gray-600 text-white px-2 py-1 rounded">
            {facingMode === "user" ? "Belakang" : "Depan"}
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} width={640} height={480} className="hidden" />

      <button onClick={takePhoto} className="bg-blue-600 text-white px-4 py-2 rounded">
        Ambil Foto
      </button>

      <label className="text-sm mt-2">atau upload foto:</label>
      <input type="file" accept="image/*" onChange={handleFileUpload} />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-md">
            <img src={previewImage} width={320} height={240} className="rounded shadow" />
            <div className="flex justify-center gap-4 mt-4">
              <button onClick={handleRetake} className="bg-red-500 text-white px-4 py-2 rounded">
                Ulangi
              </button>
              <button onClick={handleContinue} className="bg-green-600 text-white px-4 py-2 rounded">
                Lanjut
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}