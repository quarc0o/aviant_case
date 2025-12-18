"use client";

import { useEffect, useRef, useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Preparation } from "@/types/preparation";
import { acceptPreparation } from "@/actions/acceptPreparation";
import { rejectPreparation } from "@/actions/rejectPreparation";

interface OrderNotificationsProps {
  preparations: Preparation[];
}

const TIME_OPTIONS = [
  { label: "10m", minutes: 10 },
  { label: "15m", minutes: 15 },
  { label: "30m", minutes: 30 },
];

function IncomingOrderToast({
  preparation,
  onClose,
}: {
  preparation: Preparation;
  onClose: () => void;
}) {
  const [selectedMinutes, setSelectedMinutes] = useState(15);
  const [isPending, startTransition] = useTransition();

  const handleAccept = () => {
    const now = new Date();
    const readyAt = new Date(now.getTime() + selectedMinutes * 60 * 1000);

    startTransition(async () => {
      try {
        await acceptPreparation(preparation.id, readyAt.toISOString());
        onClose();
      } catch (err) {
        console.error("Failed to accept:", err);
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      try {
        await rejectPreparation(preparation.id);
        onClose();
      } catch (err) {
        console.error("Failed to reject:", err);
      }
    });
  };

  const itemsSummary = preparation.items
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(", ");

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold">{preparation.order_id}</span>
        <span className="text-xs text-gray-500">New Order</span>
      </div>
      <p className="text-sm text-gray-600 mb-3 line-clamp-1">{itemsSummary}</p>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-500">Ready in:</span>
        <div className="flex gap-1">
          {TIME_OPTIONS.map((option) => (
            <button
              key={option.minutes}
              onClick={() => setSelectedMinutes(option.minutes)}
              disabled={isPending}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
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

      <div className="flex gap-2">
        <button
          onClick={handleReject}
          disabled={isPending}
          className="flex-1 py-2 px-3 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          disabled={isPending}
          className="flex-1 py-2 px-3 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
        >
          {isPending ? "..." : "Accept"}
        </button>
      </div>
    </div>
  );
}

export default function OrderNotifications({
  preparations,
}: OrderNotificationsProps) {
  const router = useRouter();
  const seenOrderIds = useRef<Set<number>>(new Set());
  const isFirstRender = useRef(true);

  // Get current incoming orders
  const incomingOrders = preparations.filter(
    (p) => !p.accepted_at && !p.rejected_at && !p.cancelled_at
  );

  // Show toast for new incoming orders
  const showNewOrderToast = useCallback((preparation: Preparation) => {
    toast("New order", {
      description: "Order #" + preparation.order_id,
    });
  }, []);

  // Check for new orders
  useEffect(() => {
    // On first render, just mark existing orders as seen
    if (isFirstRender.current) {
      incomingOrders.forEach((order) => {
        seenOrderIds.current.add(order.id);
      });
      isFirstRender.current = false;
      return;
    }

    // Check for new orders we haven't seen
    incomingOrders.forEach((order) => {
      if (!seenOrderIds.current.has(order.id)) {
        seenOrderIds.current.add(order.id);
        showNewOrderToast(order);
      }
    });

    // Clean up dismissed orders from seen set
    const currentIds = new Set(incomingOrders.map((o) => o.id));
    seenOrderIds.current.forEach((id) => {
      if (!currentIds.has(id)) {
        seenOrderIds.current.delete(id);
        toast.dismiss(`order-${id}`);
      }
    });
  }, [incomingOrders, showNewOrderToast]);

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [router]);

  return null;
}
