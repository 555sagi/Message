import { useState, useRef, useEffect, useMemo } from 'react';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';
import * as blazeface from '@tensorflow-models/blazeface';
import { useNavigate } from 'react-router-dom';
import '@tensorflow/tfjs';
import ShowMessage from './ShowMessage';
import cssStyles from './css/CameraButton.module.css';
import FinalMessage from './FinalMessage';

// Device detection constants
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const RESIZE_DEBOUNCE_MS = 150;

// Custom hook for device detection
const useDeviceType = () => {
  const getDeviceType = () => {  
    const width = window.innerWidth;
    if (width < MOBILE_BREAKPOINT) return 'mobile';
    if (width < TABLET_BREAKPOINT) return 'tablet';
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

export default function HeadCounter() {
  const [headCount, setHeadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [finalMessage,setFinalMessage] = useState(false)
  const [error, setError] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const navigate = useNavigate();
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionInterval = useRef(null);
  const modelRef = useRef(null);
  
  // Get device type
  const deviceType = useDeviceType();
  
  // Calculate responsive positioning for camera controls
  const controlsPosition = useMemo(() => {
    switch(deviceType) {
      case 'mobile':
        return {
          position: 'absolute',
          top: '85%',      // Higher position for mobile
          left: '50%',
          transform: 'translateX(-50%)',  // Center horizontally
          zIndex: 3,
          width: '90%',    // Wider on mobile
          display: 'flex',
          justifyContent: 'center'
        };
      case 'tablet':
        return {
          position: 'absolute',
          top: '88%',      // Medium position for tablet
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          width: '70%',
          display: 'flex',
          justifyContent: 'center'
        };
      default: // desktop
        return {
          position: 'absolute',
          top: '90%',      // Lower position for desktop
          left: '80%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          width: '50%',
          maxWidth: '500px',
          display: 'flex',
          justifyContent: 'center'
        };
    }
  }, [deviceType]);

  // Load Face Detection Model and Auto-start Camera
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      try {
        // Load model
        console.log('Loading BlazeFace model...');
        modelRef.current = await blazeface.load({
          modelUrl: '/models/blazeface/model.json'
        });
        console.log('Model loaded successfully!');

        // Auto-start camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setIsCameraOn(true);
          
          // Start detection after video loads
          videoRef.current.onloadedmetadata = () => {
            startDetection();
          };
        }

        setError('');
      } catch (err) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permissions and refresh the page.');
        } else if (err.message.includes('model')) {
          setError(`Failed to load face detection model: ${err.message}`);
        } else {
          setError(`Error: ${err.message}`);
        }
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOn(true);
        setError('');
        
        // Start detection after video loads
        videoRef.current.onloadedmetadata = () => {
          startDetection();
        };
      }
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions.');
      } else {
        setError(`Error: ${err.message}`);
      }
      console.error('Camera error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    console.log('Stopping camera...');
    
    // Clear detection interval FIRST
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
      console.log('Detection interval cleared');
    }
    
    // Stop video playback
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      console.log('Video stopped');
    }
    
    // Stop all media tracks
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      console.log('Stopping tracks:', tracks.length);
      tracks.forEach(track => {
        console.log('Stopping track:', track.kind, track.enabled);
        track.stop();
      });
      streamRef.current = null;
    }
    
    // IMPORTANT: Reset head count FIRST, then camera state
    setHeadCount(0);
    // Use setTimeout to ensure state updates properly
    setTimeout(() => {
      setIsCameraOn(false);
    }, 100);
    
    
    console.log('Camera stopped, state updated');
  };

  const startDetection = () => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
    }

    console.log('Starting detection...');
    
    detectionInterval.current = setInterval(async () => {
      if (videoRef.current && modelRef.current && videoRef.current.readyState === 4) {
        try {
          const predictions = await modelRef.current.estimateFaces(videoRef.current, false);
          console.log('Predictions:', predictions.length);
          setHeadCount(predictions.length);
        } catch (err) {
          console.error('Detection error:', err);
        }
      } else {
        console.log('Video not ready:', videoRef.current?.readyState);
      }
    }, 200);
  };


const handleContinueReading = () => {
    stopCamera();
    navigate('/final-message'); // 👈 Redirect to the new URL/route
  };
  
  return (
    <div style={{position: 'relative',margin: 0,
        padding: 0,
        boxSizing: "border-box",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",}}>
      
      {/* FIXED: Only show message when camera is ON */}
      {isCameraOn && !isLoading && (
        <ShowMessage headCount={headCount} />
      )}
      
      <div>
        <div>
          
          {/* Error Message */}
          {error && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(254, 226, 226, 0.95)',
              border: '2px solid #fca5a5',
              borderRadius: '12px',
              padding: '16px',
              maxWidth: deviceType === 'mobile' ? '90%' : '400px',
              zIndex: 5,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <AlertCircle color="#dc2626" size={20} />
              <p style={{ color: '#dc2626', margin: 0, fontSize: '14px' }}>{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 5,
              textAlign: 'center'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid rgba(255, 255, 255, 0.3)',
                borderTop: '4px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ 
                color: 'white', 
                fontSize: deviceType === 'mobile' ? '14px' : '16px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
              }}>
                Initializing camera and loading model...
              </p>
            </div>
          )}

          {/* Camera Controls - Responsive Positioning */}
          {headCount === 1 && (

            <div style={controlsPosition}>
            <button style={{background:'none',border:'none',color:'white',font:'Arial, Helvetica, sans-serif'}}
              onClick={()=> handleContinueReading()}
            
            >Continue Reading ...</button>
          </div>
          )}
          
          {/* Hidden Video Element - needed for face detection */}
          <div style={{ 
            position: 'fixed', 
            bottom: 0, 
            right: 0, 
            width: '1px', 
            height: '1px', 
            overflow: 'hidden',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: -1
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '640px', height: '480px' }}
            />
          </div>
          <canvas
            ref={canvasRef}
            width="640"
            height="480"
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Add spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}