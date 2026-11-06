/**
 * Card that holds the fields and actions for one event.
 * An uncertain AI reading is labelled until the user confirms or changes it.
 * Button names include the event position, so each one is clear to screen reader users.
 */
import type { ReactElement } from "react";
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
  const name = `event ${position}`;

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-muted p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Event {position}</h2>
        {isBestGuess && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">Best guess</span>
            <button
              type="button"
              onClick={onConfirm}
              aria-label={`Looks right for ${name}`}
              className={SECONDARY_BUTTON_CLASS}
            >
              Looks right
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
          aria-label={`Move ${name} up`}
          className={SECONDARY_BUTTON_CLASS}
        >
          Move up
        </button>
        <button
          type="button"
          disabled={position === total}
          onClick={() => onMove(MOVE_DOWN)}
          aria-label={`Move ${name} down`}
          className={SECONDARY_BUTTON_CLASS}
        >
          Move down
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${name}`}
          className={SECONDARY_BUTTON_CLASS}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
