import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Clock,
  Layers,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  AlertOctagon,
  Edit3,
  ListOrdered,
  FileText,
  RotateCcw,
  Zap,
  CheckCircle,
} from 'lucide-react';
import {
  DocumentaryProject,
  FactCategory,
  FactItem,
  ScriptSegment,
  SourceReference,
} from '../types';
import {
  calculateNarrationMetrics,
  extractCleanNarration,
} from '../utils/scriptParser';

interface ResearchScriptTabProps {
  project: DocumentaryProject | null;
  onGenerateResearch: (params: {
    topic: string;
    durationSeconds: number;
    tone: 'investigatif' | 'sinematik' | 'populer' | 'misteri';
    focusAngle: string;
  }) => Promise<void>;
  onUpdateCleanNarration: (newText: string) => void;
  onUpdateSegment: (segmentId: string, updatedNarration: string) => void;
  isLoading: boolean;
  onProceedToTTS: () => void;
}

const SAMPLE_TOPICS = [
  {
    title: 'Misteri Kapal Ourang Medan 1947',
    desc: 'Laporan telegraf maritim, mayat membeku di Selat Malaka, dan hipotesis gas beracun.',
    duration: 60,
    tone: 'investigatif' as const,
  },
  {
    title: 'Situs Gunung Padang: Fakta Geologis vs Hipotesis Piramida',
    desc: 'Penelitian laboratorium radiokarbon, struktur andesit alami, dan perdebatan arkeologi.',
    duration: 90,
    tone: 'investigatif' as const,
  },
  {
    title: 'Letusan Krakatau 1883 & Dampak Gelombang Global',
    desc: 'Catatan barometer kolonial, tsunami Selat Sunda, dan anomali langit Eropa.',
    duration: 60,
    tone: 'sinematik' as const,
  },
  {
    title: 'Misteri Zona Hadal Palung Mariana',
    desc: 'Kedalaman Challenger Deep, rekaman hidrofon NOAA, dan organisme ekstrem.',
    duration: 60,
    tone: 'populer' as const,
  },
];

export const ResearchScriptTab: React.FC<ResearchScriptTabProps> = ({
  project,
  onGenerateResearch,
  onUpdateCleanNarration,
  onUpdateSegment,
  isLoading,
  onProceedToTTS,
}) => {
  const [topicInput, setTopicInput] = useState(project?.topic || '');
  const [duration, setDuration] = useState<number>(project?.targetDurationSeconds || 60);
  const [tone, setTone] = useState<'investigatif' | 'sinematik' | 'populer' | 'misteri'>(
    project?.tone || 'investigatif'
  );
  const [focusAngle, setFocusAngle] = useState(project?.focusAngle || '');
  const [editorMode, setEditorMode] = useState<'segments' | 'raw'>('segments');

  // Metrics kalkulasi langsung
  const cleanNarrationText = project?.cleanNarration || '';
  const metrics = calculateNarrationMetrics(cleanNarrationText);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim() || isLoading) return;
    onGenerateResearch({
      topic: topicInput.trim(),
      durationSeconds: duration,
      tone,
      focusAngle,
    });
  };

  const handleSelectSample = (sample: typeof SAMPLE_TOPICS[0]) => {
    setTopicInput(sample.title);
    setDuration(sample.duration);
    setTone(sample.tone);
    setFocusAngle(sample.desc);
  };

  return (
    <div className="space-y-6">
      {/* 1. Form Input Riset & Topik */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Search className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              1. Riset & Pembuatan Naskah Dokumenter
            </h2>
            <p className="text-xs text-slate-400">
              Cari sumber web terpercaya, verifikasi fakta, dan rancang narasi dengan Hook 3 detik pertama.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="topic-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Topik Dokumenter
            </label>
            <input
              id="topic-input"
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Contoh: Misteri Kapal Hantu Ourang Medan 1947..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-3.5 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
              required
            />
          </div>

          {/* Quick preset chips */}
          <div>
            <span className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Ide Topik Dokumenter Cepat (Ketuk untuk Menggunakan):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_TOPICS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="text-left p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all group"
                >
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate">
                    {sample.title}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{sample.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Duration & Tone selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label htmlFor="duration-select" className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Target Durasi Video</span>
              </label>
              <select
                id="duration-select"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:border-cyan-400 outline-none"
              >
                <option value={30}>30 Detik (Ultra Short ~65 kata)</option>
                <option value={60}>60 Detik (YouTube Shorts Standar ~130 kata)</option>
                <option value={90}>90 Detik (Extended Shorts ~195 kata)</option>
                <option value={180}>3 Menit (Mini Dokumenter ~390 kata)</option>
                <option value={300}>5 Menit (Deep Dive Dokumenter ~650 kata)</option>
              </select>
            </div>

            <div>
              <label htmlFor="tone-select" className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Gaya Narasi / Tone</span>
              </label>
              <select
                id="tone-select"
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:border-cyan-400 outline-none"
              >
                <option value="investigatif">Investigatif (Kritis, Tajam & Berbasis Bukti)</option>
                <option value="sinematik">Sinematik (Dramatis, Khidmat & Emosional)</option>
                <option value="populer">Edukatif Populer (Lugas, Cepat & Menarik)</option>
                <option value="misteri">Misteri & Ketegangan (Suspense & Penuh Tanda Tanya)</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="angle-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Fokus Khusus / Sudut Pandang (Opsional)
            </label>
            <input
              id="angle-input"
              type="text"
              value={focusAngle}
              onChange={(e) => setFocusAngle(e.target.value)}
              placeholder="Contoh: Tekankan perbandingan laporan resmi vs spekulasi media..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !topicInput.trim()}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-indigo-600 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white shadow-xl shadow-cyan-950/60 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Mencari Sumber Web & Merancang Naskah...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Jalankan Riset Web & Hasilkan Naskah</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* 2. Hasil Riset: Sumber Terpercaya & Verifikasi Fakta */}
      {project && (
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
          {/* Header Ringkasan & Sumber Terpercaya */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Sumber Riset Web Terverifikasi ({project.sources.length})</span>
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-medium">
                Google Search Grounding
              </span>
            </div>

            {project.sources.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Belum ada sumber web yang ditautkan.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {project.sources.map((src: SourceReference) => (
                  <a
                    key={src.id}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                          {src.publisher}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white line-clamp-2 mt-1">
                        {src.title}
                      </h4>
                    </div>
                    {src.dateOrSnippet && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-2 border-t border-slate-800/60 pt-1.5">
                        {src.dateOrSnippet}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Klasifikasi Fakta vs Dugaan vs Belum Terbukti */}
          {project.facts && project.facts.length > 0 && (
            <div className="pt-2 border-t border-slate-800">
              <h3 className="text-sm sm:text-base font-bold text-white mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Pemisahan Fakta, Dugaan, dan Klaim</span>
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Menghindari hoaks & manipulasi: Setiap klaim diberi label status kebenaran secara transparan.
              </p>

              <div className="space-y-2">
                {project.facts.map((fact: FactItem) => {
                  const badgeConfig = {
                    verified: {
                      icon: ShieldCheck,
                      label: 'Fakta Terverifikasi',
                      bgColor: 'bg-emerald-950/70 border-emerald-800 text-emerald-300',
                      chip: 'bg-emerald-500 text-slate-950',
                    },
                    hypothesis: {
                      icon: HelpCircle,
                      label: 'Dugaan / Teori Ilmiah',
                      bgColor: 'bg-amber-950/70 border-amber-800 text-amber-300',
                      chip: 'bg-amber-500 text-slate-950',
                    },
                    unproven: {
                      icon: AlertOctagon,
                      label: 'Belum Terbukti / Spekulasi',
                      bgColor: 'bg-rose-950/70 border-rose-800 text-rose-300',
                      chip: 'bg-rose-500 text-white',
                    },
                  }[fact.category];

                  const Icon = badgeConfig.icon;

                  return (
                    <div
                      key={fact.id}
                      className={`p-3 rounded-xl border ${badgeConfig.bgColor} flex flex-col sm:flex-row sm:items-center justify-between gap-2`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeConfig.chip} uppercase tracking-wider flex items-center gap-1`}>
                            <Icon className="w-3 h-3" />
                            {badgeConfig.label}
                          </span>
                          {fact.sourceTitle && (
                            <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                              Rujukan: {fact.sourceTitle}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-slate-200">
                          {fact.claim}
                        </p>
                        {fact.explanation && (
                          <p className="text-[11px] text-slate-400 leading-snug">
                            {fact.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Editor Naskah Narasi Interaktif */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-cyan-400" />
                  <span>Editor Naskah Narasi Dokumenter</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Perbaiki kata-kata narator langsung di bawah. Kecepatan baca standar ~130 kata/menit.
                </p>
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setEditorMode('segments')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    editorMode === 'segments'
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Per Segmen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode('raw')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    editorMode === 'raw'
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Teks Penuh</span>
                </button>
              </div>
            </div>

            {/* Reading metrics indicator bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Kata</span>
                <span className="text-white font-bold text-sm">{metrics.wordCount} kata</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Estimasi Durasi</span>
                <span className="text-cyan-400 font-bold text-sm">{metrics.formattedDuration}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Target Durasi</span>
                <span className="text-slate-300 font-bold text-sm">{project.targetDurationSeconds}s</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status Panjang</span>
                <span
                  className={`font-bold text-sm ${
                    Math.abs(metrics.estimatedSeconds - project.targetDurationSeconds) <= 10
                      ? 'text-emerald-400'
                      : metrics.estimatedSeconds > project.targetDurationSeconds
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {Math.abs(metrics.estimatedSeconds - project.targetDurationSeconds) <= 10
                    ? 'Ideal Sesuai Target'
                    : metrics.estimatedSeconds > project.targetDurationSeconds
                    ? 'Agak Panjang'
                    : 'Lebih Pendek'}
                </span>
              </div>
            </div>

            {/* Segments View */}
            {editorMode === 'segments' ? (
              <div className="space-y-3">
                {project.segments.map((seg: ScriptSegment, idx: number) => {
                  const isHook = seg.cueType === 'hook' || idx === 0;
                  const isCTA = seg.cueType === 'cta' || idx === project.segments.length - 1;

                  return (
                    <div
                      key={seg.id || idx}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isHook
                          ? 'bg-gradient-to-r from-cyan-950/50 to-slate-950 border-cyan-800/80 shadow-md shadow-cyan-950/20'
                          : isCTA
                          ? 'bg-gradient-to-r from-indigo-950/50 to-slate-950 border-indigo-800/80'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                            {seg.timeRange}
                          </span>
                          {isHook && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 flex items-center gap-1 uppercase tracking-wider animate-pulse">
                              <Zap className="w-3 h-3" />
                              Hook 3 Detik Pertama
                            </span>
                          )}
                          {isCTA && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500 text-white uppercase tracking-wider">
                              CTA Akhir
                            </span>
                          )}
                          {seg.factTag && (
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                                seg.factTag === 'verified'
                                  ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                                  : seg.factTag === 'hypothesis'
                                  ? 'bg-amber-950/70 border-amber-800 text-amber-300'
                                  : 'bg-rose-950/70 border-rose-800 text-rose-300'
                              }`}
                            >
                              {seg.factTag === 'verified' ? 'Fakta Terverifikasi' : seg.factTag === 'hypothesis' ? 'Dugaan' : 'Belum Terbukti'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Visual direction */}
                      {seg.visualDirection && (
                        <div className="mb-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-1.5">
                          <span className="text-cyan-400 font-bold uppercase text-[9px] tracking-wider px-1 bg-cyan-950 rounded border border-cyan-800 flex-shrink-0">
                            Visual Cue
                          </span>
                          <span>{seg.visualDirection}</span>
                        </div>
                      )}

                      {/* Narration editor textarea */}
                      <textarea
                        value={seg.narrationText}
                        onChange={(e) => onUpdateSegment(seg.id, e.target.value)}
                        rows={2}
                        aria-label={`Naskah segmen ${seg.timeRange}`}
                        placeholder="Masukkan teks narasi yang akan dibacakan..."
                        className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-lg p-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-colors"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Raw Monolithic Editor */
              <div>
                <textarea
                  value={project.cleanNarration}
                  onChange={(e) => onUpdateCleanNarration(e.target.value)}
                  rows={10}
                  aria-label="Editor naskah bersih narasi"
                  placeholder="Tulis atau edit naskah narator di sini..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl p-3.5 text-xs sm:text-sm text-white font-mono leading-relaxed outline-none"
                />
              </div>
            )}

            {/* Navigation Button to Next Step */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-400 text-center sm:text-left">
                Naskah siap? Lanjutkan untuk mengunduh naskah bersih atau langsung ke generator voice-over.
              </p>
              <button
                type="button"
                onClick={onProceedToTTS}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/50 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Voice-Over & Audio</span>
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
