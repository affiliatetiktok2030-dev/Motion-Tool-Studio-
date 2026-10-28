import React from 'react';
import { Search, FileDown, Mic, Clapperboard, Youtube } from 'lucide-react';

export type ActiveTabId = 'research' | 'download_script' | 'tts' | 'video_prompts' | 'metadata';

interface StepTabsProps {
  activeTab: ActiveTabId;
  onTabChange: (tab: ActiveTabId) => void;
  hasScript: boolean;
  hasAudio: boolean;
  hasPrompts: boolean;
  hasMetadata: boolean;
}

export const StepTabs: React.FC<StepTabsProps> = ({
  activeTab,
  onTabChange,
  hasScript,
  hasAudio,
  hasPrompts,
  hasMetadata,
}) => {
  const tabs = [
    {
      id: 'research' as ActiveTabId,
      number: '1',
      label: 'Riset & Naskah',
      shortLabel: 'Riset',
      icon: Search,
      isDone: hasScript,
      disabled: false,
    },
    {
      id: 'download_script' as ActiveTabId,
      number: '2',
      label: 'Unduh Naskah',
      shortLabel: 'Unduh',
      icon: FileDown,
      isDone: hasScript,
      disabled: !hasScript,
    },
    {
      id: 'tts' as ActiveTabId,
      number: '3',
      label: 'Voice-Over TTS',
      shortLabel: 'Audio',
      icon: Mic,
      isDone: hasAudio,
      disabled: !hasScript,
    },
    {
      id: 'video_prompts' as ActiveTabId,
      number: '4',
      label: 'Prompt Video 9:16',
      shortLabel: 'Video',
      icon: Clapperboard,
      isDone: hasPrompts,
      disabled: !hasScript,
    },
    {
      id: 'metadata' as ActiveTabId,
      number: '5',
      label: 'Metadata YouTube',
      shortLabel: 'SEO',
      icon: Youtube,
      isDone: hasMetadata,
      disabled: !hasScript,
    },
  ];

  const activeTabRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeTab]);

  return (
    <nav
      aria-label="Tahapan Produksi Dokumenter"
      className="bg-slate-900/90 border-b border-slate-800 px-2 py-2 sticky top-[61px] z-30 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              ref={isActive ? activeTabRef : null}
              onClick={() => onTabChange(tab.id)}
              disabled={tab.disabled}
              aria-current={isActive ? 'step' : undefined}
              className={`flex-1 min-w-[85px] sm:min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all select-none ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-950/60 ring-1 ring-cyan-400/40'
                  : tab.disabled
                  ? 'opacity-35 text-slate-500 hover:bg-transparent cursor-not-allowed'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.isDone ? 'text-emerald-400' : 'text-slate-400'}`} />
                {tab.isDone && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                )}
              </div>
              <span className="hidden sm:inline truncate">{tab.label}</span>
              <span className="sm:hidden truncate">{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
