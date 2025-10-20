// Simplified favicon processor - removed background removal dependency
// If background removal is needed in the future, use a simpler or browser-compatible approach.

export const processFaviconWithBackgroundRemoval = async (imageUrl: string): Promise<string> => {
  // For now, just return the original image URL
  // Background removal functionality can be added later with a simpler approach
  return imageUrl;
};

export const updateFaviconInDom = (faviconUrl: string) => {
  // Remove existing favicon links
  const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
  existingFavicons.forEach(link => link.remove());
  
  // Add new favicon
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = faviconUrl;
  document.head.appendChild(link);
};