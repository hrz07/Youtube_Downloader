/**
 * Synthesizes a pleasant modern notification chime for download completion
 * using Web Audio API. Requires no external audio files, zero latency.
 */
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playDownloadCompleteSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Harmonious chime sequence: F5 (698.46 Hz) -> A5 (880 Hz) -> C6 (1046.50 Hz)
    // Creates an uplifting, professional completion sound
    const notes = [
      { freq: 698.46, start: 0.0, duration: 0.28 },
      { freq: 880.0, start: 0.08, duration: 0.32 },
      { freq: 1046.5, start: 0.16, duration: 0.55 },
    ];

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sine wave with soft harmonics for rich marimba/bell tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      // Gain envelope: gentle attack, exponential decay
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.22, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration);
    });
  } catch (err) {
    console.warn('Could not play complete sound:', err);
  }
}
