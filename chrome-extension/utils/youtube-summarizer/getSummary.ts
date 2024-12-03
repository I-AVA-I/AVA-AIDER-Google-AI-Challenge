export default async function summarizeText(text: string) {
  if (!('ai' in self && 'summarizer' in self.ai)) {
    throw new Error('Summarizer API is not supported in this browser.');
  }

  const options = {
    sharedContext: 'This is a youtube subtitles',
    type: 'key-points',
    format: 'markdown',
    length: 'long',
  };

  const available = (await self.ai.summarizer.capabilities()).available;
  let summarizer;

  if (available === 'no') {
    throw new Error('The Summarizer API is not usable.');
  }

  if (available === 'readily') {
    summarizer = await self.ai.summarizer.create(options);
  } else {
    summarizer = await self.ai.summarizer.create(options);
    summarizer.addEventListener('downloadprogress', e => {
      console.log(`Model download progress: ${e.loaded} / ${e.total}`);
    });
    await summarizer.ready;
  }

  console.log(text);

  return summarizer.summarize(text);
}
