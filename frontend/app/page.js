"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import IntroductionPage from "./introductionPage";
import Calibration from "./Calibration.js";
import ParticipantInf from "./ParticipantInf";
import StartPractice from "./startPractice.js";
import Practice from "./practice.js";
import StartTest from "./startTest.js";
import GameContainer from "./gameContainer";

function HomeContent() {
  const [currentStep, setCurrentStep] = useState(0); // Start with 0 to show info page
  const [isLtiLaunch, setIsLtiLaunch] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if this is an LTI launch or has transfer ID
    const transferId = searchParams.get('transferId');
    const ltiLaunch = searchParams.get('lti');
    
    if (transferId || ltiLaunch) {
      setIsLtiLaunch(true);
      setCurrentStep(1); // Start the actual app
    }
  }, [searchParams]);

  // Show info page for direct access
  if (!isLtiLaunch && currentStep === 0) {
    return (
      <div style={{
        fontFamily: 'Arial, sans-serif',
        maxWidth: '600px',
        margin: '50px auto',
        padding: '20px',
        lineHeight: '1.6'
      }}>
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h1 style={{ color: '#333', margin: '0 0 10px 0' }}>🔍 Visual Search LTI Tool</h1>
          <p style={{ margin: '0', color: '#666' }}>Learning Tools Interoperability (LTI) 1.3 Tool</p>
        </div>
        
        <div style={{
          background: '#fff3cd',
          padding: '15px',
          borderRadius: '5px',
          margin: '10px 0',
          borderLeft: '4px solid #ffc107'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>⚠️ Important Notice</h3>
          <p style={{ margin: '0', color: '#856404' }}>
            This visual search tool is designed to be launched from your Learning Management System (LMS) like Moodle.
            Direct access to this URL is not intended for end users.
          </p>
        </div>
        
        <div style={{
          background: '#e3f2fd',
          padding: '15px',
          borderRadius: '5px',
          margin: '10px 0'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>📚 About This Tool</h3>
          <p style={{ margin: '0 0 10px 0', color: '#1976d2' }}>
            This is a visual search and perception testing tool that provides:
          </p>
          <ul style={{ margin: '0', color: '#1976d2' }}>
            <li>Visual search and perception testing</li>
            <li>User context integration from LMS</li>
            <li>Grade passback to LMS</li>
            <li>Session management</li>
          </ul>
        </div>
        
        <div style={{
          background: '#e8f5e8',
          padding: '15px',
          borderRadius: '5px',
          margin: '10px 0'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2e7d2e' }}>🚀 How to Use</h3>
          <p style={{ margin: '0', color: '#2e7d2e' }}>
            To use this tool, please access it through your Moodle course where it has been configured as an LTI external tool.
            Your instructor will provide the appropriate link within your course.
          </p>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button 
            onClick={() => {
              setIsLtiLaunch(true);
              setCurrentStep(1);
            }}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Demo Mode (For Testing)
          </button>
        </div>
      </div>
    );
  }

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

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
