"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { DEFAULT_COMPANION_NAME } from "@/lib/constants";
import {
  formatSpeechError,
  getSpeechRecognitionConstructor,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  speakText,
  stopSpeaking,
  type SpeechRecognitionLike,
} from "@/lib/speech/browser";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import type { ChatMessage } from "@/types";

type TalkWithRofyProps = {
  companionName?: string;
};

const SPEAK_PREF_KEY = "rof-talk-speak-enabled-v1";

export function TalkWithRofy({
  companionName = DEFAULT_COMPANION_NAME,
}: TalkWithRofyProps) {
  const { prefs } = usePreferences();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [synthSupported, setSynthSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const busyRef = useRef(false);
  const speakEnabledRef = useRef(speakEnabled);
  const transcriptRef = useRef("");
  const shouldSendAfterListenRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  useEffect(() => {
    speakEnabledRef.current = speakEnabled;
  }, [speakEnabled]);

  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported());
    setSynthSupported(isSpeechSynthesisSupported());
    try {
      const saved = window.localStorage.getItem(SPEAK_PREF_KEY);
      if (saved === "0") setSpeakEnabled(false);
      if (saved === "1") setSpeakEnabled(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const welcome = `Hello! I'm ${companionName}, your Real Old Friend. What's on your mind today?`;
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: welcome,
        createdAt: new Date().toISOString(),
      },
    ]);
    setInput("");
    setError(null);
    setStatus(null);
    stopSpeaking();
  }, [companionName]);

  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, listening, busy, status]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      stopSpeaking();
    };
  }, []);

  const speakReply = useCallback((text: string) => {
    if (!speakEnabledRef.current || !isSpeechSynthesisSupported()) return;
    speakText(text, { rate: 0.92 });
  }, []);

  const sendMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || busyRef.current) return;

      stopSpeaking();
      busyRef.current = true;
      setBusy(true);
      setError(null);
      setStatus(`${companionName} is thinking…`);

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      };

      const prior = messagesRef.current;
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      try {
        const history = [...prior, userMessage]
          .filter((m) => m.id !== "welcome")
          .slice(-10)
          .map((m) => ({ role: m.role, content: m.content }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            companionName,
            history: history.slice(0, -1),
            onPremMode: prefs.onPremMode,
          }),
        });

        const data = (await response.json()) as {
          reply?: string;
          error?: string;
        };

        if (!response.ok || !data.reply) {
          throw new Error(data.error || "Could not get a reply.");
        }

        const reply: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, reply]);
        setStatus(null);
        speakReply(data.reply);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.";
        setError(message);
        setStatus(null);
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [companionName, speakReply, prefs.onPremMode],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function toggleSpeak() {
    setSpeakEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SPEAK_PREF_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      if (!next) stopSpeaking();
      return next;
    });
  }

  function startListening() {
    setError(null);
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      setError(
        "Voice typing isn’t available in this browser. Please type your message.",
      );
      return;
    }

    if (listening) {
      shouldSendAfterListenRef.current = false;
      recognitionRef.current?.stop();
      setListening(false);
      setStatus(null);
      return;
    }

    stopSpeaking();
    recognitionRef.current?.abort();
    transcriptRef.current = "";
    shouldSendAfterListenRef.current = true;

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setListening(true);
      setStatus("Listening… Speak clearly into your microphone.");
    };

    recognition.onresult = (event) => {
      let interim = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const piece = result[0]?.transcript ?? "";
        if (result.isFinal) finalText += piece;
        else interim += piece;
      }

      if (finalText.trim()) {
        transcriptRef.current = finalText.trim();
        setInput(finalText.trim());
        setStatus("Got it. Sending to your companion…");
      } else if (interim.trim()) {
        transcriptRef.current = interim.trim();
        setInput(interim.trim());
        setStatus("Listening…");
      }
    };

    recognition.onerror = (event) => {
      const message = formatSpeechError(event.error);
      if (message) setError(message);
      setListening(false);
      setStatus(null);
      shouldSendAfterListenRef.current = false;
    };

    recognition.onend = () => {
      setListening(false);
      const toSend = transcriptRef.current.trim();
      if (shouldSendAfterListenRef.current && toSend) {
        shouldSendAfterListenRef.current = false;
        void sendMessage(toSend);
      } else {
        shouldSendAfterListenRef.current = false;
        setStatus((prev) => (prev?.startsWith("Listening") ? null : prev));
      }
    };

    try {
      recognition.start();
    } catch {
      setError("Could not start the microphone. Please try again.");
      setListening(false);
      setStatus(null);
      shouldSendAfterListenRef.current = false;
    }
  }

  return (
    <section
      className="rof-card flex min-h-[24rem] flex-col p-5 sm:p-6"
      aria-labelledby="talk-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="talk-heading"
            className="font-display text-2xl font-semibold text-ink sm:text-3xl"
          >
            Talk with {companionName}
          </h2>
          <p className="mt-1 text-base font-semibold text-muted">
            Type or tap the microphone to speak. {companionName} can answer out
            loud.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={speakEnabled}
          disabled={!synthSupported}
          onClick={toggleSpeak}
          className={[
            "rof-btn min-h-14 min-w-[9rem] text-lg",
            speakEnabled ? "rof-btn-primary" : "rof-btn-secondary",
          ].join(" ")}
          title={
            synthSupported
              ? "Read replies aloud"
              : "Spoken replies not available in this browser"
          }
        >
          Speak: {speakEnabled && synthSupported ? "On" : "Off"}
        </button>
      </div>

      <div
        ref={logRef}
        className="rof-inset mt-4 flex min-h-[14rem] flex-1 flex-col gap-3 overflow-y-auto p-3"
        role="log"
        aria-live="polite"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={[
              "max-w-[90%] rounded-2xl px-4 py-3 text-base font-semibold sm:text-lg",
              message.role === "user"
                ? "ml-auto bg-royal text-white"
                : "mr-auto border-2 border-steel-200 bg-[var(--surface-raised)] text-ink",
            ].join(" ")}
          >
            {message.content}
          </div>
        ))}
      </div>

      {(status || error) && (
        <p
          className={[
            "mt-3 text-lg font-bold",
            error
              ? "text-[color:var(--royal-dark,#8b1f2e)]"
              : listening
                ? "text-royal"
                : "text-muted",
          ].join(" ")}
          role={error ? "alert" : "status"}
          aria-live="assertive"
        >
          {error || status}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <label className="sr-only" htmlFor="chat-input">
          Message to {companionName}
        </label>
        <input
          id="chat-input"
          className="rof-input text-lg"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={
            listening ? "Listening…" : `Say hello to ${companionName}…`
          }
          autoComplete="off"
          disabled={busy}
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className={[
              "rof-btn min-h-14 flex-1 text-lg sm:flex-none sm:min-w-[11rem]",
              listening ? "rof-btn-primary" : "rof-btn-secondary",
            ].join(" ")}
            onClick={startListening}
            disabled={busy || !speechSupported}
            aria-pressed={listening}
          >
            {listening ? "Stop mic" : "Microphone"}
          </button>

          <button
            type="submit"
            className="rof-btn rof-btn-primary min-h-14 flex-1 text-lg sm:min-w-[8rem]"
            disabled={busy || !input.trim()}
          >
            {busy ? "Sending…" : "Send"}
          </button>
        </div>

        {!speechSupported ? (
          <p className="text-base font-semibold text-muted">
            Voice typing isn’t available here. You can still type and use Speak
            for replies when supported.
          </p>
        ) : null}
      </form>
    </section>
  );
}
