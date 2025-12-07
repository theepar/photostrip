"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Camera, RefreshCw, Upload, Check, X, Sparkles, Hourglass, Eye, Sun, Moon } from "lucide-react";

type Props = {
  onAddPhoto: (file: File) => void;
  onComplete: () => void;
};

export default function PhotoCollector({ onAddPhoto, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State
  const [photoList, setPhotoList] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [attempt, setAttempt] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [acceptedImage, setAcceptedImage] = useState<File | null>(null);
  const [timer, setTimer] = useState(3);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [autoMode, setAutoMode] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Trigger onComplete
  useEffect(() => {
    if (photoList.length === 4) {
      onComplete();
    }
  }, [photoList, onComplete]);

  // Logic Auto Mode
  useEffect(() => {
    if (autoMode && timer > 0 && attempt <= 4 && !previewImage && !acceptedImage && !showModal) {
      const timeout = setTimeout(() => {
        takePhoto();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [attempt, autoMode, timer, previewImage, acceptedImage, showModal]);

  // Logic Auto Confirm
  useEffect(() => {
    if (showModal && acceptedImage && autoMode) {
      const timeout = setTimeout(() => {
        handleContinue();
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [showModal, acceptedImage, autoMode]);

  // Camera Setup
  useEffect(() => {
    const startCamera = async () => {
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        setError("Gagal membuka portal penglihatan (Kamera Error).");
      }
    };
    startCamera();
  }, [facingMode]);

  // --- Handlers ---
  const takePhoto = () => {
    setError(null);
    if (!canvasRef.current || !videoRef.current) return;

    if (timer > 0) {
      setCountdown(timer);
      let current = timer;
      const interval = setInterval(() => {
        current--;
        setCountdown(current);
        if (current <= 0) {
          clearInterval(interval);
          setCountdown(null);
          triggerCapture();
        }
      }, 1000);
    } else {
      triggerCapture();
    }
  };

  const triggerCapture = () => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);
    setTimeout(() => capturePhoto(), 100);
  };

  const capturePhoto = () => {
    if (!canvasRef.current || !videoRef.current) return;
    const context = canvasRef.current.getContext("2d");
    if (!context) return;
    const { videoWidth, videoHeight } = videoRef.current;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;
    if (facingMode === "user") {
      context.translate(videoWidth, 0);
      context.scale(-1, 1);
    }
    context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.png`, { type: "image/png" });
        const url = URL.createObjectURL(file);
        context.setTransform(1, 0, 0, 1, 0, 0);
        setAcceptedImage(file);
        setPreviewImage(url);
        setShowModal(true);
      }
    }, "image/png");
  };

  const handleContinue = () => {
    if (acceptedImage && attempt <= 4) {
      onAddPhoto(acceptedImage);
      setPhotoList((prev) => [...prev, acceptedImage]);
      setAcceptedImage(null);
      setPreviewImage(null);
      setShowModal(false);
      setAttempt((prev) => prev + 1);
    }
  };

  const handleRetake = () => {
    if (previewImage) URL.revokeObjectURL(previewImage);
    setPreviewImage(null);
    setShowModal(false);
    setAcceptedImage(null);
  };

  // --- THEME CONFIG ---
  const theme = {
    bg: isDarkMode
      ? "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-[#1e172a] to-black"
      : "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-200 via-white to-amber-50",
    textTitle: isDarkMode
      ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500"
      : "text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700",
    textSub: isDarkMode ? "text-indigo-300" : "text-slate-500",
    textBase: isDarkMode ? "text-amber-100" : "text-slate-800",
    runeEmpty: isDarkMode ? "bg-[#0f0a15]" : "bg-white border-slate-300",
    runeActive: isDarkMode ? "bg-indigo-500 border-white" : "bg-sky-400 border-amber-500",
    runeFilled: "bg-amber-400 shadow-[0_0_10px_#fbbf24] scale-110",
    frameBorder: isDarkMode ? "border-amber-700/50 shadow-[0_0_50px_rgba(79,70,229,0.3)]" : "border-amber-300 shadow-[0_0_50px_rgba(251,191,36,0.3)]",
    controlBg: isDarkMode ? "bg-[#15101f] border-indigo-900/50" : "bg-white border-amber-200",
    controlText: isDarkMode ? "text-indigo-400" : "text-slate-500",
    controlActive: isDarkMode ? "bg-indigo-800 text-amber-200 border-indigo-500" : "bg-sky-100 text-sky-700 border-sky-300",
    uploadBtn: isDarkMode ? "text-indigo-300 border-indigo-900/50 hover:bg-[#15101f]" : "text-slate-500 border-slate-200 hover:bg-white hover:border-amber-400",
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col items-center justify-center p-4 font-serif relative overflow-hidden transition-colors duration-500`}>

      {/* Noise Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* Theme Toggle Button (Floating Top Right) */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`absolute top-4 right-4 z-50 p-3 rounded-full shadow-lg border-2 transition-all duration-300 ${isDarkMode ? 'bg-indigo-950 border-amber-500/50 text-amber-300' : 'bg-white border-sky-300 text-sky-500'}`}
      >
        {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* --- Header / Mana Progress --- */}
      <div className="w-full max-w-2xl mb-8 flex justify-between items-end relative z-10">
        <div>
          <h1 className={`text-3xl font-bold tracking-widest ${theme.textTitle} drop-shadow-sm`}>
            MYSTIC BOOTH
          </h1>
          <p className={`${theme.textSub} text-xs italic flex items-center gap-1`}>
            <Sparkles size={12} /> {isDarkMode ? "Capture your aura" : "Reveal your light"}
          </p>
        </div>

        {/* Progress Rune Stones */}
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-3 w-3 rotate-45 border transition-all duration-500 shadow-lg ${photoList.length >= step
                  ? theme.runeFilled
                  : attempt === step
                    ? `${theme.runeActive} animate-pulse`
                    : `${theme.runeEmpty} border`
                }`}
            />
          ))}
        </div>
      </div>

      {/* --- Main Mirror (Camera Frame) --- */}
      <div className={`relative w-full max-w-2xl aspect-[4/3] bg-black rounded-lg overflow-hidden border-4 border-double ${theme.frameBorder} group z-10 transition-all duration-500`}>

        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-500/60 z-20 rounded-tl-lg"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-500/60 z-20 rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-500/60 z-20 rounded-bl-lg"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-500/60 z-20 rounded-br-lg"></div>

        {/* Error Message */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
            <p className="text-red-400 border border-red-900 bg-red-950/50 px-6 py-4 rounded-lg font-bold">{error}</p>
          </div>
        )}

        {/* Video Feed */}
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""} opacity-90`}
          autoPlay
          playsInline
          muted
        />

        {/* Flash Effect */}
        <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-150 z-30 mix-blend-overlay ${isFlashing ? 'opacity-100' : 'opacity-0'}`} />

        {/* Countdown */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
            <span className="text-[10rem] font-serif text-amber-100 drop-shadow-[0_0_30px_rgba(251,191,36,0.8)] animate-bounce">
              {countdown}
            </span>
          </div>
        )}

        {/* Camera Controls Overlay */}
        <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setFacingMode(prev => prev === "user" ? "environment" : "user")} className="p-3 bg-black/50 backdrop-blur-md rounded-full border border-amber-500/30 hover:bg-amber-900/50 text-amber-200 transition">
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* --- Control Altar (Panel) --- */}
      <div className="w-full max-w-2xl mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center z-10">

        {/* Left: Timer Runes */}
        <div className="flex flex-col gap-2 items-center md:items-start order-2 md:order-1">
          <label className={`text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 ${isDarkMode ? "text-amber-500/70" : "text-slate-400"}`}>
            <Hourglass size={12} /> Time Dilation
          </label>
          <div className={`flex rounded-lg p-1 border shadow-inner ${theme.controlBg}`}>
            {[0, 3, 5].map((t) => (
              <button
                key={t}
                onClick={() => setTimer(t)}
                className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${timer === t
                  ? `${theme.controlActive} shadow-md`
                  : `${theme.controlText} hover:bg-black/5`}`}
              >
                {t}s
              </button>
            ))}
          </div>

          <button
            onClick={() => setAutoMode(!autoMode)}
            className={`mt-2 px-4 py-2 text-xs font-bold rounded-lg border transition-all w-full flex items-center justify-center gap-2 ${autoMode
              ? 'bg-amber-500/10 border-amber-500/50 text-amber-600 shadow-sm'
              : `${theme.controlBg} ${theme.controlText}`
              }`}
          >
            <Eye size={14} /> {autoMode ? "AUTO CAST" : "MANUAL CAST"}
          </button>
        </div>

        {/* Center: The Orb (Shutter) */}
        <div className="flex justify-center order-1 md:order-2">
          <button
            onClick={takePhoto}
            disabled={countdown !== null || photoList.length >= 4}
            className={`h-24 w-24 rounded-full border-4 shadow-[0_0_40px_rgba(245,158,11,0.4),inset_0_2px_5px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:grayscale group
             ${isDarkMode ? 'bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 border-[#2e1065]' : 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 border-white'}
            `}
          >
            <Camera size={36} className={`${isDarkMode ? 'text-[#2e1065]' : 'text-white'} group-hover:text-white transition-colors`} />
          </button>
        </div>

        {/* Right: Upload Scroll */}
        <div className="flex justify-center md:justify-end order-3">
          <label className={`cursor-pointer flex items-center gap-2 text-sm px-6 py-3 rounded-lg border transition group ${theme.uploadBtn}`}>
            <Upload size={18} className="group-hover:animate-bounce" />
            <span className="tracking-wide">Summon Image</span>
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setAcceptedImage(file);
                setPreviewImage(URL.createObjectURL(file));
                setShowModal(true);
              }
            }} className="hidden" />
          </label>
        </div>
      </div>

      {/* --- Review Vision (Modal) --- */}
      {showModal && previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">

          <div className={`border-2 p-1 rounded-lg shadow-2xl max-w-sm w-full flex flex-col relative ${isDarkMode ? 'bg-[#1e172a] border-amber-600/40' : 'bg-[#fffbf0] border-amber-300'}`}>

            {/* Corner Ornaments */}
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-amber-500 rotate-45"></div>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500 rotate-45"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-amber-500 rotate-45"></div>
            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber-500 rotate-45"></div>

            <div className="relative aspect-[4/3] w-full overflow-hidden border-b-2 border-indigo-900 bg-black">
              <Image src={previewImage} alt="Preview" fill className="object-cover" />
            </div>

            <div className="p-6 text-center">
              <h3 className={`font-bold text-lg mb-1 tracking-widest uppercase ${theme.textBase}`}>Spirit Captured</h3>
              <p className={`text-xs mb-6 italic ${theme.textSub}`}>Shall we bind this memory?</p>

              {autoMode && <p className="text-xs text-amber-500 mb-4 animate-pulse font-bold">Auto-binding spell active...</p>}

              <div className="grid grid-cols-2 gap-4">
                <button onClick={handleRetake} className="flex items-center justify-center gap-2 py-3 rounded-md border border-red-500/30 text-red-500 hover:bg-red-500/10 font-serif transition uppercase tracking-wider text-sm">
                  <X size={16} /> Dispel
                </button>
                <button onClick={handleContinue} className="flex items-center justify-center gap-2 py-3 rounded-md bg-amber-500 text-white hover:bg-amber-600 font-serif font-bold transition shadow-md uppercase tracking-wider text-sm">
                  <Check size={16} /> Bind
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}