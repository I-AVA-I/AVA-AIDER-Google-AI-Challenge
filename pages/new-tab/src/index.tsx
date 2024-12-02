import { createRoot } from 'react-dom/client';
import '@src/index.css';
import '@extension/ui/lib/global.css';
import NewTab from '@src/NewTab';

function init() {
  // const otMeta = document.createElement('meta');
  // otMeta.httpEquiv = 'origin-trial';
  // otMeta.content = 'Ar5Mg6M04kDaYsFEAWDiKC78Tsi+Xx2mvFgp05Xoq0llz8I8aUpkc2enAaw/K/NvItms2TVETx6ev/7uqaolEQAAAABzeyJvcmlnaW4iOiJjaHJvbWUtZXh0ZW5zaW9uOi8vbGpvY2RlbWFwb2JvbmNqa25icG1scGxpaWdmcGNqcGYiLCJmZWF0dXJlIjoiQUlTdW1tYXJpemF0aW9uQVBJIiwiZXhwaXJ5IjoxNzUzMTQyNDAwfQ==';
  // document.head.append(otMeta);

  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  const root = createRoot(appContainer);

  root.render(<NewTab />);
}

init();
