import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useTypingSound
 * - Synthesizes a soft, natural mechanical-keyboard "tick" using Web Audio API.
 * - No audio files required, no autoplay issues until user interacts.
 * - Slight randomization (pitch, gain, tiny noise burst) so it doesn't sound robotic.
 * - Persists mute preference in localStorage.
 *
 * Browser autoplay policy: Web Audio context starts "suspended" until a user
 * gesture. We attach a one-time listener that resumes it on the first
 * pointerdown / keydown / touchstart, so the sound only ever plays after the
 * user has interacted with the page.
 */
const STORAGE_KEY = "typingSoundMuted";

export function useTypingSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const lastPlayRef = useRef(0);
  const unlockedRef = useRef(false);

  const [muted, setMutedState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "1";
  });

  // Lazy-init audio context (only created after first user gesture)
  const ensureContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      const ctx = new AC();
      const master = ctx.createGain();
      // Very low overall volume — soft, non-distracting
      master.gain.value = 0.06;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterGainRef.current = master;
    }
    return ctxRef.current;
  }, []);

  // Unlock on first user gesture (autoplay policy compliance)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const unlock = () => {
      if (unlockedRef.current) return;
      const ctx = ensureContext();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      unlockedRef.current = true;
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: false });
    window.addEventListener("keydown", unlock, { once: false });
    window.addEventListener("touchstart", unlock, { once: false });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [ensureContext]);

  const setMuted = useCallback((value: boolean) => {
    setMutedState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(!muted);
  }, [muted, setMuted]);

  /**
   * Play one short typing "tick".
   * - Quick exponential decay envelope (~40ms)
   * - Random pitch around 1.6kHz–2.4kHz so consecutive keys differ
   * - Tiny filtered noise burst layered for a tactile "click" character
   */
  const playTick = useCallback(() => {
    if (muted) return;
    if (!unlockedRef.current) return; // wait for user gesture
    const ctx = ctxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;
    if (ctx.state !== "running") return;

    // Throttle: avoid stacking ticks if typing speed is extreme
    const now = ctx.currentTime;
    if (now - lastPlayRef.current < 0.02) return;
    lastPlayRef.current = now;

    // --- Tonal component (soft sine click) ---
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const baseFreq = 1600 + Math.random() * 800; // 1.6–2.4kHz
    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq, now);
    // Slight downward chirp for a "tap" feel
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(400, baseFreq * 0.55),
      now + 0.04
    );

    const peak = 0.5 + Math.random() * 0.4; // subtle volume variation
    oscGain.gain.setValueAtTime(0.0001, now);
    oscGain.gain.exponentialRampToValueAtTime(peak, now + 0.005);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(oscGain).connect(master);
    osc.start(now);
    osc.stop(now + 0.06);

    // --- Noise burst (mechanical click character) ---
    const bufferSize = Math.floor(ctx.sampleRate * 0.03);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 2000 + Math.random() * 1500;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25 + Math.random() * 0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    noise.connect(noiseFilter).connect(noiseGain).connect(master);
    noise.start(now);
    noise.stop(now + 0.04);
  }, [muted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
        masterGainRef.current = null;
      }
    };
  }, []);

  return { playTick, muted, toggleMute, setMuted };
}
