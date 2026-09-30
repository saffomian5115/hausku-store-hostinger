"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

const REFRESH_INTERVAL_MS = 30_000;

/**
 * Wraps the dashboard with auto-refresh: re-fetches the server component
 * (fresh stats / recent orders) on a polling interval via router.refresh().
 * No full page reload — scroll position and client state are preserved.
 * Polling pauses while the tab is hidden and resumes when it's visible again.
 */
export default function DashboardAutoRefresh({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const refresh = () => {
      router.refresh();
      setLastUpdated(new Date());
    };

    const start = () => {
      if (timer) return;
      refresh(); // refresh immediately on (re)connect
      timer = setInterval(refresh, REFRESH_INTERVAL_MS);
    };

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    start();

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [router]);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime-500" />
          </span>
          <span>Live</span>
          {lastUpdated && (
            <span>
              · aktualisiert um{" "}
              {lastUpdated.toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>
      {children}
    </>
  );
}
