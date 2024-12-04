import { Subtitle } from '@src/utils/subtitlesToText';
import { t } from '@extension/i18n';

export const getYTSubtitles = (videoId: string): Promise<Subtitle[]> => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'getSubtitles', videoID: videoId, lang: 'en' }, response => {
      if (response.success) {
        if (response.subtitles && response.subtitles.length > 0) {
          resolve(response.subtitles);
        } else {
          reject(new Error('There was an error getting subtitles.'));
        }
      } else {
        reject(new Error(response.error));
      }
    });
  });
};
