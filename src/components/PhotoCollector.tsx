"use client";

import { useRef, useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";

type Props = {
  onAddPhoto: (file: File) => void;
  onComplete: () => void;
};

export default function PhotoCollector({ onAddPhoto, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [attempt, setAttempt] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [acceptedImage, setAcceptedImage] = useState<File | null>(null);
  const [timer, setTimer] = useState(0); // detik timer
  const [countdown, setCountdown] = useState<number | null>(null);
  const [autoMode, setAutoMode] = useState(false);

  useEffect(() => {
    if (attempt > 4) onComplete();
  }, [attempt, onComplete]);

  useEffect(() => {
    if (showModal && acceptedImage) {
      const timeout = setTimeout(() => {
        if (showModal) {
          handleContinue(); // lanjut otomatis
        }
      }, 5000); // 5 detik preview

      return () => clearTimeout(timeout);
    }
  }, [showModal, acceptedImage]);

  useEffect(() => {
    const startCamera = async () => {
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        const e = err as Error;
        setError("Gagal mengakses kamera: " + e.message);
        console.error("Gagal mengakses kamera:", err);
      }
    };

    startCamera();
  }, [facingMode]);

  const takePhoto = () => {
    setError(null);
    if (!canvasRef.current || !videoRef.current) return;

    if (timer > 0) {
      let current = timer;
      setCountdown(current);

      const interval = setInterval(() => {
        current--;
        if (current <= 0) {
          clearInterval(interval);
          setCountdown(null);
          capturePhoto(); // ini fungsi jepret asli
        } else {
          setCountdown(current);
        }
      }, 1000);
    } else {
      capturePhoto();
    }
  };

  const capturePhoto = () => {
    const context = canvasRef.current!.getContext("2d");
    if (!context) return;

    context.setTransform(1, 0, 0, 1, 0, 0); // Reset transform

    context.drawImage(videoRef.current!, 0, 0, 640, 480);

    canvasRef.current!.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.png`, {
          type: "image/png",
        });
        const url = URL.createObjectURL(file);
        setAcceptedImage(file);
        setPreviewImage(url);

        if (autoMode) {
          // Tampilkan preview selama 2 detik lalu lanjut
          setShowModal(true);
          setTimeout(() => {
            handleContinue();
          }, 2000);
        } else {
          setShowModal(true);
        }
      } else {
        setError("Gagal mengambil foto.");
      }
    }, "image/png");
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
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
    setShowModal(false);
    setAcceptedImage(null);
  };

  const handleContinue = () => {
    if (acceptedImage && attempt <= 4) {
      onAddPhoto(acceptedImage);
      setAcceptedImage(null);
      setPreviewImage(null);
      setShowModal(false);

      if (attempt === 4) {
        onComplete();
      } else {
        setAttempt((prev) => prev + 1);
        if (autoMode && timer > 0) {
          setTimeout(() => {
            takePhoto(); // take next photo
          }, 2000); // tunggu 2 detik preview dulu
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 relative">
      <p className="text-gray-600 text-sm">Foto ke {attempt} dari 4</p>

      {error && <p className="text-red-500">{error}</p>}

      <div className="relative">
        <video
          ref={videoRef}
          width={320}
          height={240}
          className={`rounded shadow ${
            facingMode === "user" ? "scale-x-[-1]" : ""
          }`}
        />

        {countdown !== null && (
          <p className="text-4xl font-bold text-red-600 animate-pulse">
            {countdown}
          </p>
        )}

        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={toggleCamera}
            className="bg-gray-600 text-white px-2 py-1 rounded"
          >
            {facingMode === "user" ? "Belakang" : "Depan"}
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} width={640} height={480} className="hidden" />

      <div className="flex items-center gap-2">
        <label className="text-sm">Timer:</label>
        <select
          value={timer}
          onChange={(e) => setTimer(Number(e.target.value))}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value={0}>Tanpa Timer</option>
          <option value={3}>3 detik</option>
          <option value={5}>5 detik</option>
          <option value={10}>10 detik</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm">Auto Mode:</label>
        <input
          type="checkbox"
          checked={autoMode}
          onChange={(e) => setAutoMode(e.target.checked)}
        />
      </div>

      <button
        onClick={takePhoto}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Ambil Foto
      </button>

      <label className="text-sm mt-2">atau upload foto:</label>
      <input
        type="file"
        accept="image/*"
        capture={facingMode}
        onChange={handleFileUpload}
      />

      {showModal && previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-md">
            <Image
              src={previewImage}
              alt="Preview"
              width={320}
              height={240}
              className="rounded shadow"
            />
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={handleRetake}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Ulangi
              </button>
              <button
                onClick={handleContinue}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Lanjut
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
