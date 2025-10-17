import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(0);

  const lines = [
    "This message is intended to be experienced by one person at a time.",
    "Please make sure only one face is visible in front of the camera.",
    
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev < lines.length) return prev + 1;
        clearInterval(interval);
        return prev;
      });
      index++;
    }, 1800); // Delay between lines

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const handleNavigate = () => {
    navigate("/headcounter");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Poppins', sans-serif",
        padding: "0 20px",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          textAlign: "center",
          color: "#333",
        }}
      >
        {lines.slice(0, visibleCount).map((line, index) => (
          <p
            key={index}
            style={{
              fontSize: "1.3rem",
              lineHeight: "1.8rem",
              opacity: 0,
              animation: "fadeIn 1.5s forwards",
              animationDelay: `${index * 0.3}s`,
              marginBottom: "1rem",
            }}
          >
            {line}
          </p>
        ))}
      </div>

      <button
        onClick={handleNavigate}
        style={{
          marginTop: "40px",
          padding: "14px 35px",
          fontSize: "1.1rem",
          fontWeight: "600",
          color: "#fff",
          backgroundColor: "#007bff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          boxShadow: "0 5px 20px rgba(0, 123, 255, 0.3)",
          transition: "background-color 0.3s ease, transform 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#0056b3";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#007bff";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        Continue......
      </button>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default Welcome;
