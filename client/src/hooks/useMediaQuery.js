import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if a media query matches the current screen size
 * @param {string} query - The media query to check against (e.g. "(max-width: 768px)")
 * @returns {boolean} - True if the media query matches, false otherwise
 */
const useMediaQuery = (query) => {
  // Initialize state with the match status
  const [matches, setMatches] = useState(() => {
    // Check for window to support SSR
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia(query);

      // Update matches state initially
      setMatches(mediaQuery.matches);

      // Create listener function
      const updateMatches = (event) => {
        setMatches(event.matches);
      };

      // Add listener using the modern API
      mediaQuery.addEventListener('change', updateMatches);

      // Clean up
      return () => {
        mediaQuery.removeEventListener('change', updateMatches);
      };
    }
  }, [query]);

  return matches;
};

export default useMediaQuery;
