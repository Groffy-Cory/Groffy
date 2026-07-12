export type SportsEvent = {
  id: string;
  title: string;
  detail: string;
  dateLabel: string;
  league: string;
};

const FALLBACK: SportsEvent[] = [
  {
    id: "sample-1",
    title: "Home team vs Visitors",
    detail: "Sample scoreboard — connect TheSportsDB for live results.",
    dateLabel: "This week",
    league: "NFL",
  },
  {
    id: "sample-2",
    title: "Afternoon matchup",
    detail: "Check back for scores after the game.",
    dateLabel: "Upcoming",
    league: "MLB",
  },
];

export async function getSports(
  leagues: string[],
  teams: string[],
): Promise<SportsEvent[]> {
  const teamQuery = teams[0] || leagues[0] || "Chicago";

  try {
    const searchUrl = new URL(
      "https://www.thesportsdb.com/api/v1/json/3/searchteams.php",
    );
    searchUrl.searchParams.set("t", teamQuery);

    const searchRes = await fetch(searchUrl, {
      signal: AbortSignal.timeout(12000),
    });
    if (!searchRes.ok) return FALLBACK;

    const searchJson = (await searchRes.json()) as {
      teams?: Array<{ idTeam?: string; strTeam?: string; strLeague?: string }>;
    };
    const team = searchJson.teams?.[0];
    if (!team?.idTeam) {
      return FALLBACK.map((event) => ({
        ...event,
        title: `${teamQuery} update`,
        league: leagues[0] || event.league,
      }));
    }

    const eventsUrl = new URL(
      "https://www.thesportsdb.com/api/v1/json/3/eventslast.php",
    );
    eventsUrl.searchParams.set("id", team.idTeam);
    const eventsRes = await fetch(eventsUrl, {
      signal: AbortSignal.timeout(12000),
    });
    if (!eventsRes.ok) return FALLBACK;

    const eventsJson = (await eventsRes.json()) as {
      results?: Array<{
        idEvent?: string;
        strEvent?: string;
        strLeague?: string;
        dateEvent?: string;
        intHomeScore?: string | null;
        intAwayScore?: string | null;
        strHomeTeam?: string;
        strAwayTeam?: string;
      }>;
    };

    const events = (eventsJson.results || []).slice(0, 6).map((event) => {
      const score =
        event.intHomeScore != null && event.intAwayScore != null
          ? `${event.strHomeTeam} ${event.intHomeScore} – ${event.intAwayScore} ${event.strAwayTeam}`
          : event.strEvent || "Recent game";
      return {
        id: event.idEvent || score,
        title: event.strEvent || `${team.strTeam} game`,
        detail: score,
        dateLabel: event.dateEvent
          ? new Date(`${event.dateEvent}T12:00:00`).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Recent",
        league: event.strLeague || team.strLeague || leagues[0] || "Sports",
      };
    });

    return events.length > 0 ? events : FALLBACK;
  } catch {
    return FALLBACK;
  }
}
