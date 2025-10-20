import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// import { processFaviconWithBackgroundRemoval, updateFaviconInDom } from './utils/faviconProcessor';

// Process favicon with background removal
// processFaviconWithBackgroundRemoval('/lovable-uploads/7835faf8-3408-4d06-93b5-edfb87f24ebb.png')
//   .then((processedFaviconUrl) => {
//     updateFaviconInDom(processedFaviconUrl);
//   })
//   .catch((error) => {
//     console.error('Failed to process favicon:', error);
//   });

createRoot(document.getElementById("root")!).render(<App />);
