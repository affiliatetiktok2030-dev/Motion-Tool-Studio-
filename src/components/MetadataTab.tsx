import React, { useState } from 'react';
import {
  Youtube,
  Sparkles,
  Copy,
  Check,
  Hash,
  Tag,
  BookOpen,
  FileText,
  AlertCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { DocumentaryProject, TitleOption } from '../types';

interface MetadataTabProps {
  project: DocumentaryProject | null;
  onGenerateMetadata: () => Promise<void>;
  isLoading: boolean;
}

export const MetadataTab: React.FC<MetadataTabProps> = ({
  project,
  onGenerateMetadata,
  isLoading,
}) => {
  const [copiedTitleId, setCopiedTitleId] = useState<string | null>(null);
  const [copiedDesc, setCopiedDesc] = useState<boolean>(false);
  const [copiedHashtags, setCopiedHashtags] = useState<boolean>(false);
  const [copiedTags, setCopiedTags] = useState<boolean>(false);

  if (!project) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <Youtube className="w-12 h-12 mx-auto text-slate-600 mb-3" />
        <p className="text-sm font-medium">Belum ada proyek yang dibuat.</p>
        <p className="text-xs text-slate-500 mt-1">
          Selesaikan riset dan naskah terlebih dahulu di tab &quot;Riset &amp; Naskah&quot;.
        </p>
      </div>
    );
  }

  const metadata = project.metadata;
  const hasMetadata = metadata && metadata.titles && metadata.titles.length > 0;

  const handleCopy = async (text: string, type: 'desc' | 'hashtags' | 'tags' | string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'desc') {
        setCopiedDesc(true);
        setTimeout(() => setCopiedDesc(false), 2000);
      } else if (type === 'hashtags') {
        setCopiedHashtags(true);
        setTimeout(() => setCopiedHashtags(false), 2000);
      } else if (type === 'tags') {
        setCopiedTags(true);
        setTimeout(() => setCopiedTags(false), 2000);
      } else {
        setCopiedTitleId(type);
        setTimeout(() => setCopiedTitleId(null), 2000);
      }
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <Youtube className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                5. Metadata YouTube (SEO &amp; Referensi)
              </h2>
              <p className="text-xs text-slate-400">
                Judul memikat tanpa clickbait bohong, deskripsi kaya referensi sumber, dan hashtag relevan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-950 border border-slate-700 text-slate-300 font-mono">
              YouTube Shorts SEO
            </span>
          </div>
        </div>

        {/* Generate action if not yet generated */}
        {!hasMetadata && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Optimalkan Metadata &amp; SEO YouTube
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Hasilkan variasi judul bernilai CTR tinggi, format deskripsi lengkap dengan daftar sumber web terpercaya, serta tags pencarian YouTube.
              </p>
            </div>
            <button
              onClick={onGenerateMetadata}
              disabled={isLoading}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 via-rose-500 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white shadow-xl shadow-red-950/60 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Meracik Judul &amp; Metadata SEO...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Metadata YouTube</span>
                </>
              )}
            </button>
          </div>
        )}

        {hasMetadata && (
          <div className="space-y-6">
            {/* 1. ALTERNATIF JUDUL MENARIK & JUJUR */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Alternatif Judul (Menarik &amp; Tidak Menyesatkan)</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  Pilih salah satu &amp; salin
                </span>
              </div>

              <div className="space-y-2.5">
                {metadata.titles.map((t: TitleOption, idx: number) => {
                  const isCopied = copiedTitleId === (t.id || String(idx));
                  return (
                    <div
                      key={t.id || idx}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                            {t.style}
                          </span>
                          {t.estimatedCtr && (
                            <span className="text-[11px] text-slate-400">
                              {t.estimatedCtr}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-white">
                          {t.title}
                        </p>
                      </div>

                      <button
                        onClick={() => handleCopy(t.title, t.id || String(idx))}
                        aria-label={`Salin judul ${t.title}`}
                        className="flex-shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 active:scale-95 transition-all self-end sm:self-center"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Salin Judul</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. DESKRIPSI YOUTUBE DENGAN TIMESTAMPS & SUMBER */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Deskripsi Video &amp; Referensi Sumber</span>
                </h3>

                <button
                  onClick={() => handleCopy(metadata.description, 'desc')}
                  aria-label="Salin Deskripsi Lengkap"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 active:scale-95 transition-all"
                >
                  {copiedDesc ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Salin Deskripsi</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[260px] overflow-y-auto select-all">
                {metadata.description}
              </div>
            </div>

            {/* 3. HASHTAGS & TAGS PENCARIAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              {/* Hashtags */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Hashtags ({metadata.hashtags.length})</span>
                  </span>

                  <button
                    onClick={() => handleCopy(metadata.hashtags.join(' '), 'hashtags')}
                    className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {copiedHashtags ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHashtags ? 'Tersalin' : 'Salin Semua'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap gap-1.5">
                  {metadata.hashtags.map((h, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-indigo-950/70 border border-indigo-800/80 text-[11px] font-medium text-indigo-300"
                    >
                      {h.startsWith('#') ? h : `#${h}`}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Tags YouTube ({metadata.tags.length})</span>
                  </span>

                  <button
                    onClick={() => handleCopy(metadata.tags.join(', '), 'tags')}
                    className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {copiedTags ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTags ? 'Tersalin' : 'Salin Tags'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap gap-1.5">
                  {metadata.tags.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[11px] text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
