import React, { useEffect, useRef } from 'react';

const MorphOverlay = ({ isDark, onAnimationComplete }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const startAnimation = async () => {
      // Start expanding
      overlay.classList.remove('scale-0', 'opacity-0');
      overlay.classList.add('scale-150', 'opacity-70');
      
      // Wait for expansion to complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Call completion callback
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    };

    startAnimation();
  }, [onAnimationComplete]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 pointer-events-none transform scale-0 opacity-0 transition-all duration-1000 ease-out origin-center"
      style={{
        backgroundColor: isDark ? '#ffffff' : '#111827',
      }}
    />
  );
};

export default MorphOverlay;