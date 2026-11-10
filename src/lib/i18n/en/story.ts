/**
 * English words for the writing stage: the story box, Generate, the sample button, the privacy note and every error.
 * Every other language must give the same keys, which the message index checks when it is compiled.
 * Placeholders in braces, such as {count}, are filled in when the message is shown.
 */
export const story = {
  heading: "Tell your story",
  intro: "Write about the moments that shaped your life, in your own words and in any order.",
  trySample: "Try a sample life",
  sampleHint: "Not ready to write? See a made-up life as a ride. It is free and sends nothing.",
  storyLabel: "Your story",
  placeholder: "I started university in 2015. I was really excited about it...",
  promptUniversity: "I started university in",
  promptFirstJob: "My first job was",
  promptHardest: "The hardest moment was",
  promptMovedTo: "I moved to",
  promptNeverForget: "A year I will never forget was",
  promptButton: "{prompt}...",
  characterCount: "{count} of {max} characters",
  generate: "Generate my ride",
  loading: "Reading your story...",
  replaceWarning: "Generating again replaces your current events and any changes to them.",
  privacyNote:
    "When you press Generate, your story is sent to Anthropic's Claude API to find the events in it. Nothing is sent before that, this app does not save your story, and it disappears when you leave the page.",
  tooLong: "This story is over the limit. Please shorten it to continue.",
  returnToRide: "Return to my ride",
  addManually: "Skip AI and add events myself",
  errorNetwork: "We could not reach the server. Check your connection and try again.",
  errorFallback: "Something went wrong while reading your story. Please try again.",
  errorRefused:
    "We could not turn this story into a ride. You did nothing wrong. Rewording it or leaving out a part may help.",
  errorTruncated: "This story has more events than we can read at once. Please try a shorter version.",
  errorRateLimited: "The ride is very busy right now. Please try again in a minute.",
  errorVisitorLimit:
    "You have made a lot of rides in a short time. Please take a break and try again later, or explore a sample life.",
  errorDailyLimit:
    "Today's free story readings are used up. Please come back tomorrow, or explore a sample life in the meantime.",
  errorForbidden: "This request looked automated, so it was blocked. Please reload the page and try again.",
  errorNotConfigured: "The story reader is not set up on this server yet.",
  errorTooLarge: "This story is too long to send. Please shorten it and try again.",
};
