export type BirthdayEntry = {
  name: string;
  year: number;
  note: string;
};

/** Curated, senior-friendly famous birthdays by month-day (MM-DD). */
export const FAMOUS_BIRTHDAYS: Record<string, BirthdayEntry[]> = {
  "01-01": [
    { name: "J. Edgar Hoover", year: 1895, note: "Longtime FBI director" },
    { name: "Paul Revere", year: 1735, note: "American patriot and silversmith" },
  ],
  "01-08": [
    { name: "Elvis Presley", year: 1935, note: "The King of Rock and Roll" },
  ],
  "01-15": [
    { name: "Martin Luther King Jr.", year: 1929, note: "Civil rights leader" },
  ],
  "01-17": [
    { name: "Benjamin Franklin", year: 1706, note: "Founding Father, inventor, and writer" },
  ],
  "02-06": [
    { name: "Ronald Reagan", year: 1911, note: "40th U.S. President and former actor" },
  ],
  "02-11": [
    { name: "Thomas Edison", year: 1847, note: "Inventor of the practical light bulb" },
  ],
  "02-12": [
    { name: "Abraham Lincoln", year: 1809, note: "16th U.S. President" },
  ],
  "02-22": [
    { name: "George Washington", year: 1732, note: "First U.S. President" },
  ],
  "03-03": [
    { name: "Alexander Graham Bell", year: 1847, note: "Inventor of the telephone" },
  ],
  "03-14": [
    { name: "Albert Einstein", year: 1879, note: "Physicist who reshaped modern science" },
  ],
  "03-26": [
    { name: "Robert Frost", year: 1874, note: "Beloved American poet" },
  ],
  "04-13": [
    { name: "Thomas Jefferson", year: 1743, note: "Author of the Declaration of Independence" },
  ],
  "04-23": [
    { name: "William Shakespeare", year: 1564, note: "English playwright and poet" },
  ],
  "05-08": [
    { name: "Harry S. Truman", year: 1884, note: "33rd U.S. President" },
  ],
  "05-29": [
    { name: "John F. Kennedy", year: 1917, note: "35th U.S. President" },
  ],
  "06-01": [
    { name: "Marilyn Monroe", year: 1926, note: "Iconic Hollywood actress" },
  ],
  "06-14": [
    { name: "Donald Trump", year: 1946, note: "Businessman and U.S. President" },
  ],
  "07-04": [
    { name: "Calvin Coolidge", year: 1872, note: "30th U.S. President" },
  ],
  "07-12": [
    { name: "Henry David Thoreau", year: 1817, note: "Writer of Walden" },
    { name: "George Eastman", year: 1854, note: "Founder of Kodak" },
    { name: "Bill Cosby", year: 1937, note: "Entertainer and comedian" },
  ],
  "07-18": [
    { name: "Nelson Mandela", year: 1918, note: "South African leader and peacemaker" },
  ],
  "08-01": [
    { name: "Francis Scott Key", year: 1779, note: "Wrote The Star-Spangled Banner" },
  ],
  "08-19": [
    { name: "Bill Clinton", year: 1946, note: "42nd U.S. President" },
    { name: "Orville Wright", year: 1871, note: "Aviation pioneer" },
  ],
  "09-07": [
    { name: "Queen Elizabeth I", year: 1533, note: "Queen of England" },
  ],
  "09-13": [
    { name: "Roald Dahl", year: 1916, note: "Author of Charlie and the Chocolate Factory" },
  ],
  "10-01": [
    { name: "Jimmy Carter", year: 1924, note: "39th U.S. President" },
  ],
  "10-14": [
    { name: "Dwight D. Eisenhower", year: 1890, note: "General and 34th U.S. President" },
  ],
  "10-27": [
    { name: "Theodore Roosevelt", year: 1858, note: "26th U.S. President" },
  ],
  "11-02": [
    { name: "Daniel Boone", year: 1734, note: "American frontiersman" },
  ],
  "11-19": [
    { name: "Indira Gandhi", year: 1917, note: "Prime Minister of India" },
  ],
  "11-30": [
    { name: "Mark Twain", year: 1835, note: "Author of Tom Sawyer and Huckleberry Finn" },
    { name: "Winston Churchill", year: 1874, note: "British Prime Minister" },
  ],
  "12-05": [
    { name: "Walt Disney", year: 1901, note: "Animator and theme-park pioneer" },
  ],
  "12-18": [
    { name: "Steven Spielberg", year: 1946, note: "Film director" },
  ],
  "12-25": [
    { name: "Isaac Newton", year: 1642, note: "Scientist who described gravity" },
  ],
};

export function getCuratedBirthdays(month: number, day: number): BirthdayEntry[] {
  const key = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return FAMOUS_BIRTHDAYS[key] ?? [
    {
      name: "Someone special",
      year: 1900 + ((month * 3 + day) % 90),
      note: "Every day has people worth remembering — including you and your loved ones.",
    },
  ];
}
