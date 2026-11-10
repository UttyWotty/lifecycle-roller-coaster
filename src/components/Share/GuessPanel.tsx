/**
 * The card for Guess my ride: the stop's title and date, the two questions, the reveal, and the final score.
 * Answers are revealed only after both guesses are in, and the score can be shared with the ride's link.
 * It shows what the game state says and passes choices back to it.
 */
"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import type { LifeEvent } from "@/lib/events/schema";
import { FEELING_CHOICES, POINTS_PER_STOP, SIZE_CHOICES, scoreMessage, scoreOf, sizeOf, verdict } from "@/lib/guess/guessGame";
import { UNKNOWN_DATE } from "@/lib/track/labelWidth";
import type { GuessGame } from "./useGuessGame";

interface GuessPanelProps {
  game: GuessGame;
  event: LifeEvent | null;
  stopCount: number;
  title: string;
}

const PRIMARY_CLASS = "min-h-11 rounded-full bg-accent px-6 py-2 font-semibold text-on-accent disabled:opacity-50";
const CHOICE_CLASS = `${SECONDARY_BUTTON_CLASS} aria-pressed:border-accent aria-pressed:font-semibold`;
const SIZE_OPTIONS = SIZE_CHOICES.map(({ value, name, range }) => ({ value, name: `${name} (${range})` }));
const RIGHT = "Right";
const WRONG = "Not quite";
const COPIED = "Score copied. Paste it anywhere to challenge your friends.";
const SHARE_FAILED = "Sharing is blocked here.";

function Choices<T extends string>(props: {
  legend: string;
  options: readonly { value: T; name: string }[];
  chosen: T | null;
  isLocked: boolean;
  onChoose: (value: T) => void;
}): ReactElement {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="font-semibold">{props.legend}</legend>
      <div className="flex flex-wrap gap-2">
        {props.options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={props.chosen === option.value}
            disabled={props.isLocked}
            onClick={() => props.onChoose(option.value)}
            className={CHOICE_CLASS}
          >
            {option.name}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Truth({ event, game }: { event: LifeEvent; game: GuessGame }): ReactElement | null {
  if (game.revealed === null) {
    return null;
  }
  const feeling = FEELING_CHOICES.find(({ value }) => value === event.sentiment)?.name ?? event.sentiment;
  const size = SIZE_CHOICES.find(({ value }) => value === sizeOf(event.impact))?.name ?? "";
  return (
    <div aria-live="polite" className="flex flex-col gap-1 rounded-lg bg-accent/10 p-3">
      <p className="font-semibold">
        It felt {feeling.toLowerCase()}, and it was {size.toLowerCase()} ({event.impact} out of 10).
      </p>
      <p className="text-sm">
        Feeling: {game.revealed.isFeelingRight ? RIGHT : WRONG}. Size: {game.revealed.isSizeRight ? RIGHT : WRONG}.
      </p>
    </div>
  );
}

function Score({ game, stopCount, title }: Omit<GuessPanelProps, "event">): ReactElement {
  const [status, setStatus] = useState("");
  const score = scoreOf(game.results);
  const best = stopCount * POINTS_PER_STOP;

  async function share(): Promise<void> {
    const text = scoreMessage(title, score, best, window.location.href);
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setStatus(COPIED);
    } catch {
      setStatus(typeof navigator.share === "function" ? "" : SHARE_FAILED);
    }
  }

  return (
    <div aria-live="polite" className="flex flex-col gap-2">
      <p className="text-sm text-muted">Your score</p>
      <p className="text-3xl font-bold">
        {score} / {best}
      </p>
      <p className="text-lg font-semibold">{verdict(score, best)}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => void share()} className={PRIMARY_CLASS}>
          Share my score
        </button>
        <button type="button" onClick={game.start} className={SECONDARY_BUTTON_CLASS}>
          Play again
        </button>
        <button type="button" onClick={game.stop} className={SECONDARY_BUTTON_CLASS}>
          Done
        </button>
      </div>
      <p role="status" className="text-sm">
        {status}
      </p>
    </div>
  );
}

export function GuessPanel({ game, event, stopCount, title }: GuessPanelProps): ReactElement {
  const isLocked = game.revealed !== null;
  const heading = useRef<HTMLHeadingElement>(null);
  const after = useRef<HTMLDivElement>(null);

  /** Keyboard players keep their place: a new stop moves focus to its title, a reveal to what comes next. */
  useEffect(() => heading.current?.focus({ preventScroll: true }), [game.index]);
  useEffect(() => {
    if (isLocked) {
      after.current?.querySelector("button")?.focus({ preventScroll: true });
    }
  }, [isLocked]);
  return (
    <section aria-label="Guess my ride" className="flex flex-col gap-3 rounded-lg border-2 border-accent p-4">
      {event !== null && (
        <>
          <p className="text-sm text-muted">
            Stop {game.index + 1} of {stopCount} · {event.date ?? UNKNOWN_DATE} · Score {scoreOf(game.results)}
          </p>
          <h2 ref={heading} tabIndex={-1} className="wrap-anywhere text-xl font-semibold outline-none">
            {event.title}
          </h2>
          <Choices legend="How did it feel?" options={FEELING_CHOICES} chosen={game.feeling} isLocked={isLocked} onChoose={game.chooseFeeling} />
          <Choices legend="How big was it?" options={SIZE_OPTIONS} chosen={game.size} isLocked={isLocked} onChoose={game.chooseSize} />
          <Truth event={event} game={game} />
        </>
      )}
      <div ref={after} className="contents">
        {game.isFinished ? (
          <Score game={game} stopCount={stopCount} title={title} />
        ) : (
          <div className="flex flex-wrap gap-2">
            {isLocked ? (
              <button type="button" onClick={game.next} className={PRIMARY_CLASS}>
                Next stop
              </button>
            ) : (
              <button type="button" onClick={game.reveal} disabled={game.feeling === null || game.size === null} className={PRIMARY_CLASS}>
                Reveal
              </button>
            )}
            <button type="button" onClick={game.stop} className={SECONDARY_BUTTON_CLASS}>
              Stop guessing
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
