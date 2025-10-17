import { AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Message from "./Message";

function ShowMessage({ headCount }) {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (headCount === 1) {
      const timer = setTimeout(() => {
        setShowMessage(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShowMessage(false);
    }
  }, [headCount]);

  // 🎨 Reusable Styles
  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    backgroundColor: "#ffffff",
    padding: "20px",
    boxSizing: "border-box",
  };

  const cardStyle = {
    maxWidth: "600px",
    width: "100%",
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
    padding: "30px 25px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease-in-out",
  };

  const iconWrapperStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "15px",
  };

  const headingStyle = {
    fontSize: "1.6rem",
    fontWeight: "600",
    color: "#333",
    marginBottom: "10px",
  };

  const paragraphStyle = {
    fontSize: "1.1rem",
    lineHeight: "1.7rem",
    color: "#555",
    margin: "0 auto",
  };

  // Smaller font sizes on mobile
  const responsiveText = {
    fontSize: "1.3rem",
  };

  // 🌟 CASE 1 — Show Message (1 person)
  if (headCount === 1 && showMessage) {
    return (
      <div style={{ ...containerStyle, backgroundColor: "#ffffff" }}>
        <Message />
      </div>
    );
  }

  // ⚠️ CASE 2 — More than one head detected
  if (headCount > 1) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={iconWrapperStyle}>
            <AlertCircle size={50} color="#ff3b30" />
          </div>
          <h1 style={headingStyle}>⚠️ Warning: Multiple People Detected</h1>
          <p style={paragraphStyle}>
            More than one person is currently visible in front of the camera.
            Please ensure only one viewer is present before continuing.
            <br />
            <br />
            Current viewers detected:{" "}
            <strong style={{ color: "#007bff" }}>{headCount}</strong>
          </p>
        </div>
      </div>
    );
  }

  // 👤 CASE 3 — No person detected
  if (headCount === 0) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={{ ...headingStyle, color: "#007bff" }}>
            👤 No One Detected
          </h1>
          <p style={paragraphStyle}>
            Please position yourself clearly in front of the camera to view the
            private message.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default ShowMessage;
