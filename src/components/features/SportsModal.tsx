"use client";

import { FormEvent, useEffect, useState } from "react";
import { ModalShell } from "@/components/features/ModalShell";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import type { SportsEvent } from "@/lib/features/sports";
import {
  SPORTS_LEAGUE_OPTIONS,
  type SportsLeagueId,
} from "@/lib/preferences/types";

export function SportsModal() {
  const { openFeature, closeFeatureModal, prefs, updatePrefs, syncSource } =
    usePreferences();
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [teamDraft, setTeamDraft] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (openFeature !== "sports") return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openFeature, prefs.sportsLeagues, prefs.sportsTeams]);

  if (openFeature !== "sports") return null;

  async function load() {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/sports?leagues=${encodeURIComponent(prefs.sportsLeagues.join(","))}&teams=${encodeURIComponent(prefs.sportsTeams.join(","))}`,
      );
      const data = (await response.json()) as { events: SportsEvent[] };
      setEvents(data.events || []);
    } finally {
      setLoading(false);
    }
  }

  function toggleLeague(league: SportsLeagueId) {
    const has = prefs.sportsLeagues.includes(league);
    const next = has
      ? prefs.sportsLeagues.filter((item) => item !== league)
      : [...prefs.sportsLeagues, league];
    updatePrefs({ sportsLeagues: next.length > 0 ? next : ["NFL"] });
  }

  function addTeam(event: FormEvent) {
    event.preventDefault();
    const name = teamDraft.trim();
    if (!name) return;
    if (!prefs.sportsTeams.includes(name)) {
      updatePrefs({ sportsTeams: [...prefs.sportsTeams, name] });
    }
    setTeamDraft("");
  }

  return (
    <ModalShell
      title="Sports"
      subtitle="Choose leagues and favorite teams. Recent games appear below."
      footerNote={
        syncSource === "supabase"
          ? "Sports preferences saved to Supabase"
          : "Sports preferences saved on this device"
      }
      onClose={closeFeatureModal}
    >
      <p className="mb-2 text-base font-bold text-ink">Leagues</p>
      <div className="flex flex-wrap gap-2">
        {SPORTS_LEAGUE_OPTIONS.map((league) => {
          const active = prefs.sportsLeagues.includes(league.id);
          return (
            <button
              key={league.id}
              type="button"
              aria-pressed={active}
              className={[
                "rof-btn min-h-12",
                active ? "rof-btn-primary" : "rof-btn-secondary",
              ].join(" ")}
              onClick={() => toggleLeague(league.id)}
            >
              {league.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={addTeam} className="mt-5 flex flex-wrap items-end gap-3">
        <div className="min-w-[12rem] flex-1">
          <label htmlFor="sports-team" className="mb-1 block text-base font-bold text-ink">
            Favorite team
          </label>
          <input
            id="sports-team"
            className="rof-input text-lg"
            value={teamDraft}
            onChange={(event) => setTeamDraft(event.target.value)}
            placeholder="Example: Chicago Cubs"
          />
        </div>
        <button type="submit" className="rof-btn rof-btn-primary">
          Add team
        </button>
      </form>

      {prefs.sportsTeams.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {prefs.sportsTeams.map((team) => (
            <button
              key={team}
              type="button"
              className="rof-btn rof-btn-secondary"
              onClick={() =>
                updatePrefs({
                  sportsTeams: prefs.sportsTeams.filter((item) => item !== team),
                })
              }
            >
              {team} ×
            </button>
          ))}
        </div>
      ) : null}

      <p className="mt-5 text-base font-semibold text-muted">
        {loading ? "Loading scores…" : "Recent results"}
      </p>
      <ul className="mt-3 space-y-3">
        {events.map((event) => (
          <li key={event.id} className="rof-inset p-4">
            <p className="text-sm font-bold text-[color:var(--accent-gold,var(--royal-dark))]">
              {event.league} · {event.dateLabel}
            </p>
            <p className="mt-1 text-xl font-bold text-ink">{event.title}</p>
            <p className="mt-1 text-lg font-semibold text-muted">{event.detail}</p>
          </li>
        ))}
      </ul>
    </ModalShell>
  );
}
