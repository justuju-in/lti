import React from "react";
import { useState, useEffect } from "react";

function GameContainer() {
  const conditions = ["present", "absent"];
  const types = ["conjunction", "feature"];
  const numbers = [4, 8, 16, 32];
  const shapes = ["redTriangle", "redSquare", "blueTriangle", "blueSquare"];

  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const newSlides = [];
    let slideNumber = 1;

    for (let condition of conditions) {
      for (let type of types) {
        for (let number of numbers) {
          for (let repeat = 1; repeat <= 5; repeat++) {
            const slideShapes = [];

            for (let i = 0; i < number; i++) {
              if (condition === "present" && i === 0) {
                slideShapes.push("redTriangle");
              } else {
                let filteredShapes = shapes;

                if (condition === "absent") {
                  filteredShapes = shapes.filter((s) => s !== "redTriangle");
                }

                if (type === "feature") {
                  filteredShapes = filteredShapes.filter((s) =>
                    s.includes("Triangle")
                  );

                  if (filteredShapes.length === 0) {
                    filteredShapes = shapes.filter((s) => s !== "redTriangle");
                  }
                }

                const randomIndex = Math.floor(
                  Math.random() * filteredShapes.length
                );
                slideShapes.push(filteredShapes[randomIndex]);
              }
            }

            newSlides.push({
              slideNumber,
              condition,
              type,
              numberOfObjects: number,
              shapes: slideShapes,
            });

            slideNumber++;
          }
        }
      }
    }

    newSlides.sort(() => Math.random() - 0.5);
    setSlides(newSlides);
  }, []);

  const showNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      alert("Game Over!");
    }
  };

  if (slides.length === 0) {
    return <h2>Loading Slides...</h2>;
  }

  const current = slides[currentSlide];

  const shapeSize =
    parseFloat(getComputedStyle(document.documentElement).fontSize) * 3;
  const boxSize =
    parseFloat(getComputedStyle(document.documentElement).fontSize) * 30;
  const padding = 4;
  const maxAttempts = 1000;

  const generateUniquePositions = (count) => {
    const positions = [];

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let pos;

      do {
        const top = Math.floor(Math.random() * (boxSize - shapeSize));
        const left = Math.floor(Math.random() * (boxSize - shapeSize));
        pos = { top, left };
        attempts++;
        if (attempts > maxAttempts) {
          console.warn("Max attempts reached.");
          break;
        }
      } while (
        positions.some(
          (p) =>
            Math.abs(p.top - pos.top) < shapeSize + padding &&
            Math.abs(p.left - pos.left) < shapeSize + padding
        )
      );

      positions.push(pos);
    }

    return positions;
  };

  const positions = generateUniquePositions(current.shapes.length);

  return (
    <div className="game-container">
      <h2>
        Slide {current.slideNumber} / {slides.length}
      </h2>
      <p>
        Condition: <strong>{current.condition}</strong> | Type:{" "}
        <strong>{current.type}</strong> | Objects:{" "}
        <strong>{current.numberOfObjects}</strong>
      </p>

      <div className="shape-box">
        {current.shapes.map((shape, index) => (
          <div
            key={index}
            className={`shape ${shape}`}
            style={{
              top: `${positions[index].top}px`,
              left: `${positions[index].left}px`,
            }}
          />
        ))}
      </div>

      <button className="next-btn" onClick={showNextSlide}>
        Next
      </button>
    </div>
  );
}

export default GameContainer;
