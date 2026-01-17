"use client";
import React, { useState, useEffect } from "react";

function Calibration({ onDone }) {
  const [remSize, setRemSize] = useState(16); // default 16px

  // load from localStorage
  useEffect(() => {
    const savedSize = localStorage.getItem("remSize");
    if (savedSize) {
      setRemSize(parseInt(savedSize));
    }
  }, []);

  // update font-size on change
  useEffect(() => {
    document.documentElement.style.fontSize = `${remSize}px`;
    localStorage.setItem("remSize", remSize);
  }, [remSize]);
  // arrow key events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        setRemSize((prev) => Math.min(prev + 1, 32)); // max 32px
      } else if (e.key === "ArrowLeft") {
        setRemSize((prev) => Math.max(prev - 1, 12)); // min 12px
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="calibration-container">
      <div className="intro-instruction-div">
        <h1>Calibration</h1>
        <ol>
          <p>
            OK CalibrationTo ensure that stimuli and other visual elements in
            the study are presented at their intended size, it's crucial that
            you perform the following step. This is a standard screen
            calibration procedure, that does not involve any data collection
            from your card or other items. Please find an object that matches
            the size of a typical credit card, which could be anything from an
            actual debit or credit card to a driver's license or an ID{" "}
          </p>
          <p>
            card. The key is that the object's dimensions are identical to those
            of a standard credit card.
          </p>
          <p>
            Place the longer side of your card-sized object against the screen,
            aligning it with the orange line displayed. Next, use the left and
            right arrow keys on your keyboard to adjust the length of this
            orange line until it precisely matches the length of your card-sized
            item. When done, click the OK button.
          </p>
        </ol>
      </div>
      <div
        className="calibration-line"
        style={{ width: `${(remSize - 12) * 20}px` }}
      ></div>
      <button className="ok-btn" onClick={onDone}>
        OK
      </button>
    </div>
  );
}

export default Calibration;
