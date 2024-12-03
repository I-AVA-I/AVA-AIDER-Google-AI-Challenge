interface Translation {
  canTranslate(options: {
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<'readily' | 'after-download' | 'no'>;
  createTranslator(options: { sourceLanguage: string; targetLanguage: string }): Promise<LanguageTranslator>;
}

interface LanguageTranslator {
  translate(input: string): Promise<string>;
  addEventListener(type: 'downloadprogress', listener: (e: DownloadProgressEvent) => void): void;
  ready: Promise<void>;
}

interface Window {
  translation?: Translation;
}

interface WorkerGlobalScope {
  translation?: Translation;
}

declare var self: WorkerGlobalScope & typeof globalThis;
