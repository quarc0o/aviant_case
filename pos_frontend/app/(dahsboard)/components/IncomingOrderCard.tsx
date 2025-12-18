"use client";

import { Preparation } from "@/types/preparation";
import { formatTime } from "@/utils/formatTime";
import { acceptPreparation } from "@/actions/acceptPreparation";
import { rejectPreparation } from "@/actions/rejectPreparation";
import { useState, useTransition } from "react";

interface IncomingOrderCardProps {
  preparation: Preparation;
}

const TIME_OPTIONS = [
  { label: "10m", minutes: 10 },
  { label: "15m", minutes: 15 },
  { label: "20m", minutes: 20 },
  { label: "30m", minutes: 30 },
  { label: "45m", minutes: 45 },
  { label: "1h", minutes: 60 },
];

export default function IncomingOrderCard({
  preparation,
}: IncomingOrderCardProps) {
  const [selectedMinutes, setSelectedMinutes] = useState(15);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAccept = () => {
    setError(null);
    const now = new Date();
    const readyAt = new Date(now.getTime() + selectedMinutes * 60 * 1000);

    startTransition(async () => {
      try {
        await acceptPreparation(preparation.id, readyAt.toISOString());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to accept");
      }
    });
  };

  const handleReject = () => {
    setError(null);
    startTransition(async () => {
      try {
        await rejectPreparation(preparation.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to decline");
      }
    });
  };

  const itemsSummary = preparation.items
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(", ");

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-3">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full" />
            <span className="font-semibold text-gray-900">
              {preparation.order_id}
            </span>
            <span className="text-sm text-gray-400">
              {formatTime(preparation.created_at)}
            </span>
          </div>
        </div>

        {/* Items summary */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{itemsSummary}</p>

        {/* Time selection + actions row */}
        <div className="flex items-center gap-2">
          {/* Time chips */}
          <div className="flex gap-1 flex-1">
            {TIME_OPTIONS.map((option) => (
              <button
                key={option.minutes}
                onClick={() => setSelectedMinutes(option.minutes)}
                disabled={isPending}
                className={`px-2.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  selectedMinutes === option.minutes
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } disabled:opacity-50`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <button
            onClick={handleReject}
            disabled={isPending}
            className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={isPending}
            className="px-4 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
          >
            {isPending ? "..." : "Accept"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
