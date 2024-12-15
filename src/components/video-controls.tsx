import React from 'react';
import { SubtitleSettings } from './subtitle-settings';

interface VideoControlsProps {
  onOffsetChange: (offset: number) => void;
  currentOffset: number;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  onOffsetChange,
  currentOffset,
}) => {
  return (
    <div 
      className="absolute bottom-[70px] right-5 z-[9999] pointer-events-auto"
      style={{
        filter: 'drop-shadow(0 0 4px rgba(0, 0, 0, 0.5))'
      }}
    >
      <SubtitleSettings
        onOffsetChange={onOffsetChange}
        currentOffset={currentOffset}
      />
    </div>
  );
};
