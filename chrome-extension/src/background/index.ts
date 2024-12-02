import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';
import axios from 'axios';

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");

const fetchData =
  typeof fetch === 'function'
    ? async function fetchData(url: string) {
        const response = await fetch(url);
        return await response.text();
      }
    : async function fetchData(url: string) {
        const { data } = await axios.get(url);
        return data;
      };

async function getSubtitles(videoID: string, lang = 'en') {
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

// Handle Messages from NewTab
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(sender);

  if (message.action === 'getSubtitles') {
    getSubtitles(message.videoID, message.lang)
      .then(subtitles => sendResponse({ success: true, subtitles }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Handle Messages from contentScript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkYouTubeURL') {
    // Get the active tab's URL
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (chrome.runtime.lastError) {
        console.error('Failed to get active tab:', chrome.runtime.lastError);
        sendResponse({ success: false, error: 'Failed to get active tab' });
        return;
      }

      if (tabs.length > 0) {
        const activeTab = tabs[0];
        const url = activeTab.url || '';
        const isYouTube = url.includes('youtube.com/watch');
        console.log(url);
        sendResponse({ success: true, isYouTube, url });
      } else {
        console.error('No active tab found.');
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });

    return true;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'summarizeSubtitles') {
    const { subtitles } = message;

    if (!subtitles || subtitles.length === 0) {
      sendResponse({ success: false, error: 'No subtitles provided for summarization.' });
      return;
    }

    const subtitlesText = subtitles.map((subtitle: any) => subtitle.text).join(' ');

    summarizeText(subtitlesText)
      .then(summary => {
        sendResponse({ success: true, summary });
      })
      .catch(error => {
        console.error('Error summarizing subtitles:', error);
        sendResponse({
          success: false,
          error: 'An error occurred while summarizing subtitles.',
        });
      });

    return true;
  }
});

const summarizeText = async (text: any) => {
  if (!('ai' in self && 'summarizer' in self.ai)) {
    throw new Error('Summarizer API is not supported in this browser.');
  }

  const options = {
    type: 'key-points',
    format: 'markdown',
    length: 'medium',
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

  return summarizer.summarize(text);
};
