import { ParsedSubtitle } from "../types";

export function parseAssSubtitles(content: string): ParsedSubtitle[] {
  const lines = content.split('\n');
  const subtitles: ParsedSubtitle[] = [];
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

function parseSrtTimestamp(timestamp: string): number {
  const [time, milliseconds] = timestamp.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds + Number(milliseconds) / 1000;
}

export function parseSrtSubtitles(content: string): ParsedSubtitle[] {
  const subtitles: ParsedSubtitle[] = [];
  const blocks = content.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;  // Skip invalid blocks

    // Skip the subtitle number (first line)
    const timeLine = lines[1];
    const text = lines.slice(2).join('\n').trim();

    // Parse time line "00:00:20,000 --> 00:00:24,400"
    const [startTime, endTime] = timeLine.split('-->').map(t => parseSrtTimestamp(t.trim()));

    if (isNaN(startTime) || isNaN(endTime)) continue;  // Skip invalid timestamps

    subtitles.push({
      start: startTime,
      end: endTime,
      text
    });
  }

  return subtitles;
}

export function findCurrentSubtitles(subtitles: ParsedSubtitle[], currentTime: number): string {
  return subtitles
    .filter(sub => currentTime >= sub.start && currentTime <= sub.end)
    .map(sub => sub.text)
    .join('\n');
}
