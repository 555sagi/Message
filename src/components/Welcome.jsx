import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(0);
  const [canContinue, setCanContinue] = useState(false);

  const lines = [
     'మీరు మళ్ళీ ఇది చదువుతున్నారు అంటే మీకు ఏమన్న నాకు మెసేజ్ చేయాలి అనుకుంటే  ఈ iink open చెయ్యండి మీ మెసేజ్ నా దగ్గరకు చేరుతుంది' , 
'https://chat-application-seven-beige.vercel.app/' 
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev < lines.length) return prev + 1;
        clearInterval(interval);
        setCanContinue(true); // ✅ Enable button only when all lines shown
        return prev;
      });
      index++;
    }, 1500); // slightly faster transition
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = () => {
    if (canContinue) navigate("/headcounter");
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
              animation: "fadeIn 1s forwards",
              animationDelay: `${index * 0.2}s`,
              marginBottom: "1rem",
            }}
          >
            {line}
          </p>
        ))}
      </div>

      <button
        onClick={handleNavigate}
        disabled={!canContinue} // 🔒 Button disabled until ready
        style={{
          marginTop: "40px",
          padding: "14px 35px",
          fontSize: "1.1rem",
          fontWeight: "600",
          color: "#fff",
          backgroundColor: canContinue ? "#007bff" : "#a0a0a0",
          border: "none",
          borderRadius: "8px",
          cursor: canContinue ? "pointer" : "not-allowed",
          boxShadow: canContinue
            ? "0 5px 20px rgba(0, 123, 255, 0.3)"
            : "none",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          if (canContinue) {
            e.currentTarget.style.backgroundColor = "#0056b3";
            e.currentTarget.style.transform = "translateY(-2px)";
          }
        }}
        onMouseLeave={(e) => {
          if (canContinue) {
            e.currentTarget.style.backgroundColor = "#007bff";
            e.currentTarget.style.transform = "translateY(0)";
          }
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
