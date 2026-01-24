import type { GameState } from '../types';

interface ChallengeBannersProps {
  challengeTarget: number | null;
  challengeBeaten: boolean;
  gameState: GameState;
}

export const ChallengeBanners: React.FC<ChallengeBannersProps> = ({
  challengeTarget,
  challengeBeaten,
  gameState,
}) => {
  if (gameState !== 'playing') return null;

  return (
    <>
      {/* Challenge Banner */}
      {challengeTarget && !challengeBeaten && (
        <div className="fo-challenge-banner">
          <span>Beat {challengeTarget} to win!</span>
        </div>
      )}

      {/* Challenge Beaten Banner */}
      {challengeBeaten && (
        <div className="fo-challenge-banner fo-challenge-beaten">
          <span>Challenge Beaten!</span>
        </div>
      )}
    </>
  );
};
