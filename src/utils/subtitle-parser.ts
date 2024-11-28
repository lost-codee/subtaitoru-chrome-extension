interface SubtitleLine {
  start: number;  // Time in seconds
  end: number;    // Time in seconds
  text: string;
}

export function parseAssSubtitles(content: string): SubtitleLine[] {
  const lines = content.split('\n');
  const subtitles: SubtitleLine[] = [];
  let isEvents = false;

  for (const line of lines) {
    if (line.startsWith('[Events]')) {
      isEvents = true;
      continue;
    }

    if (isEvents && line.startsWith('Dialogue:')) {
      const parts = line.split(',');
      if (parts.length < 10) continue;

      // Parse timestamps (format: H:MM:SS.CC)
      const startTime = parseTimestamp(parts[1].trim());
      const endTime = parseTimestamp(parts[2].trim());
      
      // Get the text (everything after the 9th comma)
      const text = parts.slice(9).join(',').trim();
      
      // Remove style tags and other formatting
      const cleanText = text.replace(/\{[^}]+\}/g, '')  // Remove {...} style tags
                           .replace(/\\N/g, ' ')         // Replace line breaks with spaces
                           .replace(/\\[hn]/g, ' ')      // Remove hard breaks
                           .replace(/\[[^\]]+\]/g, '')   // Remove [...] tags
                           .replace(/\s+/g, ' ')
                           .trim();

      if (cleanText) {
        subtitles.push({
          start: startTime,
          end: endTime,
          text: cleanText
        });
      }
    }
  }

  return subtitles;
}

function parseTimestamp(timestamp: string): number {
  const [hours, minutes, seconds] = timestamp.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

export function findCurrentSubtitles(subtitles: SubtitleLine[], currentTime: number): string {
  return subtitles
    .filter(sub => currentTime >= sub.start && currentTime <= sub.end)
    .map(sub => sub.text)[0];
}
