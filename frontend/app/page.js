"use client";
import { useState } from "react";
import IntroductionPage from "./introductionPage";
import Calibration from "./Calibration.js";
import ParticipantInf from "./ParticipantInf";
import StartPractice from "./startPractice.js";
import Practice from "./practice.js";
import StartTest from "./startTest.js";
import GameContainer from "./gameContainer";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <>
      {currentStep === 1 && (
        <IntroductionPage onDone={() => setCurrentStep(2)} />
      )}
      {currentStep === 2 && <Calibration onDone={() => setCurrentStep(3)} />}
      {currentStep === 3 && <ParticipantInf onDone={() => setCurrentStep(4)} />}
      {currentStep === 4 && (
        <StartPractice onDone={() => setCurrentStep(5)} />
      )}
      {currentStep === 5 && <Practice onDone={() => setCurrentStep(6)} />}
      {currentStep === 6 && <StartTest onDone={() => setCurrentStep(7)} />}
      {currentStep === 7 && <GameContainer />}
    </>
  );
}
