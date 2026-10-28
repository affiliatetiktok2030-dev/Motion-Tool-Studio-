import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractCleanNarration,
  calculateNarrationMetrics,
  formatSecondsToTimecode,
  joinSegmentsToCleanNarration,
  generateCleanScriptTxt,
  composeYouTubeDescription,
} from './scriptParser';
import { ScriptSegment } from '../types';

test('extractCleanNarration strips stage brackets, cues, and speaker labels', () => {
  const raw = `
    [Musik tegang dimulai perlahan]
    Narator: Bayangkan sebuah kapal berlayar tanpa ada satu pun awak yang bernapas.
    (Visual: Peta animasi Selat Malaka bergerak cepat)
    [00:03 - 00:15]
    VO: Inilah misteri Kapal Ourang Medan pada Juni 1947.
    (SFX: Suara ombak berderu)
    Apakah ini insiden senjata kimia, atau sekadar legenda urban?
  `;

  const clean = extractCleanNarration(raw);

  // Must not have brackets or stage tags
  assert.ok(!clean.includes('[Musik tegang'));
  assert.ok(!clean.includes('(Visual:'));
  assert.ok(!clean.includes('[00:03'));
  assert.ok(!clean.includes('(SFX:'));
  assert.ok(!clean.includes('Narator:'));
  assert.ok(!clean.includes('VO:'));

  // Must retain spoken content
  assert.ok(clean.includes('Bayangkan sebuah kapal berlayar'));
  assert.ok(clean.includes('Inilah misteri Kapal Ourang Medan'));
  assert.ok(clean.includes('Apakah ini insiden senjata kimia'));
});

test('calculateNarrationMetrics estimates reading duration correctly', () => {
  // 130 words at 130 wpm should be approx 60 seconds
  const words = Array.from({ length: 130 }, (_, i) => `kata${i}`).join(' ');
  const metrics = calculateNarrationMetrics(words, 130);

  assert.equal(metrics.wordCount, 130);
  assert.equal(metrics.estimatedSeconds, 60);
  assert.equal(metrics.formattedDuration, '01:00');

  // Empty string handling
  const emptyMetrics = calculateNarrationMetrics('');
  assert.equal(emptyMetrics.wordCount, 0);
  assert.equal(emptyMetrics.estimatedSeconds, 0);
  assert.equal(emptyMetrics.formattedDuration, '00:00');
});

test('formatSecondsToTimecode converts numbers to MM:SS', () => {
  assert.equal(formatSecondsToTimecode(0), '00:00');
  assert.equal(formatSecondsToTimecode(3), '00:03');
  assert.equal(formatSecondsToTimecode(59), '00:59');
  assert.equal(formatSecondsToTimecode(60), '01:00');
  assert.equal(formatSecondsToTimecode(125), '02:05');
});

test('joinSegmentsToCleanNarration joins segment narrations cleanly', () => {
  const segments: ScriptSegment[] = [
    {
      id: '1',
      timeRange: '00:00 - 00:03',
      secondsRange: [0, 3],
      cueType: 'hook',
      narrationText: '[Visual Hook] Jangan pernah percaya bahwa sejarah selalu ditulis jujur.',
      visualDirection: 'Zoom in dokumen kuno',
    },
    {
      id: '2',
      timeRange: '00:03 - 00:15',
      secondsRange: [3, 15],
      cueType: 'fakta',
      narrationText: 'Tahun 1621, sebuah peristiwa kelam terjadi di Kepulauan Banda.',
      visualDirection: 'Peta kepulauan rempah',
      factTag: 'verified',
    },
  ];

  const joined = joinSegmentsToCleanNarration(segments);
  assert.ok(!joined.includes('[Visual Hook]'));
  assert.ok(joined.includes('Jangan pernah percaya'));
  assert.ok(joined.includes('Tahun 1621'));
});

test('generateCleanScriptTxt creates clean formatted text output for download', () => {
  const txt = generateCleanScriptTxt('Misteri Atlantis', 'Narasi lengkap di sini.', '01:00');
  assert.ok(txt.includes('MOTION TOOL STUDIO - NASKAH BERSIH NARATOR'));
  assert.ok(txt.includes('Topik Video : Misteri Atlantis'));
  assert.ok(txt.includes('Narasi lengkap di sini.'));
});

test('composeYouTubeDescription formats timestamps, sources, and hashtags', () => {
  const desc = composeYouTubeDescription(
    'Misteri kepunahan kapal kargo.',
    [
      {
        id: '1',
        timeRange: '00:00 - 00:03',
        secondsRange: [0, 3],
        cueType: 'hook',
        narrationText: 'Hook permulaan video dokumenter',
        visualDirection: '',
      },
    ],
    [
      {
        title: 'Laporan Maritim Resmi 1948',
        publisher: 'Coast Guard Archive',
        url: 'https://example.com/report',
      },
    ],
    ['Shorts', '#Dokumenter', 'Sejarah']
  );

  assert.ok(desc.includes('Misteri kepunahan kapal kargo.'));
  assert.ok(desc.includes('TIMELINE & CHAPTERS:'));
  assert.ok(desc.includes('SUMBER RISET & REFERENSI TERPERCAYA:'));
  assert.ok(desc.includes('Laporan Maritim Resmi 1948'));
  assert.ok(desc.includes('https://example.com/report'));
  assert.ok(desc.includes('#Shorts'));
  assert.ok(desc.includes('#Dokumenter'));
  assert.ok(desc.includes('#Sejarah'));
});
