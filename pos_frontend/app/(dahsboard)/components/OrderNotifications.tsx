"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Preparation } from "@/types/preparation";
import { useNotifications } from "@/context/NotificationContext";

interface OrderNotificationsProps {
  preparations: Preparation[];
}

export default function OrderNotifications({
  preparations,
}: OrderNotificationsProps) {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const seenOrderIds = useRef<Set<number>>(new Set());
  const isFirstRender = useRef(true);

  // Get current incoming orders
  const incomingOrders = preparations.filter(
    (p) => !p.accepted_at && !p.rejected_at && !p.cancelled_at
  );

  // Show toast and add to notification queue
  const handleNewOrder = useCallback(
    (preparation: Preparation) => {
      // Show toast
      toast("New order", {
        description: "Order #" + preparation.order_id,
      });
      // Add to notification queue
      addNotification(preparation);
    },
    [addNotification]
  );

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
        handleNewOrder(order);
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
  }, [incomingOrders, handleNewOrder]);

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [router]);

  return null;
}
