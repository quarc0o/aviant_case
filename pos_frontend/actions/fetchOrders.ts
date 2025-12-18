"use server";

import { Order } from "@/types/order";

const API_URL = process.env.API_URL || "http://localhost:8000";

export type OrderFilter = "all" | "new" | "in_progress" | "completed";

export async function fetchOrders(): Promise<Order[]> {
  const response = await fetch(`${API_URL}/api/orders/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  return response.json();
}
