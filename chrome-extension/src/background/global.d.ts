interface AISummarizerCapabilities {
  available: 'no' | 'readily' | 'after-download';
}

const options: AISummarizerOptions = {
  sharedContext: 'This is a scientific article',
  type: 'key-points',
  format: 'markdown',
  length: 'medium',
};

interface DownloadProgressEvent extends Event {
  loaded: number;
  total: number;
}

interface AISummarizer {
  summarize(input: string, options?: { context?: string }): Promise<{ text: string }>;
  addEventListener(type: 'downloadprogress', listener: (e: DownloadProgressEvent) => void): void;
  ready: Promise<void>;
}

interface AI {
  summarizer: {
    capabilities(): Promise<AISummarizerCapabilities>;
    create(options: AISummarizerOptions): Promise<AISummarizer>;
  };
}

interface Window {
  ai: AI;
}
