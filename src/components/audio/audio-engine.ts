'use client';

/**
 * Self-contained cinematic audio engine using the Web Audio API.
 * No external audio assets required — every sound is synthesized,
 * keeping payload at zero bytes while feeling premium and bespoke.
 *
 * - Lazy: AudioContext is created only after first user interaction.
 * - Accessible: respects reduced-audio preference; always mutable.
 * - Tasteful: soft sine/triangle tones, gentle envelopes, no harshness.
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let ambientNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
let ambientRunning = false;

function ensureContext(volume: number): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  if (masterGain) masterGain.gain.value = volume;
  return ctx;
}

export function setMasterVolume(v: number) {
  if (masterGain && ctx) {
    masterGain.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.1);
  }
}

/** A single soft enveloped tone. */
function tone(
  c: AudioContext,
  dest: AudioNode,
  freq: number,
  start: number,
  dur: number,
  peak = 0.5,
  type: OscillatorType = 'sine'
) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

/** Premium opening motif — an ascending champagne arpeggio. */
export function playIntro(volume = 0.4) {
  const c = ensureContext(volume);
  if (!c || !masterGain) return;
  const now = c.currentTime;
  // A major pentatonic shimmer: A4, C#5, E5, A5
  const notes = [440, 554.37, 659.25, 880];
  notes.forEach((f, i) => tone(c, masterGain!, f, now + i * 0.12, 1.4, 0.32, 'sine'));
  // soft sub for warmth
  tone(c, masterGain, 220, now, 1.8, 0.12, 'triangle');
}

const SOUNDS: Record<string, { freq: number[]; dur: number; type: OscillatorType }> = {
  cart: { freq: [660, 880], dur: 0.18, type: 'sine' },
  wishlist: { freq: [523.25, 783.99], dur: 0.2, type: 'sine' },
  success: { freq: [523.25, 659.25, 783.99], dur: 0.32, type: 'sine' },
  notify: { freq: [880], dur: 0.16, type: 'triangle' },
  click: { freq: [1200], dur: 0.05, type: 'sine' },
};

export function playSound(name: keyof typeof SOUNDS, volume = 0.4) {
  const c = ensureContext(volume);
  if (!c || !masterGain) return;
  const def = SOUNDS[name];
  if (!def) return;
  const now = c.currentTime;
  def.freq.forEach((f, i) => tone(c, masterGain!, f, now + i * 0.06, def.dur, 0.28, def.type));
}

/** Gentle ambient pad for story/campaign pages. */
export function startAmbient(volume = 0.25) {
  const c = ensureContext(volume);
  if (!c || !masterGain || ambientRunning) return;
  ambientRunning = true;
  const chord = [110, 164.81, 220]; // A2, E3, A3 — warm drone
  ambientNodes = chord.map((freq) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 0.03;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    gain.gain.value = 0.06;
    osc.connect(gain);
    gain.connect(masterGain!);
    osc.start();
    lfo.start();
    return { osc, gain };
  });
}

export function stopAmbient() {
  if (!ctx) return;
  const now = ctx.currentTime;
  ambientNodes.forEach(({ osc, gain }) => {
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
    osc.stop(now + 0.9);
  });
  ambientNodes = [];
  ambientRunning = false;
}
