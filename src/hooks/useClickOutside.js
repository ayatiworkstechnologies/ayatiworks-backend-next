import { useEffect, useRef } from 'react';

/**
 * Detects clicks outside of a component and calls the handler
 * @param {Function} handler - Function to call when clicking outside
 * @returns {React.RefObject} Ref to attach to the component
 */
export function useClickOutside(handler) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      // Unbind the event listener on cleanup
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handler]);

  return ref;
}
