// Tiny Web Audio synth — generates retro UI sounds on the fly, no asset files.

let ctx: AudioContext | null = null
let muted = false

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === "suspended") void ctx.resume()
  return ctx
}

export function setMuted(value: boolean) {
  muted = value
}

export function isMuted() {
  return muted
}

type ToneOpts = {
  freq: number
  type?: OscillatorType
  duration?: number
  gain?: number
  startGain?: number
  slideTo?: number
  delay?: number
}

function tone({ freq, type = "square", duration = 0.12, gain = 0.12, slideTo, delay = 0 }: ToneOpts) {
  const c = getCtx()
  if (!c || muted) return
  const t0 = c.currentTime + delay
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t0 + duration)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(g)
  g.connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

function noise(duration = 0.15, gain = 0.1) {
  const c = getCtx()
  if (!c || muted) return
  const frames = Math.floor(c.sampleRate * duration)
  const buffer = c.createBuffer(1, frames, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
  const src = c.createBufferSource()
  const g = c.createGain()
  g.gain.value = gain
  src.buffer = buffer
  src.connect(g)
  g.connect(c.destination)
  src.start()
}

export const sfx = {
  // Mechanical "thock" click
  click() {
    tone({ freq: 220, type: "square", duration: 0.05, gain: 0.14, slideTo: 90 })
    noise(0.04, 0.05)
  },
  // Dramatic error / event start
  eventStart() {
    tone({ freq: 160, type: "sawtooth", duration: 0.5, gain: 0.16, slideTo: 80 })
    tone({ freq: 110, type: "square", duration: 0.5, gain: 0.12, delay: 0.05 })
  },
  // Relief ding on event end
  eventEnd() {
    tone({ freq: 523, type: "sine", duration: 0.18, gain: 0.14 })
    tone({ freq: 784, type: "sine", duration: 0.22, gain: 0.12, delay: 0.12 })
  },
  // Emote swoosh / pop
  emote() {
    tone({ freq: 600, type: "triangle", duration: 0.12, gain: 0.1, slideTo: 1200 })
  },
  // Cash register cha-ching
  chaching() {
    tone({ freq: 988, type: "square", duration: 0.08, gain: 0.12 })
    tone({ freq: 1319, type: "square", duration: 0.14, gain: 0.12, delay: 0.08 })
  },
  // Windows-95-ish startup chord
  startup() {
    tone({ freq: 392, type: "sine", duration: 1.1, gain: 0.1 })
    tone({ freq: 523, type: "sine", duration: 1.1, gain: 0.1, delay: 0.12 })
    tone({ freq: 659, type: "sine", duration: 1.1, gain: 0.1, delay: 0.24 })
    tone({ freq: 784, type: "sine", duration: 1.2, gain: 0.1, delay: 0.36 })
  },
  // Confetti milestone
  milestone() {
    ;[523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, type: "square", duration: 0.1, gain: 0.12, delay: i * 0.06 }))
  },
  // Chaos
  chaos() {
    tone({ freq: 80, type: "sawtooth", duration: 0.6, gain: 0.18, slideTo: 1600 })
    noise(0.5, 0.12)
  },
  // Denied / error beep (bureaucracy)
  denied() {
    tone({ freq: 140, type: "square", duration: 0.18, gain: 0.14 })
    tone({ freq: 120, type: "square", duration: 0.18, gain: 0.14, delay: 0.12 })
  },
  // Startling screamer — loud dissonant blast + noise
  screamer() {
    tone({ freq: 1400, type: "sawtooth", duration: 0.5, gain: 0.28, slideTo: 120 })
    tone({ freq: 990, type: "square", duration: 0.5, gain: 0.22 })
    tone({ freq: 1490, type: "square", duration: 0.5, gain: 0.18, slideTo: 200 })
    noise(0.5, 0.22)
  },
  // Soft zen chime (minimal theme calm message)
  chime() {
    tone({ freq: 880, type: "sine", duration: 0.5, gain: 0.08 })
    tone({ freq: 1320, type: "sine", duration: 0.7, gain: 0.06, delay: 0.18 })
  },
  // Glitchy BSOD / system error sting
  crash() {
    tone({ freq: 70, type: "sawtooth", duration: 0.7, gain: 0.2 })
    noise(0.6, 0.16)
  },
  // 503 maintenance — sad descending tone
  offline() {
    tone({ freq: 440, type: "sine", duration: 0.25, gain: 0.12 })
    tone({ freq: 330, type: "sine", duration: 0.25, gain: 0.12, delay: 0.2 })
    tone({ freq: 220, type: "sine", duration: 0.4, gain: 0.12, delay: 0.4 })
  },
  // Terminal typing blip
  type() {
    tone({ freq: 1200 + Math.random() * 400, type: "square", duration: 0.025, gain: 0.05 })
  },
}
