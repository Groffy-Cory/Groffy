import type { PrayerDenominationId } from "@/lib/preferences/types";

export type PrayerContent = {
  denomination: PrayerDenominationId;
  title: string;
  body: string;
  audioLabel: string;
  audioStubNote: string;
};

const CONTENT: Record<PrayerDenominationId, PrayerContent[]> = {
  christian: [
    {
      denomination: "christian",
      title: "A quiet morning prayer",
      body: "Lord, thank You for this new day. Give me patience with myself and kindness toward others. Help me notice small blessings and rest in Your care. Amen.",
      audioLabel: "Play prayer audio",
      audioStubNote: "Audio reading coming soon — for now, read slowly aloud.",
    },
    {
      denomination: "christian",
      title: "Psalm of calm",
      body: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul.",
      audioLabel: "Play scripture audio",
      audioStubNote: "Audio reading coming soon — for now, read slowly aloud.",
    },
  ],
  jewish: [
    {
      denomination: "jewish",
      title: "Modeh Ani — morning gratitude",
      body: "I give thanks before You, living and enduring King, for You have restored my soul within me. Great is Your faithfulness. May this day be filled with peace and good deeds.",
      audioLabel: "Play blessing audio",
      audioStubNote: "Audio reading coming soon — for now, read slowly aloud.",
    },
    {
      denomination: "jewish",
      title: "Torah wisdom for the day",
      body: "Justice, justice shall you pursue. In every choice — large or small — seek fairness, compassion, and honesty. Let your words bring light.",
      audioLabel: "Play teaching audio",
      audioStubNote: "Audio reading coming soon — for now, read slowly aloud.",
    },
  ],
  muslim: [
    {
      denomination: "muslim",
      title: "A short dua for peace",
      body: "O Allah, You are peace and from You is peace. Grant my heart calmness, my home mercy, and my steps guidance. Alhamdulillah for another day.",
      audioLabel: "Play dua audio",
      audioStubNote: "Audio reading coming soon — for now, read slowly aloud.",
    },
    {
      denomination: "muslim",
      title: "Quranic reflection",
      body: "Indeed, with hardship comes ease. Take one gentle breath. Trust that relief follows difficulty, and that kindness to yourself is also worship.",
      audioLabel: "Play reflection audio",
      audioStubNote: "Audio reading coming soon — for now, read slowly aloud.",
    },
  ],
  sikh: [
    {
      denomination: "sikh",
      title: "Ik Onkar — one Creator",
      body: "There is one Creator of all. Remember the Name with a quiet mind. Serve others with humble hands. Let fear fall away in the presence of truth.",
      audioLabel: "Play shabad audio",
      audioStubNote: "Audio reading coming soon — for now, read slowly aloud.",
    },
    {
      denomination: "sikh",
      title: "Guru’s teaching for today",
      body: "Speak sweetly, work honestly, and share what you can. In every face, see the light of the Divine. Walk today with courage and gratitude.",
      audioLabel: "Play teaching audio",
      audioStubNote: "Audio reading coming soon — for now, read slowly aloud.",
    },
  ],
  mindfulness: [
    {
      denomination: "mindfulness",
      title: "Three slow breaths",
      body: "Sit comfortably. Breathe in for a count of four… hold for two… breathe out for six. Notice your shoulders soften. You are safe in this moment.",
      audioLabel: "Play guided audio",
      audioStubNote: "Guided audio coming soon — breathe along as you read.",
    },
    {
      denomination: "mindfulness",
      title: "Kindness meditation",
      body: "Silently wish: May I be well. May my loved ones be well. May all people find peace today. Rest here for one quiet minute.",
      audioLabel: "Play kindness audio",
      audioStubNote: "Guided audio coming soon — breathe along as you read.",
    },
  ],
};

export function getDailyPrayer(
  denomination: PrayerDenominationId,
): PrayerContent {
  const list = CONTENT[denomination] || CONTENT.mindfulness;
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % list.length;
  return list[dayIndex];
}

export function getAllPrayerOptions(
  denomination: PrayerDenominationId,
): PrayerContent[] {
  return CONTENT[denomination] || CONTENT.mindfulness;
}
