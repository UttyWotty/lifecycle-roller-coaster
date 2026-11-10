/**
 * English words the narrated ride speaks: each stop's place, its date the way people say it, and the ending.
 * Every other language must give the same keys, which the message index checks when it is compiled.
 * Placeholders in braces, such as {month}, are filled in when the line is built.
 */
export const narration = {
  stop: "Stop {number} of {count}. {date}. {title}",
  end: "End of the ride.",
  monthYear: "{month} {year}",
  dayMonthYear: "{day} {month} {year}",
  month1: "January",
  month2: "February",
  month3: "March",
  month4: "April",
  month5: "May",
  month6: "June",
  month7: "July",
  month8: "August",
  month9: "September",
  month10: "October",
  month11: "November",
  month12: "December",
};
