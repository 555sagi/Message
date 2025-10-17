import React, { useState, useEffect, useMemo } from 'react';
import radh_krishna_desktop from "../assets/images/krishna_radha.jfif";
import radh_krishna_mobile from "../assets/images/radha-krishna-mobile.jfif";
import TextMessageSVG from '../assets/Message.svg?react';
import TextMessageMobile from '../assets/MessageMobile.svg?react';

// Increased breakpoint to catch more devices
const MOBILE_BREAKPOINT = 1024; // Changed from 768 to 1024
const TABLET_BREAKPOINT = 768;
const RESIZE_DEBOUNCE_MS = 150;

const useMediaQuery = () => {
  const getDeviceType = () => {
    const width = window.innerWidth;
    if (width < TABLET_BREAKPOINT) return 'mobile';
    if (width < MOBILE_BREAKPOINT) return 'tablet';
    return 'desktop';
  };

  const [deviceType, setDeviceType] = useState(getDeviceType);

  useEffect(() => {
    let timeoutId = null;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDeviceType(getDeviceType());
      }, RESIZE_DEBOUNCE_MS);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return deviceType;
};

const DesktopTextSVG = () => (
  <TextMessageSVG width="100%" height="auto" preserveAspectRatio="xMidYMid meet" />
);

const MobileTextSVG = () => (
  <TextMessageMobile width="100%" height="auto" preserveAspectRatio="xMidYMid meet" />
);

const TextMessage = ({ deviceType }) => {
  // Show which SVG is loading (for debugging)
  const isMobileView = deviceType === 'mobile' || deviceType === 'tablet';
  
  return (
    <>
      <style>{`
        @keyframes textAnimation {
          0% {
            stroke-dashoffset: 90;
            fill: transparent;
          }
          40% {
            fill: transparent;
          }
          100% {
            fill: #fff;
            stroke-dashoffset: 0;
          }
        }
        
        .svg-text-message path {
          fill: transparent;
          stroke: #fff;
          stroke-width: 0.1;
          stroke-dasharray: 90;
          stroke-dashoffset: 90;
          animation: textAnimation 8s ease-in-out forwards;
        }

        .svg-text-message {
          width: 100%;
          height: auto;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px 0;
        }

        .svg-text-message svg {
          max-width: 100%;
          max-height: 75vh;
          height: auto;
          width: auto;
          object-fit: contain;
        }

        /* Debug indicator */
        .device-indicator {
          position: fixed;
          top: 10px;
          right: 10px;
          background: rgba(255, 0, 0, 0.8);
          color: white;
          padding: 5px 10px;
          border-radius: 5px;
          font-size: 12px;
          z-index: 9999;
          font-family: monospace;
        }
      `}</style>
      
      
      
      <div className="svg-text-message">
        {isMobileView ? <MobileTextSVG /> : <DesktopTextSVG />}
      </div>
    </>
  );
};

const Message = () => {
  const deviceType = useMediaQuery();
  const isMobileView = deviceType === 'mobile' || deviceType === 'tablet';
  
  const backgroundImage = useMemo(() => {
    return isMobileView ? radh_krishna_mobile : radh_krishna_desktop;
  }, [isMobileView]);

  // Responsive scaling for all devices
  const textContainerStyle = useMemo(() => {
    let scale, width, maxWidth;
    
    switch(deviceType) {
      case 'mobile':
        // Small phones (< 768px)
        scale = window.innerWidth < 400 ? 0.9 : 1.1;
        width = '95%';
        maxWidth = '100%';
        break;
      case 'tablet':
        // Tablets (768px - 1024px)
        scale = 1.2;
        width = '90%';
        maxWidth = '100%';
        break;
      default:
        // Desktop (> 1024px)
        const screenWidth = window.innerWidth;
        if (screenWidth > 1920) {
          scale = 1.6; // Large screens (4K, ultra-wide)
          width = '65%';
        } else if (screenWidth > 1440) {
          scale = 1.4; // Medium-large screens (1440p)
          width = '75%';
        } else {
          scale = 1.2; // Normal desktop (1080p)
          width = '85%';
        }
        maxWidth = '1400px';
    }

    return {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: `translate(-50%, -50%) scale(${scale})`,
      textAlign: 'center',
      zIndex: 2,
      width: width,
      maxWidth: maxWidth,
      padding: deviceType === 'mobile' ? '10px 5px' : '15px 20px',
      boxSizing: 'border-box',
      maxHeight: '85vh',
      overflow: 'hidden'
    };
  }, [deviceType]);

  return (
    <div style={styles.container}>
      <img
        src={backgroundImage}
        alt="radha-krishna"
        style={styles.backgroundImage}
        loading="eager"
      />
      <div style={styles.overlay} />
      <div style={textContainerStyle}>
        <TextMessage deviceType={deviceType} />
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden'
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    opacity: 0.6,
    zIndex: 1,
    pointerEvents: 'none'
  }
};

export default Message;