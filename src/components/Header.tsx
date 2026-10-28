import React from 'react';
import { Film, Sparkles, RefreshCw, CheckCircle2, AlertCircle, Wifi } from 'lucide-react';

interface HeaderProps {
  apiStatus: { configured: boolean; checking: boolean };
  onNewProject: () => void;
  hasActiveProject: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  apiStatus,
  onNewProject,
  hasActiveProject,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo and App Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-[1.5px] shadow-lg shadow-cyan-950/50">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Film className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1">
                Motion Tool <span className="text-cyan-400">Studio</span>
              </h1>
              <span className="hidden xs:inline-block px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">
                9:16 Shorts
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Produksi Konten YouTube Dokumenter Praktis
            </p>
          </div>
        </div>

        {/* Action Controls & API Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* API Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              apiStatus.checking
                ? 'bg-slate-900 border-slate-700 text-slate-400'
                : apiStatus.configured
                ? 'bg-emerald-950/70 border-emerald-800/80 text-emerald-300'
                : 'bg-amber-950/70 border-amber-800/80 text-amber-300'
            }`}
            title={
              apiStatus.configured
                ? 'Gemini 3.8 & Google Search Grounding Terhubung'
                : 'GEMINI_API_KEY belum terpasang di Secrets'
            }
          >
            {apiStatus.checking ? (
              <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
            ) : apiStatus.configured ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3 h-3 text-amber-400" />
            )}
            <span className="hidden sm:inline">
              {apiStatus.checking
                ? 'Memeriksa...'
                : apiStatus.configured
                ? 'Backend AI Aktif'
                : 'API Key Belum Siap'}
            </span>
            <span className="sm:hidden text-[10px]">
              {apiStatus.configured ? 'AI Ready' : 'Key Off'}
            </span>
          </div>

          {/* New Project Button */}
          <button
            onClick={onNewProject}
            disabled={!hasActiveProject}
            aria-label="Mulai Proyek Baru"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Proyek Baru</span>
          </button>
        </div>
      </div>
    </header>
  );
};
