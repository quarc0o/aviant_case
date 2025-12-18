"use server";

import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL || "http://localhost:8000";

export async function acceptOrder(
  orderId: number,
  estimatedPrepTime: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/orders/${orderId}/accept/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        estimated_prep_time: estimatedPrepTime,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error || "Failed to accept order" };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to accept order",
    };
  }
}
