"use server";

import { Preparation } from "@/types/preparation";

export async function fetchPreparations(): Promise<Preparation[]> {
  const baseUrl = process.env.API_BASE_URL;

  const response = await fetch(`${baseUrl}/preparations/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch preparations: ${response.status}`);
  }

  return response.json();
}
