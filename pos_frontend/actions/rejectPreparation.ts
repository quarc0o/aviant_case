"use server";

import { revalidatePath } from "next/cache";

interface RejectPreparationResponse {
  status: string;
  preparation_id: number;
  rejected_at: string;
}

export async function rejectPreparation(
  preparationId: number
): Promise<RejectPreparationResponse> {
  const baseUrl = process.env.API_BASE_URL;

  const response = await fetch(`${baseUrl}/preparations/reject_preparation/`, {
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
    throw new Error(error.error || `Failed to reject preparation: ${response.status}`);
  }

  revalidatePath("/");
  return response.json();
}
