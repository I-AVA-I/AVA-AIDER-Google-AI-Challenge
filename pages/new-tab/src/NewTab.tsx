import '@src/NewTab.css';
import '@src/NewTab.scss';
import { useEffect, useState } from 'react';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { Button } from '@extension/ui';
import { t } from '@extension/i18n';
import axios from 'axios';

const NewTab: React.FC = () => {
  const [videoId, setVideoId] = useState<string>('');
  const [language, setLanguage] = useState<string>('en');
  const [subtitles, setSubtitles] = useState<any[]>([]);
  const [error, setError] = useState<string | undefined | null>(null);

  const handleFetchSubtitles = () => {
    setError(null); // Clear previous errors
    chrome.runtime.sendMessage(
      { action: 'getSubtitles', videoID: videoId, lang: language },
      (response: { success: boolean; subtitles?: any[]; error?: string }) => {
        if (response.success) {
          setSubtitles(response.subtitles || []);
        } else {
          console.error(response.error);
          setError(response.error);
        }
      },
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>YouTube Captions Access</h1>

      <div>
        <input
          type="text"
          placeholder="Enter YouTube Video ID"
          value={videoId}
          onChange={e => setVideoId(e.target.value)}
          style={{
            padding: '8px',
            marginRight: '10px',
            width: '300px',
            border: '1px solid #ccc',
          }}
        />
        <input
          type="text"
          placeholder="Enter Language (e.g., en)"
          value={language}
          onChange={e => setLanguage(e.target.value)}
          style={{
            padding: '8px',
            marginRight: '10px',
            width: '100px',
            border: '1px solid #ccc',
          }}
        />
        <button onClick={handleFetchSubtitles} style={{ padding: '8px' }}>
          Fetch Subtitles
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {subtitles.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>Subtitles</h2>
          <ul>
            {subtitles.map((subtitle, index) => (
              <li key={index}>
                <strong>Start:</strong> {subtitle.start}s | <strong>Duration:</strong> {subtitle.dur}s
                <br />
                {subtitle.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default withErrorBoundary(withSuspense(NewTab, <div>{t('loading')}</div>), <div>Error Occur</div>);
