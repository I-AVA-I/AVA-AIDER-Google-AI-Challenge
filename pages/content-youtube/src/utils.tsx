// Function to extract video ID from YouTube URL
export function extractVideoId(url: string) {
  if (!url) return null;
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes('youtube.com')) {
      return parsedUrl.searchParams.get('v');
    } else if (parsedUrl.hostname.includes('youtu.be')) {
      return parsedUrl.pathname.slice(1);
    }
  } catch (error) {
    console.error('Invalid URL:', error);
  }
  return null;
}

// Function to check if we're on a YouTube video page
export function isYouTubeVideoPage() {
  const videoId = extractVideoId(window.location.href);
  return !!videoId;
}

export function waitForElement(selector: string, callback: (element: Element) => void) {
  const element = document.querySelector(selector);
  if (element) {
    callback(element);
  } else {
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        callback(element);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}
