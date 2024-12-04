import 'webextension-polyfill';
import getSubtitles from '../../utils/youtube-summarizer/getSubtitles';

console.log('background loaded');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSubtitles') {
    getSubtitles(message.videoID, message.lang)
      .then(subtitles => sendResponse({ success: true, subtitles }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Indicates async response
  }
  return;
});
