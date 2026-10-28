import { DocumentaryProject, ScriptSegment, YouTubeMetadata } from '../types';

/**
 * Membersihkan naskah narasi dari instruksi panggung, petunjuk visual,
 * timestamp, atau label peran agar hanya menyisakan kata-kata yang
 * dibacakan langsung oleh narator.
 */
export function extractCleanNarration(rawScript: string): string {
  if (!rawScript) return '';

  return rawScript
    // Hapus kurung siku seperti [Visual: Peta], [00:00 - 00:05], [Musik Tegang]
    .replace(/\[[^\]]*\]/g, ' ')
    // Hapus kurung bulat yang berisi petunjuk sutradara / visual seperti (Visual: ...), (SFX: ...)
    .replace(/\((?:visual|sfx|sound|kamera|cut|zoom|musik|hook|cta)[^)]*\)/gi, ' ')
    // Hapus label pembicara seperti "Narator:", "VO:", "Voiceover:"
    .replace(/^\s*(?:narator|vo|voiceover|host)\s*:\s*/gim, '')
    // Hapus markdown heading atau tanda bintang berlebih
    .replace(/^#+\s+/gm, '')
    .replace(/\*{1,3}/g, '')
    // Rapikan spasi ganda dan baris kosong berlebih
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n\n')
    .trim();
}

/**
 * Menghitung estimasi durasi pembacaan narasi dalam bahasa Indonesia.
 * Standar dokumenter & video pendek: ~130 kata per menit (sekitar 2,17 kata per detik).
 */
export function calculateNarrationMetrics(text: string, wordsPerMinute = 130): {
  wordCount: number;
  characterCount: number;
  estimatedSeconds: number;
  formattedDuration: string;
} {
  const clean = text.trim();
  if (!clean) {
    return {
      wordCount: 0,
      characterCount: 0,
      estimatedSeconds: 0,
      formattedDuration: '00:00',
    };
  }

  const words = clean.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const characterCount = clean.length;
  const estimatedSeconds = Math.round((wordCount / wordsPerMinute) * 60);

  return {
    wordCount,
    characterCount,
    estimatedSeconds,
    formattedDuration: formatSecondsToTimecode(estimatedSeconds),
  };
}

/**
 * Mengubah detik menjadi format timecode MM:SS
 */
export function formatSecondsToTimecode(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Menggabungkan naskah segmen menjadi satu teks narasi bersih
 */
export function joinSegmentsToCleanNarration(segments: ScriptSegment[]): string {
  if (!segments || segments.length === 0) return '';
  return segments
    .map(s => extractCleanNarration(s.narrationText))
    .filter(t => t.length > 0)
    .join('\n\n');
}

/**
 * Menghasilkan file TXT naskah bersih narator
 */
export function generateCleanScriptTxt(topic: string, cleanNarration: string, durationEstimate: string): string {
  const header = [
    `==================================================`,
    `MOTION TOOL STUDIO - NASKAH BERSIH NARATOR (VO)`,
    `Topik Video : ${topic}`,
    `Estimasi Waktu Baca : ${durationEstimate}`,
    `Petunjuk : Teks di bawah HANYA berisi kata-kata yang`,
    `dibacakan langsung oleh pengisi suara tanpa instruksi panggung.`,
    `==================================================`,
    '',
  ].join('\n');

  return `${header}${cleanNarration}\n`;
}

/**
 * Menghasilkan dokumen Master Prompt Video lengkap (9:16)
 */
export function generateMasterPromptDocument(project: DocumentaryProject): string {
  const { topic, storyboard, targetDurationSeconds, tone } = project;

  const lines: string[] = [
    `================================================================================`,
    `MOTION TOOL STUDIO - MASTER VIDEO PROMPT DOKUMENTER`,
    `================================================================================`,
    `Topik               : ${topic}`,
    `Target Durasi       : ${targetDurationSeconds} Detik (Format: 9:16 Shorts/Reels/TikTok)`,
    `Resolusi            : 1080 x 1920 px (Vertical 9:16)`,
    `Gaya Visual         : Documentary Motion Graphics (${storyboard.visualStyle || tone})`,
    `Visual Hook (0-3s)  : ${storyboard.first3SecondsVisualHook || 'Tiga detik pertama dengan transisi kinetik berenergi tinggi'}`,
    `Palet Warna         : ${storyboard.colorGradePalette?.join(', ') || 'Dark Charcoal, Muted Gold, Deep Navy, Technical Cyan'}`,
    `================================================================================`,
    ``,
    `[ATURAN UTAMA PRODUKSI & KEAMANAN FAKTA]:`,
    `- Format video WAJIB vertikal 9:16 (1080x1920) untuk tampilan penuh di HP Android/iOS.`,
    `- Setiap adegan sinkron dengan beat naskah dan transisi audio.`,
    `- Rekonstruksi visual AI WAJIB diberi label visual "Rekonstruksi AI (Bukan Arsip Asli)" agar tidak menyesatkan penonton.`,
    `- Arsip sejarah menggunakan treatment halftone 2.5D parallax, bukan distorsi fantasi.`,
    ``,
    `--------------------------------------------------------------------------------`,
    `BREAKDOWN SCENE-BY-SCENE (MOTION GRAPHICS CUES):`,
    `--------------------------------------------------------------------------------`,
  ];

  storyboard.scenes.forEach((scene, index) => {
    lines.push(`SCENE #${index + 1} [${scene.timeRange}] - Tipe Motion: ${scene.motionType.toUpperCase()}`);
    if (scene.isAiReconstruction) {
      lines.push(`[PERINGATAN]: Termasuk Rekonstruksi Sinematik AI (Tambahkan overlay/watermark: "Rekonstruksi Visual AI")`);
    }
    lines.push(`Potongan Narasi: "${scene.narrationExcerpt}"`);
    lines.push(`Pergerakan Kamera: ${scene.cameraMovement}`);
    lines.push(`Elemen On-Screen: ${scene.screenElements.join(' | ')}`);
    lines.push(`Prompt Render AI:`);
    lines.push(`>>> ${scene.masterPrompt}`);
    if (scene.negativePrompt) {
      lines.push(`Negative Prompt: ${scene.negativePrompt}`);
    }
    lines.push(``);
  });

  lines.push(`================================================================================`);
  lines.push(`Motion Tool Studio - Dokumen Siap Produksi`);
  return lines.join('\n');
}

/**
 * Menyusun deskripsi YouTube SEO lengkap dengan bab timecode & daftar referensi terpercaya
 */
export function composeYouTubeDescription(
  summaryText: string,
  segments: ScriptSegment[],
  sources: { title: string; publisher: string; url: string }[],
  hashtags: string[]
): string {
  const parts: string[] = [];

  // Ringkasan
  if (summaryText) {
    parts.push(summaryText.trim());
    parts.push('');
  }

  // Timestamps / Bab Video
  if (segments && segments.length > 0) {
    parts.push('⏱️ TIMELINE & CHAPTERS:');
    segments.forEach(seg => {
      const start = seg.timeRange.split('-')[0]?.trim() || '00:00';
      const label = seg.cueType === 'hook' ? 'Hook 3 Detik Pertama'
        : seg.cueType === 'cta' ? 'Kesimpulan & Call to Action'
        : seg.narrationText.slice(0, 35) + '...';
      parts.push(`${start} - ${label}`);
    });
    parts.push('');
  }

  // Sumber Terpercaya
  if (sources && sources.length > 0) {
    parts.push('📚 SUMBER RISET & REFERENSI TERPERCAYA:');
    sources.forEach((src, idx) => {
      parts.push(`${idx + 1}. ${src.title} (${src.publisher})`);
      parts.push(`   Tautan: ${src.url}`);
    });
    parts.push('');
  }

  parts.push('⚠️ CATATAN JURNALISTIK:');
  parts.push('Video ini diproduksi dengan memisahkan fakta terverifikasi, dugaan analitis, dan hipotesis terbuka demi integritas informasi.');
  parts.push('');

  // Hashtags
  if (hashtags && hashtags.length > 0) {
    parts.push(hashtags.map(h => (h.startsWith('#') ? h : `#${h}`)).join(' '));
  }

  return parts.join('\n');
}
