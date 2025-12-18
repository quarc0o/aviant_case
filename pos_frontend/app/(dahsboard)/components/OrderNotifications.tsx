"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Preparation } from "@/types/preparation";

interface OrderNotificationsProps {
  preparations: Preparation[];
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
