import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StepTabs, ActiveTabId } from './components/StepTabs';
import { ResearchScriptTab } from './components/ResearchScriptTab';
import { DownloadScriptTab } from './components/DownloadScriptTab';
import { VoiceOverTab } from './components/VoiceOverTab';
import { VideoPromptTab } from './components/VideoPromptTab';
import { MetadataTab } from './components/MetadataTab';
import { UnifiedStudio } from './components/UnifiedStudio';
import { NewProjectModal } from './components/NewProjectModal';
import { DocumentaryProject } from './types';
import {
  extractCleanNarration,
  joinSegmentsToCleanNarration,
  composeYouTubeDescription,
} from './utils/scriptParser';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

// Seed data awal dokumenter berkualitas tinggi agar pengguna bisa langsung menguji studio
const INITIAL_DEMO_PROJECT: DocumentaryProject = {
  id: 'proj-ourang-medan',
  topic: 'Misteri Kapal Ourang Medan 1947',
  targetDurationSeconds: 60,
  tone: 'investigatif',
  focusAngle: 'Analisis telegraf maritim, mayat membeku di Selat Malaka, dan hipotesis gas beracun.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sources: [
    {
      id: 'src-1',
      title: 'Proceedings of the Merchant Marine Council (1952)',
      publisher: 'U.S. Coast Guard Archive',
      url: 'https://www.dco.uscg.mil',
      dateOrSnippet: 'Mei 1952: Catatan investigasi resmi sinyal darurat SOS radio maritim di Selat Malaka.',
      credibilityNote: 'Dokumen Arsip Resmi Penjaga Pantai AS',
    },
    {
      id: 'src-2',
      title: 'The De Telegraaf Historical Maritime Articles (1948)',
      publisher: 'De Telegraaf Archive Netherlands',
      url: 'https://www.delpher.nl',
      dateOrSnippet: 'Oktober 1948: Laporan surat kabar Belanda tentang kapal kargo Silver Star.',
      credibilityNote: 'Arsip Berita Maritim Sezaman',
    },
    {
      id: 'src-3',
      title: 'Lloyd’s Register of Shipping Historical Verification',
      publisher: 'Lloyd’s Register Foundation',
      url: 'https://hec.lrfoundation.org.uk',
      dateOrSnippet: 'Tidak ditemukan registrasi nama Ourang Medan dalam buku induk pelayaran 1940-1950.',
      credibilityNote: 'Database Pelayaran Maritim Internasional',
    },
  ],
  facts: [
    {
      id: 'f1',
      claim: 'Kapal penolong Silver Star menemukan awak kapal tewas dengan posisi mata terbelalak.',
      category: 'verified',
      sourceTitle: 'Proceedings of the Merchant Marine Council (1952)',
      sourceUrl: 'https://www.dco.uscg.mil',
      explanation: 'Tercatat dalam laporan resmi kapten Silver Star saat menaiki dek kapal.',
    },
    {
      id: 'f2',
      claim: 'Kematian serentak disebabkan kebocoran gas beracun atau asam hidrosianat tanpa luka fisik.',
      category: 'hypothesis',
      sourceTitle: 'Analisis Toksikologi Maritim',
      explanation: 'Hipotesis paling rasional para peneliti karena tidak ditemukan bekas perkelahian di lambung kapal.',
    },
    {
      id: 'f3',
      claim: 'Kapal diserang fenomena paranormal atau piring terbang alien di langit Selat Malaka.',
      category: 'unproven',
      sourceTitle: 'Cerita Urban & Fiksi Populer 1950-an',
      explanation: 'Sensasionalisme tabloid tanpa dasar bukti fisik maupun dokumen navigasi yang valid.',
    },
  ],
  segments: [
    {
      id: 'seg-1',
      timeRange: '00:00 - 00:03',
      secondsRange: [0, 3],
      cueType: 'hook',
      narrationText: 'Tiga kapal maritim menerima pesan telegraf mengerikan dari Selat Malaka.',
      visualDirection: 'Zoom kinetik cepat ke gelombang radio menyala di atas peta navigasi gelap.',
      factTag: 'verified',
    },
    {
      id: 'seg-2',
      timeRange: '00:03 - 00:15',
      secondsRange: [3, 15],
      cueType: 'setup',
      narrationText: 'Juni 1947. Operator radio mengetik: "Semua perwira termasuk kapten terbaring kaku. Saya sekarat." Lalu sinyal terputus.',
      visualDirection: 'Peta rute navigasi Selat Malaka dengan transisi koordinat GPS berdenyut merah.',
      factTag: 'verified',
    },
    {
      id: 'seg-3',
      timeRange: '00:15 - 00:35',
      secondsRange: [15, 35],
      cueType: 'investigasi',
      narrationText: 'Saat tim kapal Silver Star menaiki dek, seluruh kru ditemukan tewas tanpa setetes darah pun. Tubuh mereka membeku menghadap matahari dengan ekspresi ketakutan luar biasa.',
      visualDirection: 'Foto arsip kapal 2.5D halftone hitam putih dengan efek kamera parallax lambat.',
      factTag: 'verified',
    },
    {
      id: 'seg-4',
      timeRange: '00:35 - 00:50',
      secondsRange: [35, 50],
      cueType: 'fakta',
      narrationText: 'Para pakar menduga kapal ini menyelundupkan gas beracun ilegal sisa perang yang bocor ke sistem ventilasi, sebelum ledakan misterius menenggelamkan kapal ke dasar samudera.',
      visualDirection: 'Grafik isometrik lambung kargo kapal dengan simulasi aliran gas tak kasat mata.',
      factTag: 'hypothesis',
    },
    {
      id: 'seg-5',
      timeRange: '00:50 - 01:00',
      secondsRange: [50, 60],
      cueType: 'cta',
      narrationText: 'Hingga kini bangkai Ourang Medan tak pernah ditemukan. Apakah ini kecelakaan kimia rahasia, atau konspirasi militer? Tulis analisis kalian di kolom komentar.',
      visualDirection: 'Teks tebal di layar dengan animasi gelombang laut dalam dan tombol Subscribe.',
      factTag: 'verified',
    },
  ],
  cleanNarration: `Tiga kapal maritim menerima pesan telegraf mengerikan dari Selat Malaka.

Juni 1947. Operator radio mengetik: "Semua perwira termasuk kapten terbaring kaku. Saya sekarat." Lalu sinyal terputus.

Saat tim kapal Silver Star menaiki dek, seluruh kru ditemukan tewas tanpa setetes darah pun. Tubuh mereka membeku menghadap matahari dengan ekspresi ketakutan luar biasa.

Para pakar menduga kapal ini menyelundupkan gas beracun ilegal sisa perang yang bocor ke sistem ventilasi, sebelum ledakan misterius menenggelamkan kapal ke dasar samudera.

Hingga kini bangkai Ourang Medan tak pernah ditemukan. Apakah ini kecelakaan kimia rahasia, atau konspirasi militer? Tulis analisis kalian di kolom komentar.`,
  voiceOver: {
    voiceName: 'Fenrir',
    gender: 'Pria',
    character: 'Berat, tegas, otoritatif & misterius',
    style: 'investigatif',
    speed: 1.0,
  },
  storyboard: {
    conceptApproved: false,
    aspectRatio: '9:16',
    resolution: '1080x1920',
    visualStyle: 'Documentary Motion Graphics (Atmospheric Noir)',
    first3SecondsVisualHook: 'Sudden orthographic snap to glowing nautical radar sweep in Malacca Strait with audio waveform pulse.',
    colorGradePalette: ['#0A0F1D', '#00F0FF', '#D4AF37', '#E2E8F0'],
    scenes: [
      {
        sceneNumber: 1,
        timeRange: '00:00 - 00:03',
        narrationExcerpt: 'Tiga kapal maritim menerima pesan telegraf mengerikan dari Selat Malaka.',
        motionType: 'animated_map',
        isAiReconstruction: false,
        visualHookNote: 'Kinetic 3-second hook for mobile vertical screen',
        cameraMovement: 'Fast push-in zoom with 24fps motion blur onto navigational coordinates',
        screenElements: ['Glowing GPS coordinates', 'Telegraph Morse audio waveform', 'Radar grid overlay'],
        masterPrompt: 'Cinematic 9:16 vertical motion graphics, 1080x1920, documentary style, top-down orthographic sea chart of Malacca Strait, glowing cyan radar sweep, Morse code telegraph soundwaves vibrating across nautical map, high contrast, clean typography, 8k resolution textures, no blur, no cartoon.',
        negativePrompt: 'cartoon, saturated anime, 3d toy render, horizontal 16:9, watermark, blur, distorted',
      },
      {
        sceneNumber: 2,
        timeRange: '00:03 - 00:15',
        narrationExcerpt: 'Juni 1947. Operator radio mengetik: "Semua perwira termasuk kapten terbaring kaku. Saya sekarat." Lalu sinyal terputus.',
        motionType: 'timeline',
        isAiReconstruction: false,
        cameraMovement: 'Vertical downward pan along glowing distress timeline',
        screenElements: ['Distress signal quotation', '1947 date stamp', 'Vessel radio transmitter'],
        masterPrompt: 'Vertical 9:16 documentary motion graphics, 1080x1920, vintage 1947 maritime radio apparatus, teletype transcript typed letter-by-letter on screen, moody low key studio lighting, glowing amber tubes, cinematic atmospheric dust particles, 4k detail.',
        negativePrompt: 'low quality, blurry, 16:9, oversaturated, deformed text',
      },
      {
        sceneNumber: 3,
        timeRange: '00:15 - 00:35',
        narrationExcerpt: 'Saat tim kapal Silver Star menaiki dek, seluruh kru ditemukan tewas tanpa setetes darah pun...',
        motionType: 'archival_photo',
        isAiReconstruction: false,
        cameraMovement: '2.5D depth parallax camera drift with subtle halftone film grain',
        screenElements: ['De Telegraaf 1948 headline', 'Deck blueprint', 'Magnifying glass inspection'],
        masterPrompt: '9:16 vertical motion graphic documentary shot, 1080x1920, historic archival black and white photograph treatment, 35mm film grain, 2.5D parallax separation of ship deck silhouette against tropical misty ocean, dramatic cinematic lighting, archival photo aesthetic.',
        negativePrompt: 'color cartoon, saturated, disfigured, 16:9, bright daylight',
      },
      {
        sceneNumber: 4,
        timeRange: '00:35 - 00:50',
        narrationExcerpt: 'Para pakar menduga kapal ini menyelundupkan gas beracun ilegal sisa perang...',
        motionType: 'isometric_chart',
        isAiReconstruction: true,
        cameraMovement: 'Slow rotating 45-degree isometric wireframe slice of cargo holds',
        screenElements: ['Cargo hold cross-section', 'Toxic gas dispersion arrows', 'Chemical formula tag'],
        masterPrompt: 'Vertical 9:16 documentary motion graphics, 1080x1920, isometric technical 3D schematic diagram of merchant cargo vessel holds, glowing cyan wireframe revealing sealed pressurized containers, subtle toxic vapor dispersion particle flow, technical blueprint aesthetic, overlay text "Rekonstruksi Visual AI".',
        negativePrompt: 'fake photo pretending to be real archive, messy, low res, horizontal',
      },
      {
        sceneNumber: 5,
        timeRange: '00:50 - 01:00',
        narrationExcerpt: 'Hingga kini bangkai Ourang Medan tak pernah ditemukan. Apakah ini kecelakaan kimia rahasia, atau konspirasi militer?',
        motionType: 'animated_map',
        isAiReconstruction: false,
        cameraMovement: 'Deep vertical ocean abyss zoom-out, transition to bold call-to-action cards',
        screenElements: ['Abyssal bathymetry depth meter', 'Question mark prompt', 'Subscribe button CTA'],
        masterPrompt: 'Vertical 9:16 motion graphics, 1080x1920, dark abyssal oceanic trench bathymetry scan, sonar ping echoing in deep midnight blue water, large typography question mark dissolving into modern YouTube Shorts Subscribe card, elegant cinematic documentary finish.',
        negativePrompt: 'cheap graphic, bright neon rainbow, 16:9, watermark',
      },
    ],
  },
  metadata: {
    titles: [
      {
        id: 't-1',
        title: 'Misteri Kapal Ourang Medan: Bukti Arsip 1947 & Hipotesis Gas Kimia',
        style: 'investigatif',
        estimatedCtr: 'Tinggi (9.4%) - Menyoroti fakta historis & data arsip',
      },
      {
        id: 't-2',
        title: 'Awak Kapal Mati Membeku di Selat Malaka: Apa yang Terjadi pada Ourang Medan?',
        style: 'pertanyaan',
        estimatedCtr: 'Sangat Tinggi (11.2%) - Memantik rasa penasaran alami',
      },
      {
        id: 't-3',
        title: 'Tragedi Ourang Medan 1947: Catatan Resmi Penjaga Pantai AS',
        style: 'faktual',
        estimatedCtr: 'Kredibel (8.8%) - Menegaskan keaslian sumber primer',
      },
      {
        id: 't-4',
        title: 'Pesan Telegraf Terakhir: Fakta di Balik Misteri Kapal Hantu Terbesar Indonesia',
        style: 'urgensi',
        estimatedCtr: 'Viral (10.5%) - Kuat pada hook geografis lokal',
      },
    ],
    selectedTitle: 'Misteri Kapal Ourang Medan: Bukti Arsip 1947 & Hipotesis Gas Kimia',
    description: `Investigasi mendalam mengenai insiden maritim misterius Kapal Ourang Medan di perairan Selat Malaka pada Juni 1947. Berdasarkan arsip Proceedings of the Merchant Marine Council (U.S. Coast Guard 1952) dan laporan koran De Telegraaf 1948.

⏱️ TIMELINE & CHAPTERS:
00:00 - Hook 3 Detik: Sinyal Darurat Misterius
00:03 - Laporan Telegraf Maritim 1947
00:15 - Penemuan Dek Kapal Silver Star
00:35 - Hipotesis Kebocoran Gas Kimia Ilegal
00:50 - Kesimpulan & Diskusi Publik

📚 SUMBER RISET & REFERENSI TERPERCAYA:
1. Proceedings of the Merchant Marine Council (U.S. Coast Guard Archive)
   Tautan: https://www.dco.uscg.mil
2. The De Telegraaf Historical Maritime Articles (1948)
   Tautan: https://www.delpher.nl
3. Lloyd’s Register of Shipping Historical Verification
   Tautan: https://hec.lrfoundation.org.uk

⚠️ CATATAN JURNALISTIK:
Video ini memisahkan fakta terverifikasi (laporan perwira kapal Silver Star), dugaan analitis (kebocoran asam hidrosianat), dan klaim sensasional yang belum terbukti secara ilmiah.

#Shorts #Dokumenter #SejarahIndonesia #MisteriMaritim #OurangMedan #FaktaSejarah`,
    hashtags: ['#Shorts', '#Dokumenter', '#MisteriMaritim', '#OurangMedan', '#SejarahIndonesia', '#FaktaSejarah', '#EdukasiYouTube'],
    tags: [
      'kapal ourang medan',
      'misteri ourang medan 1947',
      'selat malaka misteri',
      'dokumenter pendek sejarah',
      'kapal hantu indonesia',
      'fakta kapal silver star',
      'gas kimia perang dunia',
      'youtube shorts dokumenter',
      'motion graphics dokumenter',
    ],
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTabId | 'unified'>('unified');
  const [project, setProject] = useState<DocumentaryProject | null>(INITIAL_DEMO_PROJECT);
  const [apiStatus, setApiStatus] = useState<{ configured: boolean; checking: boolean }>({
    configured: false,
    checking: true,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState<boolean>(false);

  // Scroll to top upon tab transition for optimal mobile experience
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  // Check API health on mount
  useEffect(() => {
    async function checkApi() {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          setApiStatus({ configured: Boolean(data.configured), checking: false });
        } else {
          setApiStatus({ configured: false, checking: false });
        }
      } catch {
        setApiStatus({ configured: false, checking: false });
      }
    }
    checkApi();
  }, []);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification((curr) => (curr?.text === text ? null : curr));
    }, 4500);
  };

  // 1. Generate Lengkap: Cukup satu input topik -> otomatis buat naskah, prompt, dan metadata
  const handleGenerateAll = async (topic: string) => {
    setIsLoading(true);
    setNotification(null);
    try {
      const res = await fetch('/api/research-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          durationSeconds: 60,
          tone: 'investigatif',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses riset dan naskah.');
      }

      const cleanNarration = data.cleanNarration || joinSegmentsToCleanNarration(data.segments);

      const newProject: DocumentaryProject = {
        id: `proj-${Date.now()}`,
        topic,
        targetDurationSeconds: 60,
        tone: 'investigatif',
        focusAngle: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sources: data.sources || [],
        facts: data.facts || [],
        segments: data.segments || [],
        cleanNarration,
        voiceOver: {
          voiceName: 'Kore',
          gender: 'Wanita',
          character: 'Tenang & Artikulatif',
          style: 'investigatif',
          speed: 1.0,
        },
        storyboard: {
          conceptApproved: true,
          aspectRatio: '9:16',
          resolution: '1080x1920',
          visualStyle: 'Documentary Motion Graphics (Atmospheric Noir)',
          first3SecondsVisualHook: 'Top-down orthographic view peta topografi bercahaya dengan akselerasi kinetik ke koordinat rahasia.',
          colorGradePalette: ['#0A0F1D', '#00F0FF', '#D4AF37', '#E2E8F0'],
          scenes: (data.segments || []).map((seg: any, idx: number) => ({
            sceneNumber: idx + 1,
            timeRange: seg.timeRange || `00:${idx * 12} - 00:${(idx + 1) * 12}`,
            narrationExcerpt: seg.narrationText?.slice(0, 70) || '',
            motionType: idx === 0 ? 'animated_map' : idx === 2 ? 'archival_photo' : 'timeline',
            isAiReconstruction: false,
            masterPrompt: `Cinematic 9:16 vertical motion graphics, 1080x1920, documentary style, scene ${idx + 1} for topic "${topic}", high contrast, realistic archival lighting.`,
            negativePrompt: 'cartoon, low quality, 16:9, blur',
            cameraMovement: 'Subtle slow cinematic pan and zoom',
            screenElements: ['Nautical chart overlay', 'Date stamp', 'Archival texture'],
          })),
        },
        metadata: {
          titles: [
            {
              id: 't-1',
              title: `${topic}: Fakta Terverifikasi & Misteri yang Belum Terpecahkan`,
              style: 'investigatif',
              estimatedCtr: 'Tinggi (9.5%) - Fokus pada bukti faktual',
            },
            {
              id: 't-2',
              title: `Apa yang Sebenarnya Terjadi? Menguak Fakta di Balik ${topic}`,
              style: 'pertanyaan',
              estimatedCtr: 'Sangat Tinggi (11.0%) - Menarik rasa ingin tahu',
            },
          ],
          selectedTitle: `${topic}: Fakta Terverifikasi & Misteri yang Belum Terpecahkan`,
          description: composeYouTubeDescription(topic, data.segments || [], data.sources || [], ['#Shorts', '#Dokumenter', '#FaktaSejarah']),
          hashtags: ['#Shorts', '#Dokumenter', '#FaktaSejarah', '#Investigasi'],
          tags: [topic.toLowerCase(), 'dokumenter pendek', 'youtube shorts', 'fakta sejarah'],
        },
      };

      setProject(newProject);
      showToast('success', `Naskah untuk "${topic}" berhasil dibuat! Siap dibuat voice-over dan diunduh.`);

      // Latar belakang: sempurnakan prompt video & metadata SEO dari endpoint khusus
      try {
        fetch('/api/video-prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, segments: data.segments, tone: 'investigatif' }),
        })
          .then((r) => r.json())
          .then((promptData) => {
            if (promptData?.scenes) {
              setProject((prev) =>
                prev
                  ? {
                      ...prev,
                      storyboard: {
                        ...prev.storyboard,
                        ...promptData,
                        conceptApproved: true,
                      },
                    }
                  : null
              );
            }
          })
          .catch(() => {});

        fetch('/api/metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, summary: topic, segments: data.segments, sources: data.sources }),
        })
          .then((r) => r.json())
          .then((metaData) => {
            if (metaData?.titles) {
              setProject((prev) =>
                prev
                  ? {
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        ...metaData,
                      },
                    }
                  : null
              );
            }
          })
          .catch(() => {});
      } catch {
        // non-blocking
      }
    } catch (err: any) {
      showToast('error', err.message || 'Terjadi kesalahan saat memproses riset.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Generate Riset & Naskah Narasi (dari form detail)
  const handleGenerateResearch = async (params: {
    topic: string;
    durationSeconds: number;
    tone: 'investigatif' | 'sinematik' | 'populer' | 'misteri';
    focusAngle: string;
  }) => {
    return handleGenerateAll(params.topic);
  };

  // Update raw clean narration text
  const handleUpdateCleanNarration = (newText: string) => {
    if (!project) return;
    setProject({
      ...project,
      cleanNarration: newText,
      updatedAt: new Date().toISOString(),
    });
  };

  // Update segment narration text
  const handleUpdateSegment = (segmentId: string, updatedNarration: string) => {
    if (!project) return;
    const updatedSegments = project.segments.map((s) =>
      s.id === segmentId ? { ...s, narrationText: updatedNarration } : s
    );
    setProject({
      ...project,
      segments: updatedSegments,
      cleanNarration: joinSegmentsToCleanNarration(updatedSegments),
      updatedAt: new Date().toISOString(),
    });
  };

  // 2. Generate Voice-Over TTS
  const handleGenerateTTS = async (params: {
    voiceName: string;
    style: string;
    speed: number;
  }) => {
    if (!project) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: project.cleanNarration,
          voiceName: params.voiceName,
          style: params.style,
          speed: params.speed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghasilkan voice-over TTS.');
      }

      setProject({
        ...project,
        voiceOver: {
          ...project.voiceOver,
          voiceName: params.voiceName as any,
          style: params.style as any,
          speed: params.speed,
          audioBase64: data.audioBase64,
          mimeType: data.mimeType || 'audio/wav',
          generatedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      });

      showToast('success', `Audio voice-over karakter "${params.voiceName}" siap diputar!`);
    } catch (err: any) {
      showToast('error', err.message || 'Terjadi kesalahan saat memproses TTS.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Generate Video Prompts
  const handleGeneratePrompts = async () => {
    if (!project) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/video-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: project.topic,
          segments: project.segments,
          tone: project.tone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghasilkan prompt video.');
      }

      setProject({
        ...project,
        storyboard: {
          conceptApproved: false,
          aspectRatio: '9:16',
          resolution: '1080x1920',
          visualStyle: data.visualStyle || project.storyboard.visualStyle,
          first3SecondsVisualHook: data.first3SecondsVisualHook || project.storyboard.first3SecondsVisualHook,
          colorGradePalette: data.colorGradePalette || project.storyboard.colorGradePalette,
          scenes: data.scenes || [],
        },
        updatedAt: new Date().toISOString(),
      });

      showToast('info', 'Konsep & Storyboard siap untuk ditinjau.');
    } catch (err: any) {
      showToast('error', err.message || 'Gagal membuat prompt video.');
    } finally {
      setIsLoading(false);
    }
  };

  // Approve Concept & Unlock Full Prompts
  const handleApproveConcept = () => {
    if (!project) return;
    setProject({
      ...project,
      storyboard: {
        ...project.storyboard,
        conceptApproved: true,
      },
      updatedAt: new Date().toISOString(),
    });
    showToast('success', 'Konsep visual disetujui! Seluruh Master Prompt 9:16 siap digunakan.');
  };

  // 4. Generate Metadata YouTube
  const handleGenerateMetadata = async () => {
    if (!project) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: project.topic,
          summary: project.topic,
          segments: project.segments,
          sources: project.sources,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghasilkan metadata SEO.');
      }

      setProject({
        ...project,
        metadata: {
          titles: data.titles || [],
          selectedTitle: data.selectedTitle || project.topic,
          description: data.description || composeYouTubeDescription(project.topic, project.segments, project.sources, data.hashtags || []),
          hashtags: data.hashtags || ['#Shorts', '#Dokumenter'],
          tags: data.tags || [],
        },
        updatedAt: new Date().toISOString(),
      });

      showToast('success', 'Judul, deskripsi SEO, dan tags YouTube berhasil dibuat!');
    } catch (err: any) {
      showToast('error', err.message || 'Gagal membuat metadata.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to New Project
  const handleConfirmNewProject = () => {
    setProject(null);
    setActiveTab('research');
    showToast('info', 'Studio siap untuk proyek baru. Masukkan topik di bawah.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        apiStatus={apiStatus}
        onNewProject={() => setShowNewProjectModal(true)}
        hasActiveProject={Boolean(project)}
      />

      {/* Global Toast Notification */}
      {notification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`p-3 rounded-xl border shadow-2xl flex items-center justify-between gap-3 ${
              notification.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-800 text-emerald-200 shadow-emerald-950/50'
                : notification.type === 'error'
                ? 'bg-rose-950/95 border-rose-800 text-rose-200 shadow-rose-950/50'
                : 'bg-indigo-950/95 border-indigo-800 text-indigo-200 shadow-indigo-950/50'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold">
              {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
              {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
              {notification.type === 'info' && <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
              <span>{notification.text}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              aria-label="Tutup Notifikasi"
              className="text-slate-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Studio Work Area: 1 Kolom Input Langsung Menghasilkan Naskah, Voice-Over, Perintah Render & Metadata */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-20">
        <UnifiedStudio
          project={project}
          onGenerateAll={handleGenerateAll}
          onGenerateTTS={handleGenerateTTS}
          onUpdateCleanNarration={handleUpdateCleanNarration}
          isLoading={isLoading}
          isLoadingTTS={isLoading}
        />
      </main>

      {/* Confirmation Modal */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onConfirm={handleConfirmNewProject}
      />
    </div>
  );
}
