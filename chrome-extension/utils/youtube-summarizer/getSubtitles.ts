import fetchData from './fetchData';

export default async function getSubtitles(videoID: string, lang = 'en') {
  const data = await fetchData(`https://www.youtube.com/watch?v=${videoID}`);
  //console.log(`https://www.youtube.com/watch?v=${videoID}`);
  //console.log(data);
  // Ensure we have access to captions data
  if (!data.includes('captionTracks')) {
    throw new Error(`Could not find captions for video: ${videoID}`);
  }
  console.log(data);
  const regex = /"captionTracks":(\[.*?\])/;
  const match = regex.exec(data);
  if (!match || !match[1]) {
    throw new Error(`Could not parse captions for video: ${videoID}`);
  }
  console.log(`{${match}}`);

  let captionTracks;
  try {
    captionTracks = JSON.parse(match[1]); // Extract and parse JSON array
  } catch (error: any) {
    console.error('Failed to parse captionTracks:', error.message);
    throw new Error(`Invalid JSON format in captionTracks for video: ${videoID}`);
  }

  console.log(captionTracks);
  const subtitle =
    captionTracks.find((track: any) => track.vssId === `.${lang}`) ||
    captionTracks.find((track: any) => track.vssId === `a.${lang}`) ||
    captionTracks.find((track: any) => track.vssId && track.vssId.match(`.${lang}`));

  if (!subtitle || !subtitle.baseUrl) {
    throw new Error(`Could not find ${lang} captions for ${videoID}`);
  }

  const transcriptData = await fetchData(subtitle.baseUrl);
  const transcript = transcriptData
    .replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', '')
    .replace('</transcript>', '')
    .split('</text>')
    .filter((line: any) => line && line.trim())
    .map((line: any) => {
      const startRegex = /start="([\d.]+)"/;
      const durRegex = /dur="([\d.]+)"/;

      const [, start] = startRegex.exec(line) || [];
      const [, dur] = durRegex.exec(line) || [];

      const htmlText = line
        .replace(/<text.+>/, '')
        .replace(/&amp;/gi, '&')
        .replace(/<\/?[^>]+(>|$)/g, '');

      return {
        start: parseFloat(start),
        dur: parseFloat(dur),
        text: htmlText,
      };
    });

  return transcript;
}
