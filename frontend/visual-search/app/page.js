"use client";
import { useState } from "react";
import IntroductionPage from "./introductionPage";
import Calibration from "./Calibration";
import GameContainer from "./gameContainer";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <>
      {currentStep === 1 && (
        <IntroductionPage onDone={() => setCurrentStep(2)} />
      )}

      {currentStep === 2 && <Calibration onDone={() => setCurrentStep(3)} />}

      {currentStep === 3 && <GameContainer />}
    </>
  );
}


// "use client";
// import { useState, useEffect } from "react";
// import IntroductionPage from "./introductionPage.js";
// import Calibration from "./Calibration.js";

// export default function Home() {
//   const conditions = ["present", "absent"];
//   const types = ["conjunction", "feature"];
//   const numbers = [4, 8, 16, 32];

//   const shapes = ["redTriangle", "redSquare", "blueTriangle", "blueSquare"];

//   const [slides, setSlides] = useState([]);
//   const [currentSlide, setCurrentSlide] = useState(0);

//   useEffect(() => {
//     const newSlides = [];
//     let slideNumber = 1;

//     for (let condition of conditions) {
//       for (let type of types) {
//         for (let number of numbers) {
//           for (let repeat = 1; repeat <= 5; repeat++) {
//             const slideShapes = [];

//             for (let i = 0; i < number; i++) {
//               if (condition === "present" && i === 0) {
//                 slideShapes.push("redTriangle");
//               } else {
//                 let filteredShapes = shapes;

//                 if (condition === "absent") {
//                   filteredShapes = shapes.filter(
//                     (shape) => shape !== "redTriangle"
//                   );
//                 }

//                 if (type === "feature") {
//                   filteredShapes = filteredShapes.filter((shape) =>
//                     shape.includes("Triangle")
//                   );

//                   if (filteredShapes.length === 0) {
//                     filteredShapes = shapes.filter(
//                       (shape) => shape !== "redTriangle"
//                     );
//                   }
//                 }

//                 const randomIndex = Math.floor(
//                   Math.random() * filteredShapes.length
//                 );
//                 slideShapes.push(filteredShapes[randomIndex]);
//               }
//             }

//             newSlides.push({
//               slideNumber: slideNumber,
//               condition: condition,
//               type: type,
//               numberOfObjects: number,
//               shapes: slideShapes,
//             });

//             slideNumber++;
//           }
//         }
//       }
//     }

//     newSlides.sort(() => Math.random() - 0.5);
//     setSlides(newSlides);
//   }, []);

//   const showNextSlide = () => {
//     if (currentSlide < slides.length - 1) {
//       setCurrentSlide(currentSlide + 1);
//     } else {
//       alert("Game Over!");
//     }
//   };

//   if (slides.length === 0) {
//     return <h2>Loading Slides...</h2>;
//   }

//   const current = slides[currentSlide];

//   return (
//     <>
//       <IntroductionPage />
//       <Calibration />
//       <div style={{ padding: "20px" }}>
//         <h2>
//           Slide {current.slideNumber} / {slides.length}
//         </h2>
//         <p>
//           Condition: <strong>{current.condition}</strong> | Type:{" "}
//           <strong>{current.type}</strong> | Objects:{" "}
//           <strong>{current.numberOfObjects}</strong>
//         </p>

//         <div
//           style={{
//             display: "flex",
//             flexWrap: "wrap",
//             maxWidth: "500px",
//           }}
//         >
//           {current.shapes.map((shape, index) => (
//             <div key={index} className={`shape ${shape}`} />
//           ))}
//         </div>

//         <button
//           onClick={showNextSlide}
//           style={{
//             marginTop: "20px",
//             padding: "10px 20px",
//             fontSize: "16px",
//             cursor: "pointer",
//           }}
//         >
//           Next
//         </button>
//       </div>
//     </>
//   );
// }
