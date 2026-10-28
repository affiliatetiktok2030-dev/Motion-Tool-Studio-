import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Play,
  Pause,
  Mic,
  Film,
  FileText,
  Youtube,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DocumentaryProject } from '../types';
import {
  calculateNarrationMetrics,
  generateCleanScriptTxt,
  generateMasterPromptDocument,
} from '../utils/scriptParser';

interface UnifiedStudioProps {
  project: DocumentaryProject | null;
  onGenerateAll: (topic: string) => Promise<void>;
  onGenerateTTS: (params: { voiceName: string; style: string; speed: number }) => Promise<void>;
  onUpdateCleanNarration: (newText: string) => void;
  isLoading: boolean;
  isLoadingTTS: boolean;
}

const OFFICIAL_VOICES = [
  { id: 'Kore', name: 'Kore (Wanita)', desc: 'Jernih & Artikulatif (Dokumenter Sains/Investigasi)' },
  { id: 'Fenrir', name: 'Fenrir (Pria)', desc: 'Berat & Otoritatif (Sejarah Kelam & Misteri)' },
  { id: 'Puck', name: 'Puck (Pria)', desc: 'Dinamis & Edukatif (Shorts Modern)' },
  { id: 'Charon', name: 'Charon (Pria)', desc: 'Dalam & Khidmat (Sejarah Kuno & Tragedi)' },
  { id: 'Zephyr', name: 'Zephyr (Wanita)', desc: 'Lembut & Naratif (Fenomena Alam)' },
];

export const UnifiedStudio: React.FC<UnifiedStudioProps> = ({
  project,
  onGenerateAll,
  onGenerateTTS,
  onUpdateCleanNarration,
  isLoading,
  isLoadingTTS,
}) => {
  const [topicInput, setTopicInput] = useState(project?.topic || '');
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [showSources, setShowSources] = useState<boolean>(false);

  // Copy status indicators
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [copiedTitle, setCopiedTitle] = useState<boolean>(false);
  const [copiedDesc, setCopiedDesc] = useState<boolean>(false);
  const [copiedHashtags, setCopiedHashtags] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cleanNarration = project?.cleanNarration || '';
  const metrics = calculateNarrationMetrics(cleanNarration);
  const audioDataUrl = project?.voiceOver?.audioBase64
    ? `data:audio/wav;base64,${project.voiceOver.audioBase64}`
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim() || isLoading) return;
    onGenerateAll(topicInput.trim());
  };

  // Download Naskah Bersih (.TXT)
  const handleDownloadScript = () => {
    if (!project || !cleanNarration) return;
    const txt = generateCleanScriptTxt(project.topic, cleanNarration, metrics.formattedDuration);
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = project.topic.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 25);
    link.download = `naskah_${safeName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Salin Naskah
  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(cleanNarration);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } catch {
      // fallback
    }
  };

  // Play / Pause Audio
  const togglePlay = () => {
    if (audioDataUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    } else if (cleanNarration && window.speechSynthesis) {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const u = new SpeechSynthesisUtterance(cleanNarration);
        u.lang = 'id-ID';
        u.onend = () => setIsPlaying(false);
        speechSynthesis.speak(u);
        setIsPlaying(true);
      }
    }
  };

  // Download Audio
  const handleDownloadAudio = () => {
    if (!audioDataUrl || !project) return;
    const link = document.createElement('a');
    link.href = audioDataUrl;
    const safeName = project.topic.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 25);
    link.download = `voiceover_${safeName}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Prompt Render Video TXT
  const handleDownloadPrompt = () => {
    if (!project) return;
    const doc = generateMasterPromptDocument(project);
    const blob = new Blob([doc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = project.topic.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 25);
    link.download = `perintah_render_${safeName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Salin Perintah Render
  const handleCopyPrompt = async () => {
    if (!project) return;
    const doc = generateMasterPromptDocument(project);
    try {
      await navigator.clipboard.writeText(doc);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      // fallback
    }
  };

  // Format satu paket gabungan: 1 Judul Terbaik + Deskripsi + Hashtag campur
  const bestTitle = project?.metadata?.selectedTitle || project?.metadata?.titles?.[0]?.title || project?.topic || '';

  const formatAudioTime = (sec: number) => {
    if (isNaN(sec)) return '00:00';
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          SATU KOLOM INPUT TOPIK
          ========================================================================= */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-3">
          <label
            htmlFor="main-topic-input"
            className="block text-sm font-bold text-white flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Masukkan Topik Dokumenter</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              id="main-topic-input"
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Masukkan topik video Anda... (contoh: Misteri Kapal Ourang Medan 1947)"
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-3.5 text-sm sm:text-base text-white placeholder-slate-500 outline-none transition-all"
              required
            />
            <button
              type="submit"
              disabled={isLoading || !topicInput.trim()}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-indigo-600 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white shadow-xl shadow-cyan-950/60 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer flex-shrink-0"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sedang Membuat...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Buat Naskah &amp; Konten</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            Cukup masukkan topik di atas. Sistem otomatis menyusun naskah (dimulai dengan hook 3 detik), menyiapkan voice-over, perintah render video, dan judul terbaik beserta deskripsi hashtag.
          </p>
        </form>
      </section>

      {/* =========================================================================
          HASIL LENGKAP: 4 BAGIAN UTAMA
          ========================================================================= */}
      {project && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* 1. KOLOM NASKAH (HOOK 3 DETIK PERTAMA LANGSUNG MASUK DI AWAL NASKAH) */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    1. Naskah Narasi Dokumenter
                  </h3>
                  <p className="text-xs text-slate-400">
                    Naskah bersih langsung diawali Hook 3 detik pertama untuk narator.
                  </p>
                </div>
              </div>

              {/* Action Buttons for Script */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 active:scale-95 transition-all"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Salin Naskah</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadScript}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/60 active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Naskah (.TXT)</span>
                </button>
              </div>
            </div>

            {/* Metrics Bar */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400">
                Panjang: <strong className="text-white">{metrics.wordCount} kata</strong> (~{metrics.characterCount} karakter)
              </span>
              <span className="text-cyan-400 font-bold">
                Estimasi Durasi: {metrics.formattedDuration} (Target ~60s)
              </span>
            </div>

            {/* Editable Script Textarea */}
            <div>
              <textarea
                value={cleanNarration}
                onChange={(e) => onUpdateCleanNarration(e.target.value)}
                rows={8}
                aria-label="Editor naskah narasi"
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl p-3.5 text-xs sm:text-sm text-white font-mono leading-relaxed outline-none"
              />
            </div>

            {/* Sumber & Fakta Verifikasi (Opsional & Rapi) */}
            <div>
              <button
                type="button"
                onClick={() => setShowSources(!showSources)}
                className="w-full py-2 px-3 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Rujukan Sumber Web Terpercaya &amp; Fakta ({project.sources?.length || 0} Sumber)</span>
                </div>
                {showSources ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {showSources && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {project.sources?.map((s) => (
                      <a
                        key={s.id}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-xs flex items-start justify-between gap-2 group"
                      >
                        <div>
                          <p className="font-semibold text-slate-200 group-hover:text-cyan-300 line-clamp-1">
                            {s.title}
                          </p>
                          <p className="text-[10px] text-cyan-400 uppercase">{s.publisher}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 flex-shrink-0 mt-0.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 2. KOLOM VOICE-OVER (AUDIO NARATOR & UNDUH WAV) */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                  <Mic className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    2. Voice-Over (Audio Narator)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sintesis suara Text-to-Speech resmi Gemini Flash Audio 24kHz.
                  </p>
                </div>
              </div>

              {audioDataUrl && (
                <button
                  type="button"
                  onClick={handleDownloadAudio}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Audio (.WAV)</span>
                </button>
              )}
            </div>

            {/* Pilihan Suara Resmi */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-300">
                Pilih Karakter Suara:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {OFFICIAL_VOICES.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVoice(v.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedVoice === v.id
                        ? 'bg-indigo-950/70 border-indigo-500 ring-1 ring-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="font-bold text-xs text-white">{v.name}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{v.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Tombol Buat Voice-Over */}
            <div>
              <button
                type="button"
                onClick={() =>
                  onGenerateTTS({
                    voiceName: selectedVoice,
                    style: 'investigatif',
                    speed: 1.0,
                  })
                }
                disabled={isLoadingTTS || !cleanNarration}
                className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoadingTTS ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses Audio Suara {selectedVoice}...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Buat Voice-Over (Audio Suara {selectedVoice})</span>
                  </>
                )}
              </button>
            </div>

            {/* Pemutar Audio */}
            {(audioDataUrl || isPlaying) && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                {audioDataUrl && (
                  <audio
                    ref={audioRef}
                    src={audioDataUrl}
                    onTimeUpdate={() => {
                      if (audioRef.current) {
                        setCurrentTime(audioRef.current.currentTime);
                        setDuration(audioRef.current.duration || 0);
                      }
                    }}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                )}

                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Jeda Audio' : 'Putar Audio'}
                  className="w-10 h-10 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow flex-shrink-0 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                    <span>{isPlaying ? 'Memutar Audio Narasi' : 'Audio Narasi Siap'}</span>
                    <span>{formatAudioTime(currentTime)} / {formatAudioTime(duration || 60)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                      className="h-full bg-cyan-400 transition-all duration-150"
                    />
                  </div>
                </div>

                {audioDataUrl && (
                  <button
                    type="button"
                    onClick={handleDownloadAudio}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
                    title="Unduh File Audio"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                  </button>
                )}
              </div>
            )}
          </section>

          {/* 3. KOLOM PERINTAH RENDER VIDEO (PROMPT MASTER 9:16 - SIAP SALIN UNTUK RENDER) */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Film className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    3. Perintah Render Video (Prompt 9:16)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Instruksi lengkap setting render (1080x1920, Hook visual 3 detik, peta animasi, foto arsip 2.5D).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 active:scale-95 transition-all"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Salin Perintah Render</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPrompt}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download (.TXT)</span>
                </button>
              </div>
            </div>

            {/* Prompt Render Textbox */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed max-h-[260px] overflow-y-auto whitespace-pre-wrap select-all">
              {generateMasterPromptDocument(project)}
            </div>
          </section>

          {/* 4. METADATA YOUTUBE (KOLOM TERPISAH: JUDUL, DESKRIPSI, DAN HASHTAG) */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <Youtube className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  4. Metadata YouTube (Kolom Terpisah)
                </h3>
                <p className="text-xs text-slate-400">
                  Judul, deskripsi, dan hashtag masing-masing memiliki tombol salin terpisah.
                </p>
              </div>
            </div>

            {/* A. KOLOM JUDUL TERBAIK (TERPISAH) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="youtube-title" className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Judul Terbaik Rekomendasi
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(bestTitle);
                    setCopiedTitle(true);
                    setTimeout(() => setCopiedTitle(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 active:scale-95 transition-all"
                >
                  {copiedTitle ? (
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
              <input
                id="youtube-title"
                type="text"
                readOnly
                value={bestTitle}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm font-bold text-white outline-none select-all"
              />
            </div>

            {/* B. KOLOM DESKRIPSI (TERPISAH) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="youtube-description" className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Deskripsi Lengkap &amp; Rujukan Sumber
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(project.metadata?.description || '');
                    setCopiedDesc(true);
                    setTimeout(() => setCopiedDesc(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 active:scale-95 transition-all"
                >
                  {copiedDesc ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Salin Deskripsi</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                id="youtube-description"
                readOnly
                rows={7}
                value={project.metadata?.description || ''}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 leading-relaxed outline-none select-all"
              />
            </div>

            {/* C. KOLOM HASHTAG (TERPISAH) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="youtube-hashtags" className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Hashtag Relevan
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    const hashString = (project.metadata?.hashtags || [])
                      .map((h) => (h.startsWith('#') ? h : `#${h}`))
                      .join(' ');
                    await navigator.clipboard.writeText(hashString);
                    setCopiedHashtags(true);
                    setTimeout(() => setCopiedHashtags(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-700 active:scale-95 transition-all"
                >
                  {copiedHashtags ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Salin Hashtag</span>
                    </>
                  )}
                </button>
              </div>
              <input
                id="youtube-hashtags"
                type="text"
                readOnly
                value={(project.metadata?.hashtags || [])
                  .map((h) => (h.startsWith('#') ? h : `#${h}`))
                  .join(' ')}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-indigo-300 outline-none select-all"
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
