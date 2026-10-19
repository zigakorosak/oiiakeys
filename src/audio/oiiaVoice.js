// The "oiia" voice: every note is sung as o-i-i-a, like the spinning cat.
//
// Synthesized, not sampled: a sawtooth (the "vocal cords") through three
// parallel band-pass filters (the formants that make a vowel sound like
// that vowel). Sliding the formants o → i → i → a over ~0.7 s, with a
// dip between the two i's, is what makes it say "oiia". See DESIGN.md
// "Voice" for the numbers and why they are what they are.

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

// A syllable is a list of points, ramped linearly between:
//   t: seconds after the note starts
//   v: vowel at that point
//   p: pitch offset in semitones from the played note
//   g: loudness, 0..1
// The long "ii" sits at p = 0, so the note sounds in tune; the "o" slides
// up into it and the "a" falls away, which is the meme's contour.
const SYLLABLES = {
  oiia: [
    { t: 0, v: "o", p: -3, g: 0 },
    { t: 0.03, v: "o", p: -2, g: 1 },
    { t: 0.12, v: "o", p: -1, g: 1 },
    { t: 0.17, v: "i", p: 0, g: 1 },
    { t: 0.26, v: "i", p: 0, g: 0.95 },
    { t: 0.29, v: "i", p: -0.5, g: 0.3 }, // the break between "i" and "i"
    { t: 0.32, v: "i", p: 0, g: 1 },
    { t: 0.42, v: "i", p: 0, g: 1 },
    { t: 0.5, v: "a", p: -0.5, g: 1 },
    { t: 0.62, v: "a", p: -2, g: 0.7 },
    { t: 0.75, v: "a", p: -4, g: 0 },
  ],
  oi: [
    { t: 0, v: "o", p: -3, g: 0 },
    { t: 0.02, v: "o", p: -2, g: 1 },
    { t: 0.08, v: "o", p: -1, g: 1 },
    { t: 0.12, v: "i", p: 0, g: 1 },
    { t: 0.24, v: "i", p: 0, g: 0.8 },
    { t: 0.32, v: "i", p: -1, g: 0 },
  ],
};

const VIBRATO_RATE = 6; // Hz
const VIBRATO_DEPTH = 0.012; // fraction of the note's frequency
const MASTER_GAIN = 0.35;

/** Seconds a syllable lasts (the spinning cat uses it too). */
export const syllableLength = (syllable) => SYLLABLES[syllable].at(-1).t;

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

  /** Sing one "oiia" at `freq` Hz. */
  function play(freq, syllable = "oiia") {
    const audio = ensureContext();
    const points = SYLLABLES[syllable] ?? SYLLABLES.oiia;
    const start = audio.currentTime + 0.005;
    const end = start + points.at(-1).t;

    const source = audio.createOscillator();
    source.type = "sawtooth";

    const vibrato = audio.createOscillator();
    vibrato.frequency.value = VIBRATO_RATE;
    const vibratoDepth = audio.createGain();
    vibratoDepth.gain.value = freq * VIBRATO_DEPTH;
    vibrato.connect(vibratoDepth).connect(source.frequency);

    const envelope = audio.createGain();
    envelope.connect(output);

    const formants = FORMANT_BANDWIDTH.map((bandwidth, i) => {
      const filter = audio.createBiquadFilter();
      filter.type = "bandpass";
      const level = audio.createGain();
      level.gain.value = FORMANT_GAIN[i];
      source.connect(filter).connect(level).connect(envelope);
      return { filter, bandwidth };
    });

    for (const [n, point] of points.entries()) {
      const at = start + point.t;
      const ramp = n === 0 ? "setValueAtTime" : "linearRampToValueAtTime";
      source.frequency[ramp](freq * 2 ** (point.p / 12), at);
      envelope.gain[ramp](point.g * VOWEL_LEVEL[point.v], at);
      formants.forEach(({ filter, bandwidth }, i) => {
        const centre = VOWELS[point.v][i] * FORMANT_SCALE;
        filter.frequency[ramp](centre, at);
        filter.Q[ramp](centre / bandwidth, at);
      });
    }

    source.start(start);
    vibrato.start(start);
    source.stop(end + 0.05);
    vibrato.stop(end + 0.05);
    source.onended = () => envelope.disconnect();
  }

  return { play };
}
