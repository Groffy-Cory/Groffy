"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchLists, persistLists } from "@/lib/lists/repository";
import {
  applyItemUpdate,
  createList,
  createListItem,
  sortLists,
  touchList,
} from "@/lib/lists/storage";
import type {
  ListItemDraft,
  ListItemUpdate,
  ListKindId,
  RofList,
} from "@/lib/lists/types";

type ListsContextValue = {
  lists: RofList[];
  syncSource: "supabase" | "local" | "loading";
  isOpen: boolean;
  openLists: (kind?: ListKindId) => void;
  closeLists: () => void;
  initialKind: ListKindId | null;
  addList: (kind: ListKindId, title: string) => RofList;
  renameList: (listId: string, title: string) => void;
  deleteList: (listId: string) => void;
  addItem: (listId: string, draft: ListItemDraft) => void;
  updateItem: (listId: string, itemId: string, update: ListItemUpdate) => void;
  deleteItem: (listId: string, itemId: string) => void;
  getList: (listId: string) => RofList | undefined;
};

const ListsContext = createContext<ListsContextValue | null>(null);

export function ListsProvider({ children }: { children: React.ReactNode }) {
  const [lists, setLists] = useState<RofList[]>([]);
  const [syncSource, setSyncSource] = useState<"supabase" | "local" | "loading">(
    "loading",
  );
  const [isOpen, setIsOpen] = useState(false);
  const [initialKind, setInitialKind] = useState<ListKindId | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await fetchLists();
      if (cancelled) return;
      setLists(result.lists);
      setSyncSource(result.source);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void persistLists(lists).then((source) => {
      if (source === "supabase") setSyncSource("supabase");
    });
  }, [lists, ready]);

  const openLists = useCallback((kind?: ListKindId) => {
    setInitialKind(kind ?? null);
    setIsOpen(true);
  }, []);

  const closeLists = useCallback(() => {
    setIsOpen(false);
    setInitialKind(null);
  }, []);

  const addList = useCallback((kind: ListKindId, title: string) => {
    const next = createList(kind, title);
    setLists((prev) => sortLists([next, ...prev]));
    return next;
  }, []);

  const renameList = useCallback((listId: string, title: string) => {
    setLists((prev) =>
      sortLists(
        prev.map((list) =>
          list.id === listId
            ? {
                ...list,
                title: title.trim() || list.title,
                updatedAt: new Date().toISOString(),
              }
            : list,
        ),
      ),
    );
  }, []);

  const deleteList = useCallback((listId: string) => {
    setLists((prev) => prev.filter((list) => list.id !== listId));
  }, []);

  const addItem = useCallback((listId: string, draft: ListItemDraft) => {
    const item = createListItem(draft);
    setLists((prev) =>
      sortLists(
        prev.map((list) =>
          list.id === listId
            ? touchList(list, [item, ...list.items])
            : list,
        ),
      ),
    );
  }, []);

  const updateItem = useCallback(
    (listId: string, itemId: string, update: ListItemUpdate) => {
      setLists((prev) =>
        sortLists(
          prev.map((list) => {
            if (list.id !== listId) return list;
            return touchList(
              list,
              list.items.map((item) =>
                item.id === itemId ? applyItemUpdate(item, update) : item,
              ),
            );
          }),
        ),
      );
    },
    [],
  );

  const deleteItem = useCallback((listId: string, itemId: string) => {
    setLists((prev) =>
      sortLists(
        prev.map((list) =>
          list.id === listId
            ? touchList(
                list,
                list.items.filter((item) => item.id !== itemId),
              )
            : list,
        ),
      ),
    );
  }, []);

  const getList = useCallback(
    (listId: string) => lists.find((list) => list.id === listId),
    [lists],
  );

  const value = useMemo(
    () => ({
      lists,
      syncSource,
      isOpen,
      openLists,
      closeLists,
      initialKind,
      addList,
      renameList,
      deleteList,
      addItem,
      updateItem,
      deleteItem,
      getList,
    }),
    [
      lists,
      syncSource,
      isOpen,
      openLists,
      closeLists,
      initialKind,
      addList,
      renameList,
      deleteList,
      addItem,
      updateItem,
      deleteItem,
      getList,
    ],
  );

  return (
    <ListsContext.Provider value={value}>{children}</ListsContext.Provider>
  );
}

export function useLists() {
  const context = useContext(ListsContext);
  if (!context) {
    throw new Error("useLists must be used within ListsProvider");
  }
  return context;
}
