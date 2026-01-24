interface FloatingScore {
  id: string;
  value: string;
  x: number;
  y: number;
}

interface FloatingScoresProps {
  scores: FloatingScore[];
}

export const FloatingScores: React.FC<FloatingScoresProps> = ({ scores }) => {
  return (
    <>
      {scores.map(fs => (
        <div
          key={fs.id}
          className="fo-floating-score"
          style={{ left: fs.x, top: fs.y }}
        >
          {fs.value}
        </div>
      ))}
    </>
  );
};
