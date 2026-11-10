/**
 * The card for Guess my ride: the stop's title and date, the two questions, the reveal, and the final score.
 * Answers are revealed only after both guesses are in, and the score can be shared with the ride's link.
 * It shows what the game state says and passes choices back to it.
 */
"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { useLocale, useT, type Translate } from "@/components/I18n/useLocale";
import type { EventSentiment, LifeEvent } from "@/lib/events/schema";
import { FEELING_CHOICES, POINTS_PER_STOP, SIZE_CHOICES, scoreMessage, scoreOf, sizeOf, verdict, type StopSize } from "@/lib/guess/guessGame";
import type { MessageKey } from "@/lib/i18n/messages";
import type { GuessGame } from "./useGuessGame";

interface GuessPanelProps {
  game: GuessGame;
  event: LifeEvent | null;
  stopCount: number;
  title: string;
}

const PRIMARY_CLASS = "min-h-11 rounded-full bg-accent px-6 py-2 font-semibold text-on-accent disabled:opacity-50";
const CHOICE_CLASS = `${SECONDARY_BUTTON_CLASS} aria-pressed:border-accent aria-pressed:font-semibold`;
const NO_STATUS = "";
/** Button names, and the lower-case words the reveal sentence uses, for each feeling and size. */
const FEELING_NAMES: Readonly<Record<EventSentiment, MessageKey>> = {
  positive: "guess.feelingPositive",
  negative: "guess.feelingNegative",
  neutral: "guess.feelingNeutral",
};
const FEELING_WORDS: Readonly<Record<EventSentiment, MessageKey>> = {
  positive: "guess.feltPositive",
  negative: "guess.feltNegative",
  neutral: "guess.feltNeutral",
};
const SIZE_NAMES: Readonly<Record<StopSize, MessageKey>> = { small: "guess.sizeSmall", medium: "guess.sizeMedium", big: "guess.sizeBig" };
const SIZE_WORDS: Readonly<Record<StopSize, MessageKey>> = { small: "guess.wasSmall", medium: "guess.wasMedium", big: "guess.wasBig" };

function options<T extends string>(values: readonly T[], names: Readonly<Record<T, MessageKey>>, t: Translate): { value: T; name: string }[] {
  return values.map((value) => ({ value, name: t(names[value]) }));
}

function rightOrWrong(isRight: boolean, t: Translate): string {
  return t(isRight ? "guess.right" : "guess.wrong");
}

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
  const t = useT();
  if (game.revealed === null) {
    return null;
  }
  const feeling = t(FEELING_WORDS[event.sentiment]);
  const size = t(SIZE_WORDS[sizeOf(event.impact)]);
  return (
    <div aria-live="polite" className="flex flex-col gap-1 rounded-lg bg-accent/10 p-3">
      <p className="font-semibold">{t("guess.truth", { feeling, size, impact: event.impact })}</p>
      <p className="text-sm">
        {t("guess.judged", { feeling: rightOrWrong(game.revealed.isFeelingRight, t), size: rightOrWrong(game.revealed.isSizeRight, t) })}
      </p>
    </div>
  );
}

function Score({ game, stopCount, title }: Omit<GuessPanelProps, "event">): ReactElement {
  const t = useT();
  const locale = useLocale();
  const [status, setStatus] = useState(NO_STATUS);
  const score = scoreOf(game.results);
  const best = stopCount * POINTS_PER_STOP;

  async function share(): Promise<void> {
    const text = scoreMessage(title, score, best, window.location.href, locale);
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setStatus(t("guess.copied"));
    } catch {
      setStatus(typeof navigator.share === "function" ? NO_STATUS : t("guess.shareFailed"));
    }
  }

  return (
    <div aria-live="polite" className="flex flex-col gap-2">
      <p className="text-sm text-muted">{t("guess.yourScore")}</p>
      <p className="text-3xl font-bold">
        {score} / {best}
      </p>
      <p className="text-lg font-semibold">{verdict(score, best, locale)}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => void share()} className={PRIMARY_CLASS}>
          {t("guess.shareScore")}
        </button>
        <button type="button" onClick={game.start} className={SECONDARY_BUTTON_CLASS}>
          {t("guess.playAgain")}
        </button>
        <button type="button" onClick={game.stop} className={SECONDARY_BUTTON_CLASS}>
          {t("guess.done")}
        </button>
      </div>
      <p role="status" className="text-sm">
        {status}
      </p>
    </div>
  );
}

export function GuessPanel({ game, event, stopCount, title }: GuessPanelProps): ReactElement {
  const t = useT();
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
    <section aria-label={t("guess.region")} className="flex flex-col gap-3 rounded-lg border-2 border-accent p-4">
      {event !== null && (
        <>
          <p className="text-sm text-muted">
            {t("guess.progress", {
              number: game.index + 1,
              count: stopCount,
              date: event.date ?? t("ride.dateUnknown"),
              score: scoreOf(game.results),
            })}
          </p>
          <h2 ref={heading} tabIndex={-1} className="wrap-anywhere text-xl font-semibold outline-none">
            {event.title}
          </h2>
          <Choices legend={t("guess.feelingQuestion")} options={options(FEELING_CHOICES, FEELING_NAMES, t)} chosen={game.feeling} isLocked={isLocked} onChoose={game.chooseFeeling} />
          <Choices legend={t("guess.sizeQuestion")} options={options(SIZE_CHOICES, SIZE_NAMES, t)} chosen={game.size} isLocked={isLocked} onChoose={game.chooseSize} />
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
                {t("guess.nextStop")}
              </button>
            ) : (
              <button type="button" onClick={game.reveal} disabled={game.feeling === null || game.size === null} className={PRIMARY_CLASS}>
                {t("guess.reveal")}
              </button>
            )}
            <button type="button" onClick={game.stop} className={SECONDARY_BUTTON_CLASS}>
              {t("guess.stop")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
