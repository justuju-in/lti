import React from "react";
import { useState, useEffect } from "react";
import ResultTable from "./resultTable.js";
import './gameContainer.css'

function GameContainer() {
  const conditions = ["present", "absent"];
  const types = ["conjunction", "feature"];
  const numbers = [4, 8, 16, 32];
  const shapes = ["redTriangle", "redSquare", "blueTriangle", "blueSquare"];

  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [result,setResults]= useState({});
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const testRef=React.useRef({});
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
              trialId:repeat,
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
useEffect(()=>{
  const handleKeyDown=(event)=>{
    const userAnswer=event.key.toLowerCase();
    if (userAnswer==='y' || userAnswer==='n'){
      const reactionTime = (performance.now() - startTime);
      const current= slides[currentSlide];
      const actualAnswer= current.shapes.includes("redTriangle") ? "y":"n";
      const isCorrect=userAnswer===actualAnswer? 1:0;
      const key=`${current.condition}-${current.type}-${current.numberOfObjects}`;
      const key1 = `slide-${current.slideNumber}`;
      if (!testRef.current[key1]){
        setResults((prev)=>{
          const updated={...prev};
          if (!updated[key]) updated[key]=[];
          updated[key].push({
            isCorrect,
            reactionTime: Math.round(reactionTime),
            key1
          })
          return updated;
        })
        testRef.current[key1]=true;
      }
      if (currentSlide<slides.length-1){
        setCurrentSlide(currentSlide+1);
      }
      else{
        setGameOver(true); 
      }
    }
  }

    window.addEventListener("keydown",handleKeyDown)
    return ()=>{
      window.removeEventListener("keydown",handleKeyDown);
    }
  },[currentSlide,slides]);
useEffect(()=>{
  if (slides.length>0 && currentSlide<slides.length){
    setStartTime(performance.now())
  }
},[currentSlide,slides])

  if (slides.length === 0) {
    return <h2>Loading Slides...</h2>;
  }
  if (gameOver){
    return <ResultTable result={result} />;
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
    </div>
  );
}

export default GameContainer;
