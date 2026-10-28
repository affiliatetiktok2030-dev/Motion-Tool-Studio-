import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Play,
  Pause,
  Download,
  Volume2,
  Sparkles,
  Sliders,
  Filter,
  Check,
  AlertCircle,
  RotateCcw,
  AudioWaveform as WaveformIcon,
  HelpCircle,
  Radio,
} from 'lucide-react';
import { DocumentaryProject } from '../types';

interface VoiceOverTabProps {
  project: DocumentaryProject | null;
  onGenerateTTS: (params: {
    voiceName: string;
    style: string;
    speed: number;
  }) => Promise<void>;
  isLoading: boolean;
  onProceedToVideoPrompts: () => void;
}

// Katalog suara resmi Gemini 3.8 Flash TTS
interface VoiceOption {
  id: 'Kore' | 'Fenrir' | 'Puck' | 'Charon' | 'Zephyr';
  name: string;
  gender: 'Wanita' | 'Pria';
  ageGroup: 'Dewasa' | 'Muda' | 'Matang';
  character: string;
  recommendedTone: string;
  badgeColor: string;
}

const OFFICIAL_VOICES: VoiceOption[] = [
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'Wanita',
    ageGroup: 'Dewasa',
    character: 'Tenang, jernih, artikulatif & berwibawa.',
    recommendedTone: 'Dokumenter Sains, Investigasi & Analisis Faktual',
    badgeColor: 'text-emerald-400 border-emerald-800 bg-emerald-950/60',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'Pria',
    ageGroup: 'Dewasa',
    character: 'Berat, tegas, otoritatif & bernuansa misterius.',
    recommendedTone: 'Sejarah Kelam, Tragedi, Militer & Konspirasi',
    badgeColor: 'text-indigo-400 border-indigo-800 bg-indigo-950/60',
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'Pria',
    ageGroup: 'Muda',
    character: 'Dinamis, hangat, ramah & komunikatif.',
    recommendedTone: 'Edukasi Populer, YouTube Shorts Modern & Sains Santai',
    badgeColor: 'text-cyan-400 border-cyan-800 bg-cyan-950/60',
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'Pria',
    ageGroup: 'Matang',
    character: 'Dalam, berbobot, reflektif & khidmat.',
    recommendedTone: 'Sejarah Kuno, Biografi Tokoh & Filosofi',
    badgeColor: 'text-amber-400 border-amber-800 bg-amber-950/60',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'Wanita',
    ageGroup: 'Dewasa',
    character: 'Lembut, elegan, puitis & berwawasan luas.',
    recommendedTone: 'Fenomena Alam, Eksplorasi Laut Dalam & Arkeologi',
    badgeColor: 'text-purple-400 border-purple-800 bg-purple-950/60',
  },
];

export const VoiceOverTab: React.FC<VoiceOverTabProps> = ({
  project,
  onGenerateTTS,
  isLoading,
  onProceedToVideoPrompts,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption['id']>('Kore');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Pria' | 'Wanita'>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('investigatif');
  const [selectedSpeed, setSelectedSpeed] = useState<number>(1.0);

  // Audio playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [fallbackSpeechActive, setFallbackSpeechActive] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioBase64 = project?.voiceOver?.audioBase64;
  const audioDataUrl = audioBase64 ? `data:audio/wav;base64,${audioBase64}` : null;

  // Filter katalog suara asli
  const filteredVoices = OFFICIAL_VOICES.filter((voice) => {
    if (genderFilter !== 'all' && voice.gender !== genderFilter) return false;
    return true;
  });

  // Handle Play/Pause
  const togglePlay = () => {
    if (audioDataUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    } else if (project?.cleanNarration) {
      // Fallback: Web Speech API browser jika audio TTS belum di-generate atau backend error
      if (window.speechSynthesis) {
        if (speechSynthesis.speaking) {
          speechSynthesis.cancel();
          setFallbackSpeechActive(false);
          setIsPlaying(false);
        } else {
          const utterance = new SpeechSynthesisUtterance(project.cleanNarration);
          utterance.lang = 'id-ID';
          utterance.rate = selectedSpeed;
          utterance.onend = () => {
            setFallbackSpeechActive(false);
            setIsPlaying(false);
          };
          speechSynthesis.speak(utterance);
          setFallbackSpeechActive(true);
          setIsPlaying(true);
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleDownloadAudio = () => {
    if (!audioDataUrl) return;
    const link = document.createElement('a');
    link.href = audioDataUrl;
    const safeTopic = (project?.topic || 'voiceover')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 25);
    link.download = `voiceover_${selectedVoice.toLowerCase()}_${safeTopic}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerate = () => {
    onGenerateTTS({
      voiceName: selectedVoice,
      style: selectedStyle,
      speed: selectedSpeed,
    });
  };

  const formatAudioTime = (sec: number) => {
    if (isNaN(sec)) return '00:00';
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Mic className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                3. Generator Voice-Over (TTS)
              </h2>
              <p className="text-xs text-slate-400">
                Layanan Text-to-Speech resmi Gemini Flash Audio 24kHz dengan karakter vokal dokumenter.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-950 border border-slate-700 text-slate-300 font-mono">
              Model: gemini-3.8-flash-lite-tts
            </span>
          </div>
        </div>

        {/* Text Preview to be spoken */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Teks Narasi yang Akan Disintesis
            </span>
            <span className="text-[11px] text-cyan-400 font-medium">
              {project?.cleanNarration.split(/\s+/).filter(Boolean).length || 0} Kata
            </span>
          </div>
          <p className="text-xs text-slate-300 line-clamp-2 italic leading-relaxed">
            &ldquo;{project?.cleanNarration || 'Belum ada naskah.'}&rdquo;
          </p>
        </div>

        {/* 1. Filter Katalog Suara Resmi */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Katalog Suara Resmi TTS (5 Karakter)</span>
            </label>

            {/* Filter Gender */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800 self-start sm:self-auto text-xs">
              <button
                type="button"
                onClick={() => setGenderFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  genderFilter === 'all'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('Pria')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  genderFilter === 'Pria'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pria
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('Wanita')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  genderFilter === 'Wanita'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Wanita
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredVoices.map((voice) => {
              const isSelected = selectedVoice === voice.id;

              return (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => setSelectedVoice(voice.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400/50 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{voice.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${voice.badgeColor}`}>
                        {voice.gender} • {voice.ageGroup}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-snug mb-1.5">
                    {voice.character}
                  </p>

                  <div className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/80">
                    <span className="text-cyan-400/80 font-semibold">Cocok untuk:</span> {voice.recommendedTone}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Filter Gaya Bicara & Kecepatan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
          <div>
            <label htmlFor="style-select" className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Gaya Bicara / Artikulasi</span>
            </label>
            <select
              id="style-select"
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:border-cyan-400 outline-none"
            >
              <option value="investigatif">Investigatif (Serius, Tajam, Pacing Ketat)</option>
              <option value="sinematik">Sinematik (Dramatis, Khidmat, Bobot Emosional)</option>
              <option value="edukatif">Edukatif Antusias (Lugas, Cepat & Jelas)</option>
              <option value="misteri">Misteri & Suspense (Perlahan & Tegang)</option>
            </select>
          </div>

          <div>
            <label htmlFor="speed-select" className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Kecepatan Bicara ({selectedSpeed}x)</span>
            </label>
            <div className="flex items-center gap-2">
              {[0.85, 1.0, 1.15, 1.25].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setSelectedSpeed(spd)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedSpeed === spd
                      ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Action Tombol Generate */}
        <div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !project?.cleanNarration}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-indigo-600 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white shadow-xl shadow-cyan-950/60 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Memproses Sintesis Audio Suara {selectedVoice}...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Voice-Over Resmi (Gemini TTS)</span>
              </>
            )}
          </button>
        </div>

        {/* 4. Pemutar Audio & Unduh MP3/WAV */}
        {(audioDataUrl || fallbackSpeechActive) && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/50 border border-cyan-800/80 shadow-2xl space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Audio Player • Suara {project?.voiceOver?.voiceName || selectedVoice}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                WAV / 24kHz Mono
              </span>
            </div>

            {/* Audio waveform visualization bars */}
            <div className="flex items-center justify-center gap-1 h-12 px-2 py-1 bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden">
              {Array.from({ length: 36 }).map((_, i) => {
                const heightPercent = isPlaying
                  ? Math.sin((i + Date.now() / 200) * 0.5) * 35 + 50
                  : (i % 5) * 12 + 25;
                return (
                  <div
                    key={i}
                    style={{ height: `${Math.max(15, Math.min(95, heightPercent))}%` }}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isPlaying ? 'bg-gradient-to-t from-cyan-500 to-emerald-400' : 'bg-slate-700'
                    }`}
                  />
                );
              })}
            </div>

            {/* Hidden HTML5 Audio Element */}
            {audioDataUrl && (
              <audio
                ref={audioRef}
                src={audioDataUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            )}

            {/* Audio Seek bar */}
            {audioDataUrl && (
              <div className="space-y-1">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  aria-label="Progress pemutar audio"
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>{formatAudioTime(currentTime)}</span>
                  <span>{formatAudioTime(duration)}</span>
                </div>
              </div>
            )}

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Jeda Audio' : 'Putar Audio'}
                  className="w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-950/60 active:scale-95 transition-all cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                <div>
                  <p className="text-xs font-semibold text-white">
                    {isPlaying ? 'Sedang Memutar Voice-Over' : 'Siap Diputar'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Karakter: {selectedVoice} ({selectedStyle})
                  </p>
                </div>
              </div>

              {audioDataUrl && (
                <button
                  type="button"
                  onClick={handleDownloadAudio}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download Audio (.WAV)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Audio narasi siap? Lanjutkan ke generator Prompt Video 9:16 untuk instruksi visual motion graphics.
          </p>
          <button
            type="button"
            onClick={onProceedToVideoPrompts}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <span>Lanjut ke Prompt Video 9:16</span>
          </button>
        </div>
      </section>
    </div>
  );
};
