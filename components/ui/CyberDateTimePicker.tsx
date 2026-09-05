"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { CalendarIcon, ClockIcon } from "@/components/ui/Icons";

interface CyberDateTimePickerProps {
  value: string; // ISO string or "YYYY-MM-DDTHH:mm"
  onChange: (val: string) => void;
  placeholder?: string;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const DAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CyberDateTimePicker({
  value,
  onChange,
  placeholder = "Set Scheduled Launch Time",
}: CyberDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date from value
  const parsedDate = useMemo(() => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }, [value]);

  const [viewYear, setViewYear] = useState<number>(() => parsedDate?.getFullYear() || new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => parsedDate?.getMonth() ?? new Date().getMonth());

  // Selected date components
  const [selectedDay, setSelectedDay] = useState<Date | null>(() => parsedDate);
  const [hour, setHour] = useState<number>(() => {
    if (!parsedDate) return 6;
    const h = parsedDate.getHours() % 12;
    return h === 0 ? 12 : h;
  });
  const [minute, setMinute] = useState<number>(() => {
    if (!parsedDate) return 0;
    return Math.round(parsedDate.getMinutes() / 5) * 5 % 60;
  });
  const [period, setPeriod] = useState<"AM" | "PM">(() => {
    if (!parsedDate) return "PM";
    return parsedDate.getHours() >= 12 ? "PM" : "AM";
  });

  // Sync state when value changes externally (React recommended state adjustment pattern)
  const [prevValue, setPrevValue] = useState<string | undefined>(value);
  if (prevValue !== value) {
    setPrevValue(value);
    if (parsedDate) {
      setViewYear(parsedDate.getFullYear());
      setViewMonth(parsedDate.getMonth());
      setSelectedDay(parsedDate);
      const h = parsedDate.getHours() % 12;
      setHour(h === 0 ? 12 : h);
      setMinute(Math.round(parsedDate.getMinutes() / 5) * 5 % 60);
      setPeriod(parsedDate.getHours() >= 12 ? "PM" : "AM");
    } else {
      setSelectedDay(null);
    }
  }

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Calendar cells generation (only 35 or 42 as needed)
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        date: new Date(viewYear, viewMonth - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        date: new Date(viewYear, viewMonth, i),
        isCurrentMonth: true,
      });
    }

    // Next month days (35 cells max if fits in 5 rows, else 42)
    const targetLength = cells.length > 35 ? 42 : 35;
    const remaining = targetLength - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        date: new Date(viewYear, viewMonth + 1, i),
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const applySelectedDateTime = (dateObj: Date | null, h = hour, m = minute, p = period) => {
    if (!dateObj) {
      onChange("");
      return;
    }
    let militaryHour = h % 12;
    if (p === "PM") militaryHour += 12;

    const finalDate = new Date(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate(),
      militaryHour,
      m,
      0
    );

    const localIso = new Date(finalDate.getTime() - finalDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    onChange(localIso);
  };

  const handleDayClick = (cellDate: Date) => {
    setSelectedDay(cellDate);
    applySelectedDateTime(cellDate);
  };

  const handleHourChange = (newHour: number) => {
    setHour(newHour);
    if (selectedDay) {
      applySelectedDateTime(selectedDay, newHour, minute, period);
    }
  };

  const handleMinuteChange = (newMin: number) => {
    setMinute(newMin);
    if (selectedDay) {
      applySelectedDateTime(selectedDay, hour, newMin, period);
    }
  };

  const handlePeriodChange = (newPeriod: "AM" | "PM") => {
    setPeriod(newPeriod);
    if (selectedDay) {
      applySelectedDateTime(selectedDay, hour, minute, newPeriod);
    }
  };

  const handleQuickPreset = (daysFromNow: number, targetHour: number, targetPeriod: "AM" | "PM") => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setSelectedDay(d);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setHour(targetHour);
    setMinute(0);
    setPeriod(targetPeriod);
    applySelectedDateTime(d, targetHour, 0, targetPeriod);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDay(null);
    onChange("");
  };

  const isSameDay = (d1: Date, d2: Date | null) => {
    if (!d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isToday = (d: Date) => {
    const today = new Date();
    return isSameDay(d, today);
  };

  const formattedDisplayValue = useMemo(() => {
    if (!parsedDate) return "";
    return parsedDate.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }, [parsedDate]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-11 px-3.5 bg-[#060912] border rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all duration-200 select-none ${
          isOpen
            ? "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            : "border-[#1C2538] hover:border-amber-500/50"
        }`}
        style={{
          clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-6 h-6 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
            <CalendarIcon className="w-3.5 h-3.5" />
          </div>
          <span
            className={`text-xs font-mono truncate ${
              formattedDisplayValue ? "text-amber-300 font-bold" : "text-slate-500"
            }`}
          >
            {formattedDisplayValue || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {formattedDisplayValue && (
            <button
              type="button"
              onClick={handleClear}
              className="w-5 h-5 rounded bg-[#121828] hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 text-[10px] font-bold flex items-center justify-center transition-colors cursor-pointer"
              title="Clear date"
            >
              ✕
            </button>
          )}
          <span className={`text-[10px] text-slate-400 transition-transform ${isOpen ? "rotate-180 text-amber-400" : ""}`}>
            ▼
          </span>
        </div>
      </div>

      {/* Ultra-Compact Tactical Calendar Popover */}
      {isOpen && (
        <div
          className="absolute z-50 mt-1.5 right-0 w-[285px] sm:w-[295px] bg-[#0A0D18] border border-amber-500/50 rounded-2xl shadow-2xl p-3 space-y-2.5 backdrop-blur-2xl animate-fade-in text-white"
          style={{
            clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
            boxShadow: "0 15px 35px rgba(0,0,0,0.9), 0 0 20px rgba(245,158,11,0.18)",
          }}
        >
          {/* Top Gold Bevel Accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

          {/* Month Header & Presets in a Compact Dual Bar */}
          <div className="flex items-center justify-between gap-1 pt-0.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-6 h-6 rounded bg-[#101524] hover:bg-[#1A233A] text-slate-300 hover:text-white border border-[#222E48] flex items-center justify-center text-[10px] font-mono font-bold transition-colors cursor-pointer"
              >
                ←
              </button>
              <span className="font-display text-xs font-black uppercase text-white tracking-wide px-1">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-6 h-6 rounded bg-[#101524] hover:bg-[#1A233A] text-slate-300 hover:text-white border border-[#222E48] flex items-center justify-center text-[10px] font-mono font-bold transition-colors cursor-pointer"
              >
                →
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleQuickPreset(0, 6, "PM")}
                className="px-1.5 py-0.5 rounded bg-[#121828] hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-[#222E48] text-[9px] font-mono font-bold uppercase transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset(1, 6, "PM")}
                className="px-1.5 py-0.5 rounded bg-[#121828] hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-[#222E48] text-[9px] font-mono font-bold uppercase transition-colors cursor-pointer"
              >
                Tmrw
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {DAYS_SHORT.map((day) => (
              <span key={day} className="text-[9px] font-mono font-bold text-slate-500 uppercase">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarCells.map((cell, idx) => {
              const isSelected = selectedDay && isSameDay(cell.date, selectedDay);
              const isCurrentDay = isToday(cell.date);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDayClick(cell.date)}
                  className={`h-6 rounded text-[10px] font-mono font-bold flex items-center justify-center transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-sm font-black scale-105 z-10"
                      : isCurrentDay
                      ? "bg-cyan-950/60 text-cyan-300 border border-cyan-500/50"
                      : cell.isCurrentMonth
                      ? "text-slate-200 hover:bg-[#151D30] hover:text-amber-400"
                      : "text-slate-600 hover:text-slate-400"
                  }`}
                >
                  {cell.date.getDate()}
                  {isCurrentDay && !isSelected && (
                    <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-cyan-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Sleek Compact Time & Done Bottom Row */}
          <div className="pt-2 border-t border-[#182338] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <ClockIcon className="w-3 h-3 text-amber-400 shrink-0" />
              
              {/* Hour Dropdown */}
              <select
                value={hour}
                onChange={(e) => handleHourChange(parseInt(e.target.value, 10))}
                className="h-6 px-1 rounded bg-[#060912] border border-[#1C2538] text-white text-[10px] font-mono focus:border-amber-500 focus:outline-none cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}
                  </option>
                ))}
              </select>

              <span className="font-bold text-amber-400 font-mono text-xs">:</span>

              {/* Minute Dropdown */}
              <select
                value={minute}
                onChange={(e) => handleMinuteChange(parseInt(e.target.value, 10))}
                className="h-6 px-1 rounded bg-[#060912] border border-[#1C2538] text-white text-[10px] font-mono focus:border-amber-500 focus:outline-none cursor-pointer"
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, "0")}
                  </option>
                ))}
              </select>

              {/* AM/PM Toggle Button */}
              <button
                type="button"
                onClick={() => handlePeriodChange(period === "AM" ? "PM" : "AM")}
                className="h-6 px-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold uppercase transition-colors cursor-pointer"
              >
                {period}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-6 px-3 rounded bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-[10px] font-mono uppercase font-black tracking-wider transition-all shadow-sm cursor-pointer shrink-0"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
