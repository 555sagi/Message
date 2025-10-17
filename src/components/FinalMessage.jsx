import React from 'react';
import { useNavigate } from 'react-router-dom';

const FinalMessage = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleWatchAgain = () => {
    navigate('/headcounter');
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '5vw',
      background: 'linear-gradient(135deg, #e3f2fd, #f8f9fa)',
      boxSizing: 'border-box',
    },
    messageBox: {
      backgroundColor: '#fff',
      borderRadius: '2rem',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
      padding: 'clamp(1.5rem, 4vw, 3rem)',
      maxWidth: 'min(90vw, 600px)',
      textAlign: 'center',
      marginBottom: '2rem',
      borderLeft: '5px solid #007bff',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    paragraph: {
      fontSize: 'clamp(1rem, 2vw, 1.3rem)',
      lineHeight: '1.6',
      color: '#212529',
      margin: 0,
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    },
    buttonContainer: {
      display: 'flex',
      gap: '1rem',
    },
    button: {
      padding: '0.5rem 1.5rem',
      fontSize: '0.9rem',
      fontWeight: 600,
      color: '#fff',
      backgroundColor: '#007bff',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)',
      transition: 'all 0.3s ease',
    },
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = '#0056b3';
    e.currentTarget.style.transform = 'translateY(-2px)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = '#007bff';
    e.currentTarget.style.transform = 'translateY(0)';
  };

  return (
    <div style={styles.container}>
      <div
        style={styles.messageBox}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
        }}
      >
        <p style={styles.paragraph}>
          "From the bottom of my heart, if you want to take any action in your position as ER,
          please be the only person to do so, and let me be the only person involved in that action."
        </p>
      </div>

      <div style={styles.buttonContainer}>
        {/* Back to Home Button */}
        <button
          onClick={handleBackToHome}
          style={styles.button}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Back to Home
        </button>

        {/* Watch Again Button */}
        <button
          onClick={handleWatchAgain}
          style={styles.button}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Watch Again
        </button>
      </div>
    </div>
  );
};

export default FinalMessage;
