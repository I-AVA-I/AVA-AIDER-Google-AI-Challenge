export interface Subtitle {
  dur: number;
  start: number;
  text: string;
}

export function subtitlesToText(subtitles: Subtitle[], includeTimestamps: boolean = false): string {
  return subtitles
    .map(subtitle => {
      if (includeTimestamps) {
        const timestamp = formatTimestamp(subtitle.start);
        return `[${timestamp}] ${subtitle.text}`;
      }
      return subtitle.text;
    })
    .join(' ');
}

function formatTimestamp(seconds: number): string {
  const date = new Date(0);
  date.setSeconds(seconds);
  return date.toISOString().substr(11, 8); // HH:MM:SS
}
