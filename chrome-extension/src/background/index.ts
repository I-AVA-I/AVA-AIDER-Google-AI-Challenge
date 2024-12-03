import 'webextension-polyfill';
import getSubtitles from '../../utils/youtube-summarizer/getSubtitles';
import summarizeText from '../../utils/youtube-summarizer/getSummary';

console.log('background loaded');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSubtitles') {
    getSubtitles(message.videoID, message.lang)
      .then(subtitles => sendResponse({ success: true, subtitles }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Indicates async response
  } else if (message.action === 'summarizeSubtitles') {
    const { subtitles } = message;

    if (!subtitles || subtitles.length === 0) {
      sendResponse({ success: false, error: 'No subtitles provided for summarization.' });
      return;
    }

    const subtitlesText = subtitles.map((subtitle: any) => subtitle.text).join(' ');

    summarizeText(subtitlesText)
      .then(summary => sendResponse({ success: true, summary }))
      .catch(error => {
        console.error('Error summarizing subtitles:', error);
        sendResponse({
          success: false,
          error: 'An error occurred while summarizing subtitles.',
          errorDetails: error,
        });
      });
    return true;
  } else {
    return;
  }
});
