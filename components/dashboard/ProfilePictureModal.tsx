"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { UserProfile } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { authService } from "@/services/authService";
import { PRESET_AVATARS, PresetAvatar } from "@/lib/presetAvatars";
import { GAMES } from "@/lib/games";
import {
  CameraIcon,
  UploadIcon,
  TrashIcon,
  RotateCwIcon,
  ZoomInIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "@/components/ui/Icons";

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

type TabType = "upload" | "presets";

export default function ProfilePictureModal({
  isOpen,
  onClose,
  user,
}: ProfilePictureModalProps) {
  const { setUserAvatar, refreshProfile } = useAuth();
  const { selectedGame } = useGame();

  const [activeTab, setActiveTab] = useState<TabType>("presets");
  const [gameFilter, setGameFilter] = useState<"valo" | "lol" | "ml" | "codm">("valo");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PresetAvatar | null>(null);

  // Crop & Transform controls
  const [zoom, setZoom] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize selectedGame to our 4 game IDs
  const currentGameId = useMemo<"valo" | "lol" | "ml" | "codm">(() => {
    const raw = (selectedGame || "valo").toLowerCase();
    if (raw.includes("lol") || raw.includes("league")) return "lol";
    if (raw.includes("ml") || raw.includes("mobile")) return "ml";
    if (raw.includes("cod") || raw.includes("call")) return "codm";
    return "valo";
  }, [selectedGame]);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setImagePreviewUrl(user.avatar || null);
      setSelectedPreset(null);
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
      setRotation(0);
      setError(null);
      setSuccessMessage(null);
      setActiveTab("presets");
      setGameFilter(currentGameId);
    }
  }, [isOpen, user.avatar, currentGameId]);

  // Filtered Presets for current active game tab
  const filteredPresets = useMemo(() => {
    return PRESET_AVATARS.filter((p) => p.gameId === gameFilter);
  }, [gameFilter]);

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP, GIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size exceeds 5MB limit. Please choose a smaller image.");
      return;
    }

    setError(null);
    setSelectedPreset(null);
    setSelectedFile(file);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setRotation(0);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please drop a valid image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size exceeds 5MB limit.");
        return;
      }
      setError(null);
      setSelectedPreset(null);
      setSelectedFile(file);
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
      setRotation(0);

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset: PresetAvatar) => {
    setSelectedPreset(preset);
    setSelectedFile(null);
    setImagePreviewUrl(preset.url);
    setError(null);
  };

  // Drag pan handlers for custom image
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selectedFile && !imagePreviewUrl) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - offsetX, y: e.clientY - offsetY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStartRef.current.x);
    setOffsetY(e.clientY - dragStartRef.current.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Generate cropped image Blob via HTML Canvas
  const getCroppedBlob = useCallback(async (): Promise<Blob | null> => {
    if (!imagePreviewUrl) return null;

    return new Promise((resolve) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = imagePreviewUrl;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 512;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.clearRect(0, 0, size, size);

        // Center and apply transforms
        ctx.save();
        ctx.translate(size / 2, size / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);
        ctx.translate(
          (offsetX / 140) * (size / 2),
          (offsetY / 140) * (size / 2)
        );

        // Draw image centered
        const aspect = image.width / image.height;
        let drawW = size;
        let drawH = size;
        if (aspect > 1) {
          drawW = size * aspect;
          drawH = size;
        } else {
          drawW = size;
          drawH = size / aspect;
        }

        ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/png",
          0.95
        );
      };
      image.onerror = () => resolve(null);
    });
  }, [imagePreviewUrl, zoom, offsetX, offsetY, rotation]);

  const handleSave = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (selectedPreset) {
        // Save preset avatar
        const res = await authService.setPresetAvatar(selectedPreset.url);
        setUserAvatar(res.avatar);
        await refreshProfile();
        setSuccessMessage("Profile picture updated!");
        setTimeout(() => {
          onClose();
        }, 600);
      } else if (selectedFile) {
        // Render and crop the customized image
        const blob = await getCroppedBlob();
        const uploadFile = blob || selectedFile;
        const res = await authService.uploadAvatar(uploadFile);
        setUserAvatar(res.avatar);
        await refreshProfile();
        setSuccessMessage("Profile picture updated!");
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setError("Please choose a new photo or select an agent/champion preset.");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update profile picture"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user.avatar) return;
    setError(null);
    setIsLoading(true);
    try {
      await authService.removeAvatar();
      setUserAvatar(null);
      setImagePreviewUrl(null);
      setSelectedFile(null);
      setSelectedPreset(null);
      await refreshProfile();
      setSuccessMessage("Profile picture removed.");
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to remove avatar"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const initial = (user.displayName || "A").charAt(0).toUpperCase();

  const gameTabs: Array<{ id: "valo" | "lol" | "ml" | "codm"; label: string; count: number; color: string }> = [
    { id: "valo", label: "VALORANT", count: PRESET_AVATARS.filter((p) => p.gameId === "valo").length, color: "#E53A4C" },
    { id: "lol", label: "LEAGUE OF LEGENDS", count: PRESET_AVATARS.filter((p) => p.gameId === "lol").length, color: "#00A3FF" },
    { id: "ml", label: "MOBILE LEGENDS", count: PRESET_AVATARS.filter((p) => p.gameId === "ml").length, color: "#F59E0B" },
    { id: "codm", label: "CODM", count: PRESET_AVATARS.filter((p) => p.gameId === "codm").length, color: "#E5B800" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-3xl bg-[#090C16] border border-[#1E293B] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
        }}
      >
        {/* Top Accent Line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, var(--primary-brand) 30%, var(--primary-brand) 70%, transparent 100%)",
            boxShadow: "0 0 12px var(--primary-brand)",
          }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#182338] bg-[#070A12]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-brand/10 border border-primary-brand/30 flex items-center justify-center text-primary-brand">
              <CameraIcon className="w-4 h-4 text-primary-brand" />
            </div>
            <div>
              <h2 className="font-display text-base font-black text-white uppercase tracking-wider">
                Profile Picture Editor
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Choose official game agents, champions, or upload a custom photo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#101626] border border-[#202C45] hover:border-slate-400 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Top Main Mode Switcher: Agent Presets vs Custom Upload */}
        <div className="flex items-center border-b border-[#182338] bg-[#0A0D18] px-6 pt-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("presets");
              setError(null);
            }}
            className={`pb-3 px-4 font-display text-xs font-black uppercase tracking-wider transition-all relative cursor-pointer flex items-center gap-2 ${
              activeTab === "presets"
                ? "text-primary-brand border-b-2 border-primary-brand"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>Game Agents & Champions</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("upload");
              setError(null);
            }}
            className={`pb-3 px-4 font-display text-xs font-black uppercase tracking-wider transition-all relative cursor-pointer flex items-center gap-2 ${
              activeTab === "upload"
                ? "text-primary-brand border-b-2 border-primary-brand"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UploadIcon className="w-3.5 h-3.5" />
            <span>Upload Custom Photo</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Status Alerts */}
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-sans rounded-md flex items-center gap-2">
              <span className="font-bold font-mono uppercase text-[10px] bg-red-900/60 px-1.5 py-0.5 rounded">
                Error
              </span>
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-sans rounded-md flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: GAME AGENTS & CHAMPIONS PRESETS */}
          {activeTab === "presets" && (
            <div className="space-y-4">
              {/* Game Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 border-b border-[#162034] pb-3">
                {gameTabs.map((gt) => {
                  const isActive = gameFilter === gt.id;
                  const isCurrentGame = currentGameId === gt.id;
                  return (
                    <button
                      key={gt.id}
                      type="button"
                      onClick={() => setGameFilter(gt.id)}
                      className={`px-3.5 py-1.5 font-display text-xs font-bold uppercase tracking-wider rounded-lg border transition-all flex items-center gap-2 cursor-pointer ${
                        isActive
                          ? "bg-[#141C2E] text-white border-primary-brand shadow-md"
                          : "bg-[#060812] text-slate-400 border-[#182338] hover:text-white hover:border-slate-500"
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: gt.color }}
                      />
                      <span>{gt.label}</span>
                      {isCurrentGame && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-primary-brand/20 text-primary-brand border border-primary-brand/40 rounded">
                          ACTIVE GAME
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-500">
                        ({gt.count})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Agents / Champions Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                {filteredPresets.map((preset) => {
                  const isSelected =
                    selectedPreset?.id === preset.id ||
                    (!selectedPreset && imagePreviewUrl === preset.url);

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3 bg-[#060812] border transition-all text-left flex flex-col items-center space-y-2 rounded-xl group cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? "border-primary-brand bg-[#0E1424] shadow-lg shadow-primary-brand/20 ring-1 ring-primary-brand"
                          : "border-[#182338] hover:border-slate-500 hover:bg-[#0A0E1A]"
                      }`}
                    >
                      {/* Avatar Image Thumbnail in Octagonal Frame */}
                      <div
                        className="w-18 h-18 bg-[#121929] p-0.5 shadow-md flex items-center justify-center relative"
                        style={{
                          clipPath:
                            "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                          style={{
                            clipPath:
                              "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                          }}
                        />
                      </div>

                      <div className="text-center w-full min-w-0">
                        <span className="font-display text-xs font-bold text-white uppercase block truncate group-hover:text-primary-brand transition-colors">
                          {preset.name}
                        </span>
                        <span 
                          className="text-[9px] font-mono font-bold block mt-0.5 uppercase px-1.5 py-0.5 rounded bg-[#101726] border border-[#1C263B] text-slate-300 truncate"
                        >
                          {preset.role}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary-brand rounded-full flex items-center justify-center text-white text-[10px]">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD & CROP */}
          {activeTab === "upload" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Left Side: Live Octagonal Crest Canvas / Preview */}
              <div className="flex flex-col items-center justify-center p-6 bg-[#060812] border border-[#182338] rounded-xl space-y-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Live Crest Preview
                </span>

                {/* Octagonal Avatar Crest */}
                <div className="relative group/crest">
                  <div
                    className="w-36 h-36 bg-gradient-to-br from-[#1E293B] via-[#121929] to-[#0A0D18] p-[3px] shadow-2xl flex items-center justify-center relative overflow-hidden cursor-grab active:cursor-grabbing"
                    style={{
                      clipPath:
                        "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                      boxShadow: "0 0 25px rgba(0,0,0,0.8)",
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <div
                      className="w-full h-full bg-[#080B14] flex items-center justify-center overflow-hidden relative"
                      style={{
                        clipPath:
                          "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                      }}
                    >
                      {imagePreviewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imagePreviewUrl}
                          alt="Preview"
                          draggable={false}
                          className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-75"
                          style={{
                            transform: `scale(${zoom}) translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`,
                          }}
                        />
                      ) : (
                        <div className="font-display text-4xl font-black text-white">
                          {initial}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Corner Verified Crest Ring */}
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0A0D18] flex items-center justify-center text-white shadow-md">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                  </span>
                </div>

                <p className="text-[10px] font-sans text-slate-500 text-center">
                  Drag inside the crest above to pan and position your photo.
                </p>
              </div>

              {/* Right Side: Upload Zone & Precision Sliders */}
              <div className="space-y-4">
                {/* File Dropzone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 border-2 border-dashed border-[#1E293B] hover:border-primary-brand/60 bg-[#070A14] hover:bg-[#0B101E] rounded-xl text-center cursor-pointer transition-all space-y-2 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="w-10 h-10 bg-[#121929] group-hover:bg-primary-brand/20 border border-[#1E293B] group-hover:border-primary-brand/50 text-slate-400 group-hover:text-primary-brand rounded-full flex items-center justify-center mx-auto transition-colors">
                    <UploadIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-display text-xs font-bold text-white uppercase block">
                      Choose an Image or Drag & Drop
                    </span>
                    <span className="text-[10px] font-sans text-slate-400 block mt-0.5">
                      PNG, JPG, WEBP or GIF (Max 5MB)
                    </span>
                  </div>
                </div>

                {/* Crop & Transform Controls (Visible when custom image is chosen) */}
                {imagePreviewUrl && selectedFile && (
                  <div className="p-4 bg-[#070A14] border border-[#182338] rounded-xl space-y-3">
                    {/* Zoom Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <ZoomInIcon className="w-3.5 h-3.5 text-primary-brand" />
                          <span>Zoom Scale</span>
                        </span>
                        <span className="font-bold text-white">{zoom.toFixed(1)}x</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
                          className="w-6 h-6 bg-[#121929] border border-[#202C45] hover:text-white text-slate-400 rounded flex items-center justify-center text-xs font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="range"
                          min="1"
                          max="3"
                          step="0.05"
                          value={zoom}
                          onChange={(e) => setZoom(parseFloat(e.target.value))}
                          className="w-full accent-red-500 bg-[#121929] h-1.5 rounded-lg cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                          className="w-6 h-6 bg-[#121929] border border-[#202C45] hover:text-white text-slate-400 rounded flex items-center justify-center text-xs font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Transform Quick Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#141C2E]">
                      <button
                        type="button"
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                        className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 bg-[#101626] border border-[#1C2840] rounded cursor-pointer transition-colors"
                      >
                        <RotateCwIcon className="w-3 h-3" />
                        <span>Rotate 90°</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setZoom(1);
                          setOffsetX(0);
                          setOffsetY(0);
                          setRotation(0);
                        }}
                        className="text-[10px] font-mono text-slate-400 hover:text-white px-2.5 py-1 bg-[#101626] border border-[#1C2840] rounded cursor-pointer transition-colors"
                      >
                        Reset Position
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-[#182338] bg-[#070A12]">
          {user.avatar ? (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={isLoading}
              className="h-9 px-3.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 rounded cursor-pointer transition-colors disabled:opacity-50"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              <span>Remove Photo</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="h-9 px-4.5 bg-[#121828] hover:bg-[#1A233A] text-slate-300 hover:text-white border border-[#202C48] font-display text-xs font-bold uppercase tracking-wider transition-all rounded cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || (!selectedFile && !selectedPreset)}
              className="h-9 px-6 game-theme-btn font-display text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                clipPath:
                  "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  <span>Save Avatar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
