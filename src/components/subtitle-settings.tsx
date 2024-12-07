import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '../utils/cn';
import { useSettings } from '../context/settings-context';

interface SubtitleSettingsProps {
  onOffsetChange: (offset: number) => void;
  currentOffset: number;
}

type SettingsTab = 'timing' | 'style' | 'captions';

export const SubtitleSettings: React.FC<SubtitleSettingsProps> = ({
  onOffsetChange,
  currentOffset,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('timing');
  const { settings, updateSettings } = useSettings();

  const handleOffsetChange = useCallback((seconds: number) => {
    onOffsetChange(currentOffset + seconds);
  }, [currentOffset, onOffsetChange]);

  const handleFontSizeChange = useCallback((newSize: number) => {
    updateSettings({ fontSize: newSize });
  }, [updateSettings]);

  const handleFontColorChange = useCallback((newColor: string) => {
    updateSettings({ fontColor: newColor });
  }, [updateSettings]);

  const TabButton = useMemo(() => {
    return ({ tab, label }: { tab: SettingsTab; label: string }) => (
      <button
        onClick={() => setActiveTab(tab)}
        className={cn(
          "px-[12px] py-[4px] text-[14px] rounded-md transition-colors",
          activeTab === tab 
            ? "bg-zinc-700 text-white" 
            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
        )}
      >
        {label}
      </button>
    );
  }, [activeTab]);

  return (
    <div className="relative">
      {/* Settings Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "bg-zinc-900/95 p-[8px] rounded-full hover:bg-zinc-800/95 transition-colors",
          isOpen ? "bg-zinc-800/95" : ""
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      {/* Settings Popup */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-[8px] bg-zinc-900/95 rounded-lg shadow-lg p-[16px] min-w-[280px]">
        <div className="text-white">
          {/* Tabs */}
          <div className="flex gap-[8px] mb-[16px]">
            <TabButton tab="captions" label="Captions" />
            <TabButton tab="timing" label="Timing" />
            <TabButton tab="style" label="Style" />
          </div>

          {/* Captions Settings */}
          {activeTab === 'captions' && (
            <div className="space-y-[16px]">
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-zinc-400">Enable Subtitles</span>
                <button
                  onClick={() => updateSettings({ showSubtitles: !settings.showSubtitles })}
                  className={cn(
                    "w-[40px] h-[24px] rounded-full relative transition-colors",
                    settings.showSubtitles ? "bg-blue-500" : "bg-zinc-700"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white transition-transform",
                      settings.showSubtitles ? "left-[18px]" : "left-[2px]"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[14px] text-zinc-400">Show Subtitles List</span>
                <button
                  onClick={() => updateSettings({ showSubtitlesList: !settings.showSubtitlesList })}
                  className={cn(
                    "w-[40px] h-[24px] rounded-full relative transition-colors",
                    settings.showSubtitlesList ? "bg-blue-500" : "bg-zinc-700"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white transition-transform",
                      settings.showSubtitlesList ? "left-[18px]" : "left-[2px]"
                    )}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Timing Settings */}
          {activeTab === 'timing' && (
            <div className="space-y-[16px]">
              <div className="flex flex-col gap-[8px]">
                <div className="text-[14px] text-zinc-400">
                  Current offset: {currentOffset > 0 ? '+' : ''}{currentOffset}s
                </div>
                
                <div className="flex gap-[8px]">
                  <button
                    onClick={() => handleOffsetChange(-1)}
                    className="bg-zinc-800 hover:bg-zinc-700 px-[8px] py-[4px] rounded text-[14px]"
                  >
                    -1s
                  </button>
                  <button
                    onClick={() => handleOffsetChange(-0.5)}
                    className="bg-zinc-800 hover:bg-zinc-700 px-[8px] py-[4px] rounded text-[14px]"
                  >
                    -0.5s
                  </button>
                  <button
                    onClick={() => handleOffsetChange(0.5)}
                    className="bg-zinc-800 hover:bg-zinc-700 px-[8px] py-[4px] rounded text-[14px]"
                  >
                    +0.5s
                  </button>
                  <button
                    onClick={() => handleOffsetChange(1)}
                    className="bg-zinc-800 hover:bg-zinc-700 px-[8px] py-[4px] rounded text-[14px]"
                  >
                    +1s
                  </button>
                </div>

                <button
                  onClick={() => onOffsetChange(0)}
                  className="bg-zinc-800 hover:bg-zinc-700 px-[8px] py-[4px] rounded text-[14px]"
                >
                  Reset Timing
                </button>
              </div>
            </div>
          )}

          {/* Style Settings */}
          {activeTab === 'style' && (
            <div className="space-y-[16px]">
              <div className="space-y-[4px]">
                <label className="text-[14px] text-zinc-400">Font Size</label>
                <div className="flex gap-[8px]">
                  {[14, 16, 20, 24, 32].map((size) => (
                    <button
                      key={size}
                      onClick={() => handleFontSizeChange(size)}
                      className={cn(
                        "px-[8px] py-[4px] rounded text-[14px]",
                        settings.fontSize === size
                          ? "bg-blue-600 text-white"
                          : "bg-zinc-800 hover:bg-zinc-700"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-[4px]">
                <label className="text-[14px] text-zinc-400">Font Color</label>
                <div className="flex gap-[8px]">
                  {['#FFFFFF', '#FFD700', '#90EE90', '#87CEEB'].map((color) => (
                    <button
                      key={color}
                      onClick={() => handleFontColorChange(color)}
                      className={cn(
                        "w-[32px] h-[32px] rounded-full border-2",
                        settings.fontColor === color
                          ? "border-blue-500"
                          : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
  );
};
