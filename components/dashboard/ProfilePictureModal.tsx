"use client";

import React, { useState, useRef, useCallback, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { UserProfile } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import {
  CameraIcon,
  UploadIcon,
  TrashIcon,
  RotateCwIcon,
  ZoomInIcon,
  CheckCircleIcon,
} from "@/components/ui/Icons";

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

function ProfilePictureModalContent({
  onClose,
  user,
}: {
  onClose: () => void;
  user: UserProfile;
}) {
  const { setUserAvatar, refreshProfile } = useAuth();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    user.avatarOriginal || user.avatar || null
  );

  // Crop & Transform controls
  const [zoom, setZoom] = useState<number>(user.avatarZoom ?? 1);
  const [offsetX, setOffsetX] = useState<number>(user.avatarOffsetX ?? 0);
  const [offsetY, setOffsetY] = useState<number>(user.avatarOffsetY ?? 0);
  const [rotation, setRotation] = useState<number>(user.avatarRotation ?? 0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal Lifecycle: Scroll Locking & Escape Key Handler
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

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

  // Pointer drag handlers for responsive image positioning
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imagePreviewUrl) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - offsetX, y: e.clientY - offsetY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStartRef.current.x);
    setOffsetY(e.clientY - dragStartRef.current.y);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Generate cropped image Blob via HTML Canvas
  const getCroppedBlob = useCallback(async (): Promise<Blob | null> => {
    if (!imagePreviewUrl) return null;

    return new Promise((resolve) => {
      const image = new Image();
      image.crossOrigin = "anonymous";

      const processImage = () => {
        try {
          const canvas = document.createElement("canvas");
          const size = 512;
          const previewSize = 144;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }

          ctx.clearRect(0, 0, size, size);

          // Center and apply transforms matching CSS transform sequence
          ctx.save();
          ctx.translate(size / 2, size / 2);
          ctx.translate(
            (offsetX * size) / previewSize,
            (offsetY * size) / previewSize
          );
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.scale(zoom, zoom);

          // Draw image centered with object-cover calculation
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
        } catch {
          resolve(null);
        }
      };

      image.onload = processImage;
      image.onerror = () => {
        // Fallback with fetch in case CORS was restricted on direct img tag
        fetch(imagePreviewUrl)
          .then((res) => res.blob())
          .then((blob) => {
            const objectUrl = URL.createObjectURL(blob);
            const fallbackImg = new Image();
            fallbackImg.onload = () => {
              image.src = objectUrl;
              processImage();
            };
            fallbackImg.onerror = () => resolve(null);
            fallbackImg.src = objectUrl;
          })
          .catch(() => resolve(null));
      };
      image.src = imagePreviewUrl;
    });
  }, [imagePreviewUrl, zoom, offsetX, offsetY, rotation]);

  const initialZoom = user.avatarZoom ?? 1;
  const initialOffsetX = user.avatarOffsetX ?? 0;
  const initialOffsetY = user.avatarOffsetY ?? 0;
  const initialRotation = user.avatarRotation ?? 0;

  const hasTransformChanges =
    Math.abs(zoom - initialZoom) > 0.01 ||
    Math.abs(offsetX - initialOffsetX) > 0.5 ||
    Math.abs(offsetY - initialOffsetY) > 0.5 ||
    rotation !== initialRotation;

  const canSave =
    Boolean(selectedFile) || (Boolean(imagePreviewUrl) && hasTransformChanges);

  const handleSave = async () => {
    if (!imagePreviewUrl && !selectedFile) {
      setError("Please choose or upload a photo first.");
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      // Render and crop the customized image
      const blob = await getCroppedBlob();
      const uploadFile = blob || selectedFile;
      if (!uploadFile) {
        throw new Error(
          "Unable to process image. Please try selecting the file again."
        );
      }
      const res = await authService.uploadAvatar(
        uploadFile,
        selectedFile || undefined,
        { zoom, offsetX, offsetY, rotation }
      );
      setUserAvatar(res.avatar);
      await refreshProfile();
      setSuccessMessage("Profile picture updated!");
      setTimeout(() => {
        onClose();
      }, 500);
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
      await refreshProfile();
      setSuccessMessage("Profile picture removed.");
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to remove avatar"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const initial = (user.displayName || "A").charAt(0).toUpperCase();

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-2xl bg-[#090C16] border border-[#1E293B] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
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
                Upload and position your collegiate esports avatar crest
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg bg-[#101626] border border-[#202C45] hover:border-slate-400 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
          >
            ✕
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left Side: Live Octagonal Crest Canvas / Preview */}
            <div className="flex flex-col items-center justify-center p-6 bg-[#060812] border border-[#182338] rounded-xl space-y-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Live Crest Preview
              </span>

              {/* Octagonal Avatar Crest */}
              <div className="relative group/crest">
                <div
                  className={`w-36 h-36 bg-gradient-to-br from-[#1E293B] via-[#121929] to-[#0A0D18] p-[3px] shadow-2xl flex items-center justify-center relative overflow-hidden select-none touch-none ${
                    imagePreviewUrl ? "cursor-grab active:cursor-grabbing" : ""
                  }`}
                  style={{
                    clipPath:
                      "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                    boxShadow: "0 0 25px rgba(0,0,0,0.8)",
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  <div
                    className="w-full h-full bg-[#080B14] flex items-center justify-center overflow-hidden relative pointer-events-none"
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
                        className={`w-full h-full object-cover select-none pointer-events-none origin-center ${
                          isDragging ? "" : "transition-transform duration-75"
                        }`}
                        style={{
                          transform: `translate3d(${offsetX}px, ${offsetY}px, 0px) rotate(${rotation}deg) scale(${zoom})`,
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
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0A0D18] flex items-center justify-center text-white shadow-md pointer-events-none">
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                </span>
              </div>

              <p className="text-[10px] font-sans text-slate-500 text-center">
                {imagePreviewUrl
                  ? "Drag inside the crest above to pan and position your photo."
                  : "Upload a picture to preview your athlete crest."}
              </p>
            </div>

            {/* Right Side: Upload Zone & Precision Sliders */}
            <div className="space-y-4">
              {/* File Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-[#1E293B] hover:border-primary-brand/60 bg-[#070A14] hover:bg-[#0B101E] rounded-xl text-center cursor-pointer transition-all space-y-2.5 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-11 h-11 bg-[#121929] group-hover:bg-primary-brand/20 border border-[#1E293B] group-hover:border-primary-brand/50 text-slate-400 group-hover:text-primary-brand rounded-full flex items-center justify-center mx-auto transition-colors">
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

              {/* Crop & Transform Controls (Visible when image is loaded) */}
              {imagePreviewUrl && (
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
                        onClick={() =>
                          setZoom((z) =>
                            Math.max(1, parseFloat((z - 0.1).toFixed(2)))
                          )
                        }
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
                        onClick={() =>
                          setZoom((z) =>
                            Math.min(3, parseFloat((z + 0.1).toFixed(2)))
                          )
                        }
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
              disabled={isLoading || !canSave}
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
    </div>,
    document.body
  );
}

export default function ProfilePictureModal({
  isOpen,
  onClose,
  user,
}: ProfilePictureModalProps) {
  // false during SSR, true on the client — the portal needs document.body.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isOpen || !mounted) return null;

  return (
    <ProfilePictureModalContent
      key={`${user.id}-${user.avatar}-${user.avatarOriginal}-${user.avatarZoom}-${user.avatarOffsetX}-${user.avatarOffsetY}-${user.avatarRotation}`}
      onClose={onClose}
      user={user}
    />
  );
}

