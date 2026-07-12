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
  addMessageRemote,
  fetchMessages,
  persistMessages,
} from "@/lib/messages/repository";
import {
  getUnreadCount,
  sortMessages,
} from "@/lib/messages/storage";
import {
  DEMO_USER_ID,
  type Message,
  type MessageDraft,
  type MessageSourceId,
} from "@/lib/messages/types";

type MessagesContextValue = {
  messages: Message[];
  unreadCount: number;
  isOpen: boolean;
  openMessages: () => void;
  closeMessages: () => void;
  addMessage: (draft: MessageDraft) => Promise<Message>;
  markRead: (id: string) => void;
  markAllRead: () => void;
  getThread: (id: string) => Message[];
};

const MessagesContext = createContext<MessagesContextValue | null>(null);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const { user, isGuest } = useAuth();
  const userId = !isGuest && user?.id ? user.id : DEMO_USER_ID;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await fetchMessages(userId);
      if (cancelled) return;
      setMessages(result.messages);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!ready) return;
    void persistMessages(messages, userId);
  }, [messages, ready, userId]);

  const openMessages = useCallback(() => setIsOpen(true), []);
  const closeMessages = useCallback(() => setIsOpen(false), []);

  const addMessage = useCallback(
    async (draft: MessageDraft) => {
      const next = await addMessageRemote(draft, userId);
      setMessages((prev) => sortMessages([next, ...prev]));
      return next;
    },
    [userId],
  );

  const markRead = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id ? { ...message, read: true } : message,
      ),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setMessages((prev) => prev.map((message) => ({ ...message, read: true })));
  }, []);

  const getThread = useCallback(
    (id: string) => {
      const root = messages.find((message) => message.id === id);
      if (!root) return [];
      const replies = messages.filter((message) => message.replyToId === id);
      return [root, ...sortMessages(replies).reverse()];
    },
    [messages],
  );

  const value = useMemo(
    () => ({
      messages,
      unreadCount: getUnreadCount(messages),
      isOpen,
      openMessages,
      closeMessages,
      addMessage,
      markRead,
      markAllRead,
      getThread,
    }),
    [
      messages,
      isOpen,
      openMessages,
      closeMessages,
      addMessage,
      markRead,
      markAllRead,
      getThread,
    ],
  );

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error("useMessages must be used within MessagesProvider");
  }
  return context;
}

export type { MessageSourceId };
