import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon, Sparkles, ChevronDown } from "lucide-react";

const OPTIONS = [
  {
    key: "light",
    label: "Sáng",
    icon: Sun,
    iconColor: "text-amber-500",
    activeBg: "bg-amber-50 dark:bg-amber-950/40",
    activeText: "text-amber-700 dark:text-amber-300",
    activeBorder: "border-amber-200 dark:border-amber-800/60",
  },
  {
    key: "dark",
    label: "Tối",
    icon: Moon,
    iconColor: "text-indigo-400",
    activeBg: "bg-indigo-50 dark:bg-indigo-950/60",
    activeText: "text-indigo-700 dark:text-indigo-300",
    activeBorder: "border-indigo-200 dark:border-indigo-800/60",
  },
];

export default function ThemeToggle({ compact = false }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentOption = OPTIONS.find((o) => o.key === theme) || OPTIONS[0];
  const CurrentIcon = currentOption.icon;

  const handleCycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else setTheme("light");
  };

  if (compact) {
    return (
      <div className="flex justify-center w-full">
        <button
          onClick={handleCycleTheme}
          title={`Giao diện: ${currentOption.label} (Bấm để đổi)`}
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <CurrentIcon className={`w-5 h-5 ${currentOption.iconColor}`} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <CurrentIcon className={`w-4 h-4 ${currentOption.iconColor}`} />
          <span>Giao diện: <strong>{currentOption.label}</strong></span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 space-y-1 z-50 animate-fade-in">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = theme === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => {
                  setTheme(opt.key);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${active
                    ? `${opt.activeBg} ${opt.activeText} border ${opt.activeBorder}`
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent"
                  }`}
              >
                <Icon className={`w-4 h-4 ${active ? opt.iconColor : "text-slate-400"}`} />
                <span>{opt.label}</span>
                {active && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-current opacity-70" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

