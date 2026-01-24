/**
 * ShareCard Component
 *
 * Share card for Flappy Orange game scores - 1200x630 image format
 * Designed for social media sharing (Twitter, Discord, etc.)
 */


interface ShareCardProps {
  score: number;
  bestScore: number;
  isNewRecord?: boolean;
  streak?: number;
  gamesPlayed?: number;
  screenshotUrl?: string;
}

export function ShareCard({
  score,
  bestScore,
  isNewRecord = false,
  streak = 0,
  gamesPlayed = 0,
  screenshotUrl,
}: ShareCardProps) {
  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        width: 1200,
        height: 630,
        background: 'radial-gradient(ellipse 150% 150% at 70% 30%, #1A1000 0%, #0C0C0C 70%, #080808 100%)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Top Accent Bar */}
      <div
        className="w-full shrink-0"
        style={{
          height: 7,
          background: 'linear-gradient(90deg, #FF6B00 0%, #FF8C00 100%)',
        }}
      />

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Screenshot Section - Left */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 620,
            padding: 24,
            background: '#0C0C0C',
          }}
        >
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden"
            style={{
              borderRadius: 16,
              border: '1px solid #2A2A2A',
              background: screenshotUrl ? `url(${screenshotUrl}) center/cover` : '#1A1A1A',
            }}
          >
            {!screenshotUrl && (
              <span className="text-gray-500 text-lg">Game Screenshot</span>
            )}
          </div>
        </div>

        {/* Right Side - Score & Stats */}
        <div
          className="flex flex-col flex-1 gap-6"
          style={{ padding: '40px 48px 40px 24px' }}
        >
          {/* Title Row */}
          <div className="flex items-center gap-4">
            <span
              style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: 48,
                fontWeight: 800,
                letterSpacing: -1,
                color: '#FF6B00',
                textShadow: '0 0 40px rgba(255, 107, 0, 0.5)',
              }}
            >
              FLAPPY
            </span>
            <span
              style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: 48,
                fontWeight: 800,
                letterSpacing: -1,
                color: '#FFFFFF',
              }}
            >
              ORANGE
            </span>
          </div>

          {/* Score Section */}
          <div className="flex items-end gap-4">
            <span
              style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: 120,
                fontWeight: 700,
                letterSpacing: -6,
                color: '#FF6B00',
                lineHeight: 1,
                textShadow: '0 0 60px rgba(255, 107, 0, 0.3)',
              }}
            >
              {score.toLocaleString()}
            </span>
            <span
              style={{
                fontSize: 28,
                fontWeight: 500,
                color: '#404040',
                paddingBottom: 12,
              }}
            >
              pipes
            </span>
          </div>

          {/* Stats Row - Best & Record */}
          <div className="flex gap-4 w-full">
            {/* Best Badge */}
            <div
              className="flex items-center justify-center flex-1"
              style={{
                padding: '16px 24px',
                borderRadius: 16,
                background: '#161616',
                border: '1px solid #252525',
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                🍊  Best: {bestScore.toLocaleString()}
              </span>
            </div>

            {/* New Record Badge */}
            {isNewRecord && (
              <div
                className="flex items-center justify-center flex-1"
                style={{
                  padding: '16px 24px',
                  borderRadius: 16,
                  background: '#1A1500',
                  border: '1px solid #3D3000',
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    letterSpacing: 1,
                    color: '#FFD700',
                  }}
                >
                  🏆  NEW RECORD!
                </span>
              </div>
            )}
          </div>

          {/* CTA Text */}
          <div className="flex items-center w-full">
            <span
              style={{
                fontSize: 36,
                fontWeight: 600,
                fontStyle: 'italic',
                color: '#FFFFFF',
              }}
            >
              Can you beat my score? 🔥
            </span>
          </div>

          {/* Bottom Row - Streak & Games */}
          <div className="flex gap-4 w-full">
            {/* Streak Badge */}
            {streak > 0 && (
              <div
                className="flex items-center justify-center flex-1"
                style={{
                  padding: '16px 24px',
                  borderRadius: 16,
                  background: '#1A0A00',
                  border: '1px solid #3D1D00',
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#FF6B00',
                  }}
                >
                  🔥  {streak}-day streak
                </span>
              </div>
            )}

            {/* Games Played Badge */}
            {gamesPlayed > 0 && (
              <div
                className="flex items-center justify-center flex-1"
                style={{
                  padding: '16px 24px',
                  borderRadius: 16,
                  background: '#161616',
                  border: '1px solid #252525',
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#606060',
                  }}
                >
                  🎮  {gamesPlayed} games
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Branding Bar */}
      <div
        className="flex items-center justify-between shrink-0 gap-4"
        style={{
          height: 90,
          padding: '0 48px',
          background: 'linear-gradient(180deg, #0A0A0A 0%, #111111 100%)',
          borderTop: '1px solid #1A1A1A',
        }}
      >
        {/* Left Circles */}
        <OrangeCircle />
        <OrangeCircle />

        {/* Brand Name */}
        <div className="flex items-center gap-4">
          <span
            style={{
              fontFamily: 'Sora, sans-serif',
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: 4,
              color: '#FFFFFF',
              textShadow: '0 0 20px rgba(255, 255, 255, 0.125)',
            }}
          >
            WOJAK.INK
          </span>
        </div>

        {/* Center Circles */}
        <div className="flex items-center justify-center gap-3 flex-1">
          {[...Array(7)].map((_, i) => (
            <OrangeCircle key={i} />
          ))}
        </div>

        {/* TWO GROVE GAMING */}
        <div className="flex items-center gap-4">
          <span
            style={{
              fontFamily: 'Sora, sans-serif',
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: 3,
              color: '#FF6B00',
              textShadow: '0 0 25px rgba(255, 107, 0, 0.375), 0 4px 4px rgba(0, 0, 0, 0.25)',
            }}
          >
            TWO GROVE GAMING
          </span>
        </div>

        {/* Right Circles */}
        <OrangeCircle />
        <OrangeCircle />
      </div>
    </div>
  );
}

function OrangeCircle() {
  return (
    <div
      className="shrink-0"
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #FF8C00 0%, #FF6B00 70%, #CC5500 100%)',
      }}
    />
  );
}

export default ShareCard;
