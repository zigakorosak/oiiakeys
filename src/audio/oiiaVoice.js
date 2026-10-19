// The "oiia" voice. Each key press sings one vowel of o-i-a (the
// keyboard screen picks which), held for as long as the key is.
//
// Synthesized, not sampled: a sawtooth (the "vocal cords") through three
// parallel band-pass filters (the formants that make a vowel sound like
// that vowel). See DESIGN.md "Voice" for the numbers and why they are
// what they are.

// Formant centres (F1, F2, F3) in Hz for an adult voice, then scaled up:
// a smaller vocal tract sounds more like a cartoon cat than a person.
const VOWELS = {
  o: [450, 800, 2830],
  i: [280, 2250, 2890],
  a: [800, 1200, 2600],
};
const FORMANT_SCALE = 1.25;
const FORMANT_BANDWIDTH = [80, 100, 140]; // Hz, per formant
const FORMANT_GAIN = [1, 0.6, 0.3]; // higher formants are quieter
// Narrow formants catch fewer of the sawtooth's harmonics on "o" and "a"
// than on "i", so those come out quieter; this evens the three out
// (measured on A4 with an offline render, see LOG.md).
const VOWEL_LEVEL = { o: 2.2, i: 1, a: 1.8 };

/** The order presses cycle through. */
export const VOWEL_SEQUENCE = ["o", "i", "a"];

const ATTACK = 0.02; // s to full loudness
const SCOOP = 0.06; // s to slide up into the note…
const SCOOP_FROM = -1; // …from this many semitones below
const RELEASE = 0.12; // s to fade out after the key is let go
const VIBRATO_RATE = 6; // Hz
const VIBRATO_DEPTH = 0.012; // fraction of the note's frequency
const VIBRATO_DELAY = 0.15; // s of plain tone before the vibrato fades in
const MASTER_GAIN = 0.35;

export function createVoice() {
  let ctx = null;
  let output = null;

  // The AudioContext must be created (or resumed) inside a user gesture,
  // so it's made on the first note rather than at load.
  function ensureContext() {
    if (!ctx) {
      ctx = new AudioContext({ latencyHint: "interactive" });
      const master = ctx.createGain();
      master.gain.value = MASTER_GAIN;
      // Chords stack voices; the compressor keeps them from clipping.
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -12;
      limiter.ratio.value = 8;
      master.connect(limiter).connect(ctx.destination);
      output = master;
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  /**
   * Start singing `vowel` at `freq` Hz. Returns stop(), which fades it out;
   * until then it sustains.
   */
  function start(freq, vowel) {
    const audio = ensureContext();
    const now = audio.currentTime + 0.005;

    const source = audio.createOscillator();
    source.type = "sawtooth";
    source.frequency.setValueAtTime(freq * 2 ** (SCOOP_FROM / 12), now);
    source.frequency.linearRampToValueAtTime(freq, now + SCOOP);

    const vibrato = audio.createOscillator();
    vibrato.frequency.value = VIBRATO_RATE;
    const vibratoDepth = audio.createGain();
    vibratoDepth.gain.setValueAtTime(0, now + VIBRATO_DELAY);
    vibratoDepth.gain.linearRampToValueAtTime(freq * VIBRATO_DEPTH, now + VIBRATO_DELAY + 0.3);
    vibrato.connect(vibratoDepth).connect(source.frequency);

    const envelope = audio.createGain();
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(VOWEL_LEVEL[vowel], now + ATTACK);
    envelope.connect(output);

    VOWELS[vowel].forEach((formant, i) => {
      const centre = formant * FORMANT_SCALE;
      const filter = audio.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = centre;
      filter.Q.value = centre / FORMANT_BANDWIDTH[i];
      const level = audio.createGain();
      level.gain.value = FORMANT_GAIN[i];
      source.connect(filter).connect(level).connect(envelope);
    });

    source.start(now);
    vibrato.start(now);
    source.onended = () => envelope.disconnect();

    let stopped = false;
    return function stop() {
      if (stopped) return;
      stopped = true;
      // Fade from wherever the attack got to. Worked out here rather than
      // read from gain.value, which Firefox doesn't keep up to date with
      // scheduled ramps.
      const at = Math.max(audio.currentTime, now);
      const level = VOWEL_LEVEL[vowel] * Math.min(1, (at - now) / ATTACK);
      envelope.gain.cancelScheduledValues(at);
      envelope.gain.setValueAtTime(level, at);
      envelope.gain.linearRampToValueAtTime(0, at + RELEASE);
      source.stop(at + RELEASE + 0.02);
      vibrato.stop(at + RELEASE + 0.02);
    };
  }

  return { start };
}
