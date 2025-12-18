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
  const seenCustomerCancellations = useRef<Set<number>>(new Set());
  const isFirstRender = useRef(true);

  // Get current incoming orders
  const incomingOrders = preparations.filter(
    (p) => !p.accepted_at && !p.rejected_at && !p.cancelled_at
  );

  // Get orders cancelled by customer
  const customerCancelledOrders = preparations.filter(
    (p) => p.cancelled_at && p.cancelled_by_customer
  );

  // Show toast for new order
  const handleNewOrder = useCallback((preparation: Preparation) => {
    toast("New order", {
      description: "Order #" + preparation.order_id,
    });
  }, []);

  // Show toast for customer cancellation
  const handleCustomerCancellation = useCallback((preparation: Preparation) => {
    toast.error("Order cancelled by customer", {
      description: "Order #" + preparation.order_id + " was cancelled",
      duration: 5000,
    });
  }, []);

  // Check for new orders
  useEffect(() => {
    // On first render, just mark existing orders as seen
    if (isFirstRender.current) {
      incomingOrders.forEach((order) => {
        seenOrderIds.current.add(order.id);
      });
      customerCancelledOrders.forEach((order) => {
        seenCustomerCancellations.current.add(order.id);
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

    // Check for new customer cancellations
    customerCancelledOrders.forEach((order) => {
      if (!seenCustomerCancellations.current.has(order.id)) {
        seenCustomerCancellations.current.add(order.id);
        handleCustomerCancellation(order);
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
  }, [incomingOrders, customerCancelledOrders, handleNewOrder, handleCustomerCancellation]);

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [router]);

  return null;
}
