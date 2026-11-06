/**
 * Made-up life stories that let anyone see a finished ride without writing a word.
 * Every person here is fictional, and each life suits a different ride style.
 * This module holds data and one builder, and never involves an AI provider.
 */
import { formatEventId } from "@/lib/events/editing";
import type { EventCategory, EventSentiment, LifeEvent } from "@/lib/events/schema";
import type { Rider } from "@/lib/scene/riders";
import type { RideTheme } from "@/lib/scene/themes";
import type { RideStyle } from "@/lib/track/types";

export interface SampleLife {
  id: string;
  title: string;
  rideStyle: RideStyle;
  rideTheme: RideTheme;
  rider: Rider;
  events: readonly LifeEvent[];
}

type SampleRow = readonly [
  date: string | null,
  title: string,
  category: EventCategory,
  sentiment: EventSentiment,
  impact: number,
  description: string,
];

/** Sample events are complete and need no review, so none is labelled as a best guess. */
const FULL_CONFIDENCE = 1;

function buildLife(
  id: string,
  title: string,
  rideStyle: RideStyle,
  rideTheme: RideTheme,
  rider: Rider,
  rows: readonly SampleRow[],
): SampleLife {
  const events = rows.map(([date, eventTitle, category, sentiment, impact, description], index) => ({
    id: formatEventId(index + 1),
    date,
    title: eventTitle,
    description,
    category,
    sentiment,
    impact,
    confidence: FULL_CONFIDENCE,
  }));
  return { id, title, rideStyle, rideTheme, rider, events };
}

/** The story a sample would have been written from, for the story box. */
export function sampleStory(life: SampleLife): string {
  return life.events.map(({ description }) => description).join(" ");
}

export const SAMPLE_LIVES: readonly SampleLife[] = [
  buildLife("maya", "Maya's Startup Rollercoaster", "loops", "nightmare", "robot", [
    ["2009", "Coded her first game", "education", "positive", 5, "At fifteen, Maya coded her first game and showed the whole class."],
    ["2012", "Began computer science", "education", "positive", 7, "She started computer science at university, the first in her family to go."],
    ["2014", "Failed her first exam", "education", "negative", 4, "She failed her first exam and nearly switched courses."],
    ["2016", "Landed a dream job", "career", "positive", 8, "A big tech company offered her a dream job in another city."],
    ["2017", "Burned out", "health", "negative", 6, "Long hours caught up with her and she burned out."],
    ["2018", "Quit to start up", "business", "positive", 9, "She quit and started a company from her kitchen table."],
    ["2019", "Ran out of money", "finance", "negative", 9, "The savings ran out and she could not pay herself for months."],
    ["2019-11", "Met Daniel", "relationships", "positive", 7, "She met Daniel at a friend's terrible karaoke night."],
    ["2020", "First big customer", "business", "positive", 8, "A hospital chain became the company's first big customer."],
    ["2021", "Co-founder walked away", "business", "negative", 8, "Her co-founder and best friend walked away from the company."],
    ["2022", "Married Daniel", "relationships", "positive", 10, "She married Daniel in a tiny ceremony by the sea."],
    [null, "Learned to say no", "personal", "neutral", 5, "Somewhere along the way she learned to say no."],
    ["2024", "Sold the company", "finance", "positive", 10, "She sold the company and paid back everyone who believed in her."],
    ["2025", "Started mentoring", "career", "positive", 6, "She began mentoring young founders every week."],
  ]),
  buildLife("tomas", "Tomas Takes the Night Shift", "metro", "night", "ghost", [
    ["2005", "Moved to Lisbon", "personal", "positive", 6, "Tomas moved to Lisbon with one suitcase."],
    ["2007", "Started nursing school", "education", "positive", 7, "He started nursing school after years of odd jobs."],
    ["2009", "Father fell ill", "health", "negative", 8, "His father fell ill and he travelled home every weekend."],
    ["2010", "First hospital job", "career", "positive", 7, "He got his first job on a busy hospital ward."],
    ["2012", "Paid off his loans", "finance", "positive", 5, "He paid off his student loans two years early."],
    ["2013", "Met Ines on the ward", "relationships", "positive", 8, "He met Ines during a night shift over bad vending machine coffee."],
    ["2015", "Daughter was born", "relationships", "positive", 10, "Their daughter was born on the quietest night of the year."],
    ["2016", "Back injury", "health", "negative", 7, "A back injury kept him off the ward for six months."],
    ["2017", "Moved to teaching", "career", "neutral", 6, "He moved into teaching new nurses."],
    ["2020", "Pandemic wards", "career", "negative", 10, "The pandemic filled every ward and he barely slept."],
    ["2021", "Took up swimming", "health", "positive", 5, "He took up open water swimming to clear his head."],
    ["2022", "Bought a small flat", "finance", "positive", 7, "He and Ines finally bought a small flat with a view of the river."],
    ["2023", "Head of nursing", "career", "positive", 9, "He became head of nursing at the hospital where he started."],
    [null, "Still bakes on Sundays", "personal", "neutral", 3, "He still bakes his father's bread on Sundays."],
  ]),
  buildLife("priya", "Priya's Encore", "loops", "poster", "cat", [
    ["2001", "Got her first guitar", "personal", "positive", 7, "Priya got her first guitar, a battered gift from an uncle."],
    ["2004", "Formed a school band", "relationships", "positive", 5, "She formed a band with three school friends."],
    ["2007", "Dropped out of law", "education", "negative", 6, "She dropped out of law school and upset her parents."],
    ["2008", "First paid gig", "career", "positive", 6, "She played her first paid gig to eleven people."],
    ["2010", "Signed a record deal", "business", "positive", 9, "A small label signed the band after a festival set."],
    ["2011", "Album flopped", "career", "negative", 8, "The album flopped and the label dropped them."],
    ["2012", "Band broke up", "relationships", "negative", 7, "The band broke up in a van outside Leeds."],
    ["2013", "Taught guitar for rent", "finance", "neutral", 4, "She taught guitar to children to pay the rent."],
    ["2015", "Song used in a film", "career", "positive", 8, "A director used one of her old songs in a film."],
    ["2016", "Lost her voice", "health", "negative", 8, "Surgery on her vocal cords kept her silent for a year."],
    ["2018", "Forgave her parents", "relationships", "positive", 7, "She finally made peace with her parents."],
    ["2019", "Solo album", "career", "positive", 9, "Her solo album sold out its first pressing."],
    ["2022", "Sang at the big hall", "career", "positive", 10, "She sang to a full hall with her parents in the front row."],
    [null, "Opened a music school", "business", "positive", 6, "She opened a free music school in her old neighbourhood."],
  ]),
  buildLife("jonah", "Jonah's Second Act", "coaster", "classic", "smiley", [
    ["1998", "Started teaching", "career", "positive", 7, "Jonah started teaching maths at his old school."],
    ["2000", "Married Claire", "relationships", "positive", 9, "He married Claire in the rain."],
    ["2003", "Bought the old house", "finance", "positive", 6, "They bought an old house that needed everything fixed."],
    ["2005", "Twins arrived", "relationships", "positive", 10, "The twins arrived three weeks early."],
    ["2009", "Lost his savings", "finance", "negative", 8, "He lost most of his savings in the crash."],
    ["2011", "Heart scare", "health", "negative", 8, "A heart scare at forty-two changed how he lived."],
    ["2012", "Ran a first 10k", "health", "positive", 6, "He ran his first ten kilometres a year later."],
    ["2014", "Became head teacher", "career", "positive", 8, "He became head teacher of the school."],
    ["2017", "Separated from Claire", "relationships", "negative", 9, "He and Claire separated after seventeen years."],
    ["2018", "Learned to cook", "personal", "neutral", 4, "He learned to cook, badly at first."],
    ["2020", "Twins left for uni", "relationships", "neutral", 6, "The twins left for university and the house went quiet."],
    ["2021", "Retired early", "career", "neutral", 7, "He retired early to see what else there was."],
    ["2022", "Started woodworking", "education", "positive", 5, "He started a woodworking course."],
    ["2024", "Opened a woodwork shop", "business", "positive", 8, "He opened a small furniture shop on the high street."],
  ]),
  buildLife("elena", "Elena's Kitchen Stories", "metro", "sunset", "cat", [
    ["2003", "Learned from grandma", "personal", "positive", 8, "Elena learned to cook at her grandmother's side."],
    ["2008", "Culinary school", "education", "positive", 7, "She won a place at culinary school in Barcelona."],
    ["2010", "Fired from first job", "career", "negative", 6, "A head chef fired her after one month."],
    ["2011", "Worked in Paris", "career", "positive", 8, "She talked her way into a kitchen in Paris."],
    ["2013", "Grandma passed away", "relationships", "negative", 9, "Her grandmother died the week before she came home."],
    ["2014", "Took a bank loan", "finance", "neutral", 7, "She took a frightening bank loan."],
    ["2015", "Opened her restaurant", "business", "positive", 10, "She opened a restaurant named after her grandmother."],
    ["2016", "Kitchen fire", "business", "negative", 9, "A kitchen fire closed the restaurant for five months."],
    ["2017", "Neighbours rebuilt it", "relationships", "positive", 8, "Neighbours helped rebuild it and painted the walls."],
    ["2018", "Fell for Marta", "relationships", "positive", 7, "She fell for Marta, a supplier with very good lemons."],
    ["2019", "Wrist surgery", "health", "negative", 5, "Wrist surgery kept her away from the stove."],
    ["2021", "Won a national award", "career", "positive", 9, "The restaurant won a national award."],
    ["2023", "Paid off the loan", "finance", "positive", 7, "She paid off the last of the loan."],
    [null, "Wrote a cookbook", "personal", "positive", 6, "She wrote her grandmother's recipes into a cookbook."],
  ]),
  buildLife("sam", "Sam Goes the Distance", "coaster", "haunted", "dino", [
    ["2006", "Joined a running club", "health", "positive", 6, "Sam joined a running club at twelve."],
    ["2010", "Won the county race", "personal", "positive", 7, "Sam won the county race, in borrowed shoes."],
    ["2012", "Sports scholarship", "education", "positive", 9, "A sports scholarship paid for university."],
    ["2013", "Stress fracture", "health", "negative", 8, "A stress fracture ended the first season."],
    ["2014", "Lost the scholarship", "finance", "negative", 7, "The scholarship was withdrawn after the injury."],
    ["2015", "Worked in a bike shop", "career", "neutral", 3, "Sam worked in a bike shop to pay the fees."],
    ["2016", "Graduated", "education", "positive", 6, "Sam graduated in physiotherapy."],
    ["2018", "Made the national team", "career", "positive", 10, "Sam made the national team at twenty-four."],
    ["2019", "Missed the finals", "career", "negative", 7, "Sam missed the finals by half a second."],
    ["2020", "Moved in with Ali", "relationships", "positive", 7, "Sam moved in with Ali and a very loud cat."],
    ["2021", "Retired from racing", "career", "neutral", 8, "Sam retired from racing."],
    ["2022", "Started a clinic", "business", "positive", 7, "Sam started a clinic for injured runners."],
    ["2023", "Ran with an old rival", "relationships", "positive", 4, "Sam ran a charity race beside an old rival."],
    ["2025", "Became a parent", "relationships", "positive", 10, "Sam became a parent, and now runs much more slowly."],
  ]),
  buildLife("amara", "Amara Crosses the Ocean", "metro", "minimal", "astronaut", [
    ["1996", "Left Lagos at sixteen", "personal", "neutral", 9, "Amara left Lagos at sixteen to live with an aunt in Toronto."],
    ["1997", "Bullied for her accent", "education", "negative", 5, "She was teased at school for her accent."],
    ["1999", "Won a science prize", "education", "positive", 7, "She won a provincial science prize."],
    ["2001", "Worked two jobs", "finance", "negative", 5, "She worked two jobs through her engineering degree."],
    ["2004", "First engineering job", "career", "positive", 8, "She became the only woman on a bridge-building team."],
    ["2006", "Paid for brother's uni", "finance", "positive", 6, "Her salary sent her brother to university."],
    ["2008", "Laid off in the crash", "career", "negative", 8, "She was laid off in the crash."],
    ["2009", "Married Kofi", "relationships", "positive", 9, "She married Kofi with two ceremonies on two continents."],
    ["2011", "Became a citizen", "personal", "positive", 8, "She became a citizen, fifteen years after arriving."],
    ["2013", "Hard pregnancy", "health", "negative", 7, "A hard pregnancy put her in hospital for weeks."],
    ["2013-09", "Son was born", "relationships", "positive", 10, "Her son was born healthy."],
    ["2016", "Opened her own firm", "business", "positive", 8, "She opened her own engineering firm."],
    ["2020", "Bridge built in Lagos", "career", "positive", 10, "Her firm built a footbridge in the neighbourhood she grew up in."],
    [null, "Mentors new arrivals", "personal", "positive", 5, "She mentors teenagers who have just arrived in the country."],
  ]),
  buildLife("walter", "Walter's Eighty Years", "coaster", "retro", "smiley", [
    ["1951", "Grew up on the farm", "personal", "positive", 6, "Walter grew up on a sheep farm."],
    ["1961", "Left school early", "education", "negative", 5, "He left school at fifteen when the harvest failed."],
    ["1964", "Joined the navy", "career", "positive", 7, "He joined the merchant navy and saw the world."],
    ["1969", "Shipwrecked off Chile", "health", "negative", 9, "He spent two days adrift after a shipwreck off Chile."],
    ["1972", "Married Rose", "relationships", "positive", 10, "He married Rose, who had been writing to him for years."],
    ["1975", "Took over the farm", "business", "neutral", 7, "He came home and took over the farm."],
    ["1983", "Foot and mouth", "business", "negative", 8, "An outbreak took most of the flock."],
    ["1985", "Learned to read music", "education", "positive", 4, "He learned to read music to join the village choir."],
    ["1990", "Paid off the farm", "finance", "positive", 7, "He paid off the farm the week of his son's wedding."],
    ["1999", "First grandchild", "relationships", "positive", 8, "His first grandchild was born."],
    ["2008", "Rose passed away", "relationships", "negative", 10, "Rose died after thirty-six years together."],
    ["2010", "Took up painting", "personal", "positive", 6, "He took up painting, mostly sheep."],
    ["2015", "Learned to use email", "education", "neutral", 2, "He learned email to write to his grandchildren."],
    ["2021", "Walked the coast path", "health", "positive", 7, "He walked the coast path at seventy-six."],
  ]),
];
