// import { createRoot } from 'react-dom/client';
// import React, { useState, useEffect } from 'react';
// import YouTubeApp from '@src/components/YouTubeApp';
// import DefaultApp from '@src/components/DefaultApp';
// import tailwindcssOutput from '../dist/tailwind-output.css?inline';
// import youtubeAppCSS from '@src/components/YouTubeApp.css?inline';
//
// function App({ isYouTube, videoId }: { isYouTube: boolean; videoId: string | null }) {
//   return isYouTube ? <YouTubeApp videoId={videoId} /> : <DefaultApp />;
// }
//
// function extractVideoId(url: string | undefined): string | null {
//   if (!url) return null;
//
//   try {
//     const parsedUrl = new URL(url);
//     if (parsedUrl.hostname.includes('youtube.com')) {
//       return parsedUrl.searchParams.get('v');
//     } else if (parsedUrl.hostname.includes('youtu.be')) {
//       return parsedUrl.pathname.slice(1);
//     }
//   } catch (error) {
//     console.error('Invalid URL:', error);
//   }
//
//   return null;
// }
//
// function checkYouTubeURL(): Promise<{ isYouTube: boolean; videoId: string | null }> {
//   return new Promise(resolve => {
//     chrome.runtime.sendMessage({ action: 'checkYouTubeURL' }, response => {
//       if (chrome.runtime.lastError) {
//         console.error('Failed to communicate with service worker:', chrome.runtime.lastError);
//         resolve({ isYouTube: false, videoId: null });
//         return;
//       }
//
//       if (response?.success) {
//         resolve({ isYouTube: response.isYouTube, videoId: extractVideoId(response.url) || null });
//       } else {
//         console.warn('Unexpected response from service worker:', response);
//         resolve({ isYouTube: false, videoId: null });
//       }
//     });
//   });
// }
//
// // Function to observe DOM changes and wait for "secondary" to appear
// function observeYouTubeDOMChanges(videoId: string) {
//   const observer = new MutationObserver(mutations => {
//     for (const mutation of mutations) {
//       if (mutation.type === 'childList') {
//         const targetContainer = document.getElementById('secondary');
//         if (
//           targetContainer &&
//           !targetContainer.querySelector('#chrome-extension-boilerplate-react-vite-content-view-root')
//         ) {
//           console.log('Secondary container detected.');
//           injectYouTubeComponent(targetContainer, videoId);
//           observer.disconnect();
//           break;
//         }
//       }
//     }
//   });
//
//   // Start observing changes in the DOM, including the subtree
//   observer.observe(document.body, { childList: true, subtree: true });
// }
//
// // Function to inject the React component into the "secondary" container
// function injectYouTubeComponent(targetContainer: HTMLElement, videoId: string) {
//   const existingElement = targetContainer.querySelector('#chrome-extension-boilerplate-react-vite-content-view-root');
//   if (existingElement) {
//     console.log('Extension component is already injected.');
//     return;
//   }
//
//   console.log('Injecting YouTube component...');
//
//   const root = document.createElement('div');
//   root.id = 'chrome-extension-boilerplate-react-vite-content-view-root';
//
//   const shadowRoot = root.attachShadow({ mode: 'open' });
//
//   const styleElement = document.createElement('style');
//   styleElement.textContent = youtubeAppCSS;
//   shadowRoot.appendChild(styleElement);
//
//   const appContainer = document.createElement('div');
//   appContainer.className = 'youtube-app';
//   shadowRoot.appendChild(appContainer);
//
//   createRoot(appContainer).render(<App isYouTube={true} videoId={videoId} />);
//
//   const secondaryInner = targetContainer.querySelector('#secondary-inner');
//   if (secondaryInner) {
//     targetContainer.insertBefore(root, secondaryInner);
//   } else {
//     console.warn('secondary-inner not found, adding to secondary.');
//     targetContainer.appendChild(root);
//   }
// }
//
// // Entry point
// (async () => {
//   const { isYouTube, videoId } = await checkYouTubeURL();
//   if (isYouTube) {
//     console.log('YouTube detected, observing DOM changes...');
//     observeYouTubeDOMChanges(videoId ? videoId : '  ');
//   } else {
//     console.log('Not YouTube, rendering DefaultApp.');
//
//     const root = document.createElement('div');
//     root.id = 'chrome-extension-boilerplate-react-vite-content-view-root';
//     document.body.appendChild(root);
//
//     const rootIntoShadow = document.createElement('div');
//     rootIntoShadow.id = 'shadow-root';
//
//     const shadowRoot = root.attachShadow({ mode: 'open' });
//
//     if (navigator.userAgent.includes('Firefox')) {
//       const styleElement = document.createElement('style');
//       styleElement.innerHTML = tailwindcssOutput;
//       shadowRoot.appendChild(styleElement);
//     } else {
//       const globalStyleSheet = new CSSStyleSheet();
//       globalStyleSheet.replaceSync(tailwindcssOutput);
//       shadowRoot.adoptedStyleSheets = [globalStyleSheet];
//     }
//
//     shadowRoot.appendChild(rootIntoShadow);
//     createRoot(rootIntoShadow).render(<App isYouTube={false} videoId={null} />);
//   }
// })();
