import React, { useState, useEffect } from 'react';
import { YouTubeAppProps } from '../YouTubeAppProps';
import '@src/components/YouTubeApp.css';

const YouTubeApp: React.FC<YouTubeAppProps> = ({ videoId }) => {
  const [subtitles, setSubtitles] = useState<any[]>([]);
  const [error, setError] = useState<string | undefined | null>(null);
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  const languageOptions = [
    { code: 'en', label: 'EN' },
    { code: 'ru', label: 'RU' },
    { code: 'pl', label: 'PL' },
    { code: 'uk', label: 'UA' },
  ];

  const fetchSubtitles = () => {
    console.log('fetching subs: ');
    chrome.runtime.sendMessage(
      { action: 'getSubtitles', videoID: videoId, lang: 'en' },
      (response: { success: boolean; subtitles?: any[]; error?: string }) => {
        if (response.success) {
          if (response.subtitles && response.subtitles.length > 0) {
            setSubtitles(response.subtitles || []);
            console.log('subs: ' + response.subtitles);
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
          if (selectedLanguage === 'en') {
            setSummary(response.summary || 'No summary available.');
          } else {
            translateSummary(response.summary || 'No summary available.');
          }
        } else {
          setError(response.error || 'Failed to summarize subtitles.');
        }
      },
    );
  };

  const translateSummary = async (text: string) => {
    if (!('translation' in window && window.translation)) {
      setError('Translation API is not supported in this browser.');
      return;
    }

    const parameters = { sourceLanguage: 'en', targetLanguage: selectedLanguage };

    try {
      const state = await window.translation!.canTranslate(parameters);
      if (state === 'no') {
        throw new Error('Translation is not available for this language pair.');
      }

      const translator = await window.translation!.createTranslator(parameters);
      const translation = await translator.translate(text);
      setSummary(translation);
    } catch (error) {
      console.error('Translation error:', error);
      setError('An error occurred while translating the summary.');
    }
  };

  useEffect(() => {
    fetchSubtitles();
  }, [videoId]);

  return (
    <div className="youtube-app-container">
      <div className="youtube-app-header">
        <h1 className="youtube-app-title"> Summarize </h1>
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
