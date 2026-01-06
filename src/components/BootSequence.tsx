import { useState, useEffect, useRef } from 'react'
import './BootSequence.css'

export const TANGY_BOOT_LINES = [
  "CitrusBIOS v1.369 (JuiceBuild)",
  "© 2023–2026 Orange Labs",
  "",
  "Checking PULP integrity .............. OK",
  "CPU : Tangium™ 133MHz",
  "RAM : 65536K JUICE",
  "Video : VGA (Grapefruit Adapter) ..... OK",
  "Keyboard : Clicky-Mechanical ......... OK",
  "Mouse : CitrusTrack v2.1 ............. OK",
  "",
  "Detecting storange of value...",
  "  Primary Master : ORANGE_CITRUS ..... OK",
  "  Primary Slave  : PEEL_DRIVE ........ OK",
  "  Secondary Master : PULP_CACHE ...... OK",
  "  Accepting Cookies  : <true>",
  "",
  "Loading boot sector...",
  "Peel to peel : TANGBOOT.SYS .......... OK",
  "Unpacking kernel : CITRUSKERNEL.95 ... OK",
  "",
  ">> Mounting Orange Grove...",
  "Mount /WMC Server ................... OK",
  "Mount /tanggang ..................... OK",
  "Mount /hoamis ....................... OK",
  "",
  "Initializing drivers...",
  "  peel.sys     (peel protection) .... OK",
  "  pulp.sys     (pulp acceleration) .. OK",
  "  zest.sys     (zest rendering) ..... OK",
  "  squeeze.sys  (juice compression) .. OK",
  "  drip.sys     (liquidity routing) .. OK",
  "",
  "Networking...",
  "  DHCP : requesting fresh IP ........ OK",
  "  DNS  : ROYAL.CLUB ................ OK",
  "  NTP  : syncing to Orange Standard . OK",
  "",
  "Tang Guard Security...",
  "  TangGang handshake .............. PIIP",
  "  Hex Orange Address............. ENABLED",
  "",
  "Starting graphical shell...",
  "Launching ORANGE.EXE ................ OK",
  "Warming up the grove... please wait...",
  "",
  "READY: Storange of Value Initiated 🍊",
]

interface BootSequenceProps {
  lines?: string[]
  onDone?: () => void
  showOnce?: boolean
  maxVisibleLines?: number
  typingSpeed?: number
  onBootAudioReady?: (audio: HTMLAudioElement) => void
  onPs1AudioReady?: (audio: HTMLAudioElement) => void
}

export default function BootSequence({
  lines = TANGY_BOOT_LINES,
  onDone,
  showOnce = true,
  maxVisibleLines = 18,
  typingSpeed = 14,
  onBootAudioReady,
  onPs1AudioReady
}: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([])
  const [completedLines, setCompletedLines] = useState<Set<number>>(new Set())
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [isFading, setIsFading] = useState(false)
  const [showClickPrompt, setShowClickPrompt] = useState(false)
  const [sequenceStarted, setSequenceStarted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Always show click prompt - required for both mobile and desktop
  useEffect(() => {
    setShowClickPrompt(true)
  }, [])

  useEffect(() => {
    if (!sequenceStarted) {
      return
    }

    const bootAudio = new Audio('/assets/BootUp/PC-boot.mp3')
    bootAudio.volume = 0
    bootAudio.playbackRate = 0.8

    if (onBootAudioReady) {
      onBootAudioReady(bootAudio)
    }

    bootAudio.play().catch(e => {
      console.debug('[BootSequence] Audio play failed:', e)
    })

    // Fade in the audio
    const targetVolume = 0.02
    const fadeInDuration = 1000
    const startTime = Date.now()

    const fadeIn = () => {
      const elapsed = Date.now() - startTime
      const prog = Math.min(elapsed / fadeInDuration, 1)
      bootAudio.volume = targetVolume * prog

      if (prog < 1) {
        requestAnimationFrame(fadeIn)
      }
    }

    fadeIn()

    const sequence = async () => {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        if (line === '') {
          setVisibleLines(prev => [...prev, ''])
          setCompletedLines(prev => new Set([...prev, i]))
          setCurrentLineIndex(i + 1)
          await delay(29)
          continue
        }

        let currentText = ''
        for (let j = 0; j <= line.length; j++) {
          currentText = line.substring(0, j)
          setVisibleLines(prev => {
            const newLines = [...prev]
            newLines[i] = currentText
            return newLines
          })
          await delay(typingSpeed)
        }

        setCompletedLines(prev => new Set([...prev, i]))
        setCurrentLineIndex(i + 1)
        await delay(15)
      }

      await delay(282)
      setIsFading(true)
      await delay(800)
      onDone?.()
    }

    sequence()
  }, [lines, onDone, showOnce, typingSpeed, sequenceStarted, onBootAudioReady])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [visibleLines])

  const handleClickToStart = () => {
    // Pre-create PS1 audio during user interaction so it can play later
    if (onPs1AudioReady) {
      const ps1Audio = new Audio('/assets/BootUp/Ps1-startup.mp3')
      ps1Audio.volume = 0.02
      // Load the audio so it's ready to play later
      ps1Audio.load()
      onPs1AudioReady(ps1Audio)
    }
    setShowClickPrompt(false)
    setSequenceStarted(true)
  }

  return (
    <div className={`boot-sequence ${isFading ? 'fade-out' : ''}`}>
      {showClickPrompt && (
        <div className="boot-click-prompt" onClick={handleClickToStart}>
          <div className="boot-click-prompt-content">
            <div className="boot-click-prompt-title">ℹ️</div>
            <div className="boot-click-prompt-message">
              Tap for the Full Immersive Experience
            </div>
            <div className="boot-click-prompt-subtitle">
              Audio playback requires user interaction.
            </div>
          </div>
        </div>
      )}
      <div className="boot-sequence-container" ref={containerRef}>
        {visibleLines.slice(-maxVisibleLines).map((line, displayIndex) => {
          const actualIndex = Math.max(0, visibleLines.length - maxVisibleLines) + displayIndex
          const isComplete = completedLines.has(actualIndex) || line === ''
          const isCurrentLine = actualIndex === currentLineIndex && currentLineIndex < lines.length
          return (
            <div
              key={actualIndex}
              className={`boot-line ${isComplete ? 'boot-line-complete' : 'boot-line-typing'} ${isCurrentLine ? 'boot-cursor' : ''}`}
            >
              {line || '\u00A0'}
              {isCurrentLine && <span className="boot-cursor-blink">_</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
