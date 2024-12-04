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

const maxBlockLength = 2000;
const overlapLines = 2;
// const blocks = splitSubtitlesWithOverlap(subtitles, maxBlockLength, overlapLines);

// console.log('Generated blocks:', blocks);
// const summaries: string[] = [];
// const processBlock = (index: number) => {
//   if (index >= blocks.length) {
//     const finalSummary = summaries.join('\n\n');
//     sendResponse({ success: true, summary: finalSummary });
//     return;
//   }
//   const subtitlesText = blocks[index].text;
//   const previousBlock = blocks[index - 1] ? blocks[index - 1] : null;
//   summarizeText(subtitlesText, previousBlock?.text)
//     .then(summary => {
//       summaries.push(`Block ${index + 1}:\n${summary}`);
//       processBlock(index + 1);
//     })
//     .catch(error => {
//       console.error(`Error summarizing block ${index + 1}:`, error);
//       sendResponse({
//         success: false,
//         error: `An error occurred while summarizing block ${index + 1}.`,
//       });
//     });
// };
//
// processBlock(0);
//
// function splitSubtitlesWithOverlap(
//   subtitles: { start: number; dur: number; text: string }[],
//   maxBlockLength: number,
//   overlapLines: number,
// ) {
//   const blocks: { start: number; end: number; text: string }[] = [];
//   let currentBlock: { start: number; end: number; text: string } | null = null;
//   let currentText = '';
//   let currentStart = subtitles[0]?.start || 0;
//   for (let i = 0; i < subtitles.length; i++) {
//     const subtitle = subtitles[i];
//     const nextText = `${currentText} ${subtitle.text}`.trim();
//     if (nextText.length > maxBlockLength) {
//       blocks.push({
//         start: currentStart,
//         end: subtitle.start,
//         text: currentText.trim(),
//       });
//       currentStart = subtitles[Math.max(0, i - overlapLines)].start;
//       currentText = subtitles
//         .slice(Math.max(0, i - overlapLines), i + 1)
//         .map(s => s.text)
//         .join(' ');
//     } else {
//       currentText = nextText;
//     }
//   }
//   if (currentText.trim().length > 0) {
//     blocks.push({
//       start: currentStart,
//       end: subtitles[subtitles.length - 1].start + subtitles[subtitles.length - 1].dur,
//       text: currentText.trim(),
//     });
//   }
//   return blocks;
// }
