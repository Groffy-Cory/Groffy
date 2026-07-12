"use client";

import { useEffect, useMemo, useState } from "react";
import { ModalShell } from "@/components/features/ModalShell";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import {
  MEMORY_THEMES,
  bestScore,
  buildDeck,
  dailySeed,
  dailyThemeId,
  getTheme,
  loadScores,
  saveScore,
  type MemoryCard,
  type MemoryDifficulty,
  type MemoryScore,
  type MemoryThemeId,
} from "@/lib/memory-games/game";

type Phase = "setup" | "playing" | "won";

export function MemoryGamesModal() {
  const { openFeature, closeFeatureModal } = usePreferences();
  const [phase, setPhase] = useState<Phase>("setup");
  const [difficulty, setDifficulty] = useState<MemoryDifficulty>("easy");
  const [themeId, setThemeId] = useState<MemoryThemeId>("garden");
  const [daily, setDaily] = useState(false);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [scores, setScores] = useState<MemoryScore[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (openFeature !== "memory-games") return;
    setPhase("setup");
    setSelected([]);
    setMoves(0);
    setSeconds(0);
    setBusy(false);
    setMessage(null);
    setDaily(false);
    setScores(loadScores());
  }, [openFeature]);

  useEffect(() => {
    if (openFeature !== "memory-games" || phase !== "playing") return;
    const id = window.setInterval(() => setSeconds((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [openFeature, phase]);

  const matchedCount = useMemo(
    () => cards.filter((card) => card.matched).length / 2,
    [cards],
  );
  const totalPairs = cards.length / 2;
  const best = bestScore(scores, difficulty, daily);

  if (openFeature !== "memory-games") return null;

  function startGame(options?: {
    difficulty?: MemoryDifficulty;
    themeId?: MemoryThemeId;
    daily?: boolean;
  }) {
    const nextDaily = options?.daily ?? false;
    const nextDifficulty = options?.difficulty ?? difficulty;
    const nextTheme = nextDaily
      ? dailyThemeId()
      : options?.themeId ?? themeId;

    setDaily(nextDaily);
    setDifficulty(nextDifficulty);
    setThemeId(nextTheme);
    setCards(
      buildDeck(
        nextTheme,
        nextDifficulty,
        nextDaily ? dailySeed() : undefined,
      ),
    );
    setSelected([]);
    setMoves(0);
    setSeconds(0);
    setBusy(false);
    setPhase("playing");
    setMessage(
      nextDaily
        ? `Daily challenge · ${getTheme(nextTheme).label} · ${nextDifficulty}`
        : null,
    );
  }

  function finishGame(finalMoves: number, finalSeconds: number) {
    const score: MemoryScore = {
      difficulty,
      themeId,
      moves: finalMoves,
      seconds: finalSeconds,
      completedAt: new Date().toISOString(),
      daily,
    };
    setScores(saveScore(score));
    setPhase("won");
    setMessage(
      daily
        ? "Daily challenge complete — wonderful focus today!"
        : "You matched them all — nice work!",
    );
  }

  function onCardClick(uid: string) {
    if (busy || phase !== "playing") return;
    const card = cards.find((item) => item.uid === uid);
    if (!card || card.flipped || card.matched) return;
    if (selected.length >= 2) return;

    const nextSelected = [...selected, uid];
    setCards((prev) =>
      prev.map((item) =>
        item.uid === uid ? { ...item, flipped: true } : item,
      ),
    );
    setSelected(nextSelected);

    if (nextSelected.length < 2) return;

    const nextMoves = moves + 1;
    setMoves(nextMoves);
    setBusy(true);

    const [firstId, secondId] = nextSelected;
    const first = cards.find((item) => item.uid === firstId);
    const second = cards.find((item) => item.uid === secondId) || card;

    window.setTimeout(() => {
      if (first && second && first.pairId === second.pairId) {
        setCards((prev) => {
          const updated = prev.map((item) =>
            item.pairId === first.pairId
              ? { ...item, matched: true, flipped: true }
              : item,
          );
          const allMatched = updated.every((item) => item.matched);
          if (allMatched) {
            window.setTimeout(
              () => finishGame(nextMoves, seconds + 1),
              250,
            );
          }
          return updated;
        });
      } else {
        setCards((prev) =>
          prev.map((item) =>
            item.uid === firstId || item.uid === secondId
              ? { ...item, flipped: false }
              : item,
          ),
        );
      }
      setSelected([]);
      setBusy(false);
    }, 700);
  }

  return (
    <ModalShell
      title="Memory Games"
      subtitle="Match pairs of large cards. Take your time — this is meant to be fun."
      footerNote="Improvements to come!"
      onClose={closeFeatureModal}
    >
      {phase === "setup" ? (
        <div className="space-y-5">
          <section className="rof-inset p-4">
            <h3 className="font-display text-2xl font-semibold text-ink">
              Daily challenge
            </h3>
            <p className="mt-1 text-lg font-semibold text-muted">
              Today’s theme is {getTheme(dailyThemeId()).label}. Same for
              everyone today.
            </p>
            <button
              type="button"
              className="rof-btn rof-btn-primary mt-4 min-h-14"
              onClick={() => startGame({ daily: true, difficulty: "easy" })}
            >
              Play today’s challenge
            </button>
          </section>

          <section>
            <p className="mb-2 text-base font-bold text-ink">Difficulty</p>
            <div className="flex flex-wrap gap-2">
              <ChoiceChip
                label="Easy (6 pairs)"
                active={difficulty === "easy"}
                onClick={() => setDifficulty("easy")}
              />
              <ChoiceChip
                label="Medium (8 pairs)"
                active={difficulty === "medium"}
                onClick={() => setDifficulty("medium")}
              />
            </div>
          </section>

          <section>
            <p className="mb-2 text-base font-bold text-ink">Theme</p>
            <div className="flex flex-wrap gap-2">
              {MEMORY_THEMES.map((theme) => (
                <ChoiceChip
                  key={theme.id}
                  label={theme.label}
                  active={themeId === theme.id}
                  onClick={() => setThemeId(theme.id)}
                />
              ))}
            </div>
            <p className="mt-2 text-base font-semibold text-muted">
              {getTheme(themeId).hint}
            </p>
          </section>

          <button
            type="button"
            className="rof-btn rof-btn-primary min-h-14 text-lg"
            onClick={() => startGame({ daily: false })}
          >
            Start game
          </button>

          {best ? (
            <p className="text-lg font-semibold text-muted">
              Best {difficulty}
              {daily ? " daily" : ""}: {best.moves} moves in {best.seconds}s
            </p>
          ) : (
            <p className="text-lg font-semibold text-muted">
              No scores yet for this level — yours can be first.
            </p>
          )}

          {scores.length > 0 ? (
            <section className="rof-inset p-4">
              <h3 className="text-xl font-bold text-ink">Recent scores</h3>
              <ul className="mt-3 space-y-2">
                {scores.slice(0, 5).map((score, index) => (
                  <li
                    key={`${score.completedAt}-${index}`}
                    className="text-base font-semibold text-muted"
                  >
                    {score.daily ? "Daily · " : ""}
                    {getTheme(score.themeId).label} · {score.difficulty} ·{" "}
                    {score.moves} moves · {score.seconds}s
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}

      {phase === "playing" || phase === "won" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xl font-bold text-ink">
                {getTheme(themeId).label}
                {daily ? " · Daily" : ""} ·{" "}
                {difficulty === "easy" ? "Easy" : "Medium"}
              </p>
              <p className="text-lg font-semibold text-muted">
                Matches {matchedCount}/{totalPairs || 0} · Moves {moves} · Time{" "}
                {seconds}s
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rof-btn rof-btn-secondary"
                onClick={() =>
                  startGame({
                    daily,
                    difficulty,
                    themeId: daily ? dailyThemeId() : themeId,
                  })
                }
              >
                New deal
              </button>
              <button
                type="button"
                className="rof-btn rof-btn-secondary"
                onClick={() => setPhase("setup")}
              >
                Setup
              </button>
            </div>
          </div>

          {message ? (
            <p className="rof-inset p-4 text-lg font-semibold text-ink">
              {message}
            </p>
          ) : null}

          <div
            className={[
              "grid gap-3",
              difficulty === "easy"
                ? "grid-cols-3 sm:grid-cols-4"
                : "grid-cols-3 sm:grid-cols-4",
            ].join(" ")}
            role="list"
            aria-label="Memory cards"
          >
            {cards.map((card) => {
              const showFace = card.flipped || card.matched;
              return (
                <button
                  key={card.uid}
                  type="button"
                  role="listitem"
                  aria-label={
                    showFace
                      ? `${card.label}${card.matched ? ", matched" : ""}`
                      : "Hidden card"
                  }
                  aria-pressed={showFace}
                  disabled={busy || card.matched || phase === "won"}
                  onClick={() => onCardClick(card.uid)}
                  className={[
                    "flex min-h-28 flex-col items-center justify-center rounded-2xl border-4 p-3 text-center transition-colors",
                    "focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-royal",
                    card.matched
                      ? "border-royal bg-royal text-white"
                      : showFace
                        ? "border-[color:var(--accent-gold,var(--royal))] bg-[var(--surface-raised)] text-ink"
                        : "border-steel-300 bg-steel-50 text-ink hover:border-royal",
                  ].join(" ")}
                >
                  {showFace ? (
                    <>
                      <span className="text-4xl" aria-hidden>
                        {card.symbol}
                      </span>
                      <span className="mt-2 text-lg font-bold">{card.label}</span>
                    </>
                  ) : (
                    <span className="font-display text-3xl font-semibold text-muted">
                      ?
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {phase === "won" ? (
            <button
              type="button"
              className="rof-btn rof-btn-primary min-h-14"
              onClick={() => setPhase("setup")}
            >
              Play again
            </button>
          ) : null}
        </div>
      ) : null}
    </ModalShell>
  );
}

function ChoiceChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "rof-btn min-h-12",
        active ? "rof-btn-primary" : "rof-btn-secondary",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
