/**
 * Browser player for the theme music: it plays a tune from themeTunes on a loop with Web Audio oscillators, no audio files.
 * It schedules one pass ahead on a timer, so the loop never gaps, and keeps the music quieter than the ride sounds.
 * stop() silences everything at once, and it can play to the speakers or into a video recording.
 */
import { loopSeconds, notesOf, type Tune, type TuneNote } from "@/lib/music/themeTunes";

export interface MusicPlayer {
  play: (tune: Tune) => void;
  stop: () => void;
}

/** Quiet enough to sit under the ride sounds and the narration. */
const MUSIC_VOLUME = 0.12;
const BASS_SHARE = 0.7;
const SILENT = 0.0001;
const ATTACK_SECONDS = 0.02;
/** How often the timer checks, and how far ahead the next pass is scheduled: over a second, since background tabs slow timers to one a second. */
const CHECK_MS = 250;
const LOOK_AHEAD_SECONDS = 2;
/** A small delay before the first note, so it is never scheduled in the past. */
const START_DELAY_SECONDS = 0.05;

interface Playing {
  timer: ReturnType<typeof setInterval>;
  sources: Set<OscillatorNode>;
}

function playNote(context: BaseAudioContext, output: AudioNode, note: TuneNote, at: number, tune: Tune, sources: Set<OscillatorNode>): void {
  const oscillator = context.createOscillator();
  oscillator.type = note.part === "melody" ? tune.melodyWave : tune.bassWave;
  oscillator.frequency.value = note.frequency;
  const gain = context.createGain();
  const volume = note.part === "melody" ? 1 : BASS_SHARE;
  gain.gain.setValueAtTime(SILENT, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + Math.min(ATTACK_SECONDS, note.seconds / 2));
  gain.gain.exponentialRampToValueAtTime(SILENT, at + note.seconds);
  oscillator.connect(gain);
  gain.connect(output);
  sources.add(oscillator);
  oscillator.onended = () => sources.delete(oscillator);
  oscillator.start(at);
  oscillator.stop(at + note.seconds);
}

/** Makes music on a context and sends it to an output, which can be the speakers or a recording. */
export function createMusicPlayer(context: BaseAudioContext, output: AudioNode): MusicPlayer {
  const master = context.createGain();
  master.gain.value = MUSIC_VOLUME;
  master.connect(output);
  let playing: Playing | null = null;

  function stop(): void {
    if (playing === null) {
      return;
    }
    clearInterval(playing.timer);
    playing.sources.forEach((source) => source.stop());
    playing = null;
  }

  function play(tune: Tune): void {
    stop();
    const notes = notesOf(tune);
    const loop = loopSeconds(tune);
    const sources = new Set<OscillatorNode>();
    let nextPass = context.currentTime + START_DELAY_SECONDS;
    const schedule = (): void => {
      while (nextPass < context.currentTime + LOOK_AHEAD_SECONDS) {
        const passStart = nextPass;
        notes.forEach((note) => playNote(context, master, note, passStart + note.start, tune, sources));
        nextPass += loop;
      }
    };
    schedule();
    playing = { timer: setInterval(schedule, CHECK_MS), sources };
  }

  return { play, stop };
}
