import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json({ limit: '20mb' }));

// Shared Gemini AI instance with required telemetry User-Agent
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Status API
app.get('/api/status', (_req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  res.json({
    configured: Boolean(apiKey && apiKey.length > 5),
    models: {
      textAndSearch: 'gemini-3.8-flash',
      tts: 'gemini-3.8-flash-lite-tts',
    },
    service: 'Motion Tool Studio Backend',
    timestamp: new Date().toISOString(),
  });
});

// 2. Riset & Naskah Narasi dengan Google Search Grounding
app.post('/api/research-script', async (req: Request, res: Response) => {
  try {
    const { topic, durationSeconds = 60, tone = 'investigatif', focusAngle = '' } = req.body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      res.status(400).json({ error: 'Topik video wajib diisi.' });
      return;
    }

    const ai = getGenAIClient();
    if (!ai) {
      // Jujur jika API key belum terpasang
      res.status(503).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di server secrets.',
        hint: 'Harap tambahkan GEMINI_API_KEY melalui panel Secrets pada AI Studio.',
      });
      return;
    }

    // Estimasi kata: ~2.1 kata per detik
    const targetWordCount = Math.round((Number(durationSeconds) / 60) * 130);

    const prompt = `Lakukan riset mendalam berbasis web search terkini dan tulis naskah narasi dokumenter profesional untuk video YouTube berformat vertikal 9:16 (Shorts/Reels/TikTok).

TOPIK: "${topic}"
DURASI TARGET: ${durationSeconds} detik (~${targetWordCount} kata narasi)
GAYA/TONE: ${tone} (e.g. investigatif, sinematik, edukatif, misteri)
FOKUS/SUDUT PANDANG: ${focusAngle || 'Soroti fakta utama, timeline, dan analisis bukti'}

INSTRUKSI WAJIB:
1. Cari artikel, berita, laporan resmi, dan riset terpercaya menggunakan Google Search.
2. Identifikasi dan bedakan dengan tegas:
   - FAKTA TERVERIFIKASI: Dibuktikan dokumen primer, arsip, penelitian, atau saksi kredibel.
   - DUGAAN / TEORI: Hipotesis masuk akal dari para ahli/peneliti yang masih belum definitif.
   - INFORMASI BELUM TERBUKTI: Klaim sensasional, mitos, atau konspirasi yang beredar tanpa bukti ilmiah.
3. JANGAN PERNAH mengarang kutipan, tanggal peristiwa, angka statistik, atau nama pihak berwenang.
4. Struktur naskah narasi:
   - 0-3 Detik Pertama (HOOK): Kalimat pembuka magnetis berenergi tinggi yang memancing rasa penasaran instan.
   - Inti Dokumenter: Mengalir logis dengan tempo ketat, memadukan fakta terverifikasi dan dugaan secara transparan.
   - CTA di akhir: Pertanyaan retoris tajam atau ajakan berlangganan & diskusi santun.
5. Sediakan pembagian segmen berurutan dengan timecode yang jelas (misal 00:00 - 00:03, 00:03 - 00:15, dst.).
6. Berikan petunjuk visual motion graphics untuk setiap segmen: peta animasi (animated map), foto arsip 2.5D halftone, timeline bar, grafik isometrik 3D, atau rekonstruksi sinematik AI.

Kembalikan respon DALAM FORMAT JSON MURNI yang valid dengan skema berikut:
{
  "summary": "Ringkasan esensial topik dalam 2 kalimat",
  "verifiedFactsCount": 3,
  "sources": [
    {
      "id": "s1",
      "title": "Judul Artikel / Laporan Resmi",
      "publisher": "Nama Penerbit / Lembaga / Media",
      "url": "https://...",
      "dateOrSnippet": "Tanggal atau cuplikan data kunci",
      "credibilityNote": "Keterangan kredibilitas sumber"
    }
  ],
  "facts": [
    {
      "id": "f1",
      "claim": "Pernyataan fakta / dugaan",
      "category": "verified", // pilihan: "verified" | "hypothesis" | "unproven"
      "sourceTitle": "Sumber rujukan",
      "sourceUrl": "https://...",
      "explanation": "Penjelasan mengapa masuk kategori ini"
    }
  ],
  "segments": [
    {
      "id": "seg-1",
      "timeRange": "00:00 - 00:03",
      "secondsRange": [0, 3],
      "cueType": "hook", // "hook" | "setup" | "investigasi" | "fakta" | "klimaks" | "cta"
      "narrationText": "Teks yang HANYA dibaca narator tanpa kata panggung",
      "visualDirection": "Instruksi visual motion graphics",
      "factTag": "verified"
    }
  ],
  "cleanNarration": "Seluruh teks narasi bersih digabung urut"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      },
    });

    const rawText = response.text || '';

    // Ekstrak referensi riil dari Google Search Grounding jika tersedia
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingSources = chunks
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((chunk: any, i: number) => {
        const web = chunk.web;
        if (!web?.uri) return null;
        let publisher = 'Sumber Web Terverifikasi';
        try {
          publisher = new URL(web.uri).hostname.replace(/^www\./, '');
        } catch {
          // ignore
        }
        return {
          id: `g-${i + 1}`,
          title: web.title || `Laporan Web: ${publisher}`,
          publisher,
          url: web.uri,
          dateOrSnippet: 'Diverifikasi via Google Search Grounding',
          credibilityNote: 'Riset Langsung Web',
        };
      })
      .filter(Boolean);

    // Parse JSON
    let parsedData: any = null;
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, rawText];
    const candidateJson = jsonMatch[1] || rawText;

    try {
      parsedData = JSON.parse(candidateJson.trim());
    } catch {
      // Jika JSON parser gagal, cari substring { ... }
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        try {
          parsedData = JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
        } catch (e2) {
          console.error('Gagal mem-parse JSON hasil model:', e2);
        }
      }
    }

    if (!parsedData || !Array.isArray(parsedData.segments)) {
      res.status(502).json({
        error: 'Format keluaran riset tidak sesuai. Silakan coba ulangi topik.',
        raw: rawText.slice(0, 500),
      });
      return;
    }

    // Gabungkan sumber dari respon dan groundingChunks unik
    const combinedSources = [...(parsedData.sources || [])];
    groundingSources.forEach((gs: any) => {
      if (gs && !combinedSources.some(s => s.url === gs.url)) {
        combinedSources.push(gs);
      }
    });

    res.json({
      summary: parsedData.summary || '',
      sources: combinedSources,
      facts: parsedData.facts || [],
      segments: parsedData.segments,
      cleanNarration: parsedData.cleanNarration || parsedData.segments.map((s: any) => s.narrationText).join('\n\n'),
    });
  } catch (error: any) {
    console.error('Error saat riset naskah:', error);
    res.status(500).json({
      error: error.message || 'Terjadi kesalahan internal server saat memproses riset.',
    });
  }
});

// 3. Text to Speech (TTS) menggunakan gemini-3.8-flash-lite-tts
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName = 'Kore', style = 'investigatif' } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'Teks narasi untuk TTS wajib disertakan.' });
      return;
    }

    const ai = getGenAIClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di server secrets.',
        hint: 'Kunci API diperlukan untuk memanggil model gemini-3.8-flash-lite-tts.',
      });
      return;
    }

    // Pemetaan gaya narasi dokumenter ke instruksi vokal
    const styleInstructions: Record<string, string> = {
      investigatif: 'Clear, authoritative, serious investigative documentary narrator with deliberate pacing and steady articulation.',
      sinematik: 'Dramatic, solemn, deep cinematic documentary voice with measured pauses and emotional weight.',
      edukatif: 'Engaging, warm, clear, informative science documentary host with enthusiastic yet disciplined cadence.',
      misteri: 'Suspenseful, hushed, low-register mystery narrator with slow deliberate cadence and tense micro-pauses.',
    };

    const chosenStyle = styleInstructions[style] || styleInstructions.investigatif;
    const allowedVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    const validVoice = allowedVoices.includes(voiceName) ? voiceName : 'Kore';

    // Model gemini-3.8-flash-lite-tts unary menghasilkan audio WAV 24kHz lengkap
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style: chosenStyle,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: validVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      res.status(502).json({
        error: 'Model TTS tidak menghasilkan data audio. Pastikan teks narasi tidak kosong atau melanggar kebijakan keamanan.',
      });
      return;
    }

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      voiceName: validVoice,
      style,
      sampleRate: 24000,
    });
  } catch (error: any) {
    console.error('Error saat generate TTS:', error);
    res.status(500).json({
      error: error.message || 'Gagal memproduksi audio voice-over dari server TTS.',
    });
  }
});

// 4. Prompt Video Master Generator (9:16 Vertical Documentary Motion Graphics)
app.post('/api/video-prompts', async (req: Request, res: Response) => {
  try {
    const { topic, segments, tone = 'investigatif' } = req.body;

    if (!topic || !Array.isArray(segments) || segments.length === 0) {
      res.status(400).json({ error: 'Topik dan segmen naskah wajib disertakan.' });
      return;
    }

    const ai = getGenAIClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi.',
      });
      return;
    }

    const prompt = `Anda adalah Art Director & Visual Motion Designer senior spesialis video dokumenter YouTube Shorts / 9:16 vertikal.
Tugas Anda: Buat storyboard dan Master Prompt Video terperinci untuk setiap segmen naskah berikut.

TOPIK: "${topic}"
GAYA: Documentary Motion Graphics (${tone})
FORMAT WAJIB: 9:16 vertical (1080x1920 pixels)

SEGMEN NASKAH:
${JSON.stringify(segments, null, 2)}

ATURAN KRUSIAL:
1. SCENE 1 (0-3 DETIK) HARUS MEMILIKI VISUAL HOOK SUPER KUAT: Gerakan kamera kinetik, zoom-in tajam ke dokumen bertanda rahasia, atau peta topografi menyala yang langsung membetot fokus layar HP.
2. Sinkronkan elemen visual dengan narasi:
   - Peta Animasi: Tentukan rute, koordinat, orthographic view, tracing path bercahaya.
   - Foto Arsip: Treatment halftone 2.5D parallax (bukan distorsi kartun), grain film 35mm, debu seluloid halus.
   - Timeline: Garis waktu vertikal dinamis dengan penanda tahun/tanggal.
   - Diagram/Grafik: Grafik isometrik berkelas dengan data empiris.
   - Rekonstruksi Sinematik AI: WAJIB tandai "isAiReconstruction": true dan sertakan label visual "Rekonstruksi AI (Bukan Arsip Asli)" agar tidak membohongi pemirsa!
3. Format output harus JSON valid dengan skema:
{
  "visualStyle": "Penjelasan konsep visual umum",
  "first3SecondsVisualHook": "Deskripsi spesifik hook visual 3 detik pertama",
  "colorGradePalette": ["#1A1A24", "#D4AF37", "#00F0FF", "#E5E7EB"],
  "scenes": [
    {
      "sceneNumber": 1,
      "timeRange": "00:00 - 00:03",
      "narrationExcerpt": "Cuplikan kalimat narasi",
      "motionType": "animated_map", // animated_map | archival_photo | timeline | isometric_chart | ai_reconstruction | typography_card
      "isAiReconstruction": false,
      "visualHookNote": "Keterangan hook",
      "cameraMovement": "Fast push-in zoom into coordinates, sudden orthographic snap",
      "screenElements": ["Titik koordinat GPS merah", "Peta satelit resolusi tinggi", "Garis lintang radar pulse"],
      "masterPrompt": "Cinematic vertical 9:16 motion graphics, 1080x1920, documentary style...",
      "negativePrompt": "cartoon, 3d render toy, blurry, low resolution, horizontal landscape 16:9, watermark"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error saat generate video prompts:', error);
    res.status(500).json({
      error: error.message || 'Gagal menghasilkan prompt video master.',
    });
  }
});

// 5. Metadata YouTube Generator (SEO, Honest Titles, Citations)
app.post('/api/metadata', async (req: Request, res: Response) => {
  try {
    const { topic, summary, segments = [], sources = [] } = req.body;

    if (!topic) {
      res.status(400).json({ error: 'Topik video wajib disertakan.' });
      return;
    }

    const ai = getGenAIClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi.',
      });
      return;
    }

    const prompt = `Anda adalah YouTube SEO Strategist untuk kanal dokumenter bereputasi tinggi.
Buat metadata YouTube lengkap untuk topik berikut:
TOPIK: "${topic}"
RINGKASAN: "${summary || ''}"
REFERENSI SUMBER: ${JSON.stringify(sources)}

INSTRUKSI:
1. Buat 5 alternatif judul yang sangat memikat (High Click-Through Rate) namun JUJUR, TIDAK MENYESATKAN (NO CLICKBAIT BOHONG).
   Kategorikan variasinya: Investigatif, Misteri, Faktual, Pertanyaan Kritis, Urgensi Sejarah.
2. Buat deskripsi video YouTube yang kaya SEO:
   - Ringkasan pembuka 2 paragraf padat.
   - Bab Timecode (Chapters) berdasarkan alur segmen.
   - Daftar tautan sumber & referensi resmi terpercaya.
   - Pernyataan transparansi fakta vs dugaan.
3. Buat 8-10 hashtag relevan (#Shorts, #Dokumenter, dll).
4. Buat 15-20 tags YouTube SEO yang sering dicari pengguna.

Kembalikan format JSON valid:
{
  "titles": [
    {
      "id": "t1",
      "title": "Teks judul",
      "style": "investigatif",
      "estimatedCtr": "Tinggi (9.2%) - Memantik rasa penasaran jurnalis"
    }
  ],
  "selectedTitle": "Judul rekomendasi utama",
  "description": "Teks deskripsi lengkap dengan timeline dan sumber",
  "hashtags": ["#Shorts", "#Dokumenter", "..."],
  "tags": ["tag1", "tag2", "..."]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error saat generate metadata:', error);
    res.status(500).json({
      error: error.message || 'Gagal menghasilkan metadata YouTube.',
    });
  }
});

// Setup Vite dev server or static production files
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Motion Tool Studio] Server running on port ${PORT} (isProd=${isProd})`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
