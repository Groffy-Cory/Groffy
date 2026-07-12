"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { ENTRY_TYPE_OPTIONS, type VaultEntryTypeId } from "@/lib/types";
import { addVaultEntry, sendFamilyMessage, uploadFamilyMedia } from "@/lib/vault";

export function AddMemoryPanel() {
  const { activeOwnerId, displayName, user } = useAuth();
  const [type, setType] = useState<VaultEntryTypeId>("story");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
    };
  }, []);

  async function handlePhotoFile(file: File | null) {
    if (!file || !activeOwnerId || !user) return;
    setBusy(true);
    setError(null);
    setStatus("Uploading photo…");
    const result = await uploadFamilyMedia({
      familyUserId: user.id,
      ownerId: activeOwnerId,
      file,
      fileName: file.name,
      contentType: file.type || "image/jpeg",
    });
    setBusy(false);
    if (result.error || !result.url) {
      setError(result.error || "Could not upload photo.");
      setStatus(null);
      return;
    }
    setMediaUrl(result.url);
    setStatus("Photo ready. Add a title and save.");
  }

  async function toggleRecording() {
    if (!activeOwnerId || !user) return;

    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setBusy(true);
        setStatus("Uploading voice note…");
        const result = await uploadFamilyMedia({
          familyUserId: user.id,
          ownerId: activeOwnerId,
          file: blob,
          fileName: `voice-${Date.now()}.webm`,
          contentType: "audio/webm",
        });
        setBusy(false);
        if (result.error || !result.url) {
          setError(result.error || "Could not upload voice note.");
          setStatus(null);
          return;
        }
        setMediaUrl(result.url);
        setType("voice");
        setStatus("Voice note ready. Add a title and save.");
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setStatus("Recording… tap Stop when finished.");
      setError(null);
    } catch {
      setError("Microphone permission is needed to record a voice note.");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!activeOwnerId) return;
    setBusy(true);
    setError(null);
    setStatus(null);

    const result = await addVaultEntry(activeOwnerId, {
      type,
      title: title || (type === "voice" ? "Voice note" : "Family memory"),
      body:
        body ||
        (type === "photo"
          ? "A photo from the family portal."
          : type === "voice"
            ? "A voice note from the family portal."
            : "A note from family."),
      mediaUrl: mediaUrl || null,
      contributedBy: displayName,
    });

    if (result.error || !result.entry) {
      setError(result.error || "Could not save.");
      setBusy(false);
      return;
    }

    if (type === "family_message") {
      const messageError = await sendFamilyMessage({
        ownerId: activeOwnerId,
        sender: displayName,
        body: `${title.trim() ? `${title.trim()}: ` : ""}${body.trim()}`,
      });
      if (messageError) {
        setStatus(
          "Saved to Memory Vault. Message inbox sync needs the latest Supabase messages policies.",
        );
        setBusy(false);
        return;
      }
    }

    setTitle("");
    setBody("");
    setMediaUrl("");
    setStatus("Saved! Your loved one can see this in their Memory Vault.");
    setBusy(false);
  }

  return (
    <section className="fp-card p-5 sm:p-6">
      <h2
        className="text-3xl font-semibold"
        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
      >
        Add a memory
      </h2>
      <p className="mt-2 text-lg font-semibold text-[color:var(--muted)]">
        Stories, photos, and voice notes appear in their Memory Vault.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="entry-type" className="mb-1 block text-lg font-bold">
            What are you sharing?
          </label>
          <select
            id="entry-type"
            className="fp-select"
            value={type}
            onChange={(e) => setType(e.target.value as VaultEntryTypeId)}
          >
            {ENTRY_TYPE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-base font-semibold text-[color:var(--muted)]">
            {ENTRY_TYPE_OPTIONS.find((item) => item.id === type)?.hint}
          </p>
        </div>

        <div>
          <label htmlFor="title" className="mb-1 block text-lg font-bold">
            Title
          </label>
          <input
            id="title"
            className="fp-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sunday picnic"
            required
          />
        </div>

        <div>
          <label htmlFor="body" className="mb-1 block text-lg font-bold">
            Message / caption
          </label>
          <textarea
            id="body"
            className="fp-textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a few warm sentences…"
            required
          />
        </div>

        {type === "photo" ? (
          <div className="space-y-3">
            <label className="block text-lg font-bold" htmlFor="photo-file">
              Photo
            </label>
            <input
              id="photo-file"
              type="file"
              accept="image/*"
              className="block w-full text-base font-semibold"
              onChange={(e) => void handlePhotoFile(e.target.files?.[0] ?? null)}
            />
            <input
              className="fp-input"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="Or paste a photo URL"
            />
          </div>
        ) : null}

        {type === "voice" ? (
          <div className="space-y-3">
            <button
              type="button"
              className={`fp-btn w-full text-lg ${recording ? "fp-btn-primary" : "fp-btn-secondary"}`}
              onClick={() => void toggleRecording()}
              disabled={busy}
            >
              {recording ? "Stop recording" : "Record voice note"}
            </button>
            {mediaUrl ? (
              <audio controls src={mediaUrl} className="w-full">
                Your browser does not support audio.
              </audio>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <p className="text-lg font-bold text-[color:var(--danger)]" role="alert">
            {error}
          </p>
        ) : null}
        {status ? (
          <p className="text-lg font-semibold text-[color:var(--muted)]" role="status">
            {status}
          </p>
        ) : null}

        <button
          type="submit"
          className="fp-btn fp-btn-primary w-full text-xl"
          disabled={busy || !activeOwnerId}
        >
          {busy ? "Saving…" : "Save to Memory Vault"}
        </button>
      </form>
    </section>
  );
}
