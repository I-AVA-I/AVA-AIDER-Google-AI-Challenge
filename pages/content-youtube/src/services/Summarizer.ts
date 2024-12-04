import { splitText } from '@src/utils/splitText';

export type SummarizerType = 'tl;dr' | 'key-points' | 'teaser' | 'headline';
export type SummarizerFormat = 'plain-text' | 'markdown';
export type SummarizerLength = 'short' | 'medium' | 'long';

export interface SummarizerOptions {
  sharedContext?: string;
  type?: SummarizerType;
  format?: SummarizerFormat;
  length?: SummarizerLength;
  maxInputChunkLength?: number;
  overlapChunkLength?: number;
}

class Summarizer {
  private readonly options: SummarizerOptions;
  private summarizerInstance: any;

  constructor(options?: SummarizerOptions) {
    this.options = {
      sharedContext: '',
      type: 'key-points',
      format: 'markdown',
      length: 'short',
      maxInputChunkLength: 3000,
      overlapChunkLength: 500,
      ...options,
    };
  }

  private async init() {
    // @ts-ignore
    if (!('ai' in self && 'summarizer' in self.ai)) {
      throw new Error('Summarizer API is not supported in this browser.');
    }

    // @ts-ignore
    const capabilities = await self.ai.summarizer.capabilities();
    if (capabilities.available === 'no') {
      throw new Error('The Summarizer API is not usable.');
    }

    // @ts-ignore
    this.summarizerInstance = await self.ai.summarizer.create(this.options);
  }

  public async summarize(text: string, signal?: AbortSignal): Promise<string> {
    if (!this.summarizerInstance) {
      await this.init();
    }

    if (text.length <= this.options.maxInputChunkLength!) {
      // Input is small enough to process directly
      return await this.summarizerInstance.summarize(text, { signal });
    } else {
      // Input is larger than `maxInputChunkLength` characters
      // We need to split the text
      const chunks = splitText(text, this.options.maxInputChunkLength!, this.options.overlapChunkLength!);

      const summaries: string[] = [];

      for (const chunk of chunks) {
        const summary = await this.summarizerInstance.summarize(chunk, { signal });
        summaries.push(summary);
      }

      // Final summary of summaries
      return await this.summarizerInstance.summarize(summaries.join('\n\n'), { signal });
    }
  }

  public destroy() {
    if (this.summarizerInstance && typeof this.summarizerInstance.destroy === 'function') {
      this.summarizerInstance.destroy();
    }
  }
}

export default Summarizer;
