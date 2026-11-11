/**
 * The feedback form: one required "How was it?" choice, an optional message, and a Send button.
 * It says plainly what is kept before anything is sent, keeps the typed words when sending fails, and thanks the
 * visitor afterwards with a way to send another. It holds no ride or story data and sends none.
 */
"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactElement } from "react";
import { CHOICE_PILL_CLASS, ERROR_CLASS, FIELD_CLASS, LABEL_CLASS, SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { useLocale, useT } from "@/components/I18n/useLocale";
import { MAX_MESSAGE_LENGTH, REACTIONS, type Reaction } from "@/lib/feedback/feedback";
import type { MessageKey } from "@/lib/i18n/messages";
import { isSent, sendFeedback } from "./sendFeedback";

const PRIMARY_CLASS = "min-h-11 rounded-full bg-accent px-6 py-2 font-semibold text-on-accent disabled:opacity-50";
const MESSAGE_ROWS = 5;
const NO_MESSAGE = "";

export function FeedbackForm(): ReactElement {
  const t = useT();
  const locale = useLocale();
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [message, setMessage] = useState(NO_MESSAGE);
  const [isSending, setIsSending] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<MessageKey | null>(null);
  const length = Array.from(message).length;

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (reaction === null) {
      setError("feedback.chooseReaction");
      return;
    }
    setIsSending(true);
    setError(null);
    const outcome = await sendFeedback(reaction, message, locale);
    setIsSending(false);
    if (isSent(outcome)) {
      setIsDone(true);
      setReaction(null);
      setMessage(NO_MESSAGE);
    } else {
      setError(outcome as MessageKey);
    }
  }

  if (isDone) {
    return (
      <div role="status" className="flex flex-col gap-3">
        <p className="text-lg font-semibold">{t("feedback.thanks")}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setIsDone(false)} className={SECONDARY_BUTTON_CLASS}>
            {t("feedback.sendAnother")}
          </button>
          <Link href="/" className={`${SECONDARY_BUTTON_CLASS} inline-flex items-center`}>
            {t("feedback.backToApp")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-4" noValidate>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-semibold">{t("feedback.reactionLegend")}</legend>
        <div className="flex flex-wrap gap-2">
          {REACTIONS.map((option) => (
            <label key={option} className={CHOICE_PILL_CLASS}>
              <input
                type="radio"
                name="feedback-reaction"
                checked={reaction === option}
                onChange={() => {
                  setReaction(option);
                  setError(null);
                }}
                className="accent-accent"
              />
              {t(`feedback.${option}`)}
            </label>
          ))}
        </div>
      </fieldset>
      <label className={LABEL_CLASS}>
        {t("feedback.messageLabel")}
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={MESSAGE_ROWS}
          aria-describedby="feedback-hint"
          className={`${FIELD_CLASS} resize-y`}
        />
      </label>
      <p id="feedback-hint" className="flex flex-wrap justify-between gap-2 text-sm text-muted">
        <span>{t("feedback.messageHint", { max: MAX_MESSAGE_LENGTH })}</span>
        <span aria-hidden="true" className={length > MAX_MESSAGE_LENGTH ? "text-accent" : undefined}>
          {t("feedback.counter", { count: length, max: MAX_MESSAGE_LENGTH })}
        </span>
      </p>
      <p className="rounded-lg border border-muted p-3 text-sm">{t("feedback.privacyNote")}</p>
      <p role="alert" className={ERROR_CLASS}>
        {error === null ? NO_MESSAGE : t(error, { max: MAX_MESSAGE_LENGTH })}
      </p>
      <div>
        <button type="submit" disabled={isSending} className={PRIMARY_CLASS}>
          {t(isSending ? "feedback.sending" : "feedback.send")}
        </button>
      </div>
    </form>
  );
}
