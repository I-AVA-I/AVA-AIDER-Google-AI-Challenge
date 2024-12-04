import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

import { YouTubeAppProps } from '../YouTubeAppProps';
import '@src/components/YouTubeApp.css';
import Summarizer, { SummarizerOptions } from '@src/services/Summarizer';
import { Subtitle, subtitlesToText } from '@src/utils/subtitlesToText';

const languageOptions = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'pl', label: 'PL' },
  { code: 'uk', label: 'UA' },
];

const YouTubeApp: React.FC<YouTubeAppProps> = ({ videoId }) => {
  const [subtitles, setSubtitles] = useState<any[]>([]);
  const [error, setError] = useState<string | undefined | null>(null);
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  useEffect(() => {
    resetState();
    fetchSubtitles();
  }, [videoId]);

  const resetState = () => {
    setSubtitles([]);
    setError(null);
    setIsFetched(false);
    setIsLoading(false);
    setSummary(null);
  };

  const fetchSubtitles = () => {
    chrome.runtime.sendMessage({ action: 'getSubtitles', videoID: videoId, lang: 'en' }, response => {
      if (response.success) {
        if (response.subtitles && response.subtitles.length > 0) {
          setSubtitles(response.subtitles);
          console.log('Subs:', response.subtitles);
          setError(null);
        } else {
          setError('Summarization is available only for videos with subtitles.');
        }
      } else {
        setError(response.error || 'An error occurred while fetching subtitles.');
      }
      setIsFetched(true);
    });
  };

  const summarizeSubtitles = async () => {
    if (subtitles.length === 0) {
      setError('No subtitles available to summarize.');
      return;
    }

    setIsLoading(true);
    setSummary(''); // Initialize summary as empty string
    const text = subtitlesToText(subtitles, false);
    const summarizerOptions: SummarizerOptions = {
      sharedContext: '',
      type: 'key-points',
      format: 'plain-text',
      length: 'short',
      maxInputChunkLength: 4000,
      overlapChunkLength: 500,
    };
    const summarizer = new Summarizer(summarizerOptions);

    try {
      const summary = await summarizer.summarize(text);
      setSummary(summary);
    } catch (error) {
      setError(error?.toString() || 'Failed to summarize subtitles.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="youtube-app-container">
      <div className="youtube-app-header">
        <h1 className="youtube-app-title">Aider</h1>
        <div className="language-selector-container">
          <select
            value={selectedLanguage}
            onChange={e => setSelectedLanguage(e.target.value)}
            className="language-selector">
            {languageOptions.map(option => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && <div className="loading-spinner"></div>}

      {error && <div className="error-body">{error}</div>}
      {summary && (
        <div className="summary-container">
          <h2>Summary:</h2>
          <ReactMarkdown>{summary}</ReactMarkdown>
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
