import "./startTest.css";
export default function StartTest({ onDone }) {
  return (
    <div className="startTest">
      <h2>End of practice</h2>
      <p>Good!</p>
      <p>Now let's do the actual test.</p>
      <p>Sometimes there will be more shapes, sometimes less.</p>
      <p>In all cases, your task is to find the red triangle.</p>
      <p>Please prioritize accuracy over speed.</p>
      <button id="startTestButton" onClick={onDone}>
        START TEST
      </button>
    </div>
  );
}
