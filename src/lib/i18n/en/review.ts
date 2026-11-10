/**
 * English words for the review stage and the reading notes: event cards, their fields, list actions and errors.
 * Every other language must give the same keys, which the message index checks when it is compiled.
 * Placeholders in braces, such as {position}, are filled in when the message is shown.
 */
export const review = {
  heading: "Review your events",
  intro: "This step is optional. Change anything that does not feel right.",
  backToStory: "Back to my story",
  noEvents: "No events yet. Add what happened and roughly when.",
  addEvent: "Add an event",
  sortByDate: "Sort by date",
  seeRide: "See my ride",
  removed: "Removed {title}.",
  untitled: "Untitled event",
  undo: "Undo",
  fixFields: "Fix the highlighted fields in {count} of your events.",
  eventHeading: "Event {position}",
  bestGuess: "Best guess",
  looksRight: "Looks right",
  looksRightLabel: "Looks right for event {position}",
  moveUp: "Move up",
  moveUpLabel: "Move event {position} up",
  moveDown: "Move down",
  moveDownLabel: "Move event {position} down",
  delete: "Delete",
  deleteLabel: "Delete event {position}",
  titleLabel: "Title",
  titleError: "Add a title for this event.",
  dateLabel: "Date",
  datePlaceholder: "2015, 2015-06 or 2015-06-30",
  dateError: "Use a real date like 2015, 2015-06 or 2015-06-30, or leave it empty.",
  categoryLabel: "Category",
  descriptionLabel: "Description",
  feelingLabel: "How it felt",
  impactLabel: "Impact: {impact} of {max}",
  sampleNotice: "This is a sample life. The person and the story are made up, and it cost nothing to make.",
  demoTitle: "Demo mode: these are sample events, not your story",
  demoDetails:
    "The AI did not read what you wrote. To have it read your story, add an API key to .env, set EXTRACTOR_MODE=anthropic and restart the app.",
  questionsHeading: "A few questions",
};
