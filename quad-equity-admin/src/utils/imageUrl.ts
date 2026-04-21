/**
 * Normalizes image URLs to work in both development and production environments.
 * Converts localhost URLs to use the API URL from environment variables.
 * 
 * @param url - The image URL to normalize
 * @returns The normalized URL that works in the current environment
 */
export const normalizeImageUrl = (url: string | undefined | null): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return '';
  }

  // If it's already a full URL (https:// or http://), check if it's localhost
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // If it's a localhost URL, replace it with the API URL
    if (url.includes('localhost:2022') || url.includes('127.0.0.1:2022')) {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl) {
        // Extract the path from the localhost URL (e.g., /page-content/...)
        const urlPath = url.replace(/^https?:\/\/[^\/]+/, '');
        // Construct new URL using API base URL
        return `${apiUrl}${urlPath}`;
      }
    }
    // If it's already a proper URL (S3, CDN, etc.), return as-is
    return url;
  }

  // If it's a relative path (starts with /), prepend API URL if needed
  if (url.startsWith('/')) {
    const apiUrl = import.meta.env.VITE_API_URL;
    // If the path starts with /api/, it's already relative to the API base
    // Otherwise, it might be a static asset or page-content path
    if (url.startsWith('/api/')) {
      return url;
    }
    // For paths like /page-content/..., use the API URL
    if (apiUrl && !url.startsWith('/assets/') && !url.startsWith('/images/')) {
      return `${apiUrl}${url}`;
    }
    return url;
  }

  // Return as-is if it doesn't match any pattern
  return url;
};

/**
 * Normalizes an array of image URLs
 */
export const normalizeImageUrls = (urls: (string | undefined | null)[]): string[] => {
  return urls
    .map(url => normalizeImageUrl(url))
    .filter(url => url && url.trim() !== '');
};
