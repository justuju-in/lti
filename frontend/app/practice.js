"use client";
import { useEffect, useState } from "react";
import "./practice.css";

export default function Practice({ onDone }) {
  const array = [
    { src: "/Images/Stim.014.png", res: "N" },
    { src: "/Images/Stim.058.png", res: "Y" },
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedbackType, setFeedbackType] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key.toUpperCase();
      if (key === "Y" || key === "N") {
        handleResponse(key);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [currentIndex]);

  const handleResponse = (userResponse) => {
    const isCorrect = userResponse === array[currentIndex].res;
    setFeedbackType(isCorrect ? "correct" : "incorrect");
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      if (currentIndex < array.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        if (onDone) onDone();
      }
    }, 1500);
  };

  return (
    <div className="practice-container">
      <div className="instructions">
        <h1>Visual Search</h1>
        <p>
          Find the <span className="highlight">red triangle!</span>
        </p>
        <p>
          Press <span className="key">Y</span> for Yes or{" "}
          <span className="key">N</span> for No.
        </p>
      </div>

      <div className="image-section">
        {array[currentIndex] && array[currentIndex].src ? (
          <img src={array[currentIndex].src} alt={`img-${currentIndex}`} />
        ) : (
          <p>Image not found</p>
        )}
      </div>

      {showFeedback && (
        <div className={`feedback ${feedbackType}`}>
          {feedbackType === "correct" ? "✅" : "❌"}
        </div>
      )}
    </div>
  );
}
