"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "rof-a2hs-dismissed-v1";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIos(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOs = ua.includes("Mac") && "ontouchend" in document;
  return iOS || iPadOs;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const media = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in window.navigator &&
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  return media || iosStandalone;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;

    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const timer = window.setTimeout(() => {
      if (isStandalone()) return;
      if (isIos()) {
        setIosHint(true);
        setVisible(true);
      } else {
        setVisible(true);
      }
    }, 4500);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.clearTimeout(timer);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    try {
      await deferred.userChoice;
    } catch {
      /* ignore */
    }
    setDeferred(null);
    dismiss();
  }

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4"
      role="region"
      aria-label="Install app"
    >
      <div className="pointer-events-auto rof-card w-full max-w-lg border-2 border-[color:var(--border-strong)] p-4 shadow-lg sm:p-5">
        <p className="font-display text-xl font-semibold text-ink sm:text-2xl">
          Add ROF to your Home Screen
        </p>
        <p className="mt-2 text-base font-semibold leading-relaxed text-muted sm:text-lg">
          {iosHint
            ? "On iPhone or iPad: tap Share, then “Add to Home Screen” for easy one-tap access."
            : "Install Real Old Friend like an app for larger buttons and quicker opens — even when you’re offline."}
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {deferred ? (
            <button
              type="button"
              className="rof-btn rof-btn-primary min-h-14 flex-1 text-lg"
              onClick={() => void install()}
            >
              Add to Home Screen
            </button>
          ) : null}
          <button
            type="button"
            className="rof-btn rof-btn-secondary min-h-14 flex-1 text-lg"
            onClick={dismiss}
          >
            {deferred ? "Not now" : "Got it"}
          </button>
        </div>
      </div>
    </div>
  );
}
