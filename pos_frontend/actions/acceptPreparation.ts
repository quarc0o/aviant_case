"use server";

import { revalidatePath } from "next/cache";

interface AcceptPreparationResponse {
  status: string;
  preparation_id: number;
  accepted_at: string;
  ready_at: string;
}

export async function acceptPreparation(
  preparationId: number,
  readyAt: string
): Promise<AcceptPreparationResponse> {
  const baseUrl = process.env.API_BASE_URL;

  const response = await fetch(`${baseUrl}/preparations/accept_preparation/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      preparation_id: preparationId,
      ready_at: readyAt,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to accept preparation: ${response.status}`);
  }

  revalidatePath("/");
  return response.json();
}
