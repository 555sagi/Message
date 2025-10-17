import React, { useState, useEffect } from 'react';
import TextMessageSVG from '../assets/Message.svg?react';
import TextMessageMobile from '../assets/MessageMobile.svg?react';
import cssStyle from '../components/css/TextMessage.module.css'

// Define same breakpoint
const MOBILE_BREAKPOINT = 768;

const TextMessage = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="svg-container" style={{ width: '100%', height: 'auto' }}>
      {isMobile ? (
        <TextMessageMobile   width="100%" height="auto" preserveAspectRatio="xMidYMid meet" />
      ) : (
        <TextMessageSVG  width="100%" height="auto" preserveAspectRatio="xMidYMid meet" />
      )}
    </div>
  );
};

export default TextMessage;
