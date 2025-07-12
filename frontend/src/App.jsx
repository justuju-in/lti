import { useState } from 'react';

const sampleQuiz = [
  { q: '2 + 2 = ?', options: ['3', '4', '5'], answer: '4' },
  { q: 'Capital of India?', options: ['Delhi', 'Mumbai', 'Kolkata'], answer: 'Delhi' }
];

export default function App() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const handleAnswer = (opt) => {
    if (opt === sampleQuiz[step].answer) setScore(score + 1);
    const next = step + 1;
    if (next < sampleQuiz.length) setStep(next);
    else setDone(true);
  };

  if (done) {
    return <div><h2>Your score: {score}/{sampleQuiz.length}</h2></div>;
  }

  const current = sampleQuiz[step];
  return (
    <div style={{ padding: 20 }}>
      <h3>{current.q}</h3>
      {current.options.map(opt => (
        <button key={opt} onClick={() => handleAnswer(opt)} style={{ display: 'block', margin: '10px 0' }}>
          {opt}
        </button>
      ))}
    </div>
  );
}
