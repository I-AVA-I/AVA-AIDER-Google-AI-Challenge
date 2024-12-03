import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import React from 'react';
import YouTubeApp from '@src/components/YouTubeApp';
import youtubeAppCSS from '@src/components/YouTubeApp.css?inline';
import { extractVideoId, isYouTubeVideoPage, waitForElement } from '@src/utils';

// Variables to hold the root instance and the root element
let rootInstance: Root | null = null;
let rootElement: HTMLDivElement | null = null;

function injectYouTubeComponent() {
  waitForElement('#secondary', targetContainer => {
    // Function to inject the React component into the page
    const videoId = extractVideoId(window.location.href);

    if (!videoId) {
      console.warn('No video ID found.');
      return;
    }

    if (rootInstance) {
      console.log('Updating YouTube component with new videoId.');
      // Update the component with the new videoId
      rootInstance.render(<YouTubeApp videoId={videoId} />);
      return;
    }

    console.log('Injecting YouTube component...');

    if (!targetContainer) {
      console.warn('Target container not found.');
      return;
    }

    rootElement = document.createElement('div');
    rootElement.id = 'youtube-summarizer-root';

    const shadowRoot = rootElement.attachShadow({ mode: 'open' });

    const styleElement = document.createElement('style');
    styleElement.textContent = youtubeAppCSS;
    shadowRoot.appendChild(styleElement);

    const appContainer = document.createElement('div');
    appContainer.className = 'youtube-app';
    shadowRoot.appendChild(appContainer);

    rootInstance = createRoot(appContainer);
    rootInstance.render(<YouTubeApp videoId={videoId} />);

    const secondaryInner = targetContainer.querySelector('#secondary-inner');
    if (secondaryInner) {
      targetContainer.insertBefore(rootElement, secondaryInner);
    } else {
      console.warn('secondary-inner not found, adding to secondary.');
      targetContainer.appendChild(rootElement);
    }
  });
}

// Function to remove the injected component
function removeYouTubeComponent() {
  if (rootInstance && rootElement) {
    rootInstance.unmount();
    rootElement.remove();
    rootInstance = null;
    rootElement = null;
    console.log('Removed existing extension component.');
  }
}

// Function to handle navigation events
function handleNavigation() {
  if (isYouTubeVideoPage()) {
    injectYouTubeComponent();
  } else {
    removeYouTubeComponent();
  }
}

// Listen for YouTube's SPA navigation event
document.addEventListener('yt-navigate-finish', () => {
  console.log('Navigation event detected.');
  handleNavigation();
});

// Initial execution
handleNavigation();
