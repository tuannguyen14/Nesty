// components/OverlayLoading.tsx
import React from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '@/data/animations/loading.json';

interface OverlayLoadingProps {
  isVisible: boolean;
  message?: string;
  overlayOpacity?: number;
}

const OverlayLoading: React.FC<OverlayLoadingProps> = ({ 
  isVisible, 
  overlayOpacity = 0.7
}) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 transition-all duration-300"
      style={{ 
        backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
        backdropFilter: 'blur(2px)'
      }}
    >
      <Lottie
        animationData={loadingAnimation}
        loop={true}
        autoplay={true}
        style={{ width: 120, height: 120 }}
      />
    </div>
  );
};

export default OverlayLoading;