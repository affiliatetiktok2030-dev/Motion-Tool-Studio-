import React, { useState } from 'react';
import {
  Clapperboard,
  Sparkles,
  Copy,
  Check,
  Download,
  Eye,
  AlertTriangle,
  MapPin,
  Image as ImageIcon,
  Clock,
  Layers,
  Camera,
  Film,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { DocumentaryProject, ScenePrompt } from '../types';
import { generateMasterPromptDocument } from '../utils/scriptParser';

interface VideoPromptTabProps {
  project: DocumentaryProject | null;
  onGeneratePrompts: () => Promise<void>;
  onApproveConcept: () => void;
  isLoading: boolean;
  onProceedToMetadata: () => void;
}

export const VideoPromptTab: React.FC<VideoPromptTabProps> = ({
  project,
  onGeneratePrompts,
  onApproveConcept,
  isLoading,
  onProceedToMetadata,
}) => {
  const [copiedMaster, setCopiedMaster] = useState(false);
  const [copiedSceneIndex, setCopiedSceneIndex] = useState<number | null>(null);

  if (!project) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <Film className="w-12 h-12 mx-auto text-slate-600 mb-3" />
        <p className="text-sm font-medium">Belum ada proyek yang dibuat.</p>
        <p className="text-xs text-slate-500 mt-1">
          Selesaikan riset dan naskah terlebih dahulu di tab &quot;Riset &amp; Naskah&quot;.
        </p>
      </div>
    );
  }

  const storyboard = project.storyboard;
  const scenes = storyboard?.scenes || [];
  const conceptApproved = storyboard?.conceptApproved || false;

  const handleCopyMaster = async () => {
    const doc = generateMasterPromptDocument(project);
    try {
      await navigator.clipboard.writeText(doc);
      setCopiedMaster(true);
      setTimeout(() => setCopiedMaster(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyScene = async (prompt: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedSceneIndex(idx);
      setTimeout(() => setCopiedSceneIndex(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadTxt = () => {
    const doc = generateMasterPromptDocument(project);
    const blob = new Blob([doc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTopic = project.topic.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 25);
    link.download = `master_video_prompt_9x16_${safeTopic}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getMotionBadge = (type: ScenePrompt['motionType']) => {
    switch (type) {
      case 'animated_map':
        return { label: 'Peta Animasi', icon: MapPin, color: 'text-cyan-400 bg-cyan-950/70 border-cyan-800' };
      case 'archival_photo':
        return { label: 'Foto Arsip 2.5D', icon: ImageIcon, color: 'text-amber-400 bg-amber-950/70 border-amber-800' };
      case 'timeline':
        return { label: 'Timeline Bergerak', icon: Clock, color: 'text-indigo-400 bg-indigo-950/70 border-indigo-800' };
      case 'ai_reconstruction':
        return { label: 'Rekonstruksi AI', icon: Sparkles, color: 'text-rose-400 bg-rose-950/70 border-rose-800' };
      default:
        return { label: 'Motion Graphics', icon: Layers, color: 'text-slate-300 bg-slate-900 border-slate-700' };
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Clapperboard className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                4. Prompt Video Master (Format 9:16)
              </h2>
              <p className="text-xs text-slate-400">
                Gaya Documentary Motion Graphics 1080x1920 untuk YouTube Shorts / HP Android.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono font-bold">
              9:16 • 1080x1920
            </span>
          </div>
        </div>

        {/* Action Generate if not yet created */}
        {scenes.length === 0 && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Buat Storyboard &amp; Konsep Visual Motion Graphics
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Sistem akan memecah naskah menjadi adegan visual dengan hook 3 detik pertama, peta animasi, foto arsip 2.5D, dan label rekonstruksi AI.
              </p>
            </div>
            <button
              onClick={onGeneratePrompts}
              disabled={isLoading}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-xl shadow-cyan-950/60 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Merancang Konsep Storyboard...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Buat Konsep &amp; Storyboard Video 9:16</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 1. REVIEW KONSEP & PREVIEW SEBELUM RENDER PENUH */}
        {scenes.length > 0 && !conceptApproved && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 border border-cyan-800/80 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Preview Konsep &amp; Persetujuan Visual
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase tracking-wider">
                Menunggu Persetujuan
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Sesuai standar produksi studio: Tinjau konsep hook 3 detik pertama dan alur visual di bawah sebelum menghasilkan prompt produksi penuh.
            </p>

            {/* Hook 3 Detik Preview */}
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800 text-xs text-cyan-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block">
                ⚡ Hook Visual 3 Detik Pertama (Penting untuk Retensi Penonton)
              </span>
              <p className="font-semibold text-white">
                {storyboard.first3SecondsVisualHook || 'Zoom kinetik cepat ke dokumen arsip dan transisi peta topografi bercahaya.'}
              </p>
            </div>

            {/* Scenes summary list */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Rencana Adegan ({scenes.length} Scene 9:16):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {scenes.map((scene, i) => {
                  const badge = getMotionBadge(scene.motionType);
                  const Icon = badge.icon;
                  return (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-mono text-[11px] text-cyan-400 font-bold">
                          Scene #{scene.sceneNumber} [{scene.timeRange}]
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 ${badge.color}`}>
                          <Icon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] line-clamp-1 italic">
                        &ldquo;{scene.narrationExcerpt}&rdquo;
                      </p>
                      {scene.isAiReconstruction && (
                        <p className="text-[10px] text-rose-400 font-semibold mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                          <span>Label: Rekonstruksi AI (Bukan Arsip Asli)</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Warning rule */}
            <div className="p-3 rounded-xl bg-slate-950 border border-amber-900/60 text-xs text-amber-200/90 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Prinsip Integritas Dokumenter:</strong> Adegan berlabel <em>Rekonstruksi AI</em> dilarang disajikan seolah-olah merupakan rekaman arsip asli. Prompt akan secara eksplisit mencantumkan instruksi watermark &quot;Rekonstruksi Visual AI&quot;.
              </span>
            </div>

            {/* Approve button */}
            <div className="pt-2">
              <button
                onClick={onApproveConcept}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-lg shadow-emerald-950/60 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Setujui Konsep &amp; Buka Master Prompt Lengkap</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. PROMPT MASTER LENGKAP (SETELAH DISETUJUI) */}
        {scenes.length > 0 && conceptApproved && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">
                  Konsep Visual Disetujui ({scenes.length} Scene Siap Render)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyMaster}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 active:scale-95 transition-all"
                >
                  {copiedMaster ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Salin Semua Prompt</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadTxt}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Prompt (.TXT)</span>
                </button>
              </div>
            </div>

            {/* Scenes Breakdown Cards */}
            <div className="space-y-3">
              {scenes.map((scene, idx) => {
                const badge = getMotionBadge(scene.motionType);
                const Icon = badge.icon;
                const isCopied = copiedSceneIndex === idx;

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-slate-900 border border-slate-700 text-cyan-400">
                          SCENE #{scene.sceneNumber} • {scene.timeRange}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1 ${badge.color}`}>
                          <Icon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyScene(scene.masterPrompt, idx)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-cyan-400 px-2 py-1 rounded bg-slate-900 border border-slate-800 active:scale-95 transition-all"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Salin Prompt Scene</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* AI Reconstruction Warning Notice */}
                    {scene.isAiReconstruction && (
                      <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/80 text-[11px] text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                        <span>
                          <strong>Wajib Beri Label Visual:</strong> Jangan tampilkan sebagai rekaman arsip asli. Tampilkan teks overlay &quot;Rekonstruksi Visual AI&quot;.
                        </span>
                      </div>
                    )}

                    {/* Narration Match */}
                    <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/70">
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Narasi Bersamaan:
                      </span>
                      <p className="italic mt-0.5">&ldquo;{scene.narrationExcerpt}&rdquo;</p>
                    </div>

                    {/* Camera and elements */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-slate-900/40 border border-slate-800/50">
                        <span className="text-cyan-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          Pergerakan Kamera
                        </span>
                        <p className="text-slate-200 text-[11px] mt-0.5">{scene.cameraMovement}</p>
                      </div>
                      <div className="p-2 rounded bg-slate-900/40 border border-slate-800/50">
                        <span className="text-indigo-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          Elemen On-Screen
                        </span>
                        <p className="text-slate-200 text-[11px] mt-0.5">{scene.screenElements.join(', ')}</p>
                      </div>
                    </div>

                    {/* Master Prompt AI */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-200 leading-relaxed select-all">
                      <span className="text-[10px] font-sans font-bold text-slate-400 block uppercase mb-1">
                        Prompt Render Video (9:16 - 1080x1920)
                      </span>
                      {scene.masterPrompt}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next Step footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-400">
                Langkah terakhir: buat judul memikat, deskripsi lengkap dengan sumber, dan tag SEO YouTube.
              </p>
              <button
                onClick={onProceedToMetadata}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 text-white shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <span>Lanjut ke Metadata YouTube SEO</span>
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
