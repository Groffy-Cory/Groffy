"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  addVaultEntryRemote,
  fetchVaultEntries,
  persistVaultEntries,
  updateVaultEntryRemote,
} from "@/lib/memory-vault/repository";
import {
  applyVaultUpdate,
  sortVaultEntries,
} from "@/lib/memory-vault/storage";
import {
  DEMO_VAULT_OWNER_ID,
  type VaultEntry,
  type VaultEntryDraft,
  type VaultEntryUpdate,
} from "@/lib/memory-vault/types";

type MemoryVaultContextValue = {
  entries: VaultEntry[];
  syncSource: "supabase" | "local" | "loading";
  isOpen: boolean;
  openVault: () => void;
  closeVault: () => void;
  addEntry: (draft: VaultEntryDraft) => Promise<VaultEntry>;
  updateEntry: (id: string, update: VaultEntryUpdate) => Promise<VaultEntry | null>;
  getEntry: (id: string) => VaultEntry | undefined;
};

const MemoryVaultContext = createContext<MemoryVaultContextValue | null>(null);

export function MemoryVaultProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isGuest } = useAuth();
  const ownerId = !isGuest && user?.id ? user.id : DEMO_VAULT_OWNER_ID;
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [syncSource, setSyncSource] = useState<"supabase" | "local" | "loading">(
    "loading",
  );
  const [isOpen, setIsOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    (async () => {
      const result = await fetchVaultEntries(ownerId);
      if (cancelled) return;
      setEntries(result.entries);
      setSyncSource(result.source);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [ownerId]);

  useEffect(() => {
    if (!ready) return;
    void persistVaultEntries(entries, ownerId).then((source) => {
      if (source === "supabase") setSyncSource("supabase");
    });
  }, [entries, ready, ownerId]);

  const openVault = useCallback(() => setIsOpen(true), []);
  const closeVault = useCallback(() => setIsOpen(false), []);

  const addEntry = useCallback(
    async (draft: VaultEntryDraft) => {
      const next = await addVaultEntryRemote(draft, ownerId);
      setEntries((prev) =>
        sortVaultEntries([next, ...prev.filter((e) => e.id !== next.id)]),
      );
      return next;
    },
    [ownerId],
  );

  const updateEntry = useCallback(
    async (id: string, update: VaultEntryUpdate) => {
      const remote = await updateVaultEntryRemote(id, update);
      if (remote) {
        setEntries((prev) =>
          sortVaultEntries(
            prev.map((entry) => (entry.id === id ? remote : entry)),
          ),
        );
        return remote;
      }

      let updated: VaultEntry | null = null;
      setEntries((prev) => {
        const current = prev.find((entry) => entry.id === id);
        if (!current) return prev;
        updated = applyVaultUpdate(current, update);
        return sortVaultEntries(
          prev.map((entry) => (entry.id === id ? updated! : entry)),
        );
      });
      return updated;
    },
    [],
  );

  const getEntry = useCallback(
    (id: string) => entries.find((entry) => entry.id === id),
    [entries],
  );

  const value = useMemo(
    () => ({
      entries,
      syncSource,
      isOpen,
      openVault,
      closeVault,
      addEntry,
      updateEntry,
      getEntry,
    }),
    [
      entries,
      syncSource,
      isOpen,
      openVault,
      closeVault,
      addEntry,
      updateEntry,
      getEntry,
    ],
  );

  return (
    <MemoryVaultContext.Provider value={value}>
      {children}
    </MemoryVaultContext.Provider>
  );
}

export function useMemoryVault() {
  const context = useContext(MemoryVaultContext);
  if (!context) {
    throw new Error("useMemoryVault must be used within MemoryVaultProvider");
  }
  return context;
}
