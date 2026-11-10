/**
 * Browser player for Ride it sounds, built from Web Audio oscillators and noise, so no audio files are loaded.
 * Each cue from the pure rideSounds module becomes a short sound: clicks up a climb, a whoosh down a drop, a chime.
 * Lows get a falling note and the finish a fanfare, and stop() silences everything that is still sounding at once.
 */
import type { SoundCue } from "@/lib/ride/rideSounds";

export interface RideSoundPlayer {
  play: (cue: SoundCue) => void;
  stop: () => void;
}

const MASTER_VOLUME = 0.35;
const CLICK_SECONDS = 0.025;
const CLICK_FREQUENCY = 2600;
/** Clicks come faster up steep climbs. */
const SLOWEST_CLICK_GAP = 0.22;
const FASTEST_CLICK_GAP = 0.11;
const WHOOSH_LOW = 300;
const WHOOSH_HIGH = 2400;
const WHOOSH_VOLUME = 0.9;
/** Even a gentle drop is clearly heard; steeper ones add the rest. */
const WHOOSH_FLOOR = 0.6;
const NOTE_SECONDS = 0.35;
const NOTE_GAP = 0.11;
const NOTE_VOLUME = 0.5;
/** Notes in hertz: a major arpeggio for highs and the finish, a falling pair for lows. */
const HIGH_NOTES = [523.25, 659.25, 783.99, 1046.5];
const LOW_NOTES = [293.66, 220];
const NEUTRAL_NOTE = 440;
const FINISH_NOTES = [523.25, 659.25, 783.99, 1046.5, 1318.5];
const FINISH_CHORD = [523.25, 659.25, 783.99];
const FINISH_CHORD_SECONDS = 1.2;
const SILENT = 0.0001;
const SHORTEST_HIGH = 2;

function noiseBuffer(context: BaseAudioContext, seconds: number): AudioBuffer {
  const buffer = context.createBuffer(1, Math.max(1, Math.ceil(context.sampleRate * seconds)), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }
  return buffer;
}

/** Where sounds are made and what is still sounding, so every helper can add to it and stop() can end it. */
interface Voice {
  context: BaseAudioContext;
  master: GainNode;
  playing: Set<AudioScheduledSourceNode>;
}

function track(voice: Voice, source: AudioScheduledSourceNode, start: number, end: number): void {
  voice.playing.add(source);
  source.onended = () => voice.playing.delete(source);
  source.start(start);
  source.stop(end);
}

function envelope(voice: Voice, volume: number, start: number, seconds: number): GainNode {
  const gain = voice.context.createGain();
  gain.gain.setValueAtTime(SILENT, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(seconds / 4, NOTE_GAP));
  gain.gain.exponentialRampToValueAtTime(SILENT, start + seconds);
  gain.connect(voice.master);
  return gain;
}

function note(voice: Voice, frequency: number, start: number, seconds: number, volume: number, wave: OscillatorType): void {
  const oscillator = voice.context.createOscillator();
  oscillator.type = wave;
  oscillator.frequency.value = frequency;
  oscillator.connect(envelope(voice, volume, start, seconds));
  track(voice, oscillator, start, start + seconds);
}

function clicks(voice: Voice, seconds: number, strength: number): void {
  const { context } = voice;
  const gap = SLOWEST_CLICK_GAP - (SLOWEST_CLICK_GAP - FASTEST_CLICK_GAP) * strength;
  const buffer = noiseBuffer(context, CLICK_SECONDS);
  for (let at = 0; at < seconds; at += gap) {
    const start = context.currentTime + at;
    const source = context.createBufferSource();
    source.buffer = buffer;
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = CLICK_FREQUENCY;
    source.connect(filter);
    filter.connect(envelope(voice, NOTE_VOLUME, start, CLICK_SECONDS));
    track(voice, source, start, start + CLICK_SECONDS);
  }
}

function whoosh(voice: Voice, seconds: number, strength: number): void {
  const { context } = voice;
  const now = context.currentTime;
  const source = context.createBufferSource();
  source.buffer = noiseBuffer(context, seconds);
  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(WHOOSH_LOW, now);
  filter.frequency.exponentialRampToValueAtTime(WHOOSH_LOW + (WHOOSH_HIGH - WHOOSH_LOW) * strength, now + seconds);
  source.connect(filter);
  filter.connect(envelope(voice, WHOOSH_VOLUME * (WHOOSH_FLOOR + (1 - WHOOSH_FLOOR) * strength), now, seconds));
  track(voice, source, now, now + seconds);
}

function arpeggio(voice: Voice, notes: readonly number[], volume: number, wave: OscillatorType): void {
  const now = voice.context.currentTime;
  notes.forEach((frequency, index) => note(voice, frequency, now + index * NOTE_GAP, NOTE_SECONDS, volume, wave));
}

function fanfare(voice: Voice): void {
  arpeggio(voice, FINISH_NOTES, NOTE_VOLUME, "triangle");
  const chordAt = voice.context.currentTime + FINISH_NOTES.length * NOTE_GAP;
  FINISH_CHORD.forEach((frequency) => note(voice, frequency, chordAt, FINISH_CHORD_SECONDS, NOTE_VOLUME / 2, "triangle"));
}

function playCue(voice: Voice, cue: SoundCue): void {
  if (cue.kind === "climb") {
    clicks(voice, cue.seconds, cue.strength);
  } else if (cue.kind === "drop") {
    whoosh(voice, cue.seconds, cue.strength);
  } else if (cue.kind === "high") {
    const count = SHORTEST_HIGH + Math.round(cue.strength * (HIGH_NOTES.length - SHORTEST_HIGH));
    arpeggio(voice, HIGH_NOTES.slice(0, count), NOTE_VOLUME * (0.5 + cue.strength / 2), "triangle");
  } else if (cue.kind === "low") {
    arpeggio(voice, LOW_NOTES, NOTE_VOLUME * (0.5 + cue.strength / 2), "sine");
  } else if (cue.kind === "neutral") {
    note(voice, NEUTRAL_NOTE, voice.context.currentTime, NOTE_SECONDS, NOTE_VOLUME / 2, "sine");
  } else {
    fanfare(voice);
  }
}

/** Makes sounds on a context and sends them to an output, which can be the speakers or a recording. */
export function createRideSoundPlayer(context: BaseAudioContext, output: AudioNode): RideSoundPlayer {
  const master = context.createGain();
  master.gain.value = MASTER_VOLUME;
  master.connect(output);
  const voice: Voice = { context, master, playing: new Set() };
  return {
    play: (cue) => playCue(voice, cue),
    stop: () => {
      voice.playing.forEach((source) => source.stop());
      voice.playing.clear();
    },
  };
}
