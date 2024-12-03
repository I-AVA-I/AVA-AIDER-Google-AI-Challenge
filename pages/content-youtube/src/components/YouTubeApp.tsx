import React, { useState, useEffect } from 'react';
import { YouTubeAppProps } from '../YouTubeAppProps';
import '@src/components/YouTubeApp.css';

const YouTubeApp: React.FC<YouTubeAppProps> = ({ videoId }) => {
  const [subtitles, setSubtitles] = useState<any[]>([]);
  const [error, setError] = useState<string | undefined | null>(null);
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<string | null>(null);

  const fetchSubtitles = () => {
    chrome.runtime.sendMessage(
      { action: 'getSubtitles', videoID: videoId, lang: 'en' },
      (response: { success: boolean; subtitles?: any[]; error?: string }) => {
        if (response.success) {
          if (response.subtitles && response.subtitles.length > 0) {
            setSubtitles(response.subtitles || []);
            setError(null);
          } else {
            setError('Summarization is available only for videos with subtitles at this time.');
          }
        } else {
          setError(response.error || 'An error occurred while fetching subtitles.');
        }
        setIsFetched(true);
      },
    );
  };

  const summarizeSubtitles = () => {
    if (subtitles.length === 0) {
      setError('No subtitles available to summarize.');
      return;
    }

    setIsLoading(true);
    chrome.runtime.sendMessage(
      { action: 'summarizeSubtitles', subtitles },
      (response: { success: boolean; summary?: string; error?: string }) => {
        setIsLoading(false);
        if (response.success) {
          setSummary(response.summary || 'No summary available.');
        } else {
          setError(response.error || 'Failed to summarize subtitles.');
        }
      },
    );
  };

  useEffect(() => {
    fetchSubtitles();
  }, [videoId]);

  return (
    <div className="youtube-app-container">
      <h1 className="youtube-app-title">Aider - {videoId}</h1>

      {isLoading && <p>Loading...</p>}
      {error && <div className="error-body">{error}</div>}
      {summary && (
        <div className="summary-container">
          <h2>Summary:</h2>
          <p>{summary}</p>
        </div>
      )}

      {!isLoading && !summary && (
        <button className="youtube-app-button" onClick={summarizeSubtitles}>
          Summarize Video
        </button>
      )}
    </div>
  );
};

export default YouTubeApp;
