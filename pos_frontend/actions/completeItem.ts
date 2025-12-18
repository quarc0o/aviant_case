"use server";

import { revalidatePath } from "next/cache";

interface CompleteItemResponse {
  status: string;
  item_id: number;
  preparation_id: number;
  completed_at: string;
}

export async function completeItem(itemId: number): Promise<CompleteItemResponse> {
  const baseUrl = process.env.API_BASE_URL;

  const response = await fetch(`${baseUrl}/preparations/complete_item/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      item_id: itemId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to complete item: ${response.status}`);
  }

  revalidatePath("/");
  return response.json();
}
