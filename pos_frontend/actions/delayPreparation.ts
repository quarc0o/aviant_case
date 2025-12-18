"use server";

import { revalidatePath } from "next/cache";

interface DelayPreparationResponse {
  status: string;
  preparation_id: number;
  delayed_to: string;
}

export async function delayPreparation(
  preparationId: number,
  delayedTo: string
): Promise<DelayPreparationResponse> {
  const baseUrl = process.env.API_BASE_URL;

  const response = await fetch(`${baseUrl}/preparations/delay_preparation/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      preparation_id: preparationId,
      delayed_to: delayedTo,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to delay preparation: ${response.status}`);
  }

  revalidatePath("/");
  return response.json();
}
