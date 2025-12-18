"use client";

import { useState, useTransition } from "react";
import { Order, OrderStatus } from "@/types/order";
import { acceptOrder } from "@/actions/acceptOrder";
import { completeOrder } from "@/actions/completeOrder";
import CountdownTimer from "./CountdownTimer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderDetailProps {
  order: Order;
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

const TIME_OPTIONS = [
  { label: "10m", minutes: 10 },
  { label: "15m", minutes: 15 },
  { label: "20m", minutes: 20 },
  { label: "30m", minutes: 30 },
  { label: "45m", minutes: 45 },
  { label: "1h", minutes: 60 },
];

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
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

export default function OrderDetail({ order }: OrderDetailProps) {
  const [selectedMinutes, setSelectedMinutes] = useState(15);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  const handleAccept = () => {
    setError(null);
    startTransition(async () => {
      const result = await acceptOrder(order.id, selectedMinutes);
      if (!result.success) {
        setError(result.error || "Failed to accept order");
      }
    });
  };

  const handleComplete = () => {
    setError(null);
    startTransition(async () => {
      const result = await completeOrder(order.id);
      if (!result.success) {
        setError(result.error || "Failed to complete order");
      }
      setShowCompleteDialog(false);
    });
  };

  const isInProgress = order.status === "ACCEPTED" || order.status === "DELAYED";

  return (
    <div className="relative h-full flex flex-col">
      {/* Scrollable content */}
      <div className={`flex-1 overflow-y-auto p-6 ${isInProgress ? "pb-24" : ""}`}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Order #{order.id}</h2>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                order.status
              )}`}
            >
              {getStatusLabel(order.status)}
            </span>
          </div>
          <p className="text-gray-500">{formatDateTime(order.created_at)}</p>
        </div>

        {/* Customer info */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
            Customer
          </h3>
          <p className="text-gray-900 font-medium">{order.customer_name}</p>
          <p className="text-sm text-gray-600 mt-1">{order.delivery_address}</p>
        </div>

        {/* Order items */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Items
          </h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      {item.quantity}x
                    </span>
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                  {item.notes && (
                    <p className="text-sm text-gray-500 mt-1 ml-6">{item.notes}</p>
                  )}
                </div>
                <span className="text-gray-900">
                  ${parseFloat(item.unit_price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Countdown timer (shown for accepted/delayed orders) */}
        {isInProgress &&
          (() => {
            const targetTime = getTargetTime(order);
            return targetTime ? <CountdownTimer targetTime={targetTime} /> : null;
          })()}

        {/* Total */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-gray-900">Total</span>
            <span className="text-xl font-bold text-gray-900">
              ${parseFloat(order.total_price).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions for new orders (inline) */}
        {order.status === "CREATED" && (
          <div className="mt-6 space-y-4">
            {/* Time selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Estimated prep time
              </h3>
              <div className="flex gap-2 flex-wrap">
                {TIME_OPTIONS.map((option) => (
                  <button
                    key={option.minutes}
                    onClick={() => setSelectedMinutes(option.minutes)}
                    disabled={isPending}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedMinutes === option.minutes
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    } disabled:opacity-50`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error message */}
            {error && <p className="text-sm text-red-600">{error}</p>}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAccept}
                disabled={isPending}
                className="flex-1 py-2 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isPending ? "Accepting..." : `Accept (${selectedMinutes}m)`}
              </button>
              <button
                disabled={isPending}
                className="py-2 px-4 text-gray-600 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom bar for in-progress orders */}
      {isInProgress && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <button
              onClick={() => setShowCompleteDialog(true)}
              className="flex-1 py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Mark as Done
            </button>
            <button className="py-3 px-4 text-orange-600 font-medium rounded-lg border border-orange-300 hover:bg-orange-50 transition-colors">
              Delay
            </button>
          </div>
        </div>
      )}

      {/* Done confirmation dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Order as Done?</DialogTitle>
            <DialogDescription>
              This will mark order #{order.id} as done. The customer will be
              notified that their order is ready.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setShowCompleteDialog(false)}
              disabled={isPending}
              className="py-2 px-4 text-gray-600 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleComplete}
              disabled={isPending}
              className="py-2 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isPending ? "Marking..." : "Yes, Done"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
