import React from "react";

function IntroductionPage({ onDone }) {
  return (
    <div className="intro-instruction-div">
      <h1>Before starting:</h1>
      <ol>
        <li>
          Set your browsing window to Full Screen (you can do this by pressing
          F11 on Windows and Linux or the key combination CTRL+CMD+F on a Mac;
          if that does not work, in Chrome you can go to the View menu and click
          Enter Full Screen).
        </li>
        <li>
          Minimize possible distractions (TV, phone, etc.) that may affect your
          performance during the test.
        </li>
        <li>
          Position yourself at arm's length from the monitor and try to maintain
          this viewing distance throughout the experiment.
        </li>
      </ol>
      <button className="ok-btn" onClick={onDone}>
        Done
      </button>
    </div>
  );
}

export default IntroductionPage;















