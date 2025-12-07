"use client";

import { useRef, useState } from "react";
import stripToImage from "@/lib/stripToImage";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Download, ArrowLeft, Trash2, Palette, Type, Smile,
  Heart, Star, Zap, Crown, Ghost, Sun, Moon, Upload, Sparkles, Scroll,
  Pipette, RefreshCw
} from "lucide-react";

type Props = {
  initialPhotos: File[];
  onBack: () => void;
};

// --- CONFIG ---
const STICKER_PACK = [
  { id: 'star', icon: Star, color: "#fbbf24", fill: "#fbbf24" },
  { id: 'crown', icon: Crown, color: "#f59e0b", fill: "#f59e0b" },
  { id: 'heart', icon: Heart, color: "#db2777", fill: "#db2777" },
  { id: 'zap', icon: Zap, color: "#22d3ee", fill: "#22d3ee" },
  { id: 'ghost', icon: Ghost, color: "#e2e8f0", fill: "#94a3b8" },
  { id: 'sun', icon: Sun, color: "#f97316", fill: "#f97316" },
  { id: 'moon', icon: Moon, color: "#a855f7", fill: "#a855f7" },
  { id: 'sparkles', icon: Sparkles, color: "#34d399", fill: "#34d399" },
];

const PRESET_COLORS = [
  "#1a1625", // Obsidian
  "#2e1065", // Deep Arcane
  "#0c4a6e", // Deep Sea
  "#78350f", // Leather
  "#fef3c7", // Parchment
  "#ffffff", // Pure Light
  "#000000", // Pure Void
];

type AddedSticker = {
  id: number;
  iconId?: string;
  customUrl?: string;
  x: number;
  y: number;
};

export default function PhotoStripEditor({ initialPhotos, onBack }: Props) {
  const [photos] = useState<File[]>(initialPhotos);

  // State Editor
  const [bgColor, setBgColor] = useState<string>("#1a1625");
  const [textColor, setTextColor] = useState<string>("#fbbf24");
  const [name, setName] = useState("");
  const [stickers, setStickers] = useState<AddedSticker[]>([]);
  const [activeTab, setActiveTab] = useState<'color' | 'sticker'>('color');

  // State UI Theme (Dark/Light Mode)
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [saving, setSaving] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // --- Logic Warna Kontras ---
  // Fungsi sederhana menentukan text color berdasarkan brightness background
  const getContrastColor = (hexColor: string) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    // Hitung luminance
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    // Jika gelap kembalikan Emas, jika terang kembalikan Ungu Gelap
    return (yiq >= 128) ? '#2e1065' : '#fbbf24';
  };

  const handleColorChange = (c: string) => {
    setBgColor(c);
    setTextColor(getContrastColor(c));
  }

  // --- Logic Stickers ---
  const addIconSticker = (iconId: string) => {
    setStickers([...stickers, {
      id: Date.now(),
      iconId: iconId,
      x: Math.random() * 20 - 10,
      y: Math.random() * 20 - 10
    }]);
  };

  const handleCustomStickerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/png")) {
      const imageUrl = URL.createObjectURL(file);
      setStickers([...stickers, { id: Date.now(), customUrl: imageUrl, x: 0, y: 0 }]);
    } else {
      alert("Mohon upload file PNG (transparan lebih bagus!)");
    }
  };

  const removeSticker = (id: number) => {
    setStickers(stickers.filter(s => s.id !== id));
  };

  // --- Logic Save ---
  const handleSave = async () => {
    if (!previewRef.current) return;
    setSaving(true);
    try {
      const imageUrl = await stripToImage(previewRef.current);
      const a = document.createElement("a");
      a.href = imageUrl;
      a.download = `mystic-strip-${Date.now()}.jpg`;
      a.click();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  // --- THEME VARIABLES ---
  const theme = {
    bg: isDarkMode
      ? "bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-900 via-indigo-950 to-slate-950"
      : "bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-sky-100 via-white to-amber-50",
    panelBg: isDarkMode ? "bg-[#1e172a]" : "bg-[#fffbf0]",
    textPrimary: isDarkMode ? "text-amber-100" : "text-slate-800",
    textSecondary: isDarkMode ? "text-indigo-400" : "text-slate-500",
    border: isDarkMode ? "border-amber-600/50" : "border-amber-400/50",
    inputBg: isDarkMode ? "bg-[#15101f]" : "bg-white",
    tabActive: isDarkMode ? "text-amber-200 bg-[#1e172a]" : "text-amber-600 bg-[#fffbf0]",
    tabInactive: isDarkMode ? "text-indigo-400 hover:bg-[#1a1525]" : "text-slate-400 hover:bg-slate-100",
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.textPrimary} flex flex-col md:flex-row font-serif overflow-hidden relative transition-colors duration-500`}>

      {/* Noise Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* --- LEFT: PREVIEW AREA --- */}
      <div className="flex-1 relative flex items-center justify-center p-4 md:p-8 overflow-y-auto z-10">

        {/* Mobile Back Button */}
        <button onClick={onBack} className="md:hidden absolute top-4 left-4 z-20 bg-black/20 backdrop-blur p-2 rounded-full border border-white/20">
          <ArrowLeft size={20} />
        </button>

        {/* Theme Toggle Button (Floating) */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`absolute top-4 right-4 z-20 p-3 rounded-full shadow-lg border-2 transition-all duration-300 ${isDarkMode ? 'bg-indigo-950 border-amber-500/50 text-amber-300' : 'bg-white border-sky-300 text-sky-500'}`}
        >
          {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className="relative py-10 min-h-full flex items-center justify-center">

          {/* --- THE SCROLL (CANVAS) --- */}
          <motion.div
            ref={previewRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative flex flex-col items-center gap-4 p-5 transition-colors duration-300 shadow-[0_0_50px_rgba(0,0,0,0.3)] border-[3px] border-amber-500/50 outline outline-[3px] outline-black/10 rounded-lg"
            style={{
              backgroundColor: bgColor,
              width: '300px',
              minHeight: '800px',
              backgroundImage: 'linear-gradient(rgba(100,100,100,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(100,100,100,0.05) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          >
            {/* Photos */}
            {photos.map((file, index) => (
              <div key={index} className="relative w-full aspect-[4/3] bg-zinc-900 overflow-hidden rounded-sm border-2 border-amber-300/40 shadow-sm">
                <Image src={URL.createObjectURL(file)} alt="pic" fill className="object-cover" />
                <div className="absolute inset-0 ring-inset ring-4 ring-black/20 pointer-events-none"></div>
              </div>
            ))}

            {/* Footer Text */}
            <div className="mt-4 text-center w-full z-10">
              <p className="font-bold text-2xl uppercase tracking-[0.2em] drop-shadow-md font-serif break-words px-2" style={{ color: textColor }}>
                {name || "MYSTIC BOOTH"}
              </p>
              <div className="flex items-center justify-center gap-2 mt-1 opacity-70" style={{ color: textColor }}>
                <span className="h-[1px] w-4 bg-current inline-block"></span>
                <p className="text-xs italic">{new Date().toLocaleDateString()}</p>
                <span className="h-[1px] w-4 bg-current inline-block"></span>
              </div>
            </div>

            {/* Draggable Stickers Overlay */}
            {stickers.map((s) => (
              <DraggableSticker key={s.id} id={s.id} onDelete={removeSticker}>
                {s.iconId && (() => {
                  const config = STICKER_PACK.find(p => p.id === s.iconId);
                  const Icon = config?.icon || Star;
                  return (
                    <div className="relative drop-shadow-md filter">
                      <Icon size={52} color="#fff" strokeWidth={5} className="absolute top-0 left-0 blur-[1px] opacity-70" />
                      <Icon size={52} color={config?.color} fill={config?.fill} strokeWidth={2} className="relative z-10" />
                    </div>
                  );
                })()}
                {s.customUrl && (
                  <div className="relative w-20 h-20 drop-shadow-md filter hover:brightness-110">
                    <Image src={s.customUrl} alt="sticker" fill className="object-contain" />
                  </div>
                )}
              </DraggableSticker>
            ))}
          </motion.div>
        </div>
      </div>

      {/* --- RIGHT: CONTROL PANEL --- */}
      <div className={`w-full md:w-[420px] ${theme.panelBg} border-l-4 ${theme.border} flex flex-col z-30 shadow-2xl relative transition-colors duration-500`}>

        {/* Header Tabs */}
        <div className={`flex pt-1 ${isDarkMode ? 'bg-[#15101f]' : 'bg-amber-100/50'}`}>
          <button
            onClick={() => setActiveTab('color')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 tracking-widest transition-all relative rounded-t-lg mx-1 ${activeTab === 'color' ? theme.tabActive + ' border-t-2 border-x-2 border-amber-500/30' : theme.tabInactive}`}
          >
            <Scroll size={18} /> SPELL
          </button>
          <button
            onClick={() => setActiveTab('sticker')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 tracking-widest transition-all relative rounded-t-lg mx-1 ${activeTab === 'sticker' ? theme.tabActive + ' border-t-2 border-x-2 border-amber-500/30' : theme.tabInactive}`}
          >
            <Sparkles size={18} /> ARTIFACTS
          </button>
        </div>

        {/* Panel Content */}
        <div className={`p-6 flex-1 overflow-y-auto ${theme.panelBg}`}>

          {/* TAB 1: COLORS */}
          {activeTab === 'color' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">

              {/* Color Picker */}
              <div>
                <FancyLabel icon={<Palette size={16} />} text="Scroll Material" isDark={isDarkMode} />
                <div className="flex flex-wrap gap-3">
                  {/* Preset Colors */}
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => handleColorChange(c)}
                      className={`w-10 h-10 rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${bgColor === c ? 'border-amber-500 scale-110 ring-2 ring-amber-500/30' : 'border-gray-500/30'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}

                  {/* CUSTOM COLOR PICKER (Fitur Baru) */}
                  <div className="relative group">
                    <label className={`w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-amber-500 transition-colors ${isDarkMode ? 'border-gray-600 bg-white/5' : 'border-gray-400 bg-black/5'}`}>
                      <Pipette size={16} className={theme.textSecondary} />
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </label>
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Custom Color
                    </span>
                  </div>
                </div>
              </div>

              {/* Text Input */}
              <div>
                <FancyLabel icon={<Type size={16} />} text="Inscription" isDark={isDarkMode} />
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your spell..."
                    maxLength={25}
                    className={`w-full ${theme.inputBg} border-2 ${isDarkMode ? 'border-indigo-800' : 'border-amber-200'} rounded-lg px-4 py-4 ${theme.textPrimary} placeholder-gray-500 focus:border-amber-500 outline-none font-serif text-lg transition-all shadow-inner`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STICKERS */}
          {activeTab === 'sticker' && (
            <div className="animate-in slide-in-from-right-4 duration-500 space-y-8">

              {/* Upload Custom */}
              <div>
                <FancyLabel icon={<Upload size={16} />} text="Summon Image" isDark={isDarkMode} />
                <label className={`cursor-pointer group relative flex items-center justify-center gap-3 w-full py-4 border-2 border-dashed rounded-lg transition-all overflow-hidden ${isDarkMode ? 'bg-[#15101f] border-indigo-800 hover:border-amber-500' : 'bg-white border-amber-200 hover:border-amber-500'}`}>
                  <div className="absolute inset-0 bg-amber-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <Upload size={20} className="text-amber-500 relative z-10" />
                  <span className={`text-xs font-bold tracking-wider relative z-10 ${theme.textSecondary}`}>UPLOAD PNG</span>
                  <input type="file" accept="image/png" onChange={handleCustomStickerUpload} className="hidden" />
                </label>
              </div>

              {/* Sticker Grid */}
              <div>
                <FancyLabel icon={<Smile size={16} />} text="Sigils" isDark={isDarkMode} />
                <div className="grid grid-cols-4 gap-3">
                  {STICKER_PACK.map((sticker) => {
                    const Icon = sticker.icon;
                    return (
                      <button
                        key={sticker.id}
                        onClick={() => addIconSticker(sticker.id)}
                        className={`aspect-square rounded-lg flex items-center justify-center border hover:scale-105 transition active:scale-95 shadow-sm group ${isDarkMode ? 'bg-[#15101f] border-indigo-900' : 'bg-white border-amber-100'}`}
                      >
                        <Icon size={28} color={sticker.color} fill={sticker.fill} className="group-hover:animate-pulse" />
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-6 border-t-2 ${isDarkMode ? 'border-amber-600/30 bg-[#1a1525]' : 'border-amber-200 bg-amber-50'} relative z-20 flex flex-col gap-3`}>

          {/* Main Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 border-b-4 border-amber-800 rounded-xl font-bold text-[#1e172a] text-lg tracking-widest flex items-center justify-center gap-2 shadow-lg active:border-b-0 active:translate-y-[4px] transition-all disabled:opacity-50"
          >
            {saving ? <span className="animate-pulse">CASTING...</span> : <><Download size={20} /> SAVE RITUAL</>}
          </button>

          {/* Secondary Finish Button (Back to Camera) */}
          <button
            onClick={onBack}
            className={`w-full py-3 rounded-xl font-bold tracking-widest flex items-center justify-center gap-2 transition-all border-2 ${isDarkMode
                ? 'border-indigo-800 text-indigo-300 hover:bg-indigo-900/30'
                : 'border-amber-200 text-amber-700 hover:bg-amber-100'
              }`}
          >
            <RefreshCw size={16} /> NEW SPELL (SELESAI)
          </button>

        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

const FancyLabel = ({ icon, text, isDark }: { icon: React.ReactNode, text: string, isDark: boolean }) => (
  <h3 className={`text-xs font-bold mb-3 flex items-center gap-2 tracking-widest uppercase border-b pb-2 ${isDark ? 'text-amber-400 border-amber-800/50' : 'text-amber-600 border-amber-200'}`}>
    <span>{icon}</span> {text}
  </h3>
);

const DraggableSticker = ({ children, id, onDelete }: { children: React.ReactNode, id: number, onDelete: (id: number) => void }) => (
  <motion.div
    drag
    dragMomentum={false}
    whileHover={{ scale: 1.1, cursor: "grab" }}
    whileDrag={{ scale: 1.1, cursor: "grabbing", zIndex: 50 }}
    className="absolute top-[30%] left-[40%] z-20 group"
  >
    <button
      onPointerDown={(e) => { e.stopPropagation(); onDelete(id); }}
      className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all z-30 shadow-md hover:scale-110"
    >
      <Trash2 size={12} />
    </button>
    {children}
  </motion.div>
);