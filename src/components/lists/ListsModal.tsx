"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLists } from "@/components/lists/ListsProvider";
import { suggestRecipesFromGrocery } from "@/lib/lists/recipes";
import { COUPON_LINKS, GROCERY_STORES } from "@/lib/lists/stores";
import {
  formatReminderTime,
  openItemCount,
} from "@/lib/lists/storage";
import {
  LIST_KINDS,
  getListKindLabel,
  type ListItem,
  type ListKindId,
  type RofList,
} from "@/lib/lists/types";

type View =
  | { mode: "kinds" }
  | { mode: "lists"; kind: ListKindId }
  | { mode: "detail"; listId: string }
  | { mode: "edit-item"; listId: string; itemId: string }
  | { mode: "new-list"; kind: ListKindId };

export function ListsModal() {
  const {
    isOpen,
    closeLists,
    lists,
    syncSource,
    initialKind,
    addList,
    deleteList,
    addItem,
    updateItem,
    deleteItem,
    getList,
  } = useLists();

  const [view, setView] = useState<View>({ mode: "kinds" });
  const [newItemText, setNewItemText] = useState("");
  const [newItemReminder, setNewItemReminder] = useState("");
  const [editText, setEditText] = useState("");
  const [editReminder, setEditReminder] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [newListTitle, setNewListTitle] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setNewItemText("");
    setNewItemReminder("");

    if (!initialKind) {
      setView({ mode: "kinds" });
      return;
    }

    if (initialKind === "custom") {
      setView({ mode: "lists", kind: "custom" });
      return;
    }

    const existing = lists.find((list) => list.kind === initialKind);
    if (existing) {
      setView({ mode: "detail", listId: existing.id });
    } else {
      setView({ mode: "lists", kind: initialKind });
    }
    // Reset navigation only when the modal opens, not on every list edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally omit lists
  }, [isOpen, initialKind]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLists();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeLists]);

  const activeList =
    view.mode === "detail" || view.mode === "edit-item"
      ? getList(view.listId)
      : undefined;

  const recipes = useMemo(() => {
    if (!activeList || activeList.kind !== "grocery") return [];
    const texts = activeList.items
      .filter((item) => !item.completed)
      .map((item) => item.text);
    return suggestRecipesFromGrocery(texts);
  }, [activeList]);

  if (!isOpen) return null;

  function openKind(kind: ListKindId) {
    if (kind === "custom") {
      setView({ mode: "lists", kind });
      return;
    }
    const existing = lists.find((list) => list.kind === kind);
    if (existing) {
      setView({ mode: "detail", listId: existing.id });
    } else {
      const created = addList(kind, "");
      setView({ mode: "detail", listId: created.id });
    }
  }

  function handleAddItem(event: FormEvent<HTMLFormElement>, listId: string) {
    event.preventDefault();
    if (!newItemText.trim()) return;
    addItem(listId, {
      text: newItemText,
      reminderTime: newItemReminder || null,
    });
    setNewItemText("");
    setNewItemReminder("");
  }

  function startEditItem(list: RofList, item: ListItem) {
    setEditText(item.text);
    setEditReminder(item.reminderTime ?? "");
    setEditNotes(item.notes);
    setView({ mode: "edit-item", listId: list.id, itemId: item.id });
  }

  function handleSaveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (view.mode !== "edit-item" || !editText.trim()) return;
    updateItem(view.listId, view.itemId, {
      text: editText,
      reminderTime: editReminder || null,
      notes: editNotes,
    });
    setView({ mode: "detail", listId: view.listId });
  }

  function handleCreateList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (view.mode !== "new-list" || !newListTitle.trim()) return;
    const created = addList(view.kind, newListTitle);
    setNewListTitle("");
    setView({ mode: "detail", listId: created.id });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-3 sm:items-center sm:p-6"
      role="presentation"
      onClick={closeLists}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lists-title"
        className="rof-card flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-steel-200 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="lists-title"
              className="font-display text-3xl font-semibold text-ink"
            >
              Lists
            </h2>
            <p className="mt-1 text-base font-semibold text-muted">
              Groceries, coupons, to-dos, and your own lists — big checkboxes,
              simple words.
            </p>
            <p className="mt-1 text-sm font-bold text-[color:var(--accent-gold,var(--royal-dark))]">
              {syncSource === "supabase"
                ? "Saved to Supabase"
                : syncSource === "loading"
                  ? "Loading lists…"
                  : "Saved on this device — connect Supabase to sync"}
            </p>
          </div>
          <button
            type="button"
            className="rof-btn rof-btn-secondary"
            onClick={closeLists}
          >
            Close
          </button>
        </div>

        {view.mode === "kinds" ? (
          <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
            {LIST_KINDS.map((kind) => {
              const related = lists.filter((list) => list.kind === kind.id);
              const open =
                kind.id === "custom"
                  ? related.reduce((sum, list) => sum + openItemCount(list), 0)
                  : related[0]
                    ? openItemCount(related[0])
                    : 0;

              return (
                <li key={kind.id}>
                  <button
                    type="button"
                    onClick={() => openKind(kind.id)}
                    className="rof-inset w-full p-5 text-left transition-colors hover:border-[color:var(--royal)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-royal"
                  >
                    <p className="text-2xl font-bold text-ink">{kind.label}</p>
                    <p className="mt-1 text-lg font-semibold text-muted">
                      {kind.hint}
                    </p>
                    <p className="mt-2 text-base font-bold text-[color:var(--accent-gold,var(--royal-dark))]">
                      {open > 0
                        ? `${open} open item${open === 1 ? "" : "s"}`
                        : "Tap to open"}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}

        {view.mode === "lists" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 border-b-2 border-steel-200 px-4 py-3">
              <button
                type="button"
                className="rof-btn rof-btn-secondary"
                onClick={() => setView({ mode: "kinds" })}
              >
                Back
              </button>
              <p className="text-lg font-bold text-ink">
                {getListKindLabel(view.kind)}
              </p>
              <button
                type="button"
                className="rof-btn rof-btn-primary ml-auto"
                onClick={() => {
                  setNewListTitle("");
                  setView({ mode: "new-list", kind: view.kind });
                }}
              >
                New list
              </button>
            </div>
            <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {lists.filter((list) => list.kind === view.kind).length === 0 ? (
                <li className="rof-inset p-5 text-lg font-semibold text-muted">
                  No lists yet. Make one with the New list button.
                </li>
              ) : (
                lists
                  .filter((list) => list.kind === view.kind)
                  .map((list) => (
                    <li key={list.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setView({ mode: "detail", listId: list.id })
                        }
                        className="rof-inset w-full p-4 text-left"
                      >
                        <p className="text-xl font-bold text-ink">{list.title}</p>
                        <p className="mt-1 text-base font-semibold text-muted">
                          {openItemCount(list)} open · {list.items.length} total
                        </p>
                      </button>
                    </li>
                  ))
              )}
            </ul>
          </div>
        ) : null}

        {view.mode === "new-list" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6">
            <button
              type="button"
              className="rof-btn rof-btn-secondary self-start"
              onClick={() => setView({ mode: "lists", kind: view.kind })}
            >
              Back
            </button>
            <h3 className="mt-4 font-display text-2xl font-semibold text-ink">
              Name your list
            </h3>
            <form onSubmit={handleCreateList} className="mt-4 space-y-4">
              <input
                className="rof-input text-lg"
                value={newListTitle}
                onChange={(event) => setNewListTitle(event.target.value)}
                placeholder="Example: Books to read"
                required
              />
              <button type="submit" className="rof-btn rof-btn-primary">
                Create list
              </button>
            </form>
          </div>
        ) : null}

        {view.mode === "detail" && activeList ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 border-b-2 border-steel-200 px-4 py-3">
              <button
                type="button"
                className="rof-btn rof-btn-secondary"
                onClick={() =>
                  activeList.kind === "custom"
                    ? setView({ mode: "lists", kind: "custom" })
                    : setView({ mode: "kinds" })
                }
              >
                Back
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xl font-bold text-ink">
                  {activeList.title}
                </p>
                <p className="text-sm font-bold text-muted">
                  {getListKindLabel(activeList.kind)}
                </p>
              </div>
              {activeList.kind === "custom" ? (
                <button
                  type="button"
                  className="rof-btn rof-btn-secondary"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Delete “${activeList.title}” and all its items?`,
                      )
                    ) {
                      deleteList(activeList.id);
                      setView({ mode: "lists", kind: "custom" });
                    }
                  }}
                >
                  Delete list
                </button>
              ) : null}
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              <form
                onSubmit={(event) => handleAddItem(event, activeList.id)}
                className="rof-inset space-y-3 p-4"
              >
                <label
                  htmlFor="new-list-item"
                  className="block text-base font-bold text-ink"
                >
                  Add an item
                </label>
                <input
                  id="new-list-item"
                  className="rof-input text-lg"
                  value={newItemText}
                  onChange={(event) => setNewItemText(event.target.value)}
                  placeholder="Type something to remember"
                  required
                />
                <div>
                  <label
                    htmlFor="new-item-reminder"
                    className="mb-1 block text-base font-bold text-ink"
                  >
                    Time reminder (optional)
                  </label>
                  <input
                    id="new-item-reminder"
                    type="time"
                    className="rof-input text-lg"
                    value={newItemReminder}
                    onChange={(event) => setNewItemReminder(event.target.value)}
                  />
                </div>
                <button type="submit" className="rof-btn rof-btn-primary">
                  Add item
                </button>
              </form>

              <ul className="space-y-3">
                {activeList.items.length === 0 ? (
                  <li className="text-lg font-semibold text-muted">
                    This list is empty. Add your first item above.
                  </li>
                ) : (
                  activeList.items.map((item) => (
                    <li key={item.id} className="rof-inset p-4">
                      <div className="flex flex-wrap items-start gap-3">
                        <button
                          type="button"
                          aria-pressed={item.completed}
                          aria-label={
                            item.completed
                              ? `Mark “${item.text}” as not done`
                              : `Mark “${item.text}” as done`
                          }
                          onClick={() =>
                            updateItem(activeList.id, item.id, {
                              completed: !item.completed,
                            })
                          }
                          className={[
                            "mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 text-2xl font-bold",
                            item.completed
                              ? "border-royal bg-royal text-white"
                              : "border-steel-300 bg-[var(--surface-raised)] text-ink",
                          ].join(" ")}
                        >
                          {item.completed ? "✓" : ""}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={[
                              "text-xl font-bold",
                              item.completed
                                ? "text-muted line-through"
                                : "text-ink",
                            ].join(" ")}
                          >
                            {item.text}
                          </p>
                          {item.reminderTime ? (
                            <p className="mt-1 text-base font-bold text-[color:var(--accent-gold,var(--royal-dark))]">
                              Reminder: {formatReminderTime(item.reminderTime)}
                            </p>
                          ) : null}
                          {item.notes ? (
                            <p className="mt-1 text-base font-semibold text-muted">
                              {item.notes}
                            </p>
                          ) : null}
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="rof-btn rof-btn-secondary"
                              onClick={() => startEditItem(activeList, item)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="rof-btn rof-btn-secondary"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Delete “${item.text}” from this list?`,
                                  )
                                ) {
                                  deleteItem(activeList.id, item.id);
                                }
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>

              {activeList.kind === "grocery" ? (
                <>
                  <section className="rof-inset p-4 sm:p-5">
                    <h3 className="font-display text-2xl font-semibold text-ink">
                      Shop at popular stores
                    </h3>
                    <p className="mt-1 text-base font-semibold text-muted">
                      Open a store site in a new tab when you’re ready.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {GROCERY_STORES.map((store) => (
                        <a
                          key={store.id}
                          href={store.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rof-btn rof-btn-secondary"
                        >
                          {store.label}
                        </a>
                      ))}
                    </div>
                  </section>

                  <section className="rof-inset p-4 sm:p-5">
                    <h3 className="font-display text-2xl font-semibold text-ink">
                      Recipe ideas from your groceries
                    </h3>
                    <p className="mt-1 text-base font-semibold text-muted">
                      Based on open items on this list.
                    </p>
                    {recipes.length === 0 ? (
                      <p className="mt-3 text-lg font-semibold text-muted">
                        Add a few ingredients (like eggs, cheese, or chicken) to
                        see simple meal ideas.
                      </p>
                    ) : (
                      <ul className="mt-4 space-y-3">
                        {recipes.map((recipe) => (
                          <li
                            key={recipe.id}
                            className="rounded-xl bg-[var(--surface-raised)] p-4"
                          >
                            <p className="text-xl font-bold text-ink">
                              {recipe.title}
                            </p>
                            <p className="mt-1 text-sm font-bold text-[color:var(--accent-gold,var(--royal-dark))]">
                              Uses: {recipe.matched.join(", ")}
                            </p>
                            <p className="mt-2 text-lg font-semibold leading-relaxed text-muted">
                              {recipe.steps}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </>
              ) : null}

              {activeList.kind === "coupons" ? (
                <section className="rof-inset p-4 sm:p-5">
                  <h3 className="font-display text-2xl font-semibold text-ink">
                    Find coupons online
                  </h3>
                  <p className="mt-1 text-base font-semibold text-muted">
                    Clip digital deals, then jot them on your coupon list with a
                    time reminder.
                  </p>
                  <ul className="mt-4 space-y-3">
                    {COUPON_LINKS.map((link) => (
                      <li key={link.id}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rof-inset block p-4 transition-colors hover:border-[color:var(--royal)]"
                        >
                          <p className="text-xl font-bold text-ink">
                            {link.label}
                          </p>
                          <p className="mt-1 text-base font-semibold text-muted">
                            {link.hint}
                          </p>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {activeList.kind === "todo" ? (
                <p className="text-lg font-semibold text-muted">
                  Tip: add a time reminder on each to-do so you don’t forget.
                  Large checkboxes mark things done.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {view.mode === "edit-item" && activeList ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6">
            <button
              type="button"
              className="rof-btn rof-btn-secondary self-start"
              onClick={() => setView({ mode: "detail", listId: view.listId })}
            >
              Back
            </button>
            <h3 className="mt-4 font-display text-2xl font-semibold text-ink">
              Edit item
            </h3>
            <form onSubmit={handleSaveItem} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="edit-item-text"
                  className="mb-2 block text-base font-bold text-ink"
                >
                  Item
                </label>
                <input
                  id="edit-item-text"
                  className="rof-input text-lg"
                  value={editText}
                  onChange={(event) => setEditText(event.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="edit-item-reminder"
                  className="mb-2 block text-base font-bold text-ink"
                >
                  Time reminder (optional)
                </label>
                <input
                  id="edit-item-reminder"
                  type="time"
                  className="rof-input text-lg"
                  value={editReminder}
                  onChange={(event) => setEditReminder(event.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="edit-item-notes"
                  className="mb-2 block text-base font-bold text-ink"
                >
                  Notes (optional)
                </label>
                <textarea
                  id="edit-item-notes"
                  className="rof-textarea text-lg"
                  value={editNotes}
                  onChange={(event) => setEditNotes(event.target.value)}
                  placeholder="Extra detail if you need it"
                />
              </div>
              <button type="submit" className="rof-btn rof-btn-primary">
                Save changes
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
