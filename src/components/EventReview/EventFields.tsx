/**
 * Form fields for correcting one life event.
 * Every control has a visible label, and sentiment and impact stay separate choices.
 * Changes are reported to the parent, which owns the event list.
 */
import type { ChangeEvent, ReactElement } from "react";
import type { EventField, EventPatch } from "@/lib/events/editing";
import { EVENT_CATEGORIES, type LifeEvent } from "@/lib/events/schema";
import { ERROR_CLASS, FIELD_CLASS, LABEL_CLASS, toLabel } from "./fieldStyles";
import { IntensityFields } from "./IntensityFields";

interface EventFieldsProps {
  event: LifeEvent;
  invalidFields: readonly EventField[];
  onChange: (patch: EventPatch) => void;
}

const DESCRIPTION_ROWS = 2;
const DATE_PLACEHOLDER = "2015, 2015-06 or 2015-06-30";
const TITLE_ERROR = "Add a title for this event.";
const DATE_ERROR = "Use a real date like 2015, 2015-06 or 2015-06-30, or leave it empty.";

type TextChange = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

export function EventFields({ event, invalidFields, onChange }: EventFieldsProps): ReactElement {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className={`${LABEL_CLASS} sm:col-span-2`}>
        Title
        <input
          value={event.title}
          aria-invalid={invalidFields.includes("title")}
          onChange={({ target }: TextChange) => onChange({ title: target.value })}
          className={FIELD_CLASS}
        />
        {invalidFields.includes("title") && <span className={ERROR_CLASS}>{TITLE_ERROR}</span>}
      </label>
      <label className={LABEL_CLASS}>
        Date
        <input
          value={event.date ?? ""}
          placeholder={DATE_PLACEHOLDER}
          aria-invalid={invalidFields.includes("date")}
          onChange={({ target }: TextChange) => onChange({ date: target.value.trim() || null })}
          className={FIELD_CLASS}
        />
        {invalidFields.includes("date") && <span className={ERROR_CLASS}>{DATE_ERROR}</span>}
      </label>
      <label className={LABEL_CLASS}>
        Category
        <select
          value={event.category}
          onChange={({ target }) =>
            onChange({ category: target.value as LifeEvent["category"] })
          }
          className={FIELD_CLASS}
        >
          {EVENT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {toLabel(category)}
            </option>
          ))}
        </select>
      </label>
      <label className={`${LABEL_CLASS} sm:col-span-2`}>
        Description
        <textarea
          value={event.description}
          rows={DESCRIPTION_ROWS}
          onChange={({ target }: TextChange) => onChange({ description: target.value })}
          className={FIELD_CLASS}
        />
      </label>
      <IntensityFields event={event} onChange={onChange} />
    </div>
  );
}
