"use client";

import { useState, useEffect } from "react";
import { Order, OrderStatus } from "@/types/order";

interface OrderCardProps {
  order: Order;
  isSelected: boolean;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case "CREATED":
      return "bg-amber-100 text-amber-700";
    case "ACCEPTED":
      return "bg-blue-100 text-blue-700";
    case "DELAYED":
      return "bg-orange-100 text-orange-700";
    case "DONE":
      return "bg-green-100 text-green-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    case "CANCELLED":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "CREATED":
      return "New";
    case "ACCEPTED":
      return "In Progress";
    case "DELAYED":
      return "Delayed";
    case "DONE":
      return "Completed";
    case "REJECTED":
      return "Rejected";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

function getTargetTime(order: Order): Date | null {
  if (!order.estimated_prep_time) return null;

  const acceptedEvent = order.events.find(
    (e) => e.event_type === "preparation_accepted"
  );
  if (!acceptedEvent) return null;

  const acceptedAt = new Date(acceptedEvent.created_at);
  return new Date(acceptedAt.getTime() + order.estimated_prep_time * 60 * 1000);
}

function CountdownBadge({ targetTime }: { targetTime: Date }) {
  const [timeRemaining, setTimeRemaining] = useState<number>(
    targetTime.getTime() - Date.now()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(targetTime.getTime() - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  const isOverdue = timeRemaining <= 0;
  const totalSeconds = Math.abs(Math.floor(timeRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const display = `${isOverdue ? "+" : ""}${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <span
      className={`text-xs tabular-nums ${
        isOverdue ? "text-red-600" : "text-gray-500"
      }`}
    >
      <span className="font-medium">{display}</span>
      {isOverdue ? " overdue" : " remaining"}
    </span>
  );
}

export default function OrderCard({ order, isSelected }: OrderCardProps) {
  const itemsSummary = order.items
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(", ");

  const isInProgress = order.status === "ACCEPTED" || order.status === "DELAYED";
  const targetTime = isInProgress ? getTargetTime(order) : null;

  return (
    <div
      className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? "border-gray-900 bg-gray-50 shadow-sm"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-gray-900">#{order.id}</span>
        <span className="text-sm text-gray-400">{formatTime(order.created_at)}</span>
      </div>

      <p className="text-sm text-gray-600 mb-2 line-clamp-1">
        {itemsSummary || "No items"}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(
              order.status
            )}`}
          >
            {getStatusLabel(order.status)}
          </span>
          {targetTime && <CountdownBadge targetTime={targetTime} />}
        </div>
        <span className="text-sm font-medium text-gray-900">
          ${parseFloat(order.total_price).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
