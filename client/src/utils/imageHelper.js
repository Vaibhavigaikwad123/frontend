import { API_URL } from './api';

const SERVER_URL = API_URL.replace('/api', '');

/**
 * Helper to get the full URL for an image.
 * Handles:
 * 1. External URLs (http/https)
 * 2. Blob URLs (previews)
 * 3. Uploaded files (starting with /uploads)
 * 4. Local assets (stripping absolute paths if necessary)
 * 
 * @param {string} path - The image path or URL
 * @returns {string} The full usable image URL
 */
export const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('blob:')) return path;
    if (path.startsWith('http')) return path;

    // Normalize backslashes to forward slashes for easier checking
    let cleanPath = path.replace(/\\/g, '/');

    // Strip "file:///" protocol if present
    if (cleanPath.startsWith('file:///')) {
        cleanPath = cleanPath.replace('file:///', '');
    }

    if (cleanPath.startsWith('/uploads')) return `${SERVER_URL}${cleanPath}`;

    // Fix for accidental absolute paths containing /assets/
    // e.g. "D:/Stationary/client/public/assets/img.jpg" -> "/assets/img.jpg"
    if (cleanPath.includes('/assets/')) {
        return cleanPath.substring(cleanPath.indexOf('/assets/'));
    }

    return cleanPath;
};
