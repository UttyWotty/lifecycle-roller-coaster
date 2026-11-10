/**
 * Card that holds the fields and actions for one event.
 * An uncertain AI reading is labelled until the user confirms or changes it.
 * Button names include the event position, so each one is clear to screen reader users.
 */
import type { ReactElement } from "react";
import { useT } from "@/components/I18n/useLocale";
import { LOW_CONFIDENCE_THRESHOLD } from "@/lib/ai/extraction";
import type { EventField, EventPatch, MoveDirection } from "@/lib/events/editing";
import type { LifeEvent } from "@/lib/events/schema";
import { EventFields } from "./EventFields";
import { SECONDARY_BUTTON_CLASS } from "./fieldStyles";

interface EventCardProps {
  event: LifeEvent;
  position: number;
  total: number;
  invalidFields: readonly EventField[];
  onChange: (patch: EventPatch) => void;
  onConfirm: () => void;
  onMove: (direction: MoveDirection) => void;
  onDelete: () => void;
}

const MOVE_UP: MoveDirection = -1;
const MOVE_DOWN: MoveDirection = 1;

export function EventCard(props: EventCardProps): ReactElement {
  const { event, position, total, invalidFields, onChange, onConfirm, onMove, onDelete } = props;
  const isBestGuess = event.confidence < LOW_CONFIDENCE_THRESHOLD;
  const t = useT();

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-muted p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">{t("review.eventHeading", { position })}</h2>
        {isBestGuess && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">{t("review.bestGuess")}</span>
            <button
              type="button"
              onClick={onConfirm}
              aria-label={t("review.looksRightLabel", { position })}
              className={SECONDARY_BUTTON_CLASS}
            >
              {t("review.looksRight")}
            </button>
          </div>
        )}
      </div>
      <EventFields event={event} invalidFields={invalidFields} onChange={onChange} />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={position === 1}
          onClick={() => onMove(MOVE_UP)}
          aria-label={t("review.moveUpLabel", { position })}
          className={SECONDARY_BUTTON_CLASS}
        >
          {t("review.moveUp")}
        </button>
        <button
          type="button"
          disabled={position === total}
          onClick={() => onMove(MOVE_DOWN)}
          aria-label={t("review.moveDownLabel", { position })}
          className={SECONDARY_BUTTON_CLASS}
        >
          {t("review.moveDown")}
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={t("review.deleteLabel", { position })}
          className={SECONDARY_BUTTON_CLASS}
        >
          {t("review.delete")}
        </button>
      </div>
    </li>
  );
}
