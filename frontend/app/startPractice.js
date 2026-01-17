import './startPractice.css'
export default function StartPractice({ onDone }) {
  return (
    <div className="start">
      <h1>visual Search</h1>
      <p>
        Your task is to decide if there is a red triangle amongst the other
        shapes.
      </p>
      <p>If yes, press Y.</p>
      <p>If no, press N.</p>
      <p>We'll start with some practice.</p>
      <button id="startButton" onClick={onDone}>
        START PRACTICE
      </button>
    </div>
  );
}
