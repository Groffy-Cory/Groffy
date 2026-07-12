export type SpecialKind =
  | "quote"
  | "joke"
  | "history"
  | "birthdays"
  | "fact"
  | "word";

export type SpecialItem = {
  id: SpecialKind;
  title: string;
  summary: string;
  detail: string;
  attribution?: string;
  attributionUrl?: string;
  sourceLabel: string;
};

export type TodaysSpecialsResponse = {
  dateKey: string;
  displayDate: string;
  items: SpecialItem[];
};
