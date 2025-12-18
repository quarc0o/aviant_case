"use client";

import { Preparation, Item } from "@/types/preparation";
import { formatTime } from "@/utils/formatTime";
import { getPreparationStatus } from "@/utils/preparationStatus";
import { completeItem } from "@/actions/completeItem";
import { cancelPreparation } from "@/actions/cancelPreparation";
import { useTransition } from "react";

interface PreparationCardProps {
  preparation: Preparation;
}

function getTimeRemaining(readyAt: string): { text: string; isOverdue: boolean } {
  const now = new Date();
  const ready = new Date(readyAt);
  const diffMs = ready.getTime() - now.getTime();

  if (diffMs <= 0) {
    const overdueMs = Math.abs(diffMs);
    const mins = Math.floor(overdueMs / 60000);
    if (mins < 60) {
      return { text: `${mins}m overdue`, isOverdue: true };
    }
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return { text: `${hrs}h ${remainingMins}m overdue`, isOverdue: true };
  }

  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) {
    return { text: `${mins}m left`, isOverdue: false };
  }
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return { text: `${hrs}h ${remainingMins}m left`, isOverdue: false };
}

function ItemRow({ item, disabled }: { item: Item; disabled?: boolean }) {
  const isCompleted = !!item.completed_at;
  const [isPending, startTransition] = useTransition();

  const handleComplete = () => {
    if (isCompleted || isPending || disabled) return;
    startTransition(async () => {
      await completeItem(item.id);
    });
  };

  const isInteractive = !disabled && !isCompleted;

  return (
    <li
      onClick={handleComplete}
      className={`p-4 flex items-start gap-3 h-20 transition-colors ${
        isCompleted
          ? "bg-green-50/50"
          : isInteractive
          ? "cursor-pointer hover:bg-gray-50 active:bg-gray-100"
          : ""
      } ${isPending ? "opacity-50" : ""}`}
    >
      {/* Completion indicator */}
      <div
        className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          isCompleted
            ? "bg-green-500 border-green-500"
            : "border-gray-300 bg-white"
        }`}
      >
        {isCompleted && (
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>

      {/* Item details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`font-medium ${
              isCompleted ? "text-gray-500 line-through" : "text-gray-900"
            }`}
          >
            {item.name}
          </span>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-sm rounded-md font-medium">
            x{item.quantity}
          </span>
        </div>
        {item.notes && (
          <p className="mt-1 text-sm text-gray-500">{item.notes}</p>
        )}
      </div>
    </li>
  );
}

export default function PreparationCard({ preparation }: PreparationCardProps) {
  const [isPending, startTransition] = useTransition();
  const status = getPreparationStatus(preparation);
  const completedItems = preparation.items.filter(
    (item) => item.completed_at
  ).length;
  const totalItems = preparation.items.length;
  const timeRemaining = preparation.ready_at
    ? getTimeRemaining(preparation.ready_at)
    : null;

  // Disable item editing for rejected, completed, or cancelled orders
  const isEditable =
    !preparation.rejected_at &&
    !preparation.completed_at &&
    !preparation.cancelled_at;

  // Show cancel button for in-progress orders
  const canCancel =
    preparation.accepted_at &&
    !preparation.completed_at &&
    !preparation.rejected_at &&
    !preparation.cancelled_at;

  const handleCancel = () => {
    if (isPending) return;
    startTransition(async () => {
      await cancelPreparation(preparation.id);
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {preparation.order_id}
          </h3>
          <p className="text-sm text-gray-500">
            {formatTime(preparation.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {timeRemaining && !preparation.completed_at && (
            <span
              className={`px-2.5 py-1 rounded-md text-sm font-semibold ${
                timeRemaining.isOverdue
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {timeRemaining.text}
            </span>
          )}
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${status.color} ${status.bgColor}`}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {completedItems} of {totalItems} items complete
          </span>
          <span className="text-gray-500">
            {totalItems > 0
              ? Math.round((completedItems / totalItems) * 100)
              : 0}
            %
          </span>
        </div>
        <div className="mt-1.5 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{
              width: `${
                totalItems > 0 ? (completedItems / totalItems) * 100 : 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* Items list */}
      <ul className="divide-y divide-gray-100">
        {preparation.items.map((item) => (
          <ItemRow key={item.id} item={item} disabled={!isEditable} />
        ))}
      </ul>

      {/* Cancel button for in-progress orders */}
      {canCancel && (
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="w-full py-2 px-4 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? "Cancelling..." : "Cancel Preparation"}
          </button>
        </div>
      )}
    </div>
  );
}
