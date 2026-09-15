"use client";

import { useMemo, useState } from "react";

type RevenuePoint = {
  date: string; // ISO date (YYYY-MM-DD)
  total: number;
};

type RangeKey = "7" | "30";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "7", label: "7 Tage" },
  { key: "30", label: "30 Tage" },
];

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const [range, setRange] = useState<RangeKey>("7");

  // Daily totals (paid revenue only) for the selected range
  const buckets = useMemo(() => {
    const days = parseInt(range, 10);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const map = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      map.set(toDayKey(d), 0);
    }

    for (const point of data) {
      const key = point.date.slice(0, 10);
      if (map.has(key)) {
        map.set(key, (map.get(key) || 0) + point.total);
      }
    }

    return Array.from(map.entries()).map(([date, total]) => ({ date, total }));
  }, [data, range]);

  const maxValue = useMemo(
    () => Math.max(...buckets.map((b) => b.total), 0),
    [buckets]
  );
  const totalRevenue = useMemo(
    () => buckets.reduce((sum, b) => sum + b.total, 0),
    [buckets]
  );
  const paidDays = buckets.filter((b) => b.total > 0).length;

  // Round max up to a "nice" axis ceiling (1, 2, 5 × 10^n)
  const axisMax = useMemo(() => {
    if (maxValue <= 0) return 100;
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
    const normalized = maxValue / magnitude;
    const nice =
      normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return nice * magnitude;
  }, [maxValue]);

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  const formatBarLabel = (date: string, index: number) => {
    const d = new Date(`${date}T12:00:00`);
    if (range === "7") return WEEKDAYS[d.getDay()];
    // Monthly: label every 5th bar to avoid clutter
    if (index % 5 === 0 || index === buckets.length - 1) return String(d.getDate());
    return "";
  };

  const isToday = (date: string) => date === toDayKey(new Date());

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold">Umsatz-Entwicklung</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {range === "7" ? "Letzte 7 Tage" : "Letzte 30 Tage"} ·{" "}
            <span className="font-semibold text-gray-900">
              {formatEuro(totalRevenue)}
            </span>{" "}
            · {paidDays} bezahlte Tag{paidDays !== 1 ? "e" : ""}
          </p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                range === r.key
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {totalRevenue === 0 ? (
        <div className="py-16 text-center text-gray-400">
          Noch keine bezahlten Bestellungen in diesem Zeitraum.
        </div>
      ) : (
        <div>
          {/* Chart body: gridlines + bars */}
          <div className="relative pl-12">
            {/* Y-axis labels + gridlines */}
            <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-[10px] text-gray-400 w-10">
              {gridLines.map((g) => (
                <span key={g} className="text-right -translate-y-1/2">
                  {formatEuro(axisMax * g)}
                </span>
              ))}
            </div>
            <div className="absolute inset-y-0 left-10 right-0 pointer-events-none">
              {gridLines.map((g) => (
                <div
                  key={g}
                  className="absolute left-0 right-0 border-t border-gray-100"
                  style={{ bottom: `${g * 100}%` }}
                />
              ))}
            </div>

            {/* Bars */}
            <div className="relative h-48 flex items-end gap-[3px] sm:gap-1">
              {buckets.map((bucket, index) => {
                const height =
                  bucket.total > 0
                    ? Math.max((bucket.total / axisMax) * 100, 3)
                    : 0;
                return (
                  <div
                    key={bucket.date}
                    className="relative flex-1 group flex items-end h-full"
                  >
                    {bucket.total > 0 && (
                      <div
                        className={`w-full rounded-t transition-all duration-300 group-hover:opacity-100 ${
                          isToday(bucket.date)
                            ? "bg-lime-500"
                            : "bg-lime-300 group-hover:bg-lime-400"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    )}
                    {/* Tooltip */}
                    {bucket.total > 0 && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                        <p className="font-semibold">{formatEuro(bucket.total)}</p>
                        <p className="text-gray-400 text-[10px]">
                          {new Date(`${bucket.date}T12:00:00`).toLocaleDateString(
                            "de-DE",
                            { day: "2-digit", month: "2-digit" }
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex gap-[3px] sm:gap-1 mt-2 pl-12">
            {buckets.map((bucket, index) => (
              <div
                key={bucket.date}
                className={`flex-1 text-center text-[10px] ${
                  isToday(bucket.date) ? "text-lime-600 font-semibold" : "text-gray-400"
                }`}
              >
                {formatBarLabel(bucket.date, index)}
              </div>
            ))}
          </div>

          <p className="text-[10px] text-gray-400 mt-2 pl-12 text-right">
            {range === "7" ? "Wochentage" : "Tag des Monats"}
          </p>
        </div>
      )}
    </div>
  );
}
