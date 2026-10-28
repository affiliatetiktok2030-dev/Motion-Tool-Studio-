import React, { useState } from 'react';
import { Download, Copy, Check, FileText, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { DocumentaryProject } from '../types';
import {
  calculateNarrationMetrics,
  generateCleanScriptTxt,
} from '../utils/scriptParser';

interface DownloadScriptTabProps {
  project: DocumentaryProject | null;
  onProceedToTTS: () => void;
}

export const DownloadScriptTab: React.FC<DownloadScriptTabProps> = ({
  project,
  onProceedToTTS,
}) => {
  const [copied, setCopied] = useState(false);

  if (!project) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <FileText className="w-12 h-12 mx-auto text-slate-600 mb-3" />
        <p className="text-sm font-medium">Belum ada naskah yang dibuat.</p>
        <p className="text-xs text-slate-500 mt-1">
          Silakan buat riset dan naskah terlebih dahulu di tab &quot;Riset &amp; Naskah&quot;.
        </p>
      </div>
    );
  }

  const cleanText = project.cleanNarration.trim();
  const metrics = calculateNarrationMetrics(cleanText);

  const handleDownloadTxt = () => {
    const fileContent = generateCleanScriptTxt(
      project.topic,
      cleanText,
      metrics.formattedDuration
    );

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTopic = project.topic
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 30);
    link.download = `naskah_bersih_${safeTopic}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Download className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                2. Unduh Naskah Bersih Narator
              </h2>
              <p className="text-xs text-slate-400">
                File TXT murni hanya berisi teks yang dibacakan narator tanpa petunjuk panggung atau visual.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              aria-label="Salin Naskah Narator"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 active:scale-95 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cyan-400" />
                  <span>Salin Naskah</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadTxt}
              aria-label="Unduh Naskah Format TXT"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/60 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download (.TXT)</span>
            </button>
          </div>
        </div>

        {/* Quality notice */}
        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200 flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>
            Naskah telah diverifikasi bebas dari tag teknis seperti <code>[Visual]</code> atau <code>[Musik]</code> sehingga siap direkam oleh pengisi suara atau dibaca oleh mesin TTS.
          </span>
        </div>

        {/* Stats card */}
        <div className="grid grid-cols-3 gap-2.5 mb-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
          <div>
            <span className="block text-[10px] uppercase font-semibold text-slate-400">Jumlah Kata</span>
            <span className="text-sm sm:text-base font-bold text-white">{metrics.wordCount}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-semibold text-slate-400">Karakter</span>
            <span className="text-sm sm:text-base font-bold text-white">{metrics.characterCount}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-semibold text-slate-400">Estimasi VO</span>
            <span className="text-sm sm:text-base font-bold text-cyan-400">{metrics.formattedDuration}</span>
          </div>
        </div>

        {/* Clean text display */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 relative font-mono text-xs sm:text-sm text-slate-200 leading-relaxed max-h-[420px] overflow-y-auto whitespace-pre-wrap select-all">
          {cleanText}
        </div>

        {/* Next step footer */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Langkah selanjutnya: konversi teks naskah ini menjadi audio narasi menggunakan Text-to-Speech resmi.
          </p>
          <button
            onClick={onProceedToTTS}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-950/60 active:scale-95 transition-all cursor-pointer"
          >
            <span>Buka Voice-Over TTS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
