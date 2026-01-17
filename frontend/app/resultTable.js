import React from "react";
function removeDuplicates(results){
  const clean={};
  for (const [key,entries] of Object.entries(results)){
    const seen=new Set();
    clean[key]=[];
    for (const entry of entries){
      if (!seen.has(entry.key1)){
        seen.add(entry.key1);
        clean[key].push(entry);
      }
    }
  }
  return clean;
}
export default function ResultTable({ result }) {
  console.log(result);
  const cleanresult=removeDuplicates(result);
  if (!result || Object.keys(result).length === 0) {
    return <p>No results to display.</p>;
  }

  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif" }}>
      <h2>🎉 Game Over!</h2>
      <h3>📊 Average Score Per Category</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", marginTop: "20px", width: "100%", maxWidth: "600px" }}>
        <thead>
          <tr>
            <th>Category</th>
            <th>Avg Score</th>
            <th>Average Time(ms)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(cleanresult).sort().map(([key, data]) => {
            const totalCorrect = data.reduce((sum, d) => sum + d.isCorrect, 0);
            const avgScore = totalCorrect / data.length;

            const totalTime=data.reduce((sum,d)=>sum+(d.reactionTime || 0),0);
            const avgTime=totalTime/data.length;
            return (
              <tr key={key}>
                <td>{key}</td>
                <td>{avgScore}</td>
                <td>{Math.round(avgTime)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
