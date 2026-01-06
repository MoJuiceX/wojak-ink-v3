import { useState, useEffect, useRef } from 'react'
import './StartupSequence.css'
import BootSequence, { TANGY_BOOT_LINES } from './BootSequence'

interface StartupSequenceProps {
  onComplete: () => void
}

export default function StartupSequence({ onComplete }: StartupSequenceProps) {
  const [stage, setStage] = useState<'boot' | 'logo' | 'loading' | 'complete'>('boot')
  const [progress, setProgress] = useState(0)
  const [logoFading, setLogoFading] = useState(false)
  const [loadingFading, setLoadingFading] = useState(false)
  const [bootDone, setBootDone] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 480)
  const ps1AudioRef = useRef<HTMLAudioElement | null>(null)
  const bootAudioRef = useRef<HTMLAudioElement | null>(null)

  // Track screen size for responsive loading bar
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 480)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!bootDone || stage !== 'boot') return

    const sequence = async () => {
      await delay(200)

      setStage('logo')
      setLogoFading(false)

      // Play the pre-created PS1 audio (created during user click in BootSequence)
      if (ps1AudioRef.current) {
        ps1AudioRef.current.currentTime = 0.5 // Skip first 0.5 seconds
        ps1AudioRef.current.play().catch(e => {
          console.debug('[StartupSequence] PS1 audio play failed:', e)
        })
      }

      await delay(3439)

      setLogoFading(true)
      await delay(2579)

      await delay(100)

      setStage('loading')
      setLoadingFading(false)

      let bootFadeStarted = false
      let ps1FadeStarted = false

      for (let i = 0; i <= 100; i += 2) {
        setProgress(i)

        // Start PC-boot fadeout very early (at 20%) for a very long linear fadeout
        if (i >= 20 && !bootFadeStarted) {
          bootFadeStarted = true

          // Very long fadeout: ~40 iterations * 109ms = ~4.4 seconds
          const bootFadeOutDuration = 4400

          if (bootAudioRef.current && !bootAudioRef.current.paused) {
            const startVolume = bootAudioRef.current.volume
            const startTime = Date.now()

            const fadeOutBoot = () => {
              if (!bootAudioRef.current) return

              const elapsed = Date.now() - startTime
              const prog = Math.min(elapsed / bootFadeOutDuration, 1)
              // Linear fadeout
              bootAudioRef.current.volume = startVolume * (1 - prog)

              if (prog < 1) {
                requestAnimationFrame(fadeOutBoot)
              } else {
                bootAudioRef.current.pause()
                bootAudioRef.current.currentTime = 0
              }
            }

            fadeOutBoot()
          }
        }

        // Start PS1 fadeout at 15% for a long linear fadeout - ensures fully faded by 100%
        if (i >= 15 && !ps1FadeStarted) {
          ps1FadeStarted = true

          // Very long fadeout: ~42 iterations * 109ms = ~4.6 seconds
          const ps1FadeOutDuration = 4600

          if (ps1AudioRef.current && !ps1AudioRef.current.paused) {
            const startVolume = ps1AudioRef.current.volume
            const startTime = Date.now()

            const fadeOutPs1 = () => {
              if (!ps1AudioRef.current) return

              const elapsed = Date.now() - startTime
              const prog = Math.min(elapsed / ps1FadeOutDuration, 1)
              // Linear fadeout
              ps1AudioRef.current.volume = startVolume * (1 - prog)

              if (prog < 1) {
                requestAnimationFrame(fadeOutPs1)
              } else {
                ps1AudioRef.current.pause()
                ps1AudioRef.current.currentTime = 0
              }
            }

            fadeOutPs1()
          }
        }

        await delay(99)
      }

      setStage('complete')
      setLoadingFading(true)

      await delay(1500)

      onComplete()
    }

    sequence()
  }, [bootDone, stage, onComplete])

  return (
    <div className={`startup-sequence ${stage === 'complete' ? 'fade-out-black' : ''}`}>
      {stage === 'boot' && (
        <BootSequence
          onDone={() => setBootDone(true)}
          lines={TANGY_BOOT_LINES}
          showOnce={true}
          maxVisibleLines={18}
          onBootAudioReady={(bootAudio) => {
            bootAudioRef.current = bootAudio
          }}
          onPs1AudioReady={(ps1Audio) => {
            ps1AudioRef.current = ps1Audio
          }}
        />
      )}

      {(stage === 'logo' || stage === 'loading' || stage === 'complete') && (
        <>
          {stage === 'logo' && (
            <div className={`startup-logo-screen ${logoFading ? 'fade-out' : ''}`}>
              <div className="startup-logo">
                <span className="startup-logo-emoji">🍊</span>
                <span className="startup-logo-text">Tang Gang</span>
              </div>
            </div>
          )}

          {(stage === 'loading' || stage === 'complete') && (
            <div className={`startup-loading-screen ${loadingFading || stage === 'complete' ? 'fade-out' : ''}`}>
              <div className="startup-logo-small">
                <span>🍊</span> Orange Grove <span>🍊</span>
              </div>

              <div className="startup-loading-container">
                <div className="startup-loading-text">
                  Starting Tang Gang OS...
                </div>
                <div className="startup-progress-bar">
                  <div
                    className="startup-progress-fill"
                    style={{ width: `${progress}%` }}
                  >
                    {Array.from({ length: Math.floor(progress / (isDesktop ? 3.7 : 4.0)) }).map((_, i) => (
                      <div key={i} className="startup-progress-block" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="startup-copyright">
                © 2024 Tang Gang. All rights reserved.
              </div>
            </div>
          )}

          {(stage === 'logo' || stage === 'loading' || stage === 'complete') && (
            <div className={`startup-logo-subtitle-container ${loadingFading || stage === 'complete' ? 'fade-out' : ''}`}>
              <div className={`startup-loading-subtitle ${stage === 'loading' || stage === 'complete' ? 'no-pulse' : ''}`}>
                WOJAK_FARMERS_PLOT.EXE
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
