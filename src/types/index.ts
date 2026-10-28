export type FactCategory = 'verified' | 'hypothesis' | 'unproven';

export interface SourceReference {
  id: string;
  title: string;
  publisher: string;
  url: string;
  dateOrSnippet?: string;
  credibilityNote?: string;
}

export interface FactItem {
  id: string;
  claim: string;
  category: FactCategory;
  sourceTitle?: string;
  sourceUrl?: string;
  explanation: string;
}

export interface ScriptSegment {
  id: string;
  timeRange: string;
  secondsRange: [number, number];
  cueType: 'hook' | 'setup' | 'investigasi' | 'fakta' | 'klimaks' | 'cta';
  narrationText: string;
  visualDirection: string;
  factTag?: FactCategory;
}

export interface ScenePrompt {
  sceneNumber: number;
  timeRange: string;
  narrationExcerpt: string;
  motionType: 'animated_map' | 'archival_photo' | 'timeline' | 'isometric_chart' | 'ai_reconstruction' | 'typography_card';
  isAiReconstruction: boolean;
  visualHookNote?: string;
  masterPrompt: string;
  negativePrompt: string;
  cameraMovement: string;
  screenElements: string[];
}

export interface VideoStoryboard {
  conceptApproved: boolean;
  aspectRatio: '9:16';
  resolution: '1080x1920';
  visualStyle: string;
  first3SecondsVisualHook: string;
  colorGradePalette: string[];
  scenes: ScenePrompt[];
}

export interface TitleOption {
  id: string;
  title: string;
  style: 'investigatif' | 'misteri' | 'faktual' | 'pertanyaan' | 'urgensi';
  estimatedCtr: string;
}

export interface YouTubeMetadata {
  titles: TitleOption[];
  selectedTitle: string;
  description: string;
  hashtags: string[];
  tags: string[];
}

export interface VoiceOverConfig {
  voiceName: 'Kore' | 'Fenrir' | 'Puck' | 'Charon' | 'Zephyr';
  gender: 'Wanita' | 'Pria';
  character: string;
  style: 'investigatif' | 'sinematik' | 'edukatif' | 'misteri';
  speed: number;
  audioBase64?: string;
  mimeType?: string;
  generatedAt?: string;
  durationSeconds?: number;
}

export interface DocumentaryProject {
  id: string;
  topic: string;
  targetDurationSeconds: number;
  tone: 'investigatif' | 'sinematik' | 'populer' | 'misteri';
  focusAngle: string;
  createdAt: string;
  updatedAt: string;
  sources: SourceReference[];
  facts: FactItem[];
  segments: ScriptSegment[];
  cleanNarration: string;
  voiceOver: VoiceOverConfig;
  storyboard: VideoStoryboard;
  metadata: YouTubeMetadata;
}
