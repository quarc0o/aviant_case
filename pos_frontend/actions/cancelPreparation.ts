"use server";

import { revalidatePath } from "next/cache";

interface CancelPreparationResponse {
  status: string;
  preparation_id: number;
  cancelled_at: string;
}

export async function cancelPreparation(
  preparationId: number
): Promise<CancelPreparationResponse> {
  const baseUrl = process.env.API_BASE_URL;

  const response = await fetch(`${baseUrl}/preparations/cancel_preparation/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      preparation_id: preparationId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to cancel preparation: ${response.status}`);
  }

  revalidatePath("/");
  return response.json();
}
