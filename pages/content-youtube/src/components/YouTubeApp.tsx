import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MdContentCopy, MdFormatListBulleted } from 'react-icons/md';
import { MdFormatAlignJustify } from 'react-icons/md';
import { t } from '@extension/i18n';
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

const lengthOptions = [
  { value: 'short', label: t('short') },
  { value: 'medium', label: t('medium') },
  { value: 'long', label: t('long') },
];

const YouTubeApp: React.FC<YouTubeAppProps> = ({ videoId }) => {
  const [subtitles, setSubtitles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFetched, setIsFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [summaryType, setSummaryType] = useState<'key-points' | 'tl;dr'>('key-points');
  const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'long'>('short');
  const [dotCount, setDotCount] = useState(1);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  useEffect(() => {
    resetState();
    fetchSubtitles();
  }, [videoId]);

  useEffect(() => {
    if (subtitles.length > 0) {
      summarizeSubtitles();
      setIsLoading(true);
    }
  }, [summaryType, summaryLength, selectedLanguage]);

  const resetState = () => {
    setSubtitles([]);
    setError(null);
    setIsFetched(false);
    setIsLoading(false);
    setSummary(null);
    setDotCount(1);
    setIsPanelVisible(false);
  };

  const fetchSubtitles = () => {
    chrome.runtime.sendMessage({ action: 'getSubtitles', videoID: videoId, lang: 'en' }, response => {
      if (response.success) {
        if (response.subtitles && response.subtitles.length > 0) {
          setSubtitles(response.subtitles);
          setError(null);
        } else {
          setError(t('subtitlesUnavailable'));
        }
      } else {
        setError(response.error || t('subtitlesUnavailable'));
      }
      setIsFetched(true);
    });
  };

  const summarizeSubtitles = async () => {
    if (subtitles.length === 0) {
      setError(t('subtitlesUnavailable'));
      return;
    }

    // Abort the previous request if there is one
    if (abortController) {
      abortController.abort();
    }

    // Create a new AbortController for this request
    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    setIsLoading(true);
    setSummary(null);
    setDotCount(1);
    setIsPanelVisible(true);

    const text = subtitlesToText(subtitles, false);
    const summarizerOptions: SummarizerOptions = {
      sharedContext: '',
      type: summaryType,
      format: 'markdown',
      length: summaryLength,
      maxInputChunkLength: 4000,
      overlapChunkLength: 500,
    };
    const summarizer = new Summarizer(summarizerOptions);

    try {
      let summary = await summarizer.summarize(text, newAbortController.signal);
      if (selectedLanguage !== 'en') {
        summary = await translateSummary(summary);
      }
      setSummary(summary);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Summarization request was aborted');
      } else {
        setError(t('failedToSummarize'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const translateSummary = async (text: string) => {
    if (!('translation' in window && window.translation)) {
      throw new Error('Translation API is not supported in this browser.');
    }
    const parameters = { sourceLanguage: 'en', targetLanguage: selectedLanguage };
    try {
      const state = await window.translation!.canTranslate(parameters);
      if (state === 'no') {
        console.error('Translation error:', error);
        return text;
      }
      const translator = await window.translation!.createTranslator(parameters);
      return await translator.translate(text);
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('An error occurred while translating the summary.');
    }
  };

  // useEffect(() => {
  //   let dotInterval: number;
  //   if (isLoading) {
  //     dotInterval = setInterval(() => {
  //       setDotCount((prevCount) => (prevCount % 4) + 1);
  //     }, 1000);
  //   } else {
  //     setDotCount(1);
  //   }
  //   return () => clearInterval(dotInterval);
  // }, [isLoading]);

  const copyToClipboard = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
    }
  };

  return (
    <div className="youtube-app-container">
      {subtitles.length > 0 && !isPanelVisible && (
        <button className="youtube-app-button" onClick={summarizeSubtitles}>
          {t('summarizeVideo')}
        </button>
      )}

      {isPanelVisible && (
        <div className="youtube-app-panel">
          <div className="summary-panel">
            <div className="youtube-app-header">
              <h1 className="youtube-app-title">{t('transcriptSummary')}</h1>
              <div className="selectors-container">
                <div className="toggle-icons">
                  <MdFormatListBulleted
                    className={`icon ${summaryType === 'key-points' ? 'active' : ''}`}
                    onClick={() => setSummaryType('key-points')}
                    title={t('keyPoints')}
                  />
                  <MdFormatAlignJustify
                    className={`icon ${summaryType === 'tl;dr' ? 'active' : ''}`}
                    onClick={() => setSummaryType('tl;dr')}
                    title={t('tldr')}
                  />
                </div>

                <select
                  value={summaryLength}
                  onChange={e => setSummaryLength(e.target.value as 'short' | 'medium' | 'long')}
                  className="menu-selector"
                  style={{ marginRight: '10px' }}>
                  {lengthOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedLanguage}
                  onChange={e => setSelectedLanguage(e.target.value)}
                  className="menu-selector">
                  {languageOptions.map(option => (
                    <option key={option.code} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading && (
              <div className="loading-text">
                {summaryType === 'key-points' ? t('loading_key') : t('loading_tldr')}
                {'.'.repeat(dotCount - 1)}
              </div>
            )}

            {error && <div className="error-body">{error}</div>}

            {summary && (
              <div className="summary-container">
                <ReactMarkdown>{summary}</ReactMarkdown>
                <button className="copy-button" onClick={copyToClipboard}>
                  <MdContentCopy size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeApp;
