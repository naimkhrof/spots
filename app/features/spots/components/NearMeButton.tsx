import { useState } from "react";
import type { Coordinates } from "../model/distance";

/**
 * Demande la position au navigateur, sur clic seulement. Elle reste dans l'état de la page :
 * ni URL, ni serveur, ni stockage.
 */
export function NearMeButton({ active, onChange }: { active: boolean; onChange: (origin: Coordinates | null) => void }) {
  const [status, setStatus] = useState<"idle" | "locating" | "refused">("idle");

  const toggle = () => {
    if (active) return onChange(null);
    if (!("geolocation" in navigator)) return setStatus("refused");
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setStatus("idle");
        onChange({ lat: coords.latitude, lng: coords.longitude });
      },
      () => setStatus("refused"),
      { maximumAge: 60_000, timeout: 10_000 },
    );
  };

  return (
    <div className="flex flex-col items-end gap-1 [@media(scripting:none)]:hidden">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={active}
        disabled={status === "locating"}
        className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:border-stone-500 disabled:opacity-60 aria-pressed:border-lime-400 aria-pressed:bg-lime-400 aria-pressed:text-lime-950 dark:border-stone-700 dark:bg-stone-900"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
        {status === "locating" ? "Localisation…" : "Autour de moi"}
      </button>
      <p role="status" className="text-xs text-stone-500 empty:hidden dark:text-stone-400">
        {status === "refused" ? "Position indisponible." : ""}
      </p>
    </div>
  );
}
