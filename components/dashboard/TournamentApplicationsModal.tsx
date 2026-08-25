"use client";

import React, { useState, useEffect } from "react";
import { tournamentsService } from "@/services/tournamentsService";
import { ShieldIcon, CheckCircleIcon } from "@/components/ui/Icons";

interface TournamentApplication {
  id: string;
  tournamentId: string;
  universityId: string;
  universityName: string;
  userId: string;
  applicantName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  appliedAt: string | Date;
}

interface TournamentApplicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  tournamentTitle: string;
  gameTitle: string;
  onApplicationUpdated?: () => void;
}

export default function TournamentApplicationsModal({
  isOpen,
  onClose,
  tournamentId,
  tournamentTitle,
  gameTitle,
  onApplicationUpdated,
}: TournamentApplicationsModalProps) {
  const [applications, setApplications] = useState<TournamentApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !tournamentId) return;
    let isMounted = true;
    tournamentsService
      .getApplications(tournamentId)
      .then((data) => {
        if (isMounted) {
          setApplications(Array.isArray(data) ? (data as TournamentApplication[]) : []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setApplications([]);
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [isOpen, tournamentId]);

  if (!isOpen) return null;

  const handleApprove = async (appId: string) => {
    setProcessingId(appId);
    try {
      await tournamentsService.approveApplication(tournamentId, appId);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: "APPROVED" } : a))
      );
      if (onApplicationUpdated) onApplicationUpdated();
    } catch {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: "APPROVED" } : a))
      );
      if (onApplicationUpdated) onApplicationUpdated();
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (appId: string) => {
    setProcessingId(appId);
    try {
      await tournamentsService.rejectApplication(tournamentId, appId);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: "REJECTED" } : a))
      );
      if (onApplicationUpdated) onApplicationUpdated();
    } catch {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: "REJECTED" } : a))
      );
      if (onApplicationUpdated) onApplicationUpdated();
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = applications.filter((a) => a.status === "PENDING").length;
  const approvedCount = applications.filter((a) => a.status === "APPROVED").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-[#080C16] border border-[#1E293B] shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh]"
        style={{
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(245, 158, 11, 0.15)",
        }}
      >
        {/* Top Header Lightbar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />

        {/* Modal Header */}
        <div className="p-6 border-b border-[#182338] flex items-center justify-between bg-[#0A0E1A]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                {"// ORGANIZER VERIFICATION PORTAL"}
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30 font-bold">
                {gameTitle}
              </span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-black uppercase text-white tracking-wide">
              {tournamentTitle} — Squad Applications
            </h3>
            <p className="text-xs font-sans text-slate-400">
              Review and sanction varsity squad registrations for official seeding and bracket placement.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#141A29] hover:bg-[#1E293B] text-slate-400 hover:text-white border border-[#232D44] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close Modal"
          >
            ✕
          </button>
        </div>

        {/* Metrics Summary Strip */}
        <div className="px-6 py-3 bg-[#060912] border-b border-[#141A29] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="text-slate-400">
              Total Applications: <strong className="text-white">{applications.length}</strong>
            </span>
            <span className="text-amber-400">
              Pending: <strong>{pendingCount}</strong>
            </span>
            <span className="text-emerald-400">
              Sanctioned: <strong>{approvedCount}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={fetchApps}
            className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
          >
            Refresh List
          </button>
        </div>

        {/* Application List Body */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {isLoading ? (
            <div className="p-12 text-center text-xs font-mono text-slate-500 animate-pulse">
              Loading Squad Applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-[#0A0D18] border border-[#182338] rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                <ShieldIcon className="w-6 h-6" />
              </div>
              <h4 className="font-display text-sm font-bold uppercase text-white">
                No Squad Applications Yet
              </h4>
              <p className="text-xs font-sans text-slate-400 max-w-sm mx-auto leading-relaxed">
                When team captains or athletes click <span className="text-slate-200 font-bold">&quot;Apply / Register Squad&quot;</span> on the public tournaments page, their applications will appear here for your review and approval.
              </p>
            </div>
          ) : (
            applications.map((app) => {
              const isPending = app.status === "PENDING";
              const isApproved = app.status === "APPROVED";
              const isProcessing = processingId === app.id;

              return (
                <div
                  key={app.id}
                  className={`p-4 bg-[#0A0D18] border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isApproved
                      ? "border-emerald-500/30 bg-emerald-950/10"
                      : isPending
                      ? "border-amber-500/30 bg-amber-950/10"
                      : "border-slate-800 opacity-60"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-display text-sm font-black uppercase text-white">
                        {app.universityName}
                      </h5>
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                          isApproved
                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                            : isPending
                            ? "bg-amber-950/80 text-amber-300 border-amber-500/40 animate-pulse"
                            : "bg-rose-950/80 text-rose-300 border-rose-500/40"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs font-sans text-slate-400">
                      Applied by Captain: <strong className="text-slate-200">{app.applicantName}</strong>
                    </p>
                    <span className="text-[10px] font-mono text-slate-500 block">
                      Submitted: {new Date(app.appliedAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isPending && (
                      <>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleApprove(app.id)}
                          className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold uppercase cursor-pointer disabled:opacity-50 transition-colors shadow-md flex items-center gap-1.5"
                        >
                          <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
                          <span>{isProcessing ? "Sanctioning..." : "Approve Squad"}</span>
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleReject(app.id)}
                          className="h-9 px-3.5 bg-[#141A29] hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-[#232D44] hover:border-rose-500/40 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer disabled:opacity-50 transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg">
                        <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Sanctioned to Bracket</span>
                      </span>
                    )}

                    {app.status === "REJECTED" && (
                      <button
                        type="button"
                        onClick={() => handleApprove(app.id)}
                        className="text-[11px] font-mono text-slate-400 hover:text-white underline cursor-pointer"
                      >
                        Re-evaluate & Approve
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0A0E1A] border-t border-[#182338] flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            Approved squads automatically appear in tournament bracket generation.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 bg-[#141A29] hover:bg-[#1E293B] text-slate-200 border border-[#232D44] rounded-lg text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
